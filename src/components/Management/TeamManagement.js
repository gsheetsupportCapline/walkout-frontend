import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./Management.css";

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    teamName: "",
    isActive: true,
    visibility: "on",
  });

  const fetchTeams = useCallback(async () => {
    try {
      const response = await api.get("/teams");
      if (response.data.success) {
        setTeams(response.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingTeam) {
        response = await api.put(`/teams/${editingTeam._id}`, formData);
        showSuccess("Team updated successfully");
      } else {
        response = await api.post("/teams", formData);
        showSuccess("Team created successfully");
      }

      if (response.data.success) {
        fetchTeams();
        closeModal();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      teamName: team.teamName,
      isActive: team.isActive,
      visibility: team.visibility,
    });
    setShowModal(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      const response = await api.delete(`/teams/${teamId}`);
      if (response.data.success) {
        showSuccess("Team deleted successfully");
        fetchTeams();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete team");
    }
  };

  const openModal = () => {
    setEditingTeam(null);
    setFormData({
      teamName: "",
      isActive: true,
      visibility: "on",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (loading) {
    return <div className="loading">Loading teams...</div>;
  }

  return (
    <div className="management-container">
      <div className="page-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage organizational teams</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + Add Team
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Status</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team._id}>
                <td>{team.teamName}</td>
                <td>
                  <span
                    className={`badge ${
                      team.isActive ? "badge-success" : "badge-danger"
                    }`}
                  >
                    {team.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      team.visibility === "on" ? "badge-green" : "badge-gray"
                    }`}
                  >
                    {team.visibility}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(team)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(team._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTeam ? "Edit Team" : "Add New Team"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="teamName">Team Name</label>
                  <input
                    type="text"
                    id="teamName"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Development Team"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="visibility">Visibility</label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                  >
                    <option value="on">On</option>
                    <option value="off">Off</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTeam ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
