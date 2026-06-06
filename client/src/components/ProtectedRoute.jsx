import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

export const BuyerRoute = ({ children, requireAuth = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (requireAuth && !user) return <Navigate to="/login" replace />;
  if (user && user.role === "admin") return <Navigate to="/admin" replace />;
  return children;
};
