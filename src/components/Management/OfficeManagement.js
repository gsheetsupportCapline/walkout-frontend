import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./Management.css";

const OfficeManagement = () => {
  const [offices, setOffices] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [editingOffice, setEditingOffice] = useState(null);
  const [formData, setFormData] = useState({
    officeName: "",
    officeCode: "",
    regionId: "",
    isActive: true,
    visibility: "on",
  });

  const fetchOffices = useCallback(async () => {
    try {
      const response = await api.get("/offices");
      if (response.data.success) {
        setOffices(response.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch offices");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchRegions = useCallback(async () => {
    try {
      const response = await api.get("/regions");
      if (response.data.success) {
        setRegions(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch regions:", err);
    }
  }, []);

  useEffect(() => {
    fetchOffices();
    fetchRegions();
  }, [fetchOffices, fetchRegions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingOffice) {
        response = await api.put(`/offices/${editingOffice._id}`, formData);
        showSuccess("Office updated successfully");
      } else {
        response = await api.post("/offices", formData);
        showSuccess("Office created successfully");
      }

      if (response.data.success) {
        fetchOffices();
        closeModal();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (office) => {
    setEditingOffice(office);
    setFormData({
      officeName: office.officeName,
      officeCode: office.officeCode,
      regionId: office.regionId?._id || "",
      isActive: office.isActive,
      visibility: office.visibility,
    });
    setShowModal(true);
  };

  const handleDelete = async (officeId) => {
    if (!window.confirm("Are you sure you want to delete this office?")) {
      return;
    }

    try {
      const response = await api.delete(`/offices/${officeId}`);
      if (response.data.success) {
        showSuccess("Office deleted successfully");
        fetchOffices();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete office");
    }
  };

  const openModal = () => {
    setEditingOffice(null);
    setFormData({
      officeName: "",
      officeCode: "",
      regionId: "",
      isActive: true,
      visibility: "on",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffice(null);
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
    return <div className="loading">Loading offices...</div>;
  }

  return (
    <div className="management-container">
      <div className="page-header">
        <div>
          <h1>Office Management</h1>
          <p>Manage office locations</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + Add Office
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Office Name</th>
              <th>Office Code</th>
              <th>Region</th>
              <th>Status</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offices.map((office) => (
              <tr key={office._id}>
                <td>{office.officeName}</td>
                <td>
                  <span className="code-badge">{office.officeCode}</span>
                </td>
                <td>
                  {office.regionId?.regionName || "N/A"}
                  {office.regionId?.regionCode && (
                    <span className="code-badge ml-2">
                      {office.regionId.regionCode}
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${
                      office.isActive ? "badge-success" : "badge-danger"
                    }`}
                  >
                    {office.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      office.visibility === "on" ? "badge-green" : "badge-gray"
                    }`}
                  >
                    {office.visibility}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(office)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(office._id)}
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
              <h2>{editingOffice ? "Edit Office" : "Add New Office"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="officeName">Office Name</label>
                  <input
                    type="text"
                    id="officeName"
                    name="officeName"
                    value={formData.officeName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Delhi Office"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="officeCode">Office Code</label>
                  <input
                    type="text"
                    id="officeCode"
                    name="officeCode"
                    value={formData.officeCode}
                    onChange={handleChange}
                    required
                    placeholder="e.g., DLH01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="regionId">Region</label>
                  <select
                    id="regionId"
                    name="regionId"
                    value={formData.regionId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Region</option>
                    {regions
                      .filter((r) => r.visibility === "on" && r.isActive)
                      .map((region) => (
                        <option key={region._id} value={region._id}>
                          {region.regionName} ({region.regionCode})
                        </option>
                      ))}
                  </select>
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
                  {editingOffice ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeManagement;
