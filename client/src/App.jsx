import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute, AdminRoute, BuyerRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Chatbot from "./components/Chatbot/Chatbot";
import AdminLayout from "./components/AdminLayout/AdminLayout";

// Scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Pages
import HomePage from "./pages/HomePage/HomePage";
import ShopPage from "./pages/ShopPage/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage/ProductDetailPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import CartPage from "./pages/CartPage/CartPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import MyOrdersPage from "./pages/OrdersPage/MyOrdersPage";
import OrderDetailPage from "./pages/OrdersPage/OrderDetailPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminUsers from "./pages/Admin/AdminUsers";

// Root App Layout and Routes Wrapper
const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPath && <Navbar />}
      <Routes>
        {/* Public customer pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/password/reset/:token" element={<ResetPasswordPage />} />
        
        {/* Cart Page: Block admin */}
        <Route path="/cart" element={<BuyerRoute><CartPage /></BuyerRoute>} />

        {/* Protected Buyer Paths */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/checkout" element={<BuyerRoute requireAuth={true}><CheckoutPage /></BuyerRoute>} />
        <Route path="/orders" element={<BuyerRoute requireAuth={true}><MyOrdersPage /></BuyerRoute>} />
        <Route path="/order/:orderId" element={<BuyerRoute requireAuth={true}><OrderDetailPage /></BuyerRoute>} />

        {/* Admin Layout (No customer chrome, dedicated sidebar shell) */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <Chatbot />}
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <ScrollToTop />
              <AppContent />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
