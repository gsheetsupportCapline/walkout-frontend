import React from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../Layout/Navbar";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>
            {getGreeting()}, {user?.name}!
          </h1>
          <p>Welcome to Walkout Management System</p>
        </div>

        <div className="dashboard-content">
          <div className="info-card">
            <h2>Getting Started</h2>
            <p>
              Welcome to your dashboard. This is your central hub for managing
              your work and accessing various features of the system.
            </p>
            <ul className="feature-list">
              <li>✓ Access your profile and update personal information</li>
              <li>✓ Use the Control Panel to manage your resources</li>
              <li>✓ Navigate using the top menu bar</li>
              {(user?.role === "admin" || user?.role === "superAdmin") && (
                <>
                  <li>
                    ✓ Manage users, regions, offices, and teams through Control
                    Panel
                  </li>
                  <li>✓ Monitor system activity and user access</li>
                </>
              )}
            </ul>
          </div>

          <div className="info-card">
            <h2>Quick Links</h2>
            <div className="quick-links">
              <a href="/profile" className="quick-link-btn">
                <span className="link-icon">👤</span>
                <span>My Profile</span>
              </a>
              <a href="/control-panel" className="quick-link-btn">
                <span className="link-icon">⚙️</span>
                <span>Control Panel</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
