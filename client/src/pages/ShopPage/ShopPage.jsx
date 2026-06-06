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

const priceRanges = [
  { label: "All Prices", value: "" },
  { label: "Under 10,000 BDT", value: "0-10000" },
  { label: "10k - 30k BDT", value: "10000-30000" },
  { label: "30k - 60k BDT", value: "30000-60000" },
  { label: "60k - 120k BDT", value: "60000-120000" },
  { label: "Above 120k BDT", value: "120000-9999999" }
];

const availabilities = [
  { label: "All Stock Status", value: "" },
  { label: "In Stock", value: "in-stock" },
  { label: "Limited Stock", value: "limited" },
  { label: "Out of Stock", value: "out-of-stock" }
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const currentCat = searchParams.get("category") || "All";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const currentPrice = searchParams.get("price") || "";
  const currentAvail = searchParams.get("availability") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const limit = 12;

  // Temporary local states for filters before hitting Apply
  const [tempCat, setTempCat] = useState(currentCat);
  const [tempPrice, setTempPrice] = useState(currentPrice);
  const [tempAvail, setTempAvail] = useState(currentAvail);

  // Sync temp states if search params change externally (like clicking category from home, or clearing)
  useEffect(() => {
    setTempCat(currentCat);
  }, [currentCat]);

  useEffect(() => {
    setTempPrice(currentPrice);
  }, [currentPrice]);

  useEffect(() => {
    setTempAvail(currentAvail);
  }, [currentAvail]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentCat !== "All") params.set("category", currentCat);
        if (currentSearch) params.set("search", currentSearch);
        if (currentPrice) params.set("price", currentPrice);
        if (currentAvail) params.set("availability", currentAvail);
        if (currentSort && currentSort !== "newest") params.set("sort", currentSort);
        params.set("page", currentPage);
        params.set("limit", limit);
        
        const { data } = await API.get(`/api/v1/product/?${params.toString()}`);
        // Filter out products without valid photos
        const withImages = (data.products || []).filter(p => p.images?.length > 0 && p.images[0]?.url);
        setProducts(withImages);
        setTotal(data.totalProducts || 0);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchProducts();
  }, [currentCat, currentSearch, currentPage, currentPrice, currentAvail, currentSort]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val && val !== "All") { 
      p.set(key, val); 
    } else { 
      p.delete(key); 
    }
    // Reset page to 1 whenever filters change
    if (key !== "page") p.delete("page");
    setSearchParams(p);
  };

  const applyFilters = () => {
    const p = new URLSearchParams(searchParams);
    
    if (tempCat && tempCat !== "All") {
      p.set("category", tempCat);
    } else {
      p.delete("category");
    }

    if (tempPrice) {
      p.set("price", tempPrice);
    } else {
      p.delete("price");
    }

    if (tempAvail) {
      p.set("availability", tempAvail);
    } else {
      p.delete("availability");
    }

    p.delete("page"); // Reset to page 1 on new filter apply
    setSearchParams(p);
  };

  const handleSortChange = (newSort) => {
    const p = new URLSearchParams(searchParams);
    if (newSort && newSort !== "newest") {
      p.set("sort", newSort);
    } else {
      p.delete("sort");
    }
    p.delete("page"); // Reset to page 1
    setSearchParams(p);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setTempCat("All");
    setTempPrice("");
    setTempAvail("");
  };

  const totalPages = Math.ceil(total / limit);

  // Generates page numbers around current page (sliding window pagination)
  const getPaginationPages = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      
      if (start === 1) {
        end = 5;
      } else if (end === totalPages) {
        start = totalPages - 4;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <main className="shop-page">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1 className="display-lg">Shop{currentSearch ? `: "${currentSearch}"` : ""}</h1>
            <p className="body-md text-graphite" style={{ marginTop: 4 }}>
              {total} product{total !== 1 ? "s" : ""} found
            </p>
          </div>
          {/* Mobile Filter Toggle */}
          <button 
            className="mobile-filter-toggle-btn" 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            {showMobileFilters ? <FiX size={16} /> : <FiFilter size={16} />}
            {showMobileFilters ? "Hide Filters" : "Filters & Sort"}
          </button>
        </div>

        {/* Premium Horizontal Filter Bar */}
        <div className={`filter-bar ${showMobileFilters ? "mobile-open" : "mobile-collapsed"}`}>
          <div className="filter-bar-left">
            {/* Category Dropdown */}
            <div className="filter-dropdown-container">
              <label className="filter-label">Category</label>
              <select
                value={tempCat}
                onChange={(e) => setTempCat(e.target.value)}
                className="filter-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Dropdown */}
            <div className="filter-dropdown-container">
              <label className="filter-label">Price Range</label>
              <select
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="filter-select"
              >
                {priceRanges.map((range) => (
                  <option key={range.label} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status Dropdown */}
            <div className="filter-dropdown-container">
              <label className="filter-label">Stock Status</label>
              <select
                value={tempAvail}
                onChange={(e) => setTempAvail(e.target.value)}
                className="filter-select"
              >
                {availabilities.map((avail) => (
                  <option key={avail.label} value={avail.value}>
                    {avail.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply & Clear Actions */}
            <div className="filter-actions">
              <button className="apply-filter-btn" onClick={applyFilters}>
                Filter
              </button>
              {(currentCat !== "All" || currentPrice || currentAvail || currentSearch) && (
                <button className="clear-filter-btn" onClick={clearAllFilters}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="filter-bar-right">
            {/* Sort Dropdown */}
            <div className="filter-dropdown-container">
              <label className="filter-label">Sort By</label>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="filter-select sort-select"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="ratings-desc">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shop Main Layout (Now full-width product grid) */}
        <div className="shop-layout-horizontal">
          <div className="shop-content">
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Sliding window pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setParam("page", String(currentPage - 1))}>
                      &laquo; Prev
                    </button>
                    
                    {currentPage > 3 && totalPages > 5 && (
                      <>
                        <button className={`pagination-btn ${currentPage === 1 ? "active" : ""}`} onClick={() => setParam("page", "1")}>1</button>
                        {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
                      </>
                    )}

                    {getPaginationPages().map((page) => (
                      <button key={page} className={`pagination-btn ${currentPage === page ? "active" : ""}`} onClick={() => setParam("page", String(page))}>
                        {page}
                      </button>
                    ))}

                    {currentPage < totalPages - 2 && totalPages > 5 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
                        <button className={`pagination-btn ${currentPage === totalPages ? "active" : ""}`} onClick={() => setParam("page", String(totalPages))}>
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => setParam("page", String(currentPage + 1))}>
                      Next &raquo;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="page-loader">
                <p className="body-md text-graphite" style={{ textAlign: "center", width: "100%", padding: "40px 0" }}>
                  No products found. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ShopPage;
