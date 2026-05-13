import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiUsers, FiShoppingCart, FiDollarSign, FiBox, FiClipboard, FiGrid, FiTrendingUp } from "react-icons/fi";
import API from "../../api/axios";
import "./AdminPages.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await API.get("/api/v1/admin/dashboard-stats"); setStats(data); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  // Backend response keys: totalRevenueAllTime, totalUsersCount, orderStatusCounts, etc.
  const totalOrders = stats?.orderStatusCounts
    ? Object.values(stats.orderStatusCounts).reduce((a, b) => a + b, 0)
    : 0;

  const cards = [
    { label: "Total Revenue", value: `$${Number(stats?.totalRevenueAllTime || 0).toLocaleString()}`, icon: FiDollarSign, color: "#0d7a3e" },
    { label: "Total Orders", value: totalOrders, icon: FiClipboard, color: "var(--color-primary)" },
    { label: "Today Revenue", value: `$${Number(stats?.todayRevenue || 0).toLocaleString()}`, icon: FiTrendingUp, color: "#f4a623" },
    { label: "Total Users", value: stats?.totalUsersCount || 0, icon: FiUsers, color: "var(--color-bloom-coral)" },
  ];

  return (
    <main className="section">
      <div className="container">
        <h1 className="display-lg" style={{ marginBottom: 8 }}><FiGrid style={{ marginRight: 8 }} /> Admin Dashboard</h1>
        <p className="body-md text-graphite" style={{ marginBottom: 32 }}>
          {stats?.revenueGrowth && <>Month-over-month growth: <strong>{stats.revenueGrowth}</strong></>}
        </p>

        <div className="grid grid-4 admin-stats-grid">
          {cards.map((c) => (
            <div key={c.label} className="card admin-stat-card" style={{ padding: 24 }}>
              <div className="admin-stat-icon" style={{ background: c.color + "18", color: c.color }}><c.icon size={24} /></div>
              <p className="caption-md text-graphite" style={{ marginTop: 12 }}>{c.label}</p>
              <p className="display-md" style={{ marginTop: 4 }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Order Status Breakdown */}
        {stats?.orderStatusCounts && (
          <div className="card" style={{ padding: 24, marginTop: 24 }}>
            <h2 className="display-xs" style={{ marginBottom: 16 }}>Order Status</h2>
            <div className="flex gap-xl" style={{ flexWrap: "wrap" }}>
              {Object.entries(stats.orderStatusCounts).map(([status, count]) => (
                <div key={status}>
                  <p className="display-md">{count}</p>
                  <p className="caption-md text-graphite">{status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {stats?.lowStockProducts?.length > 0 && (
          <div className="card" style={{ padding: 24, marginTop: 24, borderLeft: "4px solid var(--color-bloom-coral)" }}>
            <h2 className="display-xs" style={{ marginBottom: 12 }}>⚠️ Low Stock Alert</h2>
            {stats.lowStockProducts.map((p, i) => (
              <div key={i} className="flex-between caption-md" style={{ padding: "6px 0" }}>
                <span>{p.name}</span>
                <span className="text-error body-emphasis">{p.stock} left</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-3" style={{ marginTop: 32 }}>
          <Link to="/admin/products" className="card admin-nav-card"><FiPackage size={28} /><span className="display-xs">Products</span><span className="caption-md text-graphite">Manage inventory</span></Link>
          <Link to="/admin/orders" className="card admin-nav-card"><FiShoppingCart size={28} /><span className="display-xs">Orders</span><span className="caption-md text-graphite">Track & fulfill</span></Link>
          <Link to="/admin/users" className="card admin-nav-card"><FiUsers size={28} /><span className="display-xs">Users</span><span className="caption-md text-graphite">Manage accounts</span></Link>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
