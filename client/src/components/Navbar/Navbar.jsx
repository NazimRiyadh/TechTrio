import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiPackage, FiSettings } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navbar.css";

const categories = [
  "Laptops & Desktops",
  "Smartphones & Tablets",
  "Audio & Headphones",
  "Monitors & Displays",
  "PC Components",
  "Peripherals & Gaming",
  "Gadgets & Drones"
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenu(false);
    navigate("/");
  };

  return (
    <header className="navbar-wrapper">
      {/* Main Nav */}
      <nav className="nav-bar-top">
        <div className="nav-inner">
          {/* Left: Logo */}
          <Link to="/" className="nav-logo display-sm">
            tech<span className="text-primary">trio</span>
          </Link>

          {/* Center: Nav Links */}
          <div className="nav-links">
            <Link to="/shop" className="nav-link body-md">Shop All</Link>
            <div className="nav-dropdown-wrapper">
              <button className="nav-link body-md dropdown-trigger">
                Categories <span className="chevron-icon">▼</span>
              </button>
              <div className="categories-dropdown">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    className="category-dropdown-item"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Search + Cart + User */}
          <div className="nav-actions">
            <form onSubmit={handleSearch} className="nav-search-form">
              <FiSearch className="nav-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nav-search-input"
              />
            </form>

            {(!user || user.role !== "admin") && (
              <Link to="/cart" className="nav-icon-btn" aria-label="Cart">
                <FiShoppingCart size={20} />
                {count > 0 && <span className="cart-badge">{count}</span>}
              </Link>
            )}

            {user ? (
              <div className="user-menu-wrapper">
                <button
                  className="nav-user-trigger"
                  onClick={() => setUserMenu(!userMenu)}
                  aria-label="User menu"
                >
                  {user.avatar?.url ? (
                    <img src={user.avatar.url} alt="" className="nav-avatar" />
                  ) : (
                    <span className="nav-avatar-fallback">
                      <FiUser size={16} />
                    </span>
                  )}
                  <span className="nav-username">{user.name?.split(" ")[0]}</span>
                </button>
                {userMenu && (
                  <div className="user-dropdown" onMouseLeave={() => setUserMenu(false)}>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenu(false)}>
                      <FiUser size={16} /> Profile
                    </Link>
                    {user.role !== "admin" && (
                      <Link to="/orders" className="dropdown-item" onClick={() => setUserMenu(false)}>
                        <FiPackage size={16} /> My Orders
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setUserMenu(false)}>
                        <FiSettings size={16} /> Admin Panel
                      </Link>
                    )}
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm nav-signin-btn">
                Sign In
              </Link>
            )}

            <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-inner">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <FiSearch className="nav-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="nav-search-input"
              />
            </form>
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="mobile-link body-lg"
                onClick={() => setMobileOpen(false)}
              >
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
