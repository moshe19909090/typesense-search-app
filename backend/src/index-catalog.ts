import fs from "fs";
import readline from "readline";
import path from "path";
import client from "./typesense-client";

const collectionName = "products";

async function createSchema() {
  const schema = {
    name: collectionName,
    enable_nested_fields: false,
    fields: [
      { name: "id", type: "string" as const },
      { name: "title", type: "string" as const },
      { name: "price", type: "float" as const },
      { name: "rank", type: "int32" as const },
      { name: "tags", type: "string[]" as const, facet: true },
      { name: "collections", type: "string[]" as const, facet: true },
      { name: "inventoryQuantity", type: "int32" as const },
      { name: "status", type: "string" as const },
      { name: "imageSrc", type: "string" as const },
    ],
    default_sorting_field: "rank",
  };

  try {
    await client.collections(collectionName).delete();
    console.log("Previous collection deleted.");
  } catch {
    console.log("Collection does not exist yet.");
  }

  await client.collections().create(schema);
  console.log("Collection created!");
}

async function importData() {
  const filePath = path.join(__dirname, "catalog.fixed.jsonl"); // ✅ Corrected file name
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const batch: any[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const parsed = JSON.parse(line);

      const id = parsed.id?.toString() || parsed._id?.$oid;
      const title = typeof parsed.title === "string" ? parsed.title : "";

      if (!id || !title.trim()) {
        console.warn("Skipping record due to missing ID or title");
        continue;
      }

      const product = {
        id,
        title,
        price: parsed.price ?? 0,
        rank: parsed.rank ?? 0,
        tags: parsed.tags ?? [],
        collections: parsed.collections ?? [],
        inventoryQuantity: parsed.inventoryQuantity ?? 0,
        status: parsed.status ?? "unknown",
        imageSrc: parsed.image?.src ?? "",
      };

      batch.push(product);

      if (batch.length >= 100) {
        const response = await client
          .collections(collectionName)
          .documents()
          .import(batch, { action: "upsert" });

        const failed = response.filter((r: any) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to import ${failed.length} items`);
        } else {
          console.log(`Imported batch of ${batch.length}`);
        }

        batch.length = 0;
      }
    } catch (err) {
      console.error("Error parsing or importing line:", err);
    }
  }

  // Final batch
  if (batch.length > 0) {
    const response = await client
      .collections(collectionName)
      .documents()
      .import(batch, { action: "upsert" });

    const failed = response.filter((r: any) => !r.success);
    if (failed.length > 0) {
      console.error(`Final batch failed: ${failed.length} items`);
    } else {
      console.log(`Final batch imported: ${batch.length}`);
    }
  }

  console.log("🎉 Indexing complete!");
}

(async () => {
  try {
    await createSchema();
    await importData();
  } catch (err) {
    console.error("Failed to index data:", err);
  }
})();
