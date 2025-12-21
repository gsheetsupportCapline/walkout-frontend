import React, { useState, useEffect } from "react";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import "./ArchiveDropdownManagement.css";

const ArchiveDropdownManagement = () => {
  const { showSuccess, showError } = useToast();

  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restoreName, setRestoreName] = useState("");
  const [pagination, setPagination] = useState({
    limit: 20,
    skip: 0,
    total: 0,
  });

  useEffect(() => {
    fetchArchives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.skip]);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dropdowns/archives/dropdown-sets", {
        params: {
          limit: pagination.limit,
          skip: pagination.skip,
          sortBy: "-deletedAt",
        },
      });
      if (response.data.success) {
        setArchives(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.total,
        }));
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to fetch archived dropdown sets"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (archive) => {
    try {
      const response = await api.get(
        `/dropdowns/archives/dropdown-sets/${archive._id}`
      );
      if (response.data.success) {
        setSelectedArchive(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to fetch archive details"
      );
    }
  };

  const openRestoreModal = (archive) => {
    setSelectedArchive(archive);
    setRestoreName(archive.name);
    setShowRestoreModal(true);
  };

  const handleRestore = async () => {
    try {
      const payload =
        restoreName !== selectedArchive.name ? { newName: restoreName } : {};
      const response = await api.post(
        `/dropdowns/archives/dropdown-sets/${selectedArchive._id}/restore`,
        payload
      );
      if (response.data.success) {
        showSuccess("Dropdown set restored successfully");
        setShowRestoreModal(false);
        setRestoreName("");
        setSelectedArchive(null);
        fetchArchives();
      }
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response?.data?.message.includes("already exists")
      ) {
        showError(
          "A set with this name already exists. Please use a different name."
        );
      } else {
        showError(
          err.response?.data?.message || "Failed to restore dropdown set"
        );
      }
    }
  };

  const openDeleteModal = (archive) => {
    setSelectedArchive(archive);
    setShowDeleteModal(true);
  };

  const handlePermanentDelete = async () => {
    try {
      const response = await api.delete(
        `/dropdowns/archives/dropdown-sets/${selectedArchive._id}/permanent`
      );
      if (response.data.success) {
        showSuccess("Archived dropdown set permanently deleted");
        setShowDeleteModal(false);
        setSelectedArchive(null);
        fetchArchives();
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to permanently delete archive"
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrevPage = () => {
    if (pagination.skip > 0) {
      setPagination((prev) => ({
        ...prev,
        skip: Math.max(0, prev.skip - prev.limit),
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination.skip + pagination.limit < pagination.total) {
      setPagination((prev) => ({
        ...prev,
        skip: prev.skip + prev.limit,
      }));
    }
  };

  return (
    <div className="archive-management">
      <div className="archive-header">
        <div>
          <h2>Archived Dropdown Sets</h2>
          <p className="archive-subtitle">
            View, restore, or permanently delete archived dropdown sets
          </p>
        </div>
        <div className="archive-stats">
          <span className="stat-badge">Total Archives: {pagination.total}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading archived dropdown sets...</div>
      ) : archives.length === 0 ? (
        <div className="no-archives">
          <p>No archived dropdown sets found</p>
        </div>
      ) : (
        <>
          <div className="archive-table-container">
            <table className="archive-table">
              <thead>
                <tr>
                  <th>Set Name</th>
                  <th>Options Count</th>
                  <th>Deleted By</th>
                  <th>Deleted At</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {archives.map((archive) => (
                  <tr key={archive._id}>
                    <td className="archive-name">
                      <strong>{archive.name}</strong>
                      {archive.description && (
                        <small className="archive-desc">
                          {archive.description}
                        </small>
                      )}
                    </td>
                    <td>{archive.options?.length || 0}</td>
                    <td>
                      <div className="user-info">
                        <span className="user-name">
                          {archive.deletedBy?.name || "Unknown"}
                        </span>
                        <small className="user-email">
                          {archive.deletedBy?.email || ""}
                        </small>
                      </div>
                    </td>
                    <td>{formatDate(archive.deletedAt)}</td>
                    <td className="reason-cell">
                      <span className="reason-badge">
                        {archive.deletionReason || "No reason provided"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-xs btn-info"
                          onClick={() => handleViewDetails(archive)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => openRestoreModal(archive)}
                        >
                          Restore
                        </button>
                        <button
                          className="btn btn-xs btn-danger"
                          onClick={() => openDeleteModal(archive)}
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

          {pagination.total > pagination.limit && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={handlePrevPage}
                disabled={pagination.skip === 0}
              >
                Previous
              </button>
              <span className="pagination-info">
                Showing {pagination.skip + 1} -{" "}
                {Math.min(pagination.skip + pagination.limit, pagination.total)}{" "}
                of {pagination.total}
              </span>
              <button
                className="btn btn-secondary"
                onClick={handleNextPage}
                disabled={
                  pagination.skip + pagination.limit >= pagination.total
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedArchive && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Archive Details: {selectedArchive.name}</h3>

            <div className="archive-details">
              <div className="detail-row">
                <label>Original ID:</label>
                <span className="mono-text">{selectedArchive.originalId}</span>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedArchive.description || "No description"}</span>
              </div>
              <div className="detail-row">
                <label>Last Option ID:</label>
                <span>#{selectedArchive.lastOptionId}</span>
              </div>
              <div className="detail-row">
                <label>Deleted By:</label>
                <span>
                  {selectedArchive.deletedBy?.name} (
                  {selectedArchive.deletedBy?.email})
                </span>
              </div>
              <div className="detail-row">
                <label>Deleted At:</label>
                <span>{formatDate(selectedArchive.deletedAt)}</span>
              </div>
              <div className="detail-row">
                <label>Deletion Reason:</label>
                <span className="reason-text">
                  {selectedArchive.deletionReason || "No reason provided"}
                </span>
              </div>
            </div>

            <h4>Options ({selectedArchive.options?.length || 0})</h4>
            <div className="options-list">
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Name</th>
                    <th>Visibility</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedArchive.options?.map((option, index) => (
                    <tr key={index}>
                      <td className="ref-id-cell">#{option.incrementalId}</td>
                      <td>{option.name}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && selectedArchive && (
        <div
          className="modal-overlay"
          onClick={() => setShowRestoreModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Restore Dropdown Set</h3>
            <p className="info-text">
              This will restore the dropdown set and all its options back to the
              main collection.
            </p>

            <div className="form-group">
              <label>Set Name *</label>
              <input
                type="text"
                value={restoreName}
                onChange={(e) => setRestoreName(e.target.value)}
                placeholder="Enter set name"
              />
              <small className="help-text">
                If a set with this name already exists, please provide a
                different name.
              </small>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowRestoreModal(false);
                  setRestoreName("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleRestore}
                disabled={!restoreName.trim()}
              >
                Restore Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {showDeleteModal && selectedArchive && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Permanent Delete</h3>
            <p className="warning-text danger">
              ⚠️ This action cannot be undone! The archive will be permanently
              deleted from the database.
            </p>

            <div className="archive-info">
              <strong>Set Name:</strong> {selectedArchive.name}
              <br />
              <strong>Options:</strong> {selectedArchive.options?.length || 0}
              <br />
              <strong>Deleted At:</strong>{" "}
              {formatDate(selectedArchive.deletedAt)}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handlePermanentDelete}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveDropdownManagement;
