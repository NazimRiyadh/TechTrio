import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FiGrid, 
  FiBox, 
  FiShoppingCart, 
  FiUsers, 
  FiMenu, 
  FiX, 
  FiLogOut, 
  FiHome,
  FiUser
} from "react-icons/fi";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin":
        return "Dashboard Overview";
      case "/admin/products":
        return "Product Inventory";
      case "/admin/orders":
        return "Order Management";
      case "/admin/users":
        return "Customer Accounts";
      default:
        return "Admin Portal";
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <button 
          className="admin-hamburger-btn" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <Link to="/admin" className="admin-mobile-logo">
          tech<span>trio</span> <small>Admin</small>
        </Link>
        <div className="admin-mobile-avatar">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt="Profile" />
          ) : (
            <div className="admin-avatar-fallback"><FiUser size={16} /></div>
          )}
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Nav */}
      <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-header">
          {!collapsed ? (
            <>
              <Link to="/admin" className="admin-sidebar-logo">
                tech<span>trio</span>
                <span className="admin-badge">Admin</span>
              </Link>
              <button
                className="sidebar-collapse-toggle desktop-only"
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Collapse Sidebar"
              >
                <FiMenu size={18} />
              </button>
            </>
          ) : (
            <button
              className="sidebar-collapsed-toggle-btn desktop-only"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Expand Sidebar"
              title="Expand Sidebar"
            >
              <span className="logo-letter">t.</span>
            </button>
          )}
        </div>

        {/* Quick Admin Profile Card */}
        {user && (
          <div className="admin-profile-card">
            <div className="admin-profile-avatar-wrapper">
              {user.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} className="admin-profile-avatar" />
              ) : (
                <div className="admin-profile-avatar fallback"><FiUser size={24} /></div>
              )}
              <span className="admin-status-dot"></span>
            </div>
            {!collapsed && (
              <div className="admin-profile-info">
                <span className="admin-profile-name truncate">{user.name}</span>
                <span className="admin-profile-role">Administrator</span>
              </div>
            )}
          </div>
        )}

        {/* Sidebar Links */}
        <nav className="admin-sidebar-nav">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            title="Dashboard Overview"
          >
            <FiGrid className="nav-icon" size={20} />
            <span className="nav-label">Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            title="Product Inventory"
          >
            <FiBox className="nav-icon" size={20} />
            <span className="nav-label">Products</span>
          </NavLink>
          
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            title="Order Management"
          >
            <FiShoppingCart className="nav-icon" size={20} />
            <span className="nav-label">Orders</span>
          </NavLink>
          
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
            title="Customer Accounts"
          >
            <FiUsers className="nav-icon" size={20} />
            <span className="nav-label">Customers</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer Operations */}
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-item store-link" title="View Front Store">
            <FiHome className="nav-icon" size={20} />
            <span className="nav-label">View Store</span>
          </Link>
          <button onClick={handleLogout} className="admin-nav-item logout-btn" title="Sign Out">
            <FiLogOut className="nav-icon" size={20} />
            <span className="nav-label">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Section */}
      <main className="admin-main-container">
        {/* Topbar Header */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <h1 className="admin-page-title display-xs">{getPageTitle()}</h1>
          </div>
          <div className="admin-topbar-right flex gap-md">
            <div className="admin-topbar-profile flex gap-sm">
              <div className="admin-topbar-avatar">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user?.name} />
                ) : (
                  <div className="fallback-avatar"><FiUser size={16} /></div>
                )}
              </div>
              <div className="admin-topbar-info flex-col">
                <span className="topbar-name">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Active Page Outlet */}
        <div className="admin-content-viewport">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
