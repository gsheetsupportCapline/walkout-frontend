import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import "./Management.css";
import "./DropdownSetManagement.css";

// Import FIELD_IDS from WalkoutForm
const FIELD_IDS = {
  PATIENT_TYPE: "WFDRP_PATIENT_TYPE",
  INSURANCE_TYPE: "WFDRP_INSURANCE_TYPE",
  INSURANCE: "WFDRP_INSURANCE",
  PATIENT_PORTION_PRIMARY_MODE: "WFDRP_PP_PRIMARY_MODE",
  PATIENT_PORTION_SECONDARY_MODE: "WFDRP_PP_SECONDARY_MODE",
  REASON_LESS_COLLECTION: "WFDRP_REASON_LESS_COLLECTION",
  RULE_ENGINE_NOT_RUN_REASON: "WFDRP_RULE_ENGINE_NOT_RUN_REASON",
  GOOGLE_REVIEW_REQUEST: "WFRAD_GOOGLE_REVIEW",
  RULE_ENGINE_RUN: "WFRAD_RULE_ENGINE_RUN",
  RULE_ENGINE_ERROR_FOUND: "WFRAD_RULE_ENGINE_ERROR",
  LC3_RUN_RULES: "WFRAD_LC3_RUN_RULES",
  LC3_RULE_ERROR_FOUND: "WFRAD_LC3_ERROR_FOUND",
  LC3_DOCUMENT_CHECK_STATUS: "WFDRP_LC3_DOC_STATUS",
  LC3_ATTACHMENT_CHECK_STATUS: "WFDRP_LC3_ATTACH_STATUS",
  LC3_PATIENT_PORTION_STATUS: "WFDRP_LC3_PP_STATUS",
  LC3_PRODUCTION_DETAILS_STATUS: "WFDRP_LC3_PROD_STATUS",
  LC3_PROVIDER_NOTES_STATUS: "WFDRP_LC3_PROVIDER_STATUS",
  LC3_ONHOLD_STATUS: "WFDRP_LC3_ONHOLD_STATUS",
  AUDIT_DISCREPANCY_FOUND: "WFRAD_AUDIT_DISCREPANCY",
  AUDIT_DISCREPANCY_FIXED: "WFRAD_AUDIT_FIXED",
  IV_STATUS: "WFDD_IV_STATUS",
};

