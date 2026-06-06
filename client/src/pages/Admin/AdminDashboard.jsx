import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiUsers, 
  FiTrendingUp, 
  FiBox, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiStar, 
  FiCalendar, 
  FiArrowUpRight, 
  FiArrowDownRight,
  FiMoreHorizontal,
  FiShield
} from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import API from "../../api/axios";
import "./AdminPages.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          API.get("/api/v1/admin/dashboard-stats"),
          API.get("/api/v1/order/admin/getall")
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error("Error fetching dashboard statistics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  // Calculate total orders across statuses
  const totalOrders = stats?.orderStatusCounts
    ? Object.values(stats.orderStatusCounts).reduce((a, b) => a + b, 0)
    : 0;

  // Extract growth values
  const isGrowthPositive = stats?.revenueGrowth?.startsWith("+");
  const growthValue = stats?.revenueGrowth ? stats.revenueGrowth : "0%";

  // Generate sparkline data using monthlySales or a flat zero fallback
  const sparklineData = stats?.monthlySales && stats.monthlySales.length > 0
    ? stats.monthlySales.map(item => ({ val: item.totalsales }))
    : [{ val: 0 }, { val: 0 }];

  // Calculate Category Sales Share dynamically
  const totalCategoryRevenue = stats?.categorySales
    ? stats.categorySales.reduce((sum, cat) => sum + cat.revenue, 0)
    : 0;

  const colorsPalette = ["#3b82f6", "#22c55e", "#eab308", "#ec4899", "#8b5cf6", "#f97316", "#06b6d4"];

  const categorySalesData = stats?.categorySales && stats.categorySales.length > 0
    ? stats.categorySales.map((cat, idx) => ({
        name: cat.name,
        revenue: cat.revenue,
        share: totalCategoryRevenue > 0
          ? `${((cat.revenue / totalCategoryRevenue) * 100).toFixed(0)}%`
          : "0%",
        color: colorsPalette[idx % colorsPalette.length]
      }))
    : [];

  const processingOrders = orders.filter(o => o.order_status === "Processing");

  return (
    <div className="admin-dashboard-container">
      {/* 4 Remos-Style Stat Cards */}
      <section className="kpi-grid">
        
        {/* Card 1: Total Sales */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box rev"><FiShoppingBag size={20} /></div>
            <div className="kpi-info-wrapper">
              <span className="kpi-label">Total Sales</span>
            </div>
          </div>
          <div className="kpi-val-row">
            <div className="kpi-value">{totalOrders.toLocaleString()}</div>
          </div>
          {/* Faint elegant sparkline */}
          <div className="kpi-sparkline-box">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={sparklineData}>
                <Area type="monotone" dataKey="val" stroke="#22c55e" fill="rgba(34, 197, 94, 0.05)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box today"><FiDollarSign size={20} /></div>
            <div className="kpi-info-wrapper">
              <span className="kpi-label">Total Income</span>
            </div>
            {stats?.revenueGrowth && (
              <span className={`kpi-trend ${isGrowthPositive ? "positive" : "negative"}`}>
                {isGrowthPositive ? <FiArrowUpRight size={10} /> : <FiArrowDownRight size={10} />} 
                {growthValue.replace(/[+-]/, "")}
              </span>
            )}
          </div>
          <div className="kpi-val-row">
            <div className="kpi-value">৳{Number(stats?.totalRevenueAllTime || 0).toLocaleString("en-BD")}</div>
          </div>
          <div className="kpi-sparkline-box">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={sparklineData.map(d => ({ val: d.val * 0.9 }))}>
                <Area type="monotone" dataKey="val" stroke="#f97316" fill="rgba(249, 115, 22, 0.05)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Orders Paid */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box month"><FiBox size={20} /></div>
            <div className="kpi-info-wrapper">
              <span className="kpi-label">Orders Paid</span>
            </div>
          </div>
          <div className="kpi-val-row">
            <div className="kpi-value">{stats?.orderStatusCounts?.Delivered || 0}</div>
          </div>
          <div className="kpi-sparkline-box">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={sparklineData.map(d => ({ val: Math.abs(d.val - 300) }))}>
                <Area type="monotone" dataKey="val" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.05)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 4: Total Visitors / Customers */}
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box growth"><FiUsers size={20} /></div>
            <div className="kpi-info-wrapper">
              <span className="kpi-label">Total Visitors</span>
            </div>
          </div>
          <div className="kpi-val-row">
            <div className="kpi-value">{(stats?.totalUsersCount || 0).toLocaleString()}</div>
          </div>
          <div className="kpi-sparkline-box">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={sparklineData.map(d => ({ val: d.val + 200 }))}>
                <Area type="monotone" dataKey="val" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.05)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

      {/* Bento Grid layout containing charts & list details */}
      <div className="admin-bento-grid">
        
        {/* Left Column: Recent sales performance & Top products */}
        <div className="bento-left-col">
          {/* Recent Order Chart Widget */}
          <div className="card chart-card bento-card" style={{ marginBottom: 24 }}>
            <div className="chart-header">
              <div>
                <h2 className="display-xs">Recent Order</h2>
                <span className="caption-md text-graphite" style={{ marginTop: 2, display: "block" }}>Sales performance tracking</span>
              </div>
              <button className="copy-btn-mini" style={{ padding: 8 }}><FiMoreHorizontal size={18} /></button>
            </div>
            
            <div className="chart-container">
              {stats?.monthlySales && stats.monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="recentOrderGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary-bright)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="var(--color-primary-bright)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8" 
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `৳${Number(v).toLocaleString("en-BD")}`}
                      dx={-10}
                    />
                    <Tooltip 
                      formatter={(value) => [`৳${Number(value).toLocaleString("en-BD")}`, "Sales"]}
                      contentStyle={{ 
                        background: "white", 
                        border: "none", 
                        borderRadius: "8px", 
                        boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                        fontFamily: "var(--font-family)"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="totalsales" 
                      stroke="var(--color-primary)" 
                      strokeWidth={3} 
                      fillOpacity={1}
                      fill="url(#recentOrderGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">No transaction history found.</div>
              )}
            </div>
          </div>

          {/* Top Products (Clean list like Remos) */}
          <div className="card detail-section-card bento-card">
            <div className="detail-section-header">
              <h2 className="display-xs">Top Products</h2>
              <Link to="/admin/products" className="view-all-link">View all</Link>
            </div>
            
            <div className="detail-table-wrapper">
              {stats?.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topSellingProducts.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="table-product-cell">
                            <img src={p.image || "https://placehold.co/40"} alt={p.name} className="table-thumb" />
                            <div className="flex-col">
                              <span className="table-product-name truncate" style={{ maxWidth: "240px" }} title={p.name}>{p.name}</span>
                              <span className="caption-sm text-graphite" style={{ marginTop: 2 }}>{p.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center body-emphasis" style={{ color: "var(--color-ink)" }}>{p.total_sold} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="detail-empty">No products sales logged.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Processing Orders Action Queue, Category Breakdown, Alerts */}
        <div className="bento-right-col">
          
          {/* Action Queue: Processing Orders */}
          <div className="card detail-section-card bento-card" style={{ marginBottom: 24 }}>
            <div className="detail-section-header">
              <h2 className="display-xs" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Processing Orders
                <span className="bento-badge" style={{ backgroundColor: "var(--color-primary-soft)", color: "var(--color-primary)", fontSize: "11px", padding: "2px 8px", borderRadius: "10px", fontWeight: 800 }}>
                  {processingOrders.length} active
                </span>
              </h2>
              <Link to="/admin/orders" className="view-all-link">Fulfill</Link>
            </div>
            
            <div className="processing-orders-list" style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 350, overflowY: "auto", paddingRight: 4 }}>
              {processingOrders.length > 0 ? (
                processingOrders.slice(0, 5).map((order) => (
                  <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-hairline)", paddingBottom: 12 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="flex gap-xs" style={{ alignItems: "center" }}>
                        <span className="order-short-id" style={{ fontSize: "12.5px" }}>#{order.id.slice(0, 8)}</span>
                        <span className="caption-sm text-graphite" style={{ fontSize: "11px" }}>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: "13.5px", color: "var(--color-ink)", marginTop: 2 }} className="truncate">
                        {order.shipping_info?.full_name || "Guest Customer"}
                      </p>
                      <span className="caption-sm text-graphite truncate" style={{ fontSize: "11.5px", display: "block", marginTop: 2 }} title={order.order_items?.map(i => `${i.quantity}x ${i.title}`).join(", ")}>
                        {order.order_items?.map(i => `${i.quantity}x ${i.title}`).join(", ")}
                      </span>
                    </div>
                    <div className="text-right" style={{ flexShrink: 0, marginLeft: 12 }}>
                      <span className="body-emphasis" style={{ fontSize: "14px", color: "var(--color-ink)", display: "block" }}>৳{Number(order.total_price).toLocaleString("en-BD")}</span>
                      <Link to="/admin/orders" className="view-all-link" style={{ fontSize: "11.5px", display: "inline-block", marginTop: 4 }}>Fulfill →</Link>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--color-graphite)" }}>
                  <FiCheckCircle size={32} style={{ color: "#22c55e", marginBottom: 8, display: "inline-block" }} />
                  <p className="caption-md" style={{ fontWeight: 600 }}>All orders processed!</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Categories By Sales */}
          <div className="card detail-section-card bento-card" style={{ marginBottom: 24 }}>
            <div className="detail-section-header">
              <h2 className="display-xs">Top Categories By Sales</h2>
              <span className="view-all-link">View all</span>
            </div>

            <div className="low-stock-list-container" style={{ marginTop: 10 }}>
              {categorySalesData.length > 0 ? (
                <div className="low-stock-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {categorySalesData.map((cat, idx) => (
                    <div key={idx} className="flex-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--color-hairline)" }}>
                      <div className="flex-center gap-md">
                        <span 
                          className="legend-dot" 
                          style={{ 
                            backgroundColor: cat.color, 
                            width: 12, 
                            height: 12, 
                            borderRadius: "50%", 
                            boxShadow: `0 2px 6px ${cat.color}50` 
                          }} 
                        />
                        <div className="flex-col">
                          <span className="body-emphasis" style={{ color: "var(--color-ink)", fontSize: "14px" }}>{cat.name}</span>
                          <span className="caption-sm text-graphite">{cat.share} market share</span>
                        </div>
                      </div>

                      <div className="flex-center gap-lg">
                        <div className="flex-col text-right">
                          <span className="body-emphasis" style={{ color: "var(--color-ink)", fontSize: "14.5px" }}>
                            ৳{Number(cat.revenue).toLocaleString("en-BD")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="detail-empty" style={{ minHeight: "150px" }}>No category sales logged.</div>
              )}
            </div>
          </div>

          {/* Inventory Warning Alerts Banner */}
          {stats?.lowStockProducts?.length > 0 && (
            <div className="card detail-section-card bento-card" style={{ borderLeft: "4px solid var(--color-error)", padding: 20 }}>
              <div className="flex-between">
                <div className="flex-center gap-sm">
                  <FiAlertTriangle className="alert-icon-warning" size={20} />
                  <div>
                    <h3 className="body-emphasis" style={{ color: "var(--color-ink)" }}>Inventory Stock Warnings</h3>
                    <p className="caption-md text-graphite" style={{ marginTop: 2 }}>The following products have 5 or fewer items remaining in stock:</p>
                  </div>
                </div>
              </div>
              <div className="low-stock-list" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {stats.lowStockProducts.map((p, idx) => (
                  <div key={idx} className="low-stock-item flex-between" style={{ margin: 0 }}>
                    <span className="low-stock-name truncate" style={{ maxWidth: "160px" }}>{p.name}</span>
                    <span className={`badge stock-indicator-badge ${p.stock === 0 ? "out-of-stock" : "warning"}`}>
                      {p.stock === 0 ? "Out of Stock" : `${p.stock} units`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
