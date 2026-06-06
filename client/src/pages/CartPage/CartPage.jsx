import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import "./CartPage.css";

const CartPage = () => {
  const { items, removeItem, updateQty, subtotal, tax, shipping, total, count } = useCart();

  if (items.length === 0) {
    return (
      <main className="section">
        <div className="container text-center" style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <FiShoppingCart size={60} color="var(--color-steel)" />
          <h1 className="display-md" style={{ margin: "20px 0 12px" }}>Your cart is empty</h1>
          <p className="body-md text-graphite" style={{ marginBottom: 24 }}>Add some products to get started.</p>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <h1 className="display-lg" style={{ marginBottom: 32 }}>Shopping Cart ({count})</h1>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item card" style={{ padding: 20 }}>
                <div className="cart-item-img-wrap">
                  {item.image ? <img src={item.image} alt={item.name} /> : <div className="cart-item-placeholder">🛍️</div>}
                </div>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="body-emphasis text-ink">{item.name}</Link>
                  <p className="price-md text-primary" style={{ marginTop: 4 }}>৳{Number(item.price).toLocaleString("en-BD")}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="pdp-qty flex">
                    <button className="pdp-qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}><FiMinus size={14} /></button>
                    <span className="pdp-qty-val caption-md">{item.quantity}</span>
                    <button className="pdp-qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}><FiPlus size={14} /></button>
                  </div>
                  <span className="body-emphasis">৳{(item.price * item.quantity).toLocaleString("en-BD")}</span>
                  <button className="btn btn-text-link text-error" onClick={() => removeItem(item.id)}><FiTrash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary card" style={{ padding: 28 }}>
            <h2 className="display-xs" style={{ marginBottom: 20 }}>Order Summary</h2>
            <div className="cart-summary-row flex-between body-md"><span>Subtotal</span><span>৳{Math.round(subtotal).toLocaleString("en-BD")}</span></div>
            <div className="cart-summary-row flex-between body-md"><span>Tax (18% VAT)</span><span>৳{Math.round(tax).toLocaleString("en-BD")}</span></div>
            <div className="cart-summary-row flex-between body-md"><span>Shipping {shipping === 0 ? <small className="text-green">(Free)</small> : ""}</span><span>{shipping === 0 ? "Free" : `৳${Math.round(shipping).toLocaleString("en-BD")}`}</span></div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row flex-between display-xs"><span>Total</span><span>৳{Math.round(total).toLocaleString("en-BD")}</span></div>
            <Link to="/checkout" className="btn btn-primary w-full" style={{ marginTop: 20 }}>Proceed to Checkout <FiArrowRight /></Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
