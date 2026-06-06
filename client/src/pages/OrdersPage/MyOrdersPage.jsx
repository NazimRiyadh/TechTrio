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
              <div key={order.id} className="card order-row" style={{ padding: 20 }}>
                <div className="order-row-info">
                  <span className="body-emphasis">Order #{order.id?.slice(0, 8)}</span>
                  <span className="caption-md text-graphite">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="order-row-meta flex gap-md" style={{ alignItems: "center" }}>
                  <span className={`badge ${statusColor[order.order_status] || "badge-outline"}`}>{order.order_status}</span>
                  <span className="body-emphasis">৳{Number(order.total_price).toLocaleString("en-BD")}</span>
                  <Link to={`/order/${order.id}`} className="btn btn-outline-ink btn-sm"><FiEye size={14} /> View</Link>
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
