import { useState } from "react";
import { FiUser, FiLock, FiEdit2 } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [avatar, setAvatar] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", profileForm.name); fd.append("email", profileForm.email);
      if (avatar) fd.append("avatar", avatar);
      await updateProfile(fd);
      showToast("Profile updated!");
    } catch (err) { showToast(err.response?.data?.message || "Update failed", "error"); }
    finally { setLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showToast("Passwords don't match", "error"); return; }
    setLoading(true);
    try {
      await updatePassword(passwordForm);
      showToast("Password updated!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { showToast(err.response?.data?.message || "Update failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <main className="section">
      <div className="container profile-page">
        <h1 className="display-lg" style={{ marginBottom: 32 }}>My Profile</h1>
        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar card" style={{ padding: 24 }}>
            <div className="text-center" style={{ marginBottom: 20 }}>
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="profile-avatar" />
              ) : (
                <div className="profile-avatar-placeholder display-lg">{user?.name?.[0]}</div>
              )}
              <p className="body-emphasis" style={{ marginTop: 12 }}>{user?.name}</p>
              <p className="caption-md text-graphite">{user?.email}</p>
            </div>
            <button className={`profile-tab ${tab === "profile" ? "tab-active" : ""}`} onClick={() => setTab("profile")}><FiUser size={16} /> Profile</button>
            <button className={`profile-tab ${tab === "password" ? "tab-active" : ""}`} onClick={() => setTab("password")}><FiLock size={16} /> Password</button>
          </div>

          {/* Content */}
          <div className="profile-content card" style={{ padding: 32 }}>
            {tab === "profile" ? (
              <form onSubmit={handleProfileUpdate} className="auth-form">
                <h2 className="display-xs" style={{ marginBottom: 8 }}><FiEdit2 size={18} /> Edit Profile</h2>
                <div><label className="input-label">Name</label><input type="text" className="input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required /></div>
                <div><label className="input-label">Email</label><input type="email" className="input" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required /></div>
                <div><label className="input-label">Avatar</label><input type="file" accept="image/*" className="input" style={{ paddingTop: 10 }} onChange={(e) => setAvatar(e.target.files[0])} /></div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
              </form>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="auth-form">
                <h2 className="display-xs" style={{ marginBottom: 8 }}><FiLock size={18} /> Change Password</h2>
                <div><label className="input-label">Current Password</label><input type="password" className="input" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} required /></div>
                <div><label className="input-label">New Password</label><input type="password" className="input" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={8} /></div>
                <div><label className="input-label">Confirm New Password</label><input type="password" className="input" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required /></div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Updating..." : "Update Password"}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
