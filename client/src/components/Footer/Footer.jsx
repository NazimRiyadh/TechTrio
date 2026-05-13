import { Link, useNavigate } from "react-router-dom";
import { FiGithub, FiTwitter, FiInstagram, FiMail } from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  const navigate = typeof window !== 'undefined' ? null : null;

  return (
    <footer>
      {/* Help Band */}
      <section className="help-band section-ink">
        <div className="container text-center">
          <h2 className="display-md" style={{ marginBottom: 12 }}>How can we help?</h2>
          <p className="body-md text-on-ink" style={{ opacity: 0.7, marginBottom: 24 }}>
            We're here for you — browse topics, chat with us, or track your order.
          </p>
          <div className="help-tabs flex-center gap-sm" style={{ flexWrap: "wrap" }}>
            <Link to="/shop" className="tab" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)", background: "transparent", textDecoration: "none" }}>Browse Products</Link>
            <Link to="/orders" className="tab" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)", background: "transparent", textDecoration: "none" }}>Track Order</Link>
            <a href="mailto:nazimriyadh001@gmail.com" className="tab" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)", background: "transparent", textDecoration: "none" }}>Contact Us</a>
            <Link to="/forgot-password" className="tab" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)", background: "transparent", textDecoration: "none" }}>Account Help</Link>
          </div>
        </div>
      </section>

      {/* Footer Dark */}
      <div className="footer-dark section-ink">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3 className="footer-heading">Shop</h3>
              <Link to="/shop?category=Laptops">Laptops</Link>
              <Link to="/shop?category=Smartphones">Smartphones</Link>
              <Link to="/shop?category=Audio">Audio</Link>
              <Link to="/shop?category=Monitors">Monitors</Link>
              <Link to="/shop?category=Gaming">Gaming</Link>
              <Link to="/shop?category=Accessories">Accessories</Link>
            </div>
            <div className="footer-col">
              <h3 className="footer-heading">Account</h3>
              <Link to="/profile">My Profile</Link>
              <Link to="/orders">My Orders</Link>
              <Link to="/cart">Shopping Cart</Link>
              <Link to="/login">Sign In</Link>
            </div>
            <div className="footer-col">
              <h3 className="footer-heading">Support</h3>
              <a href="mailto:nazimriyadh001@gmail.com">Contact Us</a>
              <Link to="/forgot-password">Reset Password</Link>
              <Link to="/shop">Browse Products</Link>
            </div>
            <div className="footer-col">
              <h3 className="footer-heading">Connect</h3>
              <div className="footer-social flex gap-md">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="Github"><FiGithub size={18} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FiTwitter size={18} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram size={18} /></a>
                <a href="mailto:nazimriyadh001@gmail.com" aria-label="Email"><FiMail size={18} /></a>
              </div>
              <p className="body-sm" style={{ opacity: 0.5, marginTop: 16 }}>
                BigBazar — Premium Electronics
              </p>
            </div>
          </div>
          <div className="footer-bottom caption-sm">
            <span>© {new Date().getFullYear()} BigBazar. All rights reserved.</span>
            <div className="flex gap-md">
              <Link to="/shop">Shop</Link>
              <Link to="/login">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
