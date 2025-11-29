import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">{sidebarOpen ? "Admin Panel" : "AP"}</h2>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin/dashboard"
            className={`nav-item ${isActive("/admin/dashboard")}`}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <div className="nav-divider">{sidebarOpen && "Management"}</div>

          <Link
            to="/admin/users"
            className={`nav-item ${isActive("/admin/users")}`}
          >
            <span className="nav-icon">👥</span>
            {sidebarOpen && <span>Users</span>}
          </Link>

          <Link
            to="/admin/regions"
            className={`nav-item ${isActive("/admin/regions")}`}
          >
            <span className="nav-icon">🌍</span>
            {sidebarOpen && <span>Regions</span>}
          </Link>

          <Link
            to="/admin/offices"
            className={`nav-item ${isActive("/admin/offices")}`}
          >
            <span className="nav-icon">🏢</span>
            {sidebarOpen && <span>Offices</span>}
          </Link>

          <Link
            to="/admin/teams"
            className={`nav-item ${isActive("/admin/teams")}`}
          >
            <span className="nav-icon">🤝</span>
            {sidebarOpen && <span>Teams</span>}
          </Link>

          <div className="nav-divider">{sidebarOpen && "Account"}</div>

          <Link to="/profile" className={`nav-item ${isActive("/profile")}`}>
            <span className="nav-icon">👤</span>
            {sidebarOpen && <span>Profile</span>}
          </Link>

          <Link to="/" className="nav-item">
            <span className="nav-icon">🏠</span>
            {sidebarOpen && <span>Back to Home</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-content">
        {/* Top Bar */}
        <header className="admin-topbar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            ☰
          </button>

          <div className="topbar-right">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span
                className={`user-role badge badge-${
                  user?.role === "superAdmin"
                    ? "purple"
                    : user?.role === "admin"
                    ? "blue"
                    : user?.role === "office"
                    ? "orange"
                    : "green"
                }`}
              >
                {user?.role}
              </span>
            </div>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
