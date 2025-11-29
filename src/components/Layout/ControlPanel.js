import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import "./ControlPanel.css";

const ControlPanel = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const canAccessUsers = () => {
    return user?.role === "admin" || user?.role === "superAdmin";
  };

  const canAccessManagement = () => {
    return user?.role === "admin" || user?.role === "superAdmin";
  };

  return (
    <>
      <Navbar />
      <div className="control-panel-layout">
        <aside className="control-sidebar">
          <div className="sidebar-section">
            <Link
              to="/profile"
              className={`sidebar-item ${isActive("/profile")}`}
            >
              <span className="sidebar-icon">👤</span>
              <span>Profile</span>
            </Link>
          </div>

          {canAccessUsers() && (
            <>
              <div className="sidebar-divider">Management</div>
              <div className="sidebar-section">
                <Link
                  to="/control-panel/users"
                  className={`sidebar-item ${isActive("/control-panel/users")}`}
                >
                  <span className="sidebar-icon">👥</span>
                  <span>Users</span>
                </Link>
              </div>
            </>
          )}

          {canAccessManagement() && (
            <div className="sidebar-section">
              <Link
                to="/control-panel/regions"
                className={`sidebar-item ${isActive("/control-panel/regions")}`}
              >
                <span className="sidebar-icon">🌍</span>
                <span>Regions</span>
              </Link>

              <Link
                to="/control-panel/offices"
                className={`sidebar-item ${isActive("/control-panel/offices")}`}
              >
                <span className="sidebar-icon">🏢</span>
                <span>Offices</span>
              </Link>

              <Link
                to="/control-panel/teams"
                className={`sidebar-item ${isActive("/control-panel/teams")}`}
              >
                <span className="sidebar-icon">🤝</span>
                <span>Teams</span>
              </Link>
            </div>
          )}
        </aside>

        <main className="control-main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default ControlPanel;
