import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./App.css";

interface Product {
  id: string;
  title: string;
  price: number;
  inventoryQuantity: number;
  imageSrc: string;
  tags?: string[];
  collections?: string[];
}

const PAGE_SIZE = 12;

function App() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allCollections, setAllCollections] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  const buildFilterQuery = (): string => {
    const tagFilter = selectedTags.length
      ? `tags:=[${selectedTags.map((t) => `"${t}"`).join(",")}]`
      : "";
    const collectionFilter = selectedCollections.length
      ? `collections:=[${selectedCollections.map((c) => `"${c}"`).join(",")}]`
      : "";
    return [tagFilter, collectionFilter].filter(Boolean).join(" && ");
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const filters = buildFilterQuery();
      const url = new URL("http://localhost:3001/search");
      url.searchParams.set("q", debouncedQuery || "*");
      url.searchParams.set("page", page.toString());
      url.searchParams.set("pageSize", PAGE_SIZE.toString());
      url.searchParams.set("facet_by", "tags,collections");
      if (filters) {
        url.searchParams.set("filters", filters);
      }

      const response = await axios.get(url.toString());

      setProducts(response.data.results || []);
      setTotalPages(
        response.data.found ? Math.ceil(response.data.found / PAGE_SIZE) : 1
      );

      // update facets dynamically
      const facets = response.data.facets || [];
      const tagsFacet = facets.find((f: any) => f.field_name === "tags");
      const collectionsFacet = facets.find(
        (f: any) => f.field_name === "collections"
      );

      setAllTags(tagsFacet?.counts.map((c: any) => c.value) || []);
      setAllCollections(
        collectionsFacet?.counts.map((c: any) => c.value) || []
      );
    } catch (err) {
      console.error("Failed to fetch products or facets", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, selectedTags, selectedCollections]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleSelected = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setPage(1);
    setSelected(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="app">
      <h1>Product Search</h1>

      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />

      <div className="filters">
        <div className="filter-group">
          <h4>Tags:</h4>
          {allTags.map((tag) => (
            <span
              key={tag}
              className={`chip ${selectedTags.includes(tag) ? "selected" : ""}`}
              onClick={() => toggleSelected(tag, selectedTags, setSelectedTags)}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="filter-group">
          <h4>Collections:</h4>
          {allCollections.map((collection) => (
            <span
              key={collection}
              className={`chip ${
                selectedCollections.includes(collection) ? "selected" : ""
              }`}
              onClick={() =>
                toggleSelected(
                  collection,
                  selectedCollections,
                  setSelectedCollections
                )
              }
            >
              {collection}
            </span>
          ))}
        </div>
      </div>

      {(selectedTags.length > 0 || selectedCollections.length > 0) && (
        <div className="selected-summary">
          <p>
            <strong>Filters:</strong>{" "}
            {[...selectedTags, ...selectedCollections].join(", ")}
          </p>
          <button
            onClick={() => {
              setSelectedTags([]);
              setSelectedCollections([]);
              setPage(1);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : products.length === 0 ? (
        <p className="empty">No products found.</p>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <div className="card" key={product.id}>
              <img src={product.imageSrc} alt={product.title} />
              <h3>{product.title}</h3>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.inventoryQuantity}</p>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={n === page ? "active" : ""}
            onClick={() => setPage(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
