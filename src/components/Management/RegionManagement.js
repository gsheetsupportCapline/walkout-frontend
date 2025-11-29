import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./Management.css";

const RegionManagement = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [editingRegion, setEditingRegion] = useState(null);
  const [formData, setFormData] = useState({
    regionName: "",
    regionCode: "",
    isActive: true,
    visibility: "on",
  });

  const fetchRegions = useCallback(async () => {
    try {
      const response = await api.get("/regions");
      if (response.data.success) {
        setRegions(response.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch regions");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingRegion) {
        response = await api.put(`/regions/${editingRegion._id}`, formData);
        showSuccess("Region updated successfully");
      } else {
        response = await api.post("/regions", formData);
        showSuccess("Region created successfully");
      }

      if (response.data.success) {
        fetchRegions();
        closeModal();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (region) => {
    setEditingRegion(region);
    setFormData({
      regionName: region.regionName,
      regionCode: region.regionCode,
      isActive: region.isActive,
      visibility: region.visibility,
    });
    setShowModal(true);
  };

  const handleDelete = async (regionId) => {
    if (!window.confirm("Are you sure you want to delete this region?")) {
      return;
    }

    try {
      const response = await api.delete(`/regions/${regionId}`);
      if (response.data.success) {
        showSuccess("Region deleted successfully");
        fetchRegions();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to delete region");
    }
  };

  const openModal = () => {
    setEditingRegion(null);
    setFormData({
      regionName: "",
      regionCode: "",
      isActive: true,
      visibility: "on",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegion(null);
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
    return <div className="loading">Loading regions...</div>;
  }

  return (
    <div className="management-container">
      <div className="page-header">
        <div>
          <h1>Region Management</h1>
          <p>Manage geographic regions</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          + Add Region
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Region Name</th>
              <th>Region Code</th>
              <th>Status</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region._id}>
                <td>{region.regionName}</td>
                <td>
                  <span className="code-badge">{region.regionCode}</span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      region.isActive ? "badge-success" : "badge-danger"
                    }`}
                  >
                    {region.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      region.visibility === "on" ? "badge-green" : "badge-gray"
                    }`}
                  >
                    {region.visibility}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(region)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(region._id)}
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
              <h2>{editingRegion ? "Edit Region" : "Add New Region"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="regionName">Region Name</label>
                  <input
                    type="text"
                    id="regionName"
                    name="regionName"
                    value={formData.regionName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., North Region"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="regionCode">Region Code</label>
                  <input
                    type="text"
                    id="regionCode"
                    name="regionCode"
                    value={formData.regionCode}
                    onChange={handleChange}
                    required
                    placeholder="e.g., NR01"
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
                  {editingRegion ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionManagement;
