import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const categories = ["Laptops", "Smartphones", "Audio", "Monitors", "Gaming", "Accessories"];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/shop?search=${encodeURIComponent(search.trim())}`); setSearch(""); }
  };

  const handleLogout = async () => { await logout(); setUserMenu(false); navigate("/"); };

  return (
    <header className="navbar-wrapper">
      {/* Utility Strip */}
      <div className="utility-strip">
        <div className="container flex-between">
          <div className="utility-left caption-md">
            <span>Free shipping on orders over $500</span>
          </div>
          <div className="utility-right caption-md flex gap-md">
            {!user ? (
              <>
                <Link to="/login">Sign In</Link>
                <span style={{ opacity: 0.4 }}>|</span>
                <Link to="/register">Create Account</Link>
              </>
            ) : (
              <span>Welcome, {user.name?.split(" ")[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="nav-bar-top">
        <div className="container flex-between">
          <Link to="/" className="nav-logo display-sm">
            Big<span className="text-primary">Bazar</span>
          </Link>

          {/* Desktop Category Links */}
          <div className="nav-links">
            {categories.map((cat) => (
              <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="nav-link body-md">
                {cat}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="nav-actions flex gap-md">
            <form onSubmit={handleSearch} className="nav-search-form">
              <FiSearch className="nav-search-icon" />
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="nav-search-input" />
            </form>

            <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
              <FiShoppingCart size={20} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>

            {user ? (
              <div className="user-menu-wrapper">
                <button className="nav-icon-btn" onClick={() => setUserMenu(!userMenu)} aria-label="User menu">
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt="" className="nav-avatar" />
                  ) : (
                    <FiUser size={20} />
                  )}
                </button>
                {userMenu && (
                  <div className="user-dropdown" onMouseLeave={() => setUserMenu(false)}>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenu(false)}><FiUser size={16} /> Profile</Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenu(false)}><FiPackage size={16} /> My Orders</Link>
                    {user.role === "admin" && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setUserMenu(false)}><FiSettings size={16} /> Admin Panel</Link>
                    )}
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}><FiLogOut size={16} /> Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}

            <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="container flex-col gap-md">
            {categories.map((cat) => (
              <Link key={cat} to={`/shop?category=${encodeURIComponent(cat)}`} className="mobile-link body-lg" onClick={() => setMobileOpen(false)}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
