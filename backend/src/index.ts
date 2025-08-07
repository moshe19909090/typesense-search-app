import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import client from "./typesense-client";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/search", async (req, res) => {
  const q = (req.query.q as string) || "";
  const page = parseInt((req.query.page as string) || "1", 10);
  const pageSize = parseInt((req.query.pageSize as string) || "12", 10);

  if (isNaN(page) || isNaN(pageSize)) {
    return res.status(400).json({ error: "Invalid page or pageSize value" });
  }

  const searchParameters: any = {
    q: q || "*",
    query_by: "title",
    per_page: pageSize,
    page,
    facet_by: "tags,collections",
    max_facet_values: 15,
  };

  if (!q) {
    searchParameters.sort_by = "rank:desc";
  }

  const filters = req.query.filters as string | undefined;
  if (filters) {
    searchParameters.filter_by = filters;
  }

  try {
    const result = await client
      .collections("products")
      .documents()
      .search(searchParameters);

    res.json({
      found: result.found,
      page: result.page,
      totalPages: Math.ceil(result.found / pageSize),
      results: result.hits?.map((hit: any) => hit.document) ?? [],
      facets: result.facet_counts ?? [],
    });
  } catch (error: any) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
