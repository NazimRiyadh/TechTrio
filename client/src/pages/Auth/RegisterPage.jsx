import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./AuthPages.css";

const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      if (avatar) fd.append("avatar", avatar);
      await register(fd);
      showToast("Account created!");
      navigate("/");
    } catch (err) { showToast(err.response?.data?.message || "Registration failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <main className="auth-page section">
      <div className="auth-card card">
        <h1 className="display-md text-center">Create Account</h1>
        <p className="body-md text-graphite text-center" style={{ marginTop: 8, marginBottom: 28 }}>Join BigBazar today</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="input-label">Full Name</label>
            <input type="text" className="input" placeholder="John Doe" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input type="password" className="input" placeholder="Min 8 characters" required minLength={8}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Avatar (optional)</label>
            <input type="file" accept="image/*" className="input" style={{ paddingTop: 10 }}
              onChange={(e) => setAvatar(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="body-md text-center" style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login" className="text-primary body-emphasis">Sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
