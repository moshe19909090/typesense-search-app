const fs = require("fs");
const readline = require("readline");

const inputPath = "catalog.jsonl"; // your existing raw file
const outputPath = "catalog.fixed.jsonl";

const rl = readline.createInterface({
  input: fs.createReadStream(inputPath),
  crlfDelay: Infinity
});

let buffer = "";
let validCount = 0;
let errorCount = 0;

const output = fs.createWriteStream(outputPath);

rl.on("line", (line: any) => {
  if (line.trim() === "") return; // skip empty lines
  buffer += line;

  // Try parsing the accumulated buffer
  try {
    const parsed = JSON.parse(buffer);
    output.write(JSON.stringify(parsed) + "\n");
    validCount++;
    buffer = ""; // reset buffer
  } catch (e) {
    // Not yet valid JSON — keep buffering
  }
});

rl.on("close", () => {
  console.log(`✅ Done. Valid lines: ${validCount}`);
  if (buffer.trim() !== "") {
    console.warn("⚠️ Remaining buffer was not parsed. Possibly malformed:");
    console.warn(buffer.slice(0, 300));
  }
});
