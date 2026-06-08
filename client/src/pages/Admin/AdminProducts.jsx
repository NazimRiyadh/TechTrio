import { useState, useEffect, useCallback } from "react";
import {
  FiTrash2,
  FiPlus,
  FiX,
  FiEdit2,
  FiSearch,
  FiPackage,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AdminPages.css";

const categoryOptions = [
  "Laptops & Desktops",
  "Smartphones & Tablets",
  "Audio & Headphones",
  "Monitors & Displays",
  "PC Components",
  "Peripherals & Gaming",
  "Gadgets & Drones",
];

const AdminProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // always all 7, with counts
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Create Form State
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", stock: "" });
  const [images, setImages] = useState(null);

  // Edit Form State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", price: "", category: "", stock: "" });

  const [submitting, setSubmitting] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategoryEdit, setIsCustomCategoryEdit] = useState(false);
  const [customCategoryEdit, setCustomCategoryEdit] = useState("");

  // Debounce search input so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === "NEW") {
      setIsCustomCategory(true);
      setForm({ ...form, category: "" });
    } else {
      setIsCustomCategory(false);
      setForm({ ...form, category: val });
    }
  };

  // Map UI stock filter → API param
  const stockParam = stockFilter === "In Stock" ? "in" : stockFilter === "Low Stock" ? "low" : stockFilter === "Out of Stock" ? "out" : "";

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (stockParam) params.set("stock", stockParam);
      params.set("page", page);
      params.set("limit", limit);

      const { data } = await API.get(`/api/v1/product/admin/all?${params.toString()}`);
      setProducts(data.products || []);
      setTotalProducts(data.totalProducts || 0);
      if (data.pagination) {
        setPaginationInfo(data.pagination);
      }
      // categories from API always contains all 7, with counts
      if (data.categories) setAllCategories(data.categories);
    } catch (err) {
      console.error(err);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [showToast, categoryFilter, debouncedSearch, stockParam, page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (images) {
        Array.from(images).forEach((f) => fd.append("images", f));
      }
      await API.post("/api/v1/product/admin/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Product created successfully!");
      setShowCreate(false);
      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
      });
      setImages(null);
      setLoading(true);
      fetchProducts();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create product",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (product) => {
    setEditingId(product.id);
    const isCustom = !categoryOptions.includes(product.category);
    setIsCustomCategoryEdit(isCustom);
    setCustomCategoryEdit(isCustom ? product.category : "");
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/api/v1/product/admin/update/${editingId}`, editForm);
      showToast("Product updated successfully!");
      setShowEdit(false);
      setEditingId(null);
      setLoading(true);
      fetchProducts();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update product",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this product?"))
      return;
    try {
      await API.delete(`/api/v1/product/admin/delete/${id}`);
      showToast("Product deleted successfully");
      setLoading(true);
      fetchProducts();
    } catch (err) {
      showToast("Failed to delete product", err);
    }
  };

  // Filtering is server-side — products returned from API are already filtered.
  // allCategories comes from the API and always contains all 7 categories with full DB counts.
  const filteredProducts = products; // already filtered server-side


  const getStockBadge = (stock) => {
    if (stock === 0)
      return <span className="badge stock-badge out">Out of Stock</span>;
    if (stock <= 5)
      return <span className="badge stock-badge low">Low Stock ({stock})</span>;
    return <span className="badge stock-badge in">In Stock ({stock})</span>;
  };

  if (initialLoading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-products-container">
      {/* Search & Filter Header Strip */}
      <section className="admin-actions-bar card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products by name, desc, or category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="clear-search-btn"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-select-wrapper">
            <FiTag className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">
                All Categories ({allCategories.reduce((s, c) => s + c.cnt, 0)})
              </option>
              {allCategories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category} ({c.cnt})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select-wrapper">
            <FiPackage className="filter-icon" />
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock (&gt;5)</option>
              <option value="Low Stock">Low Stock (≤5)</option>
              <option value="Out of Stock">Out of Stock (0)</option>
            </select>
          </div>

          <button
            className="btn btn-primary btn-sm add-product-trigger-btn"
            onClick={() => setShowCreate(true)}
          >
            <FiPlus size={16} /> Add Product
          </button>
        </div>
      </section>

      {/* Results summary */}
      <div className="results-summary caption-md text-graphite" style={{ marginBottom: 8 }}>
        {loading ? "Loading..." : (
          <>
            Showing <strong>{filteredProducts.length}</strong> of{" "}
            <strong>{allCategories.reduce((s, c) => s + c.cnt, 0)}</strong> total products
            {categoryFilter !== "All" && <> in <span className="text-primary">{categoryFilter}</span></>}
            {stockFilter !== "All" && <> · {stockFilter}</>}
            {searchQuery && <> · matching "<em>{debouncedSearch}</em>"</>}
          </>
        )}
      </div>


      {/* Create Product Slide-over / Modal overlay */}
      {showCreate && (
        <div
          className="admin-modal-overlay"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="admin-modal card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="display-xs">
                <FiPackage /> Add New Product
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowCreate(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-row">
                <div className="form-field flex-2">
                  <label className="input-label">Product Name</label>
                  <input
                    className="input"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. HP EliteBook 840"
                  />
                </div>
                <div className="form-field flex-1">
                  <label className="input-label">Category</label>
                  {!isCustomCategory ? (
                    <select
                      className="input"
                      required
                      value={form.category}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="NEW">+ Add Custom Category...</option>
                    </select>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        className="input"
                        required
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setForm({ ...form, category: e.target.value });
                        }}
                        placeholder="Custom category name"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-ink btn-sm"
                        style={{
                          height: "44px",
                          borderRadius: "var(--rounded-md)",
                        }}
                        onClick={() => {
                          setIsCustomCategory(false);
                          setForm({ ...form, category: "" });
                          setCustomCategory("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="input-label">Product Description</label>
                <textarea
                  className="input text-area"
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Write a rich description about product specs, warranty, etc."
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="input-label">Price (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="form-field">
                  <label className="input-label">
                    Opening Inventory (Stock)
                  </label>
                  <input
                    type="number"
                    className="input"
                    required
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="input-label">Upload Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="input file-input"
                  onChange={(e) => setImages(e.target.files)}
                />
                <span
                  className="caption-sm text-graphite"
                  style={{ marginTop: 4 }}
                >
                  You can upload multiple high-res product photos.
                </span>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline-ink"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating Product..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEdit && (
        <div className="admin-modal-overlay" onClick={() => setShowEdit(false)}>
          <div
            className="admin-modal card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="display-xs">
                <FiEdit2 /> Edit Product Details
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowEdit(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-row">
                <div className="form-field flex-2">
                  <label className="input-label">Product Name</label>
                  <input
                    className="input"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-field flex-1">
                  <label className="input-label">Category</label>
                  {!isCustomCategoryEdit ? (
                    <select
                      className="input"
                      required
                      value={
                        categoryOptions.includes(editForm.category)
                          ? editForm.category
                          : editForm.category
                            ? "NEW"
                            : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "NEW") {
                          setIsCustomCategoryEdit(true);
                          setCustomCategoryEdit(editForm.category || "");
                        } else {
                          setIsCustomCategoryEdit(false);
                          setEditForm({ ...editForm, category: val });
                        }
                      }}
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="NEW">+ Add Custom Category...</option>
                    </select>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        className="input"
                        required
                        value={customCategoryEdit}
                        onChange={(e) => {
                          setCustomCategoryEdit(e.target.value);
                          setEditForm({
                            ...editForm,
                            category: e.target.value,
                          });
                        }}
                        placeholder="Custom category name"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-ink btn-sm"
                        style={{
                          height: "44px",
                          borderRadius: "var(--rounded-md)",
                        }}
                        onClick={() => {
                          setIsCustomCategoryEdit(false);
                          setCustomCategoryEdit("");
                          setEditForm({ ...editForm, category: "" });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label className="input-label">Product Description</label>
                <textarea
                  className="input text-area"
                  rows={4}
                  required
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="input-label">Price (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    required
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                  />
                </div>
                <div className="form-field">
                  <label className="input-label">Current Stock</label>
                  <input
                    type="number"
                    className="input"
                    required
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm({ ...editForm, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <p className="caption-sm text-graphite" style={{ marginTop: 12 }}>
                ðŸ’¡ Note: To update product images, please delete and re-create
                this item (Cloudinary integration limits raw metadata edits).
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline-ink"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table Card */}
      <section className={`card admin-table-card ${loading ? "loading-opacity" : ""}`}>
        {filteredProducts.length > 0 ? (
          <>
            {/* Desktop View */}
            <div className="table-responsive admin-products-desktop">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Inventory Status</th>
                    <th className="text-center">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-img-wrapper">
                          {p.images?.[0]?.url ? (
                            <img src={p.images[0].url} alt={p.name} />
                          ) : (
                            <div className="table-img-fallback">
                              <FiPackage size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="body-emphasis product-title-col">
                        <div className="product-title-cell">
                          <span className="name-main truncate" title={p.name}>
                            {p.name}
                          </span>
                          <span className="desc-sub truncate">
                            {p.description}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-outline">{p.category}</span>
                      </td>
                      <td className="body-emphasis price-col">
                        ৳
                        {Number(p.price).toLocaleString("en-BD")}
                      </td>
                      <td>{getStockBadge(p.stock)}</td>
                      <td className="text-center">
                        <div className="table-actions flex-center gap-sm">
                          <button
                            className="btn btn-outline-ink btn-sm action-icon-btn edit"
                            onClick={() => handleStartEdit(p)}
                            title="Edit details"
                          >
                            <FiEdit2 size={14} /> Edit
                          </button>
                          <button
                            className="btn btn-outline-ink btn-sm action-icon-btn delete"
                            onClick={() => deleteProduct(p.id)}
                            title="Delete item"
                          >
                            <FiTrash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="admin-products-mobile" style={{ padding: "8px 16px" }}>
              {filteredProducts.map((p) => (
                <div key={p.id} className="mobile-product-card card" style={{ padding: 16, marginBottom: 16, border: "1px solid var(--color-hairline)" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <div className="table-img-wrapper" style={{ width: 60, height: 60, flexShrink: 0 }}>
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div className="table-img-fallback">
                          <FiPackage size={20} />
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: "14px", display: "block", color: "var(--color-ink)" }} className="truncate">{p.name}</span>
                      <span style={{ fontSize: "12px", color: "var(--color-graphite)", display: "block" }} className="truncate">{p.description}</span>
                      <span className="badge badge-outline" style={{ marginTop: 4, display: "inline-block", fontSize: "11px" }}>{p.category}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--color-graphite)", display: "block" }}>Price</span>
                      <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--color-primary)" }}>
                        ৳{Number(p.price).toLocaleString("en-BD")}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--color-graphite)", display: "block", textAlign: "right" }}>Stock Status</span>
                      {getStockBadge(p.stock)}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid var(--color-hairline)", paddingTop: 12 }}>
                    <button
                      className="btn btn-outline-ink btn-sm action-icon-btn edit"
                      onClick={() => handleStartEdit(p)}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      <FiEdit2 size={12} /> Edit
                    </button>
                    <button
                      className="btn btn-outline-ink btn-sm action-icon-btn delete"
                      onClick={() => deleteProduct(p.id)}
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                    >
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Control Bar */}
            <div className="admin-pagination-bar flex-between" style={{ borderTop: "1px solid var(--color-hairline)", padding: "16px 20px" }}>
              <span className="caption-md text-graphite">
                Showing page <strong>{paginationInfo.currentPage}</strong> of <strong>{paginationInfo.totalPages}</strong> ({paginationInfo.totalProducts} products total)
              </span>
              
              <div className="pagination-buttons flex gap-sm" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button 
                  className="btn btn-outline-ink btn-sm page-nav-btn"
                  disabled={!paginationInfo.hasPrevPage}
                  onClick={() => {
                    setPage((prev) => Math.max(1, prev - 1));
                    setLoading(true);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <FiChevronLeft size={16} /> Prev
                </button>
                <button 
                  className="btn btn-outline-ink btn-sm page-nav-btn"
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() => {
                    setPage((prev) => Math.min(paginationInfo.totalPages, prev + 1));
                    setLoading(true);
                  }}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="table-empty-state">
            <FiPackage size={48} className="empty-icon" />
            <h3>No products found</h3>
            <p className="caption-md text-graphite">
              Try refining your search queries or adding new inventory catalog
              items.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminProducts;

