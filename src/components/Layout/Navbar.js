import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/">
            <img
              src="/smilepoint-dental.png"
              alt="Smilepoint Dental"
              className="navbar-logo-img"
            />
          </Link>
          <Link to="/" className="navbar-logo">
            Walkout <span className="version-text">2.0</span>
          </Link>
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/appointments" className="navbar-link">
                <span className="nav-icon">📅</span>
                Appointments
              </Link>
              <Link to="/dashboard" className="navbar-link">
                <span className="nav-icon">📊</span>
                Dashboards
              </Link>

              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={toggleDropdown}
                  aria-label="User menu"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        <span className="dropdown-name">{user?.name}</span>
                        <span className="dropdown-email">{user?.email}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="dropdown-icon">👤</span>
                      Profile
                    </Link>
                    {(user.role === "admin" || user.role === "superAdmin") && (
                      <Link
                        to="/control-panel"
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">⚙️</span>
                        Control Panel
                      </Link>
                    )}
                    <button className="dropdown-item" onClick={handleLogout}>
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/signup" className="navbar-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
