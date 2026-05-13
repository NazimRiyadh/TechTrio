import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    full_name: "", address: "", city: "", state: "", pincode: "", country: "", phone: "",
  });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Backend expects orderedItems with { product: { id, images }, quantity }
      const orderedItems = items.map((i) => ({
        product: { id: i.id, images: i.image ? [{ url: i.image }] : [] },
        quantity: i.quantity,
      }));

      const { data } = await API.post("/api/v1/order/new", {
        ...shippingInfo,
        orderedItems,
      });

      // The backend already creates the payment intent and returns clientSecret
      // In a full Stripe Elements integration, you'd confirm the payment here.
      // For now, the order is placed and payment intent is created server-side.
      showToast("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (err) {
      showToast(err.response?.data?.message || "Order failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) { navigate("/cart"); return null; }

  return (
    <main className="section">
      <div className="container">
        <h1 className="display-lg" style={{ marginBottom: 8 }}>Checkout</h1>
        {/* Steps */}
        <div className="checkout-steps flex gap-md" style={{ marginBottom: 32 }}>
          {["Shipping", "Review & Pay"].map((s, i) => (
            <div key={s} className={`checkout-step ${step >= i + 1 ? "checkout-step-active" : ""}`}>
              <span className="checkout-step-num">{i + 1}</span> {s}
            </div>
          ))}
        </div>

        <div className="cart-layout">
          <div>
            {step === 1 && (
              <div className="card" style={{ padding: 28 }}>
                <h2 className="display-xs" style={{ marginBottom: 20 }}>Shipping Details</h2>
                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                  <div>
                    <label className="input-label">Full Name</label>
                    <input type="text" className="input" required value={shippingInfo.full_name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="input-label">Address</label>
                    <input type="text" className="input" required value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} />
                  </div>
                  <div className="flex gap-md">
                    <div style={{ flex: 1 }}>
                      <label className="input-label">City</label>
                      <input type="text" className="input" required value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="input-label">State</label>
                      <input type="text" className="input" required value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-md">
                    <div style={{ flex: 1 }}>
                      <label className="input-label">PIN Code</label>
                      <input type="text" className="input" required value={shippingInfo.pincode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="input-label">Country</label>
                      <input type="text" className="input" required value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Phone</label>
                    <input type="tel" className="input" required value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary">Continue to Review</button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="card" style={{ padding: 28 }}>
                <h2 className="display-xs" style={{ marginBottom: 20 }}>Review Your Order</h2>
                <div style={{ marginBottom: 20, padding: 16, background: "var(--color-cloud)", borderRadius: "var(--rounded-lg)" }}>
                  <p className="caption-md text-graphite">Shipping to:</p>
                  <p className="body-emphasis">{shippingInfo.full_name}</p>
                  <p className="body-md">{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.pincode}, {shippingInfo.country}</p>
                  <p className="caption-md text-graphite">Phone: {shippingInfo.phone}</p>
                </div>
                {items.map((item) => (
                  <div key={item.id} className="flex-between body-md" style={{ padding: "8px 0", borderBottom: "1px solid var(--color-hairline)" }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex gap-md" style={{ marginTop: 20 }}>
                  <button className="btn btn-outline-ink" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? "Placing Order..." : `Place Order — $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="cart-summary card" style={{ padding: 28 }}>
            <h2 className="display-xs" style={{ marginBottom: 20 }}>Summary</h2>
            <p className="caption-md text-graphite" style={{ marginBottom: 12 }}>
              Tax (18%) and shipping are calculated by the server.
            </p>
            {items.map((item) => (
              <div key={item.id} className="cart-summary-row flex-between caption-md">
                <span className="truncate" style={{ maxWidth: "65%" }}>{item.name} ×{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="cart-summary-divider" />
            <div className="cart-summary-row flex-between display-xs"><span>Cart Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