// Field ID Labels for dropdown options - ALL DROPDOWNS
const FIELD_LABELS = {
  // === OFFICE SECTION - DROPDOWNS (7) ===
  WFDRP_OFFICE_PATIENT_TYPE: "Office - Patient Type (Dropdown)",
  WFDRP_OFFICE_INSURANCE_TYPE: "Office - Insurance Type (Dropdown)",
  WFDRP_OFFICE_INSURANCE: "Office - Insurance (Dropdown)",
  WFDRP_OFFICE_PP_PRIMARY_MODE:
    "Office - Patient Portion Primary Mode (Dropdown)",
  WFDRP_OFFICE_PP_SECONDARY_MODE:
    "Office - Patient Portion Secondary Mode (Dropdown)",
  WFDRP_OFFICE_REASON_LESS_COLLECTION:
    "Office - Reason Office Collected less Patient Portion than Expected? (Dropdown)",
  WFDRP_OFFICE_RULE_ENGINE_NOT_RUN:
    "Office - Reason for Rules Engine not run (Dropdown)",

  // === LC3 SECTION - DROPDOWNS (21) ===
  WFDRP_LC3_REASON_NOT_RUN: "LC3 - Reason for Rules Engine not run (Dropdown)",
  WFDRP_LC3_SIGNED_TREATMENT_PLAN:
    "LC3 - Signed Treatment Plan Available (Dropdown)",
  WFDRP_LC3_PRC_AVAILABLE: "LC3 - PRC Available (Dropdown)",
  WFDRP_LC3_SIGNED_CONSENT_GENERAL:
    "LC3 - Signed Consent - General Available (Dropdown)",
  WFDRP_LC3_NVD_AVAILABLE: "LC3 - NVD Available (Dropdown)",
  WFDRP_LC3_NARRATIVE_AVAILABLE: "LC3 - Narrative Available (Dropdown)",
  WFDRP_LC3_SIGNED_CONSENT_TX: "LC3 - Signed Consent Tx. Available (Dropdown)",
  WFDRP_LC3_PRE_AUTH: "LC3 - Pre Auth Available (Dropdown)",
  WFDRP_LC3_ROUTE_SHEET: "LC3 - Route Sheet Available (Dropdown)",
  WFDRP_LC3_PANO: "LC3 - Pano (Dropdown)",
  WFDRP_LC3_FMX: "LC3 - FMX (Dropdown)",
  WFDRP_LC3_BITEWING: "LC3 - Bitewing (Dropdown)",
  WFDRP_LC3_PA: "LC3 - PA (Dropdown)",
  WFDRP_LC3_PERIO_CHART: "LC3 - Perio Chart (Dropdown)",
  WFDRP_LC3_PP_PRIMARY_MODE: "LC3 - Pat. Portion Primary Mode (Dropdown)",
  WFDRP_LC3_PAYMENT_VERIFIED_PRIMARY:
    "LC3 - Payment verified from (Primary) (Dropdown)",
  WFDRP_LC3_PP_SECONDARY_MODE: "LC3 - Pat. Portion Secondary Mode (Dropdown)",
  WFDRP_LC3_PAYMENT_VERIFIED_SECONDARY:
    "LC3 - Payment verified from (Secondary) (Dropdown)",
  WFDRP_LC3_REASON_PROD_DIFF:
    "LC3 - Reason for Difference in Total Production (Dropdown)",
  WFDRP_LC3_REASON_INS_DIFF:
    "LC3 - Reason for Difference in Est Insurance (Dropdown)",
  WFDRP_LC3_ONHOLD_REASONS: "LC3 - On Hold Reasons (Dropdown)",

  // === IV SECTION - DROPDOWNS (1) ===
  WFDD_IV_STATUS: "IV - IV Status (Dropdown)",
};

