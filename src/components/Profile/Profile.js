import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./Profile.css";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    repeatPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      const response = await api.put("/users/profile", updateData);

      if (response.data.success) {
        updateUser(response.data.data);
        showSuccess("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords
    if (passwordData.newPassword.length < 6) {
      showError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.repeatPassword) {
      showError("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.put("/users/profile", {
        oldPassword: passwordData.oldPassword,
        password: passwordData.newPassword,
      });

      if (response.data.success) {
        showSuccess("Password changed successfully");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          repeatPassword: "",
        });
        setShowPasswordChange(false);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {/* Stats Cards */}
      <div className="profile-stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>Role</h3>
            <p className="stat-value">{user?.role}</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>Status</h3>
            <p className="stat-value">
              {user?.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📧</div>
          <div className="stat-content">
            <h3>Email</h3>
            <p className="stat-value-sm">{user?.email}</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">@</div>
          <div className="stat-content">
            <h3>Username</h3>
            <p className="stat-value">{user?.username}</p>
          </div>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">Full Name:</span>
            <span className="info-value">{user?.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{user?.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span
              className={`badge badge-${
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
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span
              className={`badge ${
                user?.isActive ? "badge-success" : "badge-danger"
              }`}
            >
              {user?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="profile-form-section">
          <div className="section-header">
            <h2>Edit Profile</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm"
              >
                Edit Information
              </button>
            )}
          </div>

          {isEditing && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                    });
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-form-section">
          <div className="section-header">
            <h2>Change Password</h2>
            {!showPasswordChange && (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="btn btn-primary btn-sm"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordChange && (
            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="repeatPassword">Repeat New Password</label>
                <input
                  type="password"
                  id="repeatPassword"
                  name="repeatPassword"
                  value={passwordData.repeatPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                  placeholder="Repeat new password"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      repeatPassword: "",
                    });
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
