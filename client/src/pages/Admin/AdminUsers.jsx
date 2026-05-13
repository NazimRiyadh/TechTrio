import { useState, useEffect } from "react";
import { FiTrash2, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AdminPages.css";

const AdminUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try { const { data } = await API.get("/api/v1/admin/get-all-users"); setUsers(data.users || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try { await API.delete(`/api/v1/admin/delete-user/${id}`); showToast("User deleted"); fetchUsers(); }
    catch (err) { showToast("Failed to delete", "error"); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <main className="section">
      <div className="container">
        <Link to="/admin" className="btn btn-text-link" style={{ marginBottom: 16, display: "inline-flex" }}><FiArrowLeft /> Dashboard</Link>
        <div className="admin-header"><h1 className="display-lg">Manage Users</h1><span className="badge badge-outline">{users.length} users</span></div>
        <div className="card" style={{ overflow: "auto" }}>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="body-emphasis">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === "admin" ? "badge-ink" : "badge-outline"}`}>{u.role}</span></td>
                  <td className="caption-md text-graphite">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>{u.role !== "admin" && <button className="btn btn-text-link text-error" onClick={() => deleteUser(u.id)}><FiTrash2 size={15} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default AdminUsers;
