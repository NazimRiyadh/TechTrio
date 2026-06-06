import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import API from "../../api/axios";
import "./OrdersPage.css";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/api/v1/order/${orderId}`);
        // Backend returns { orders: { ...singleOrder } }
        setOrder(data.orders);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [orderId]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!order) return <div className="page-loader"><p>Order not found.</p></div>;

  // Backend returns order_items (from join) and shipping_info (json_build_object)
  const items = order.order_items || [];
  const ship = order.shipping_info || {};

  return (
    <main className="section">
      <div className="container">
        <Link to="/orders" className="btn btn-text-link" style={{ marginBottom: 24, display: "inline-flex" }}><FiArrowLeft /> Back to Orders</Link>
        <h1 className="display-lg" style={{ marginBottom: 24 }}>Order #{order.id?.slice(0, 8)}</h1>
        <div className="cart-layout">
          <div>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h2 className="display-xs" style={{ marginBottom: 16 }}>Items</h2>
              {items.map((item, i) => (
                <div key={item.order_item_id || i} className="flex-between body-md" style={{ padding: "10px 0", borderBottom: "1px solid var(--color-hairline)" }}>
                  <div className="flex gap-md" style={{ alignItems: "center" }}>
                    {item.image && <img src={item.image} alt="" style={{ width: 48, height: 48, borderRadius: "var(--rounded-lg)", objectFit: "contain", background: "var(--color-cloud)" }} />}
                    <div>
                      <p className="body-emphasis">{item.title || `Product ${item.product_id?.slice(0, 8)}`}</p>
                      <p className="caption-md text-graphite">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="body-emphasis">৳{(Number(item.price) * item.quantity).toLocaleString("en-BD")}</span>
                </div>
              ))}
            </div>
            {ship.full_name && (
              <div className="card" style={{ padding: 24 }}>
                <h2 className="display-xs" style={{ marginBottom: 12 }}>Shipping Address</h2>
                <p className="body-emphasis">{ship.full_name}</p>
                <p className="body-md">{ship.address}, {ship.city}, {ship.state} {ship.pincode}, {ship.country}</p>
                <p className="caption-md text-graphite">Phone: {ship.phone}</p>
              </div>
            )}
          </div>
          <div className="cart-summary card" style={{ padding: 28 }}>
            <h2 className="display-xs" style={{ marginBottom: 16 }}>Summary</h2>
            <div className="cart-summary-row flex-between body-md"><span>Status</span><span className="badge badge-ink">{order.order_status}</span></div>
            <div className="cart-summary-row flex-between body-md"><span>Subtotal</span><span>৳{Number(order.total_price).toLocaleString("en-BD")}</span></div>
            <div className="cart-summary-row flex-between body-md"><span>Tax</span><span>৳{Number(order.tax_price).toLocaleString("en-BD")}</span></div>
            <div className="cart-summary-row flex-between body-md"><span>Shipping</span><span>৳{Number(order.shipping_price).toLocaleString("en-BD")}</span></div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row flex-between display-xs"><span>Total</span><span>৳{Number(order.total_price).toLocaleString("en-BD")}</span></div>
            <div className="cart-summary-row flex-between caption-md text-graphite"><span>Placed</span><span>{new Date(order.created_at).toLocaleDateString()}</span></div>
            {order.paid_at && <div className="cart-summary-row flex-between caption-md text-graphite"><span>Paid</span><span>{new Date(order.paid_at).toLocaleDateString()}</span></div>}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetailPage;
