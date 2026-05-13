import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./AuthPages.css";

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      showToast("Welcome back!");
      navigate("/");
    } catch (err) { showToast(err.response?.data?.message || "Login failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <main className="auth-page section">
      <div className="auth-card card">
        <h1 className="display-md text-center">Sign In</h1>
        <p className="body-md text-graphite text-center" style={{ marginTop: 8, marginBottom: 28 }}>Welcome back to BigBazar</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="input-label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input type="password" className="input" placeholder="••••••••" required
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="flex-between" style={{ marginTop: -4 }}>
            <span />
            <Link to="/forgot-password" className="btn-text-link caption-md">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="body-md text-center" style={{ marginTop: 20 }}>
          Don't have an account? <Link to="/register" className="text-primary body-emphasis">Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
