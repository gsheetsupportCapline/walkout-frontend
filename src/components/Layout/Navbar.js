import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walkInData, setWalkInData] = useState({
    patientId: "",
    patientName: "",
    dos: "",
    officeName: "",
  });
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (
          showWalkInModal &&
          event.target.classList.contains("modal-overlay")
        ) {
          setShowWalkInModal(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWalkInModal]);

  useEffect(() => {
    if (showWalkInModal) {
      fetchOffices();
    }
  }, [showWalkInModal]);

  const fetchOffices = async () => {
    try {
      const response = await api.get("/offices");
      if (response.data.success) {
        const activeOffices = response.data.data.filter(
          (office) => office.isActive && office.visibility === "on",
        );
        setOffices(activeOffices);
      }
    } catch (err) {
      showError("Failed to fetch offices");
    }
  };

  const handleWalkInChange = (e) => {
    setWalkInData({
      ...walkInData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        "patient-id": walkInData.patientId,
        "patient-name": walkInData.patientName,
        dos: walkInData.dos,
        "office-name": walkInData.officeName,
      };

      const response = await api.post("/appointments/walk-in", payload);

      if (response.data.success) {
        showSuccess("Walk-in appointment created successfully");
        setShowWalkInModal(false);
        setWalkInData({
          patientId: "",
          patientName: "",
          dos: "",
          officeName: "",
        });
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to create walk-in appointment",
      );
    } finally {
      setLoading(false);
    }
  };

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
              <button
                className="navbar-link"
                onClick={() => setShowWalkInModal(true)}
                style={{ background: "none", border: "none" }}
              >
                <span className="nav-icon">➕</span>
                Walk-in/Unscheduled
              </button>

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

      {/* Walk-in Modal */}
      {showWalkInModal && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2>Create Walk-in/Unscheduled Appointment</h2>
              <button
                className="modal-close"
                onClick={() => setShowWalkInModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleWalkInSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="patientId">Patient ID *</label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={walkInData.patientId}
                  onChange={handleWalkInChange}
                  required
                  placeholder="Enter patient ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientName">Patient Name *</label>
                <input
                  type="text"
                  id="patientName"
                  name="patientName"
                  value={walkInData.patientName}
                  onChange={handleWalkInChange}
                  required
                  placeholder="Enter patient name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dos">Date of Service *</label>
                <input
                  type="date"
                  id="dos"
                  name="dos"
                  value={walkInData.dos}
                  onChange={handleWalkInChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="officeName">Office Name *</label>
                <select
                  id="officeName"
                  name="officeName"
                  value={walkInData.officeName}
                  onChange={handleWalkInChange}
                  required
                >
                  <option value="">-- Select Office --</option>
                  {offices.map((office) => (
                    <option key={office._id} value={office.officeName}>
                      {office.officeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Appointment"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowWalkInModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
