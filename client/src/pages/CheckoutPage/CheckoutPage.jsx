import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import API from "../../api/axios";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import {
  FiCheck,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiShield,
  FiLock,
} from "react-icons/fi";
import "./CheckoutPage.css";

/* ───────── Stripe promise (loaded once) ───────── */
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

let stripePromise = null;
const getStripe = async () => {
  if (stripePromise) return stripePromise;

  // Prefer env var, fallback to fetching from server
  let key = stripeKey;
  if (!key) {
    try {
      const { data } = await API.get("/api/v1/payment/stripe-key");
      key = data.stripePublishableKey;
    } catch {
      console.error("Could not fetch Stripe publishable key");
      return null;
    }
  }
  stripePromise = loadStripe(key);
  return stripePromise;
};

/* ─────────────────────────────────────────────────
   Inner Payment Form (runs inside <Elements>)
   ───────────────────────────────────────────────── */
const PaymentForm = ({ onSuccess, onBack, totalLabel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/orders",
        },
        redirect: "if_required",
      });

      if (error) {
        showToast(error.message, "error");
      } else if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "requires_capture")
      ) {
        onSuccess();
      }
    } catch (err) {
      showToast("Payment failed. Please try again.", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-element-wrapper">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Security badges */}
      <div className="payment-security">
        <div className="payment-security-item">
          <FiLock size={14} />
          <span>SSL Encrypted</span>
        </div>
        <div className="payment-security-item">
          <FiShield size={14} />
          <span>Secure Checkout</span>
        </div>
      </div>

      <div className="payment-actions">
        <button
          type="button"
          className="btn btn-outline-ink"
          onClick={onBack}
          disabled={processing}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn btn-primary payment-submit-btn"
          disabled={!stripe || !ready || processing}
        >
          {processing ? (
            <span className="payment-spinner-wrap">
              <span className="payment-spinner" />
              Processing…
            </span>
          ) : (
            <>
              <FiLock size={15} />
              Pay {totalLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────────
   Main CheckoutPage
   ───────────────────────────────────────────────── */
const CheckoutPage = () => {
  const { items, total, subtotal, tax, shipping, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [serverTotal, setServerTotal] = useState(null);
  const [stripeInstance, setStripeInstance] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({
    full_name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    phone: "",
  });

  // Load Stripe on mount
  useEffect(() => {
    getStripe().then(setStripeInstance);
  }, []);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && !clientSecret) {
      navigate("/cart");
    }
  }, [items, clientSecret, navigate]);

  const steps = [
    { label: "Shipping", icon: FiTruck },
    { label: "Review", icon: FiPackage },
    { label: "Payment", icon: FiCreditCard },
  ];

  /* ──── Step 2 → 3: Place order & get clientSecret ──── */
  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderedItems = items.map((i) => ({
        product: { id: i.id, images: i.image ? [{ url: i.image }] : [] },
        quantity: i.quantity,
      }));

      const { data } = await API.post("/api/v1/order/new", {
        ...shippingInfo,
        orderedItems,
      });

      setClientSecret(data.paymentIntent);
      setServerTotal(data.total_price);
      setStep(3);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to place order",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ──── Payment success ──── */
  const handlePaymentSuccess = () => {
    clearCart();
    setStep(4);
  };

  // Automatically redirect after a few seconds when payment succeeds (step 4)
  // This allows the server webhook to process safely and prevents race conditions
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        navigate("/orders");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const displayTotal = serverTotal ?? total;

  if (items.length === 0 && !clientSecret) return null;

  return (
    <main className="section">
      <div className="container">
        {step === 4 ? (
          <div className="checkout-success-card">
            <div className="success-circle">
              <FiCheck size={40} />
            </div>
            <h2
              className="display-md"
              style={{ marginBottom: 12, fontWeight: 700 }}
            >
              Payment Confirmed!
            </h2>
            <p
              className="body-md text-graphite"
              style={{ maxWidth: 480, margin: "0 auto 24px", lineHeight: 1.6 }}
            >
              Thank you for your purchase! Your payment was processed
              successfully. We are preparing your order details and redirecting
              you to your order status page.
            </p>
            <div
              className="success-redirect-loader flex flex-center gap-xs"
              style={{ marginBottom: 32 }}
            >
              <span
                className="payment-spinner"
                style={{
                  borderTopColor: "var(--color-primary)",
                  width: 16,
                  height: 16,
                }}
              />
              <span className="caption-md text-graphite">
                Confirming order details and redirecting...
              </span>
            </div>
            <div className="flex gap-md" style={{ justifyContent: "center" }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/orders")}
              >
                Go to My Orders
              </button>
              <button
                className="btn btn-outline-ink"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="display-lg" style={{ marginBottom: 8 }}>
              Checkout
            </h1>

            {/* ──── Step Indicator ──── */}
            <div className="checkout-steps">
              {steps.map((s, i) => {
                const StepIcon = s.icon;
                const isActive = step >= i + 1;
                const isDone = step > i + 1;
                return (
                  <div
                    key={s.label}
                    className={`checkout-step ${isActive ? "checkout-step-active" : ""} ${isDone ? "checkout-step-done" : ""}`}
                  >
                    <span className="checkout-step-num">
                      {isDone ? <FiCheck size={14} /> : <StepIcon size={14} />}
                    </span>
                    <span className="checkout-step-label">{s.label}</span>
                    {i < steps.length - 1 && (
                      <span className="checkout-step-connector" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="cart-layout">
              {/* ──── Left Column ──── */}
              <div>
                {/* STEP 1: Shipping */}
                {step === 1 && (
                  <div className="card checkout-card">
                    <h2 className="display-xs checkout-card-title">
                      <FiTruck size={20} />
                      Shipping Details
                    </h2>
                    <form
                      className="auth-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setStep(2);
                      }}
                    >
                      <div>
                        <label className="input-label">Full Name</label>
                        <input
                          type="text"
                          className="input"
                          required
                          placeholder="John Doe"
                          value={shippingInfo.full_name}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              full_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="input-label">Address</label>
                        <input
                          type="text"
                          className="input"
                          required
                          placeholder="123 Main Street, Apt 4"
                          value={shippingInfo.address}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                          <label className="input-label">City</label>
                          <input
                            type="text"
                            className="input"
                            required
                            placeholder="New York"
                            value={shippingInfo.city}
                            onChange={(e) =>
                              setShippingInfo({
                                ...shippingInfo,
                                city: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="input-label">State</label>
                          <input
                            type="text"
                            className="input"
                            required
                            placeholder="NY"
                            value={shippingInfo.state}
                            onChange={(e) =>
                              setShippingInfo({
                                ...shippingInfo,
                                state: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-md">
                        <div style={{ flex: 1 }}>
                          <label className="input-label">PIN Code</label>
                          <input
                            type="text"
                            className="input"
                            required
                            placeholder="10001"
                            value={shippingInfo.pincode}
                            onChange={(e) =>
                              setShippingInfo({
                                ...shippingInfo,
                                pincode: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="input-label">Country</label>
                          <input
                            type="text"
                            className="input"
                            required
                            placeholder="United States"
                            value={shippingInfo.country}
                            onChange={(e) =>
                              setShippingInfo({
                                ...shippingInfo,
                                country: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="input-label">Phone</label>
                        <input
                          type="tel"
                          className="input"
                          required
                          placeholder="+1 (555) 123-4567"
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo({
                              ...shippingInfo,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <button type="submit" className="btn btn-primary w-full">
                        Continue to Review
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 2: Review */}
                {step === 2 && (
                  <div className="card checkout-card">
                    <h2 className="display-xs checkout-card-title">
                      <FiPackage size={20} />
                      Review Your Order
                    </h2>

                    {/* Shipping summary */}
                    <div className="checkout-shipping-summary">
                      <p className="caption-md text-graphite">Shipping to:</p>
                      <p className="body-emphasis">{shippingInfo.full_name}</p>
                      <p className="body-md">
                        {shippingInfo.address}, {shippingInfo.city},{" "}
                        {shippingInfo.state} {shippingInfo.pincode},{" "}
                        {shippingInfo.country}
                      </p>
                      <p className="caption-md text-graphite">
                        Phone: {shippingInfo.phone}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="checkout-review-items">
                      {items.map((item) => (
                        <div key={item.id} className="checkout-review-item">
                          <div className="checkout-review-item-img">
                            {item.image ? (
                              <img src={item.image} alt={item.name} />
                            ) : (
                              <FiPackage size={24} />
                            )}
                          </div>
                          <div className="checkout-review-item-info">
                            <span className="body-emphasis truncate">
                              {item.name}
                            </span>
                            <span className="caption-md text-graphite">
                              Qty: {item.quantity}
                            </span>
                          </div>
                          <span className="body-emphasis">
                            ৳{(item.price * item.quantity).toLocaleString("en-BD")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-md" style={{ marginTop: 24 }}>
                      <button
                        className="btn btn-outline-ink"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        {loading ? (
                          <span className="payment-spinner-wrap">
                            <span className="payment-spinner" />
                            Creating Order…
                          </span>
                        ) : (
                          "Continue to Payment"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Payment via Stripe Elements */}
                {step === 3 && clientSecret && stripeInstance && (
                  <div className="card checkout-card">
                    <h2 className="display-xs checkout-card-title">
                      <FiCreditCard size={20} />
                      Payment
                    </h2>
                    <Elements
                      stripe={stripeInstance}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "stripe",
                          variables: {
                            colorPrimary: "#024ad8",
                            colorBackground: "#ffffff",
                            colorText: "#1a1a1a",
                            colorDanger: "#b3262b",
                            fontFamily: "'Inter', sans-serif",
                            borderRadius: "4px",
                            spacingUnit: "4px",
                          },
                          rules: {
                            ".Input": {
                              border: "1px solid #c2c2c2",
                              boxShadow: "none",
                              padding: "12px 16px",
                              fontSize: "16.5px",
                              transition: "border-color 0.2s",
                            },
                            ".Input:focus": {
                              border: "1px solid #1a1a1a",
                              boxShadow: "none",
                            },
                            ".Label": {
                              fontSize: "14.4px",
                              fontWeight: "500",
                              color: "#1a1a1a",
                            },
                          },
                        },
                      }}
                    >
                      <PaymentForm
                        onSuccess={handlePaymentSuccess}
                        onBack={() => setStep(2)}
                        totalLabel={`৳${Math.round(displayTotal).toLocaleString("en-BD")}`}
                      />
                    </Elements>
                  </div>
                )}

                {step === 3 && !stripeInstance && (
                  <div
                    className="card checkout-card"
                    style={{ textAlign: "center", padding: 48 }}
                  >
                    <div
                      className="spinner"
                      style={{ margin: "0 auto 16px" }}
                    />
                    <p className="body-md text-graphite">
                      Loading payment form…
                    </p>
                  </div>
                )}
              </div>

              {/* ──── Right Column: Order Summary ──── */}
              <div className="cart-summary card checkout-summary-card">
                <h2 className="display-xs" style={{ marginBottom: 20 }}>
                  Order Summary
                </h2>

                <div className="checkout-summary-items">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="cart-summary-row flex-between caption-md"
                    >
                      <span className="truncate" style={{ maxWidth: "65%" }}>
                        {item.name} ×{item.quantity}
                      </span>
                      <span>৳{(item.price * item.quantity).toLocaleString("en-BD")}</span>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-row flex-between caption-md">
                  <span>Subtotal</span>
                  <span>৳{Math.round(subtotal).toLocaleString("en-BD")}</span>
                </div>
                <div className="cart-summary-row flex-between caption-md">
                  <span>Tax</span>
                  <span>৳{Math.round(tax).toLocaleString("en-BD")}</span>
                </div>
                <div className="cart-summary-row flex-between caption-md">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `৳${Math.round(shipping).toLocaleString("en-BD")}`}
                  </span>
                </div>

                <div className="cart-summary-divider" />

                <div className="cart-summary-row flex-between display-xs">
                  <span>Total</span>
                  <span>৳{Math.round(displayTotal).toLocaleString("en-BD")}</span>
                </div>

                {step === 3 && serverTotal && serverTotal !== total && (
                  <p
                    className="caption-sm text-graphite"
                    style={{ marginTop: 8 }}
                  >
                    * Final total calculated by server (includes 18% tax +
                    shipping).
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;
