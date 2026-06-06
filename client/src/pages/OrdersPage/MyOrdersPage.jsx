import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiEye } from "react-icons/fi";
import API from "../../api/axios";
import "./OrdersPage.css";

const statusColor = { Processing: "badge-ink", Shipped: "badge-outline", Delivered: "badge-sale" };

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get("/api/v1/order/orders/me");
        // Backend returns { myOrders: [...] }
        setOrders(data.myOrders || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <main className="section">
      <div className="container">
        <h1 className="display-lg" style={{ marginBottom: 32 }}><FiPackage style={{ marginRight: 8 }} /> My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center" style={{ padding: "60px 0" }}>
            <p className="body-md text-graphite" style={{ marginBottom: 16 }}>You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-hairline)", paddingBottom: 12, flexWrap: "wrap", gap: 12 }}>
                  <div className="order-row-info">
                    <span className="body-emphasis" style={{ fontSize: 16 }}>Order #{order.id?.slice(0, 8)}</span>
                    <span className="caption-md text-graphite">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="order-row-meta flex gap-md" style={{ alignItems: "center" }}>
                    <span className={`badge ${statusColor[order.order_status] || "badge-outline"}`}>{order.order_status}</span>
                    <span className="body-emphasis" style={{ color: "var(--color-ink)", fontSize: 16 }}>৳{Number(order.total_price).toLocaleString("en-BD")}</span>
                    <Link to={`/order/${order.id}`} className="btn btn-outline-ink btn-sm"><FiEye size={14} /> View Order</Link>
                  </div>
                </div>

                {/* Stepper Status Timeline */}
                {order.order_status !== "Cancelled" ? (
                  <div className="order-stepper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "10px 0 20px", position: "relative", padding: "0 10px", width: "100%" }}>
                    {/* Background Progress Line */}
                    <div style={{
                      position: "absolute",
                      left: "35px",
                      right: "35px",
                      top: "11px",
                      height: "3px",
                      background: "var(--color-hairline)",
                      zIndex: 1
                    }} />
                    {/* Active Progress Line */}
                    <div style={{
                      position: "absolute",
                      left: "35px",
                      right: "35px",
                      top: "11px",
                      height: "3px",
                      background: "var(--color-primary)",
                      width: order.order_status === "Delivered" ? "100%" : order.order_status === "Shipped" ? "50%" : "0%",
                      transition: "width 0.5s ease",
                      zIndex: 2
                    }} />

                    {/* Step 1: Processing */}
                    <div className="step-node" style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, flex: 1 }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        border: "3px solid var(--color-canvas)",
                        boxShadow: "0 2px 5px rgba(2, 74, 216, 0.2)"
                      }}>✓</div>
                      <span className="caption-sm" style={{ fontWeight: 600, marginTop: 4, color: "var(--color-ink)", fontSize: "11.5px" }}>Processing</span>
                    </div>

                    {/* Step 2: Shipped */}
                    <div className="step-node" style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, flex: 1 }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: (order.order_status === "Shipped" || order.order_status === "Delivered") ? "var(--color-primary)" : "var(--color-steel)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        border: "3px solid var(--color-canvas)",
                        boxShadow: (order.order_status === "Shipped" || order.order_status === "Delivered") ? "0 2px 5px rgba(2, 74, 216, 0.2)" : "none"
                      }}>{(order.order_status === "Shipped" || order.order_status === "Delivered") ? "✓" : "2"}</div>
                      <span className="caption-sm" style={{ fontWeight: 600, marginTop: 4, color: (order.order_status === "Shipped" || order.order_status === "Delivered") ? "var(--color-ink)" : "var(--color-graphite)", fontSize: "11.5px" }}>Shipped</span>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="step-node" style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, flex: 1 }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: order.order_status === "Delivered" ? "var(--color-primary)" : "var(--color-steel)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                        border: "3px solid var(--color-canvas)",
                        boxShadow: order.order_status === "Delivered" ? "0 2px 5px rgba(2, 74, 216, 0.2)" : "none"
                      }}>{order.order_status === "Delivered" ? "✓" : "3"}</div>
                      <span className="caption-sm" style={{ fontWeight: 600, marginTop: 4, color: order.order_status === "Delivered" ? "var(--color-ink)" : "var(--color-graphite)", fontSize: "11.5px" }}>Delivered</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "var(--rounded-lg)", padding: "12px 18px", color: "var(--color-error)", fontSize: "13.5px", fontWeight: 600, margin: "10px 0 16px" }}>
                    This order was cancelled.
                  </div>
                )}

                {/* Items List */}
                <div className="order-items-preview" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--rounded-md)", overflow: "hidden", background: "var(--color-cloud)", border: "1px solid var(--color-hairline)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : (
                          <FiPackage size={16} style={{ color: "#94a3b8" }} />
                        )}
                      </div>
                      <div style={{ display: "flex", flex: 1, justifyContent: "space-between", alignItems: "center", minWidth: 0 }}>
                        <span className="truncate body-emphasis" style={{ fontSize: 14, color: "var(--color-ink)", maxWidth: "70%" }} title={item.title}>
                          {item.title}
                        </span>
                        <span className="caption-md text-graphite" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                          ৳{Number(item.price).toLocaleString("en-BD")} × {item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOrdersPage;
