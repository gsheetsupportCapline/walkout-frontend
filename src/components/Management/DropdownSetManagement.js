import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./Management.css";
import "./DropdownSetManagement.css";

const DropdownSetManagement = () => {
  const { showSuccess, showError } = useToast();

  const [dropdownSets, setDropdownSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [showSetModal, setShowSetModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [editingOption, setEditingOption] = useState(null);
  const [bulkOptions, setBulkOptions] = useState([
    { name: "", visibility: true, isActive: true },
  ]);

  const [setFormData, setSetFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [optionFormData, setOptionFormData] = useState({
    name: "",
    visibility: true,
    isActive: true,
  });

  useEffect(() => {
    fetchDropdownSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDropdownSets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dropdowns/dropdown-sets");
      if (response.data.success) {
        setDropdownSets(response.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch dropdown sets");
    } finally {
      setLoading(false);
    }
  };

  const fetchSetDetails = async (setId) => {
    try {
      const response = await api.get(`/dropdowns/dropdown-sets/${setId}`);
      if (response.data.success) {
        setSelectedSet(response.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch set details");
    }
  };

  const handleViewSetDetails = async (set) => {
    await fetchSetDetails(set._id);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedSet(null);
    fetchDropdownSets();
  };

  const handleCreateSet = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/dropdowns/dropdown-sets", setFormData);
      if (response.data.success) {
        showSuccess("Dropdown set created successfully");
        setShowSetModal(false);
        setSetFormData({ name: "", description: "", isActive: true });
        fetchDropdownSets();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create dropdown set");
    }
  };

  const handleUpdateSet = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/dropdowns/dropdown-sets/${selectedSet._id}`,
        setFormData
      );
      if (response.data.success) {
        showSuccess("Dropdown set updated successfully");
        setShowSetModal(false);
        setSetFormData({ name: "", description: "", isActive: true });
        fetchSetDetails(selectedSet._id);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update dropdown set");
    }
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/dropdowns/dropdown-sets/${selectedSet._id}/options`,
        optionFormData
      );
      if (response.data.success) {
        showSuccess("Option added successfully");
        setShowOptionModal(false);
        setOptionFormData({ name: "", visibility: true, isActive: true });
        fetchSetDetails(selectedSet._id);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add option");
    }
  };

  const handleUpdateOption = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/dropdowns/dropdown-sets/${selectedSet._id}/options/${editingOption._id}`,
        optionFormData
      );
      if (response.data.success) {
        showSuccess("Option updated successfully");
        setShowOptionModal(false);
        setEditingOption(null);
        setOptionFormData({ name: "", visibility: true, isActive: true });
        fetchSetDetails(selectedSet._id);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update option");
    }
  };

  const openEditSetModal = (set) => {
    setSetFormData({
      name: set.name,
      description: set.description || "",
      isActive: set.isActive,
    });
    setShowSetModal(true);
  };

  const openAddOptionModal = () => {
    setEditingOption(null);
    setOptionFormData({ name: "", visibility: true, isActive: true });
    setShowOptionModal(true);
  };

  const openEditOptionModal = (option) => {
    setEditingOption(option);
    setOptionFormData({
      name: option.name,
      visibility: option.visibility,
      isActive: option.isActive,
    });
    setShowOptionModal(true);
  };

  const openDeleteSetModal = (setId) => {
    setDeleteTarget({ type: "set", id: setId });
    setDeletionReason("");
    setShowDeleteModal(true);
  };

  const openDeleteOptionModal = (optionId) => {
    setDeleteTarget({ type: "option", id: optionId });
    setDeletionReason("");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletionReason.trim()) {
      showError("Please provide a reason for deletion");
      return;
    }

    try {
      if (deleteTarget.type === "set") {
        const response = await api.delete(
          `/dropdowns/dropdown-sets/${deleteTarget.id}`,
          {
            data: { deletionReason },
          }
        );
        if (response.data.success) {
          showSuccess("Dropdown set archived successfully");
          setShowDeleteModal(false);
          setDeletionReason("");
          setDeleteTarget(null);
          if (viewMode === "detail") {
            handleBackToList();
          } else {
            fetchDropdownSets();
          }
        }
      } else if (deleteTarget.type === "option") {
        const response = await api.delete(
          `/dropdowns/dropdown-sets/${selectedSet._id}/options/${deleteTarget.id}`,
          { data: { deletionReason } }
        );
        if (response.data.success) {
          showSuccess("Option archived successfully");
          setShowDeleteModal(false);
          setDeletionReason("");
          setDeleteTarget(null);
          fetchSetDetails(selectedSet._id);
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to archive item");
    }
  };

  const openBulkAddModal = () => {
    setBulkOptions([{ name: "", visibility: true, isActive: true }]);
    setShowBulkAddModal(true);
  };

  const handleAddBulkRow = () => {
    setBulkOptions([
      ...bulkOptions,
      { name: "", visibility: true, isActive: true },
    ]);
  };

  const handleRemoveBulkRow = (index) => {
    if (bulkOptions.length > 1) {
      setBulkOptions(bulkOptions.filter((_, i) => i !== index));
    }
  };

  const handleBulkOptionChange = (index, field, value) => {
    const updated = [...bulkOptions];
    updated[index][field] = value;
    setBulkOptions(updated);
  };

  const handleBulkAddOptions = async () => {
    const validOptions = bulkOptions.filter((opt) => opt.name.trim() !== "");
    if (validOptions.length === 0) {
      showError("Please add at least one option with a name");
      return;
    }

    try {
      const response = await api.post(
        `/dropdowns/dropdown-sets/${selectedSet._id}/options/bulk`,
        { options: validOptions }
      );
      if (response.data.success) {
        showSuccess(`${validOptions.length} option(s) added successfully`);
        setShowBulkAddModal(false);
        setBulkOptions([{ name: "", visibility: true, isActive: true }]);
        fetchSetDetails(selectedSet._id);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add options in bulk");
    }
  };

  const renderListView = () => (
    <div className="management-container">
      <div className="page-header">
        <div>
          <h1>Dropdown Set Management</h1>
          <p>Manage dropdown sets and their options</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedSet(null);
            setSetFormData({ name: "", description: "", isActive: true });
            setShowSetModal(true);
          }}
        >
          + Create New Set
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading dropdown sets...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Set Name</th>
                <th>Description</th>
                <th>Options Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dropdownSets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No dropdown sets found
                  </td>
                </tr>
              ) : (
                dropdownSets.map((set) => (
                  <tr key={set._id}>
                    <td>
                      <strong>{set.name}</strong>
                    </td>
                    <td>{set.description || "-"}</td>
                    <td>{set.options?.length || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          set.isActive ? "badge-success" : "badge-danger"
                        }`}
                      >
                        {set.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewSetDetails(set)}
                          title="Manage Options"
                        >
                          Manage
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openEditSetModal(set)}
                          title="Edit Set"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openDeleteSetModal(set._id)}
                          title="Delete Set"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDetailView = () => (
    <div className="detail-view">
      <div className="detail-header">
        <button className="btn btn-back" onClick={handleBackToList}>
          ← Back to List
        </button>
        <div className="detail-title">
          <h2>{selectedSet?.name}</h2>
          <span
            className={`status-badge ${
              selectedSet?.isActive ? "active" : "inactive"
            }`}
          >
            {selectedSet?.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="detail-actions">
          <button
            className="btn btn-secondary"
            onClick={() => openEditSetModal(selectedSet)}
          >
            Edit Set
          </button>
          <button className="btn btn-success" onClick={openBulkAddModal}>
            + Bulk Add Options
          </button>
          <button className="btn btn-primary" onClick={openAddOptionModal}>
            + Add Option
          </button>
        </div>
      </div>

      {selectedSet?.description && (
        <p className="detail-description">{selectedSet.description}</p>
      )}

      <div className="options-table-container">
        <table className="options-table">
          <thead>
            <tr>
              <th>Database Ref</th>
              <th>Option Name</th>
              <th>Visibility</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedSet?.options && selectedSet.options.length > 0 ? (
              selectedSet.options.map((option) => (
                <tr key={option._id}>
                  <td className="ref-id-cell">#{option.incrementalId}</td>
                  <td className="option-name-cell">{option.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        option.visibility ? "visible" : "hidden"
                      }`}
                    >
                      {option.visibility ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        option.isActive ? "active" : "inactive"
                      }`}
                    >
                      {option.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => openEditOptionModal(option)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => openDeleteOptionModal(option._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  No options available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="dropdown-set-management">
      {viewMode === "list" ? renderListView() : renderDetailView()}

      {showSetModal && (
        <div className="modal-overlay" onClick={() => setShowSetModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedSet ? "Edit Dropdown Set" : "Create Dropdown Set"}</h3>
            <form onSubmit={selectedSet ? handleUpdateSet : handleCreateSet}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={setFormData.name}
                  onChange={(e) =>
                    setSetFormData({ ...setFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={setFormData.description}
                  onChange={(e) =>
                    setSetFormData({
                      ...setFormData,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={setFormData.isActive}
                    onChange={(e) =>
                      setSetFormData({
                        ...setFormData,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSetModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedSet ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOptionModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowOptionModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingOption
                ? "Edit Option"
                : `Add Option to ${selectedSet?.name}`}
            </h3>
            <form
              onSubmit={editingOption ? handleUpdateOption : handleAddOption}
            >
              <div className="form-group">
                <label>Option Name *</label>
                <input
                  type="text"
                  value={optionFormData.name}
                  onChange={(e) =>
                    setOptionFormData({
                      ...optionFormData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={optionFormData.visibility}
                    onChange={(e) =>
                      setOptionFormData({
                        ...optionFormData,
                        visibility: e.target.checked,
                      })
                    }
                  />
                  Visible
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={optionFormData.isActive}
                    onChange={(e) =>
                      setOptionFormData({
                        ...optionFormData,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOptionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOption ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBulkAddModal(false)}
        >
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Bulk Add Options to {selectedSet?.name}</h3>
            <div className="bulk-add-container">
              <div className="bulk-table-wrapper">
                <table className="bulk-table">
                  <thead>
                    <tr>
                      <th>Option Name *</th>
                      <th>Visibility</th>
                      <th>Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkOptions.map((option, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) =>
                              handleBulkOptionChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Enter option name"
                            className="bulk-input"
                          />
                        </td>
                        <td>
                          <select
                            value={option.visibility}
                            onChange={(e) =>
                              handleBulkOptionChange(
                                index,
                                "visibility",
                                e.target.value === "true"
                              )
                            }
                            className="bulk-select"
                          >
                            <option value="true">Visible</option>
                            <option value="false">Hidden</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={option.isActive}
                            onChange={(e) =>
                              handleBulkOptionChange(
                                index,
                                "isActive",
                                e.target.value === "true"
                              )
                            }
                            className="bulk-select"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-xs btn-danger"
                            onClick={() => handleRemoveBulkRow(index)}
                            disabled={bulkOptions.length === 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-add-row"
                onClick={handleAddBulkRow}
              >
                + Add Row
              </button>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowBulkAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBulkAddOptions}
              >
                Save All Options
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p className="warning-text">
              {deleteTarget?.type === "set"
                ? "This will archive the entire dropdown set and all its options."
                : "This will archive the selected option."}
            </p>
            <div className="form-group">
              <label>Reason for Deletion *</label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Please provide a reason for archiving this item..."
                rows="4"
                required
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownSetManagement;
