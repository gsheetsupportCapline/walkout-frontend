import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'inactive'
  const [showOfficeDropdown, setShowOfficeDropdown] = useState(null);
  const [tempSelectedOffices, setTempSelectedOffices] = useState([]);
  const officeDropdownRef = useRef(null);
  const { user: currentUser, isSuperAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/users");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Close office dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        officeDropdownRef.current &&
        !officeDropdownRef.current.contains(event.target)
      ) {
        setShowOfficeDropdown(null);
      }
    };

    if (showOfficeDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOfficeDropdown]);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await api.get("/teams");
      if (response.data.success) {
        setTeams(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  }, []);

  const fetchOffices = useCallback(async () => {
    try {
      const response = await api.get("/offices");
      if (response.data.success) {
        setOffices(response.data.data.filter((office) => office.isActive));
      }
    } catch (err) {
      console.error("Failed to fetch offices:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
    fetchOffices();
  }, [fetchUsers, fetchTeams, fetchOffices]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const endpoint = newStatus === "active" ? "activate" : "deactivate";
      const response = await api.put(`/users/${userId}/${endpoint}`);
      if (response.data.success) {
        showSuccess(
          `User ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`,
        );
        fetchUsers();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/users/${userId}/change-role`, {
        role: newRole,
      });
      if (response.data.success) {
        showSuccess(`User role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change role");
    }
  };

  const handleTeamChange = async (userId, teamId) => {
    try {
      const response = await api.put(`/users/${userId}`, {
        teamName: teamId ? [teamId] : [],
      });
      if (response.data.success) {
        showSuccess("User team updated successfully");
        fetchUsers();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to change team");
    }
  };

  const handleOfficeAssignment = async (userId, selectedOfficeIds) => {
    try {
      const response = await api.put(`/users/${userId}`, {
        assignedOffice: selectedOfficeIds,
      });
      if (response.data.success) {
        showSuccess("User offices updated successfully");
        fetchUsers();
        setShowOfficeDropdown(null);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update offices");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data.success) {
        showSuccess("User deleted successfully");
        fetchUsers();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Filter users based on active tab and exclude superAdmin
  const filteredUsers = users.filter((user) => {
    const isSuperAdmin = user.role === "superAdmin";
    const matchesTab = activeTab === "active" ? user.isActive : !user.isActive;
    return !isSuperAdmin && matchesTab;
  });

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage user accounts and permissions</p>
      </div>

      {/* Tab Toggle */}
      <div className="tab-toggle">
        <button
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Users
        </button>
        <button
          className={`tab-btn ${activeTab === "inactive" ? "active" : ""}`}
          onClick={() => setActiveTab("inactive")}
        >
          Inactive Users
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Team</th>
              <th>Assigned Offices</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No {activeTab} users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    {isSuperAdmin() ? (
                      <select
                        className="inline-select"
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                      >
                        <option value="user">user</option>
                        <option value="office">office</option>
                        <option value="admin">admin</option>
                        <option value="superAdmin">superAdmin</option>
                      </select>
                    ) : (
                      <span className="role-text">{user.role}</span>
                    )}
                  </td>
                  <td>
                    {isSuperAdmin() || currentUser?.role === "admin" ? (
                      <select
                        className="inline-select"
                        value={
                          user.teamName && user.teamName.length > 0
                            ? user.teamName[0].teamId._id
                            : ""
                        }
                        onChange={(e) =>
                          handleTeamChange(user._id, e.target.value)
                        }
                      >
                        <option value="">No Team</option>
                        {teams.map((team) => (
                          <option key={team._id} value={team._id}>
                            {team.teamName || team.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="team-text">
                        {user.teamName && user.teamName.length > 0
                          ? user.teamName[0].teamId.teamName
                          : "No Team"}
                      </span>
                    )}
                  </td>
                  <td>
                    {(() => {
                      // Check if user has Office or LC3 Team
                      const hasOfficeOrLC3Team =
                        user.teamName &&
                        user.teamName.length > 0 &&
                        user.teamName.some((team) => {
                          const teamName = team.teamId?.teamName?.toLowerCase();
                          console.log(
                            `User ${user.userName} - Team: ${team.teamId?.teamName}`,
                            team,
                          );
                          return (
                            teamName === "office" || teamName === "lc3 team"
                          );
                        });

                      console.log(
                        `User ${user.userName} - Show dropdown: ${hasOfficeOrLC3Team}`,
                      );

                      return hasOfficeOrLC3Team ? (
                        <div className="office-dropdown-wrapper">
                          <button
                            className="office-count-btn"
                            onClick={(e) => {
                              if (showOfficeDropdown === user._id) {
                                setShowOfficeDropdown(null);
                              } else {
                                // Initialize temp state with current assigned offices (only IDs)
                                let currentOfficeIds = [];
                                if (
                                  user.assignedOffice &&
                                  user.assignedOffice.length > 0
                                ) {
                                  currentOfficeIds = user.assignedOffice.map(
                                    (o) => {
                                      // Handle different formats
                                      if (typeof o === "string") {
                                        return o;
                                      }
                                      // Handle populated officeId object: { officeId: { _id, officeName, regionId }, _id }
                                      if (o.officeId?._id) {
                                        return o.officeId._id.toString();
                                      }
                                      // Fallback to direct _id if not populated
                                      if (o._id) {
                                        return o._id.toString();
                                      }
                                      return o.toString();
                                    },
                                  );
                                }
                                console.log(
                                  "Current Office IDs:",
                                  currentOfficeIds,
                                );
                                console.log(
                                  "User assignedOffice:",
                                  user.assignedOffice,
                                );
                                setTempSelectedOffices(currentOfficeIds);
                                setShowOfficeDropdown(user._id);

                                // Position dropdown with smart positioning (above or below based on available space)
                                setTimeout(() => {
                                  const dropdown =
                                    document.querySelector(".office-dropdown");
                                  if (dropdown) {
                                    const rect =
                                      e.target.getBoundingClientRect();
                                    const dropdownHeight = 400; // max-height from CSS
                                    const viewportHeight = window.innerHeight;
                                    const spaceBelow =
                                      viewportHeight - rect.bottom;
                                    const spaceAbove = rect.top;

                                    // Check if dropdown should open upward
                                    if (
                                      spaceBelow < dropdownHeight &&
                                      spaceAbove > spaceBelow
                                    ) {
                                      // Open upward
                                      dropdown.style.bottom = `${viewportHeight - rect.top + 5}px`;
                                      dropdown.style.top = "auto";
                                      dropdown.classList.add(
                                        "office-dropdown-up",
                                      );
                                    } else {
                                      // Open downward (default)
                                      dropdown.style.top = `${rect.bottom + 5}px`;
                                      dropdown.style.bottom = "auto";
                                      dropdown.classList.remove(
                                        "office-dropdown-up",
                                      );
                                    }
                                    dropdown.style.left = `${rect.left}px`;
                                  }
                                }, 0);
                              }
                            }}
                          >
                            {user.assignedOffice &&
                            user.assignedOffice.length > 0
                              ? `${user.assignedOffice.length} office${user.assignedOffice.length > 1 ? "s" : ""} selected`
                              : "Select offices"}
                          </button>
                          {showOfficeDropdown === user._id && (
                            <div
                              className="office-dropdown"
                              ref={officeDropdownRef}
                            >
                              <div className="office-dropdown-header">
                                <span>Select Offices</span>
                                <button
                                  onClick={() => setShowOfficeDropdown(null)}
                                >
                                  ×
                                </button>
                              </div>
                              <div className="office-options">
                                {offices.map((office) => {
                                  const officeIdStr = office._id.toString();
                                  const isSelected = tempSelectedOffices.some(
                                    (id) => id.toString() === officeIdStr,
                                  );
                                  console.log(
                                    `Office ${office.officeName} (${officeIdStr}): ${isSelected}`,
                                    tempSelectedOffices,
                                  );
                                  return (
                                    <label
                                      key={office._id}
                                      className="office-option"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setTempSelectedOffices([
                                              ...tempSelectedOffices,
                                              office._id,
                                            ]);
                                          } else {
                                            setTempSelectedOffices(
                                              tempSelectedOffices.filter(
                                                (id) =>
                                                  id.toString() !==
                                                  office._id.toString(),
                                              ),
                                            );
                                          }
                                        }}
                                      />
                                      <span>{office.officeName}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <div className="office-actions-row">
                                <button
                                  className="btn-office-cancel"
                                  onClick={() => setShowOfficeDropdown(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn-office-ok"
                                  onClick={() =>
                                    handleOfficeAssignment(
                                      user._id,
                                      tempSelectedOffices,
                                    )
                                  }
                                >
                                  OK
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="no-office-text">-</span>
                      );
                    })()}
                  </td>
                  <td>
                    <select
                      className="inline-select status-select"
                      value={user.isActive ? "active" : "inactive"}
                      onChange={(e) =>
                        handleStatusChange(user._id, e.target.value)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user._id !== currentUser._id && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
