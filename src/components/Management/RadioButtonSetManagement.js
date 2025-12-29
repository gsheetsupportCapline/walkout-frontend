import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./Management.css";
import "./RadioButtonSetManagement.css";

const RadioButtonSetManagement = () => {
  const { showSuccess, showError } = useToast();

  const [buttonSets, setButtonSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [showSetModal, setShowSetModal] = useState(false);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [editingButton, setEditingButton] = useState(null);
  const [bulkButtons, setBulkButtons] = useState([
    { name: "", visibility: true, isActive: true },
  ]);

  const [setFormData, setSetFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [buttonFormData, setButtonFormData] = useState({
    name: "",
    visibility: true,
    isActive: true,
  });

  useEffect(() => {
    fetchButtonSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchButtonSets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/radio-buttons/button-sets");
      if (response.data.success) {
        setButtonSets(response.data.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch button sets");
    } finally {
      setLoading(false);
    }
  };

  const fetchSetDetails = async (setId) => {
    try {
      const response = await api.get(`/radio-buttons/button-sets/${setId}`);
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
    fetchButtonSets();
  };

  const handleCreateSet = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        "/radio-buttons/button-sets",
        setFormData
      );
      if (response.data.success) {
        showSuccess("Button set created successfully");
        closeSetModal();
        fetchButtonSets();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create button set");
    }
  };

  const handleUpdateSet = async (e) => {
    e.preventDefault();
    try {
      const setId = selectedSet._id;
      const response = await api.put(
        `/radio-buttons/button-sets/${setId}`,
        setFormData
      );
      if (response.data.success) {
        showSuccess("Button set updated successfully");
        setShowSetModal(false);
        setSetFormData({ name: "", description: "", isActive: true });
        if (viewMode === "detail") {
          fetchSetDetails(setId);
        } else {
          setSelectedSet(null);
          fetchButtonSets();
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update button set");
    }
  };

  const closeSetModal = () => {
    setShowSetModal(false);
    setSelectedSet(null);
    setSetFormData({ name: "", description: "", isActive: true });
  };

  const handleAddButton = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/radio-buttons/button-sets/${selectedSet._id}/buttons`,
        buttonFormData
      );
      if (response.data.success) {
        showSuccess("Button added successfully");
        setShowButtonModal(false);
        setButtonFormData({ name: "", visibility: true, isActive: true });
        fetchSetDetails(selectedSet._id);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add button");
    }
  };

  const handleUpdateButton = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/radio-buttons/button-sets/${selectedSet._id}/buttons/${editingButton._id}`,
        buttonFormData
      );
      if (response.data.success) {
        showSuccess("Button updated successfully");
        setShowButtonModal(false);
        setEditingButton(null);
        setButtonFormData({ name: "", visibility: true, isActive: true });
        fetchSetDetails(selectedSet._id);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update button");
    }
  };

  const openEditSetModal = (set) => {
    setSelectedSet(set);
    setSetFormData({
      name: set.name,
      description: set.description || "",
      isActive: set.isActive,
    });
    setShowSetModal(true);
  };

  const openDeleteSetModal = (setId) => {
    setDeleteTarget({ type: "set", id: setId });
    setDeletionReason("");
    setShowDeleteModal(true);
  };

  const openDeleteButtonModal = (buttonId) => {
    setDeleteTarget({ type: "button", id: buttonId });
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
          `/radio-buttons/button-sets/${deleteTarget.id}`,
          {
            data: { deletionReason },
          }
        );
        if (response.data.success) {
          showSuccess("Button set archived successfully");
          setShowDeleteModal(false);
          setDeletionReason("");
          setDeleteTarget(null);
          if (viewMode === "detail") {
            handleBackToList();
          } else {
            fetchButtonSets();
          }
        }
      } else if (deleteTarget.type === "button") {
        const response = await api.delete(
          `/radio-buttons/button-sets/${selectedSet._id}/buttons/${deleteTarget.id}`,
          { data: { deletionReason } }
        );
        if (response.data.success) {
          showSuccess("Button archived successfully");
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

  const openAddButtonModal = () => {
    setEditingButton(null);
    setButtonFormData({ name: "", visibility: true, isActive: true });
    setShowButtonModal(true);
  };

  const openEditButtonModal = (button) => {
    setEditingButton(button);
    setButtonFormData({
      name: button.name,
      visibility: button.visibility,
      isActive: button.isActive,
    });
    setShowButtonModal(true);
  };

  const openBulkAddModal = () => {
    setBulkButtons([{ name: "", visibility: true, isActive: true }]);
    setShowBulkAddModal(true);
  };

  const handleAddBulkRow = () => {
    setBulkButtons([
      ...bulkButtons,
      { name: "", visibility: true, isActive: true },
    ]);
  };

  const handleRemoveBulkRow = (index) => {
    if (bulkButtons.length > 1) {
      setBulkButtons(bulkButtons.filter((_, i) => i !== index));
    }
  };

  const handleBulkButtonChange = (index, field, value) => {
    const updated = [...bulkButtons];
    updated[index][field] = value;
    setBulkButtons(updated);
  };

  const handleBulkAddButtons = async () => {
    const validButtons = bulkButtons.filter((btn) => btn.name.trim() !== "");
    if (validButtons.length === 0) {
      showError("Please add at least one button with a name");
      return;
    }

    try {
      const response = await api.post(
        `/radio-buttons/button-sets/${selectedSet._id}/buttons/bulk`,
        { buttons: validButtons }
      );
      if (response.data.success) {
        showSuccess(`${validButtons.length} button(s) added successfully`);
        setShowBulkAddModal(false);
        setBulkButtons([{ name: "", visibility: true, isActive: true }]);
        fetchSetDetails(selectedSet._id);
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add buttons in bulk");
    }
  };

  const copyToClipboard = (text, label = "ID") => {
    navigator.clipboard.writeText(text).then(
      () => showSuccess(`${label} copied to clipboard!`),
      () => showError(`Failed to copy ${label}`)
    );
  };

  const truncateId = (id) => {
    if (!id) return "-";
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  const renderListView = () => (
    <div className="management-container">
      <div className="page-header">
        <div>
          <h1>Radio Button Set Management</h1>
          <p>Manage radio button sets and their buttons</p>
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
        <div className="loading">Loading button sets...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Set Name</th>
                <th>Set ID</th>
                <th>Buttons Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buttonSets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No button sets found
                  </td>
                </tr>
              ) : (
                buttonSets.map((set) => (
                  <tr key={set._id}>
                    <td>
                      <strong>{set.name}</strong>
                    </td>
                    <td>
                      <span
                        className="id-cell"
                        onClick={() => copyToClipboard(set._id, "Set ID")}
                        title={`Click to copy: ${set._id}`}
                      >
                        {truncateId(set._id)}
                      </span>
                    </td>
                    <td>{set.buttons?.length || 0}</td>
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
                          title="Manage Buttons"
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
            + Bulk Add Buttons
          </button>
          <button className="btn btn-primary" onClick={openAddButtonModal}>
            + Add Button
          </button>
        </div>
      </div>

      {selectedSet?.description && (
        <p className="detail-description">{selectedSet.description}</p>
      )}

      <div className="buttons-table-container">
        <table className="buttons-table">
          <thead>
            <tr>
              <th>Database Ref</th>
              <th>Button Name</th>
              <th>Visibility</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedSet?.buttons && selectedSet.buttons.length > 0 ? (
              selectedSet.buttons.map((button) => (
                <tr key={button._id}>
                  <td className="ref-id-cell">#{button.incrementalId}</td>
                  <td className="button-name-cell">{button.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        button.visibility ? "visible" : "hidden"
                      }`}
                    >
                      {button.visibility ? "Visible" : "Hidden"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        button.isActive ? "active" : "inactive"
                      }`}
                    >
                      {button.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => openEditButtonModal(button)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => openDeleteButtonModal(button._id)}
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
                  No buttons available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="radio-button-set-management">
      {viewMode === "list" ? renderListView() : renderDetailView()}

      {showSetModal && (
        <div className="modal-overlay" onClick={closeSetModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedSet ? "Edit Button Set" : "Create Button Set"}</h3>
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
                  onClick={closeSetModal}
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

      {showButtonModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowButtonModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingButton
                ? "Edit Button"
                : `Add Button to ${selectedSet?.name}`}
            </h3>
            <form
              onSubmit={editingButton ? handleUpdateButton : handleAddButton}
            >
              <div className="form-group">
                <label>Button Name *</label>
                <input
                  type="text"
                  value={buttonFormData.name}
                  onChange={(e) =>
                    setButtonFormData({
                      ...buttonFormData,
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
                    checked={buttonFormData.visibility}
                    onChange={(e) =>
                      setButtonFormData({
                        ...buttonFormData,
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
                    checked={buttonFormData.isActive}
                    onChange={(e) =>
                      setButtonFormData({
                        ...buttonFormData,
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
                  onClick={() => setShowButtonModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingButton ? "Update" : "Add"}
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
            <h3>Bulk Add Buttons to {selectedSet?.name}</h3>
            <div className="bulk-add-container">
              <div className="bulk-table-wrapper">
                <table className="bulk-table">
                  <thead>
                    <tr>
                      <th>Button Name *</th>
                      <th>Visibility</th>
                      <th>Active</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkButtons.map((button, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={button.name}
                            onChange={(e) =>
                              handleBulkButtonChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Enter button name"
                            className="bulk-input"
                          />
                        </td>
                        <td>
                          <select
                            value={button.visibility}
                            onChange={(e) =>
                              handleBulkButtonChange(
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
                            value={button.isActive}
                            onChange={(e) =>
                              handleBulkButtonChange(
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
                            disabled={bulkButtons.length === 1}
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
                onClick={handleBulkAddButtons}
              >
                Save All Buttons
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
                ? "This will archive the entire button set and all its buttons."
                : "This will archive the selected button."}
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

export default RadioButtonSetManagement;
