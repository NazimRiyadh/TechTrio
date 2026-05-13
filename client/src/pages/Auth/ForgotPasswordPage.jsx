import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import "./AuthPages.css";

const ForgotPasswordPage = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/api/v1/auth/forgot", { email });
      setSent(true);
      showToast("Reset link sent to your email!");
    } catch (err) { showToast(err.response?.data?.message || "Failed to send", "error"); }
    finally { setLoading(false); }
  };

  return (
    <main className="auth-page section">
      <div className="auth-card card">
        <h1 className="display-md text-center">Forgot Password</h1>
        <p className="body-md text-graphite text-center" style={{ marginTop: 8, marginBottom: 28 }}>
          Enter your email and we'll send you a reset link.
        </p>
        {sent ? (
          <div className="text-center">
            <p className="body-md" style={{ marginBottom: 16 }}>Check your inbox for the reset link.</p>
            <Link to="/login" className="btn btn-outline-ink">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="input-label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" required
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
        <p className="body-md text-center" style={{ marginTop: 20 }}>
          <Link to="/login" className="text-primary">Back to Sign In</Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
