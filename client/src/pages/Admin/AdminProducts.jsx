import { useState, useEffect } from "react";
import { FiTrash2, FiPlus, FiArrowLeft, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AdminPages.css";

const AdminProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", stock: "" });
  const [images, setImages] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try { const { data } = await API.get("/api/v1/product/?limit=50"); setProducts(data.products || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (images) { Array.from(images).forEach((f) => fd.append("images", f)); }
      await API.post("/api/v1/product/admin/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Product created!"); setShowCreate(false);
      setForm({ name: "", description: "", price: "", category: "", stock: "" }); setImages(null);
      fetchProducts();
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setSubmitting(false); }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await API.delete(`/api/v1/product/admin/delete/${id}`); showToast("Product deleted"); fetchProducts(); }
    catch (err) { showToast("Failed to delete", "error"); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <main className="section">
      <div className="container">
        <Link to="/admin" className="btn btn-text-link" style={{ marginBottom: 16, display: "inline-flex" }}><FiArrowLeft /> Dashboard</Link>
        <div className="admin-header">
          <h1 className="display-lg">Manage Products</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(!showCreate)}>{showCreate ? <><FiX /> Cancel</> : <><FiPlus /> Add Product</>}</button>
        </div>

        {showCreate && (
          <form className="card" style={{ padding: 28, marginBottom: 24 }} onSubmit={handleCreate}>
            <h2 className="display-xs" style={{ marginBottom: 16 }}>New Product</h2>
            <div className="auth-form">
              <div className="flex gap-md">
                <div style={{ flex: 2 }}><label className="input-label">Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label className="input-label">Category</label><input className="input" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              </div>
              <div><label className="input-label">Description</label><textarea className="input" rows={3} style={{ height: "auto" }} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="flex gap-md">
                <div style={{ flex: 1 }}><label className="input-label">Price ($)</label><input type="number" step="0.01" className="input" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div style={{ flex: 1 }}><label className="input-label">Stock</label><input type="number" className="input" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
              </div>
              <div><label className="input-label">Images</label><input type="file" accept="image/*" multiple className="input" style={{ paddingTop: 10 }} onChange={(e) => setImages(e.target.files)} /></div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Creating..." : "Create Product"}</button>
            </div>
          </form>
        )}

        <div className="card" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.images?.[0]?.url ? <img src={p.images[0].url} alt="" style={{ width: 40, height: 40, borderRadius: "var(--rounded-md)", objectFit: "contain", background: "var(--color-cloud)" }} /> : "—"}</td>
                  <td className="body-emphasis">{p.name}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td><span className={p.stock === 0 ? "text-error" : ""}>{p.stock}</span></td>
                  <td className="caption-md">{p.category}</td>
                  <td><button className="btn btn-text-link text-error" onClick={() => deleteProduct(p.id)}><FiTrash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminProducts;
