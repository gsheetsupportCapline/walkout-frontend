import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, isAdmin } = useAuth();
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
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">{sidebarOpen ? "Walkout" : "W"}</h2>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive("/dashboard")}`}
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link to="/profile" className={`nav-item ${isActive("/profile")}`}>
            <span className="nav-icon">👤</span>
            {sidebarOpen && <span>Profile</span>}
          </Link>

          {isAdmin() && (
            <>
              <div className="nav-divider">{sidebarOpen && "Management"}</div>

              <Link to="/users" className={`nav-item ${isActive("/users")}`}>
                <span className="nav-icon">👥</span>
                {sidebarOpen && <span>Users</span>}
              </Link>

              <Link
                to="/regions"
                className={`nav-item ${isActive("/regions")}`}
              >
                <span className="nav-icon">🌍</span>
                {sidebarOpen && <span>Regions</span>}
              </Link>

              <Link
                to="/offices"
                className={`nav-item ${isActive("/offices")}`}
              >
                <span className="nav-icon">🏢</span>
                {sidebarOpen && <span>Offices</span>}
              </Link>

              <Link to="/teams" className={`nav-item ${isActive("/teams")}`}>
                <span className="nav-icon">🤝</span>
                {sidebarOpen && <span>Teams</span>}
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
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
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
