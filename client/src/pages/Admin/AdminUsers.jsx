import { useState, useEffect } from "react";
import { FiTrash2, FiSearch, FiUser, FiChevronLeft, FiChevronRight, FiShield, FiFilter } from "react-icons/fi";
import API from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import "./AdminPages.css";

const AdminUsers = () => {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/api/v1/admin/get-all-users?page=${page}&limit=${limit}`);
      setUsers(data.users || []);
      if (data.pagination) {
        setPaginationInfo(data.pagination);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch users catalog", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const deleteUser = async (id) => {
    if (id === currentUser?.id) {
      showToast("Operation blocked: You cannot delete yourself!", "error");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      await API.delete(`/api/v1/admin/delete-user/${id}`);
      showToast("User account deleted successfully");
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    }
  };

  // Local Search & Role Filtering & Sorting on current page
  const filteredUsers = users
    .filter((u) => {
      const matchesSearch = 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === "role-admin") {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return 0;
      }
      if (sortBy === "role-customer") {
        if (a.role === "customer" && b.role !== "customer") return -1;
        if (a.role !== "customer" && b.role === "customer") return 1;
        return 0;
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return 0;
    });

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="badge role-badge admin flex-center gap-xs">
          <FiShield size={12} /> Administrator
        </span>
      );
    }
    return <span className="badge role-badge customer">Customer</span>;
  };

  return (
    <div className="admin-users-container">
      {/* Search Header Strip */}
      <section className="admin-actions-bar card">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search visible users by name or email address..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setRoleFilter("all"); setSortBy("default"); }} className="clear-search-btn">Reset</button>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-select-wrapper">
            <FiFilter className="filter-icon" />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="customer">Customers</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <FiShield className="filter-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Default Sort (Joined)</option>
              <option value="role-admin">Admins First</option>
              <option value="role-customer">Customers First</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="users-stat-quick">
          Total users: <strong className="body-emphasis text-primary">{paginationInfo.totalUsers}</strong>
        </div>
      </section>

      {/* Users Data Grid Card */}
      <section className="card admin-table-card">
        {loading ? (
          <div className="table-loading flex-center" style={{ minHeight: "200px" }}>
            <div className="spinner" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Security Level</th>
                    <th>Date Joined</th>
                    <th className="text-center">Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const formattedDate = new Date(u.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    });

                    // Parse avatar url if it exists as object or string
                    let avatarUrl = "";
                    if (u.avatar) {
                      avatarUrl = typeof u.avatar === "string" ? u.avatar : u.avatar.url;
                    }

                    return (
                      <tr key={u.id} className={isSelf ? "user-row-self" : ""}>
                        <td>
                          <div className="table-avatar-wrapper">
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={u.name} className="user-avatar" />
                            ) : (
                              <div className="user-avatar-fallback flex-center" title={u.name}>
                                {getInitials(u.name)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="body-emphasis">
                          <div className="user-name-cell">
                            <span className="user-name-text">{u.name}</span>
                            {isSelf && <span className="self-label-pill">You</span>}
                          </div>
                        </td>
                        <td className="text-graphite">{u.email}</td>
                        <td>{getRoleBadge(u.role)}</td>
                        <td>
                          <span className="caption-md text-graphite">{formattedDate}</span>
                        </td>
                        <td className="text-center">
                          {isSelf ? (
                            <span className="action-note-text caption-sm text-graphite">Protected Account</span>
                          ) : u.role === "admin" ? (
                            <span className="action-note-text caption-sm text-graphite">Admin Account</span>
                          ) : (
                            <button 
                              className="btn btn-outline-ink btn-sm action-icon-btn delete" 
                              onClick={() => deleteUser(u.id)}
                              title="Delete Account"
                            >
                              <FiTrash2 size={14} /> Remove Account
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Control Bar */}
            <div className="admin-pagination-bar flex-between">
              <span className="caption-md text-graphite">
                Showing page <strong>{paginationInfo.currentPage}</strong> of <strong>{paginationInfo.totalPages}</strong> ({paginationInfo.totalUsers} users total)
              </span>
              
              <div className="pagination-buttons flex gap-sm">
                <button 
                  className="btn btn-outline-ink btn-sm page-nav-btn"
                  disabled={!paginationInfo.hasPrevPage}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  <FiChevronLeft size={16} /> Prev
                </button>
                <button 
                  className="btn btn-outline-ink btn-sm page-nav-btn"
                  disabled={!paginationInfo.hasNextPage}
                  onClick={() => setPage((prev) => Math.min(paginationInfo.totalPages, prev + 1))}
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="table-empty-state">
            <FiUser size={48} className="empty-icon" />
            <h3>No users found</h3>
            <p className="caption-md text-graphite">Try adjusting your search filters or page indices.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminUsers;