const DropdownSetManagement = () => {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

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
        closeSetModal();
        fetchDropdownSets();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create dropdown set");
    }
  };

  const handleUpdateSet = async (e) => {
    e.preventDefault();
    try {
      const setId = selectedSet._id;
      const response = await api.put(
        `/dropdowns/dropdown-sets/${setId}`,
        setFormData,
      );
      if (response.data.success) {
        showSuccess("Dropdown set updated successfully");
        setShowSetModal(false);
        setSetFormData({ name: "", description: "", isActive: true });
        if (viewMode === "detail") {
          fetchSetDetails(setId);
        } else {
          setSelectedSet(null);
          fetchDropdownSets();
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update dropdown set");
    }
  };

  const closeSetModal = () => {
    setShowSetModal(false);
    setSelectedSet(null);
    setSetFormData({ name: "", description: "", isActive: true });
  };

  const handleAddOption = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/dropdowns/dropdown-sets/${selectedSet._id}/options`,
        optionFormData,
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
        optionFormData,
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
    setSelectedSet(set);
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
          },
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
          { data: { deletionReason } },
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
        { options: validOptions },
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

  const copyToClipboard = (text, label = "ID") => {
    navigator.clipboard.writeText(text).then(
      () => showSuccess(`${label} copied to clipboard!`),
      () => showError(`Failed to copy ${label}`),
    );
  };

  const truncateId = (id) => {
    if (!id) return "-";
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  // Handle field ID mapping
  const handleFieldIdMapping = async (setId, fieldId) => {
    try {
      if (!fieldId) {
        // Remove all usedIn references if empty
        await api.put(`/dropdowns/dropdown-sets/${setId}/used-in`, {
          references: [],
        });
        showSuccess("Field mapping cleared");
      } else {
        // STEP 1: Remove this field ID from ALL other sets first
        // This ensures only ONE set can have a particular field ID
        const otherSets = dropdownSets.filter((s) => s._id !== setId);
        for (const otherSet of otherSets) {
          if (otherSet.usedIn && otherSet.usedIn.includes(fieldId)) {
            // Remove the field ID from this set
            const updatedReferences = otherSet.usedIn.filter(
              (id) => id !== fieldId,
            );
            await api.put(`/dropdowns/dropdown-sets/${otherSet._id}/used-in`, {
              references: updatedReferences,
            });
            console.log(`Removed ${fieldId} from set: ${otherSet.name}`);
          }
        }

        // STEP 2: Now add to the current set
        await api.put(`/dropdowns/dropdown-sets/${setId}/used-in`, {
          references: [fieldId],
        });
        showSuccess("Field mapped successfully - previous mappings cleared");
      }
      fetchDropdownSets(); // Refresh the list
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to update field mapping",
      );
    }
  };

  const renderListView = () => (
    <div className="management-container">
      <div className="page-header">
        <div>
          <h1>Dropdown Set Management</h1>
          <p>Manage dropdown sets and their options</p>
        </div>
        {user?.role === "superAdmin" && (
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
        )}
      </div>

      {loading ? (
        <div className="loading">Loading dropdown sets...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Set Name</th>
                {user?.role === "superAdmin" && <th>Set ID</th>}
                <th>Options Count</th>
                {user?.role === "superAdmin" && <th>Used In Field</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dropdownSets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No dropdown sets found
                  </td>
                </tr>
              ) : (
                dropdownSets.map((set) => (
                  <tr key={set._id}>
                    <td>
                      <strong>{set.name}</strong>
                    </td>
                    {user?.role === "superAdmin" && (
                      <td>
                        <span
                          className="id-cell"
                          onClick={() => copyToClipboard(set._id, "Set ID")}
                          title={`Click to copy: ${set._id}`}
                        >
                          {truncateId(set._id)}
                        </span>
                      </td>
                    )}
                    <td>{set.options?.length || 0}</td>
                    {user?.role === "superAdmin" && (
                      <td>
                        <select
                          className="field-id-select"
                          value={set.usedIn?.[0] || ""}
                          onChange={(e) =>
                            handleFieldIdMapping(set._id, e.target.value)
                          }
                          title="Map this set to a form field"
                        >
                          <option value="">-- Select Field --</option>
                          {Object.entries(FIELD_LABELS)
                            .filter(
                              ([key]) =>
                                key.startsWith("WFDRP_") ||
                                key.startsWith("WFDD_"),
                            ) // Dropdown fields
                            .map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                        </select>
                      </td>
                    )}
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
                        {user?.role === "superAdmin" && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => openDeleteSetModal(set._id)}
                            title="Delete Set"
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
        <div className="modal-overlay" onClick={closeSetModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedSet ? "Edit Dropdown Set" : "Create Dropdown Set"}
              </h2>
              <button className="modal-close" onClick={closeSetModal}>
                ×
              </button>
            </div>
            <form onSubmit={selectedSet ? handleUpdateSet : handleCreateSet}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="setName">Name *</label>
                  <input
                    type="text"
                    id="setName"
                    name="name"
                    value={setFormData.name}
                    onChange={(e) =>
                      setSetFormData({ ...setFormData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="setDescription">Description</label>
                  <textarea
                    id="setDescription"
                    name="description"
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
              </div>
              <div className="modal-footer">
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

      {showOptionModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowOptionModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingOption
                  ? "Edit Option"
                  : `Add Option to ${selectedSet?.name}`}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowOptionModal(false)}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={editingOption ? handleUpdateOption : handleAddOption}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="optionName">Option Name *</label>
                  <input
                    type="text"
                    id="optionName"
                    name="name"
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
              </div>
              <div className="modal-footer">
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
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Bulk Add Options to {selectedSet?.name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowBulkAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
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
                                  e.target.value,
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
                                  e.target.value === "true",
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
                                  e.target.value === "true",
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
            </div>
            <div className="modal-footer">
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                {deleteTarget?.type === "set"
                  ? "This will archive the entire dropdown set and all its options."
                  : "This will archive the selected option."}
              </p>
              <div className="form-group">
                <label htmlFor="deletionReason">Reason for Deletion *</label>
                <textarea
                  id="deletionReason"
                  name="deletionReason"
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Please provide a reason for archiving this item..."
                  rows="4"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
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
