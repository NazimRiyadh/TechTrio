import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";
import API from "../../api/axios";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./ShopPage.css";

const categories = [
  "All",
  "Laptops & Desktops", 
  "Smartphones & Tablets", 
  "Audio & Headphones", 
  "Monitors & Displays", 
  "PC Components", 
  "Peripherals & Gaming", 
  "Gadgets & Drones"
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const currentCat = searchParams.get("category") || "All";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const currentPrice = searchParams.get("price") || "";
  const currentAvail = searchParams.get("availability") || "";
  const limit = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentCat !== "All") params.set("category", currentCat);
        if (currentSearch) params.set("search", currentSearch);
        if (currentPrice) params.set("price", currentPrice);
        if (currentAvail) params.set("availability", currentAvail);
        params.set("page", currentPage);
        params.set("limit", limit);
        const { data } = await API.get(`/api/v1/product/?${params.toString()}`);
        // Filter out products without valid photos
        const withImages = (data.products || []).filter(p => p.images?.length > 0 && p.images[0]?.url);
        setProducts(withImages);
        setTotal(data.totalProducts || 0);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [currentCat, currentSearch, currentPage, currentPrice, currentAvail]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== "All") { p.set(key, val); } else { p.delete(key); }
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="shop-page">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1 className="display-lg">Shop{currentSearch ? `: "${currentSearch}"` : ""}</h1>
            <p className="body-md text-graphite" style={{ marginTop: 4 }}>{total} product{total !== 1 ? "s" : ""} found</p>
          </div>
          <button className="btn btn-outline-ink btn-sm filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
            <FiFilter size={14} /> Filters
          </button>
        </div>

        {/* Category Tabs */}
        <div className="shop-tabs">
          {categories.map((cat) => (
            <button key={cat} className={`tab ${currentCat === cat ? "tab-active" : ""}`} onClick={() => setParam("category", cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="shop-filters card">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <span className="body-emphasis">Filters</span>
              <button className="nav-icon-btn" onClick={() => setFiltersOpen(false)}><FiX size={18} /></button>
            </div>
            <div className="filter-group">
              <label className="input-label">Price Range</label>
              <div className="flex gap-sm">
                {["", "0-50", "50-200", "200-1000", "1000-5000"].map((range) => (
                  <button key={range} className={`tab ${currentPrice === range ? "tab-active" : ""}`}
                    onClick={() => setParam("price", range)}>
                    {range ? `$${range.replace("-", "–$")}` : "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="input-label">Availability</label>
              <div className="flex gap-sm">
                {["", "in-stock", "limited", "out-of-stock"].map((a) => (
                  <button key={a} className={`tab ${currentAvail === a ? "tab-active" : ""}`}
                    onClick={() => setParam("availability", a)}>
                    {a ? a.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase()) : "All"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : products.length > 0 ? (
          <div className="grid grid-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        ) : (
          <div className="page-loader"><p className="body-md text-graphite">No products found.</p></div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination flex-center gap-sm">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} className={`tab ${currentPage === i + 1 ? "tab-active" : ""}`}
                onClick={() => setParam("page", String(i + 1))}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ShopPage;
