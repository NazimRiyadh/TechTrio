import { useState, useEffect } from "react";
import { FiTrash2, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AdminPages.css";

const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try { const { data } = await API.get("/api/v1/order/admin/getall"); setOrders(data.orders || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    try { await API.put(`/api/v1/order/admin/update/${id}`, { status }); showToast("Status updated!"); fetchOrders(); }
    catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
  };

  const deleteOrder = async (id) => {
    if (!confirm("Delete this order?")) return;
    try { await API.delete(`/api/v1/order/admin/delete/${id}`); showToast("Order deleted"); fetchOrders(); }
    catch (err) { showToast("Failed to delete", "error"); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <main className="section">
      <div className="container">
        <Link to="/admin" className="btn btn-text-link" style={{ marginBottom: 16, display: "inline-flex" }}><FiArrowLeft /> Dashboard</Link>
        <div className="admin-header"><h1 className="display-lg">Manage Orders</h1><span className="badge badge-outline">{orders.length} orders</span></div>
        <div className="card" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="body-emphasis">{o.id?.slice(0, 8)}</td>
                  <td>${Number(o.total_price).toFixed(2)}</td>
                  <td>
                    <select className="input" style={{ height: 36, width: "auto", fontSize: 13 }} value={o.order_status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                      <option>Processing</option><option>Shipped</option><option>Delivered</option>
                    </select>
                  </td>
                  <td className="caption-md text-graphite">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td><button className="btn btn-text-link text-error" onClick={() => deleteOrder(o.id)}><FiTrash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminOrders;
