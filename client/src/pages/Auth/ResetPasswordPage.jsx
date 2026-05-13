import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AuthPages.css";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { showToast("Passwords don't match", "error"); return; }
    setLoading(true);
    try {
      await API.put(`/api/v1/auth/reset/${token}`, { password: form.password, confirmPassword: form.confirmPassword });
      showToast("Password reset successfully!");
      navigate("/login");
    } catch (err) { showToast(err.response?.data?.message || "Reset failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <main className="auth-page section">
      <div className="auth-card card">
        <h1 className="display-md text-center">Reset Password</h1>
        <p className="body-md text-graphite text-center" style={{ marginTop: 8, marginBottom: 28 }}>Enter your new password</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="input-label">New Password</label>
            <input type="password" className="input" placeholder="Min 8 characters" required minLength={8}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Confirm Password</label>
            <input type="password" className="input" placeholder="Repeat password" required
              value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
