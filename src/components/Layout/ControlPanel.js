import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import "./ControlPanel.css";

const ControlPanel = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Detailed role checking
  React.useEffect(() => {
    if (user) {
      console.log("=== CONTROL PANEL DEBUG ===");
      console.log("User Object:", user);
      console.log("User Role:", user.role);
      console.log("Role Type:", typeof user.role);
      console.log("Is Admin:", user.role === "admin");
      console.log("Is SuperAdmin:", user.role === "superAdmin");
      console.log("Is User:", user.role === "user");
      console.log("Is Office:", user.role === "office");
      console.log(
        "canAccessUsers():",
        user?.role === "admin" || user?.role === "superAdmin",
      );
      console.log("========================");
    }
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const canAccessUsers = () => {
    return user?.role === "admin" || user?.role === "superAdmin";
  };

  const canAccessRegions = () => {
    return user?.role === "superAdmin";
  };

  const canAccessOffices = () => {
    return user?.role === "superAdmin";
  };

  const canAccessTeams = () => {
    return user?.role === "superAdmin";
  };

  const canAccessFormManagement = () => {
    return user?.role === "admin" || user?.role === "superAdmin";
  };

  const canAccessArchives = () => {
    return user?.role === "superAdmin";
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

          {(canAccessRegions() || canAccessOffices() || canAccessTeams()) && (
            <>
              <div className="sidebar-divider">Organization</div>
              <div className="sidebar-section">
                {canAccessRegions() && (
                  <Link
                    to="/control-panel/regions"
                    className={`sidebar-item ${isActive(
                      "/control-panel/regions",
                    )}`}
                  >
                    <span className="sidebar-icon">🌍</span>
                    <span>Regions</span>
                  </Link>
                )}

                {canAccessOffices() && (
                  <Link
                    to="/control-panel/offices"
                    className={`sidebar-item ${isActive(
                      "/control-panel/offices",
                    )}`}
                  >
                    <span className="sidebar-icon">🏢</span>
                    <span>Offices</span>
                  </Link>
                )}

                {canAccessTeams() && (
                  <Link
                    to="/control-panel/teams"
                    className={`sidebar-item ${isActive(
                      "/control-panel/teams",
                    )}`}
                  >
                    <span className="sidebar-icon">🤝</span>
                    <span>Teams</span>
                  </Link>
                )}
              </div>
            </>
          )}

          {canAccessFormManagement() && (
            <>
              <div className="sidebar-divider">Form Management</div>
              <div className="sidebar-section">
                <Link
                  to="/control-panel/dropdown-sets"
                  className={`sidebar-item ${isActive(
                    "/control-panel/dropdown-sets",
                  )}`}
                >
                  <span className="sidebar-icon">📋</span>
                  <span>Dropdown Sets</span>
                </Link>

                <Link
                  to="/control-panel/radio-button-sets"
                  className={`sidebar-item ${isActive(
                    "/control-panel/radio-button-sets",
                  )}`}
                >
                  <span className="sidebar-icon">🔘</span>
                  <span>Radio Button Sets</span>
                </Link>
              </div>
            </>
          )}

          {canAccessArchives() && (
            <>
              <div className="sidebar-divider">Archive Management</div>
              <div className="sidebar-section">
                <Link
                  to="/control-panel/archives/dropdown-sets"
                  className={`sidebar-item ${isActive(
                    "/control-panel/archives/dropdown-sets",
                  )}`}
                >
                  <span className="sidebar-icon">📦</span>
                  <span>Archived Dropdowns</span>
                </Link>

                <Link
                  to="/control-panel/archives/radio-button-sets"
                  className={`sidebar-item ${isActive(
                    "/control-panel/archives/radio-button-sets",
                  )}`}
                >
                  <span className="sidebar-icon">🗄️</span>
                  <span>Archived Radio Buttons</span>
                </Link>
              </div>
            </>
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
