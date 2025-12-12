import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import Navbar from "../Layout/Navbar";
import "./Appointments.css";

const Appointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showError } = useToast();
  // Load persisted data from localStorage
  const getStoredData = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [appointments, setAppointments] = useState(() =>
    getStoredData("appointments_data", [])
  );
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(() =>
    getStoredData("appointments_total", 0)
  );

  // Filter states - load from localStorage
  const [filters, setFilters] = useState(() =>
    getStoredData("appointments_filters", {
      officeName: "",
      startDate: "",
      endDate: "",
      patientId: "",
    })
  );

  // Pagination states - load from localStorage
  const [currentPage, setCurrentPage] = useState(() =>
    getStoredData("appointments_page", 1)
  );
  const [limit] = useState(50);

  // Check if user is admin or superAdmin
  const isAdminOrSuper = user?.role === "admin" || user?.role === "superAdmin";

  // Fetch offices
  const fetchOffices = useCallback(async () => {
    try {
      const response = await api.get("/offices");
      if (response.data.success) {
        const activeOffices = response.data.data.filter(
          (office) => office.isActive && office.visibility === "on"
        );
        setOffices(activeOffices);
      }
    } catch (err) {
      console.error("Failed to fetch offices:", err);
    }
  }, []);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!filters.officeName) {
      return;
    }

    setLoading(true);
    try {
      const skip = (currentPage - 1) * limit;
      let queryParams = `officeName=${encodeURIComponent(
        filters.officeName
      )}&limit=${limit}&skip=${skip}`;

      if (filters.startDate) {
        queryParams += `&startDate=${filters.startDate}`;

        // For user/office role, if only startDate is provided, set endDate same as startDate
        if (!isAdminOrSuper) {
          queryParams += `&endDate=${filters.startDate}`;
        }
      }
      if (filters.endDate && isAdminOrSuper) {
        queryParams += `&endDate=${filters.endDate}`;
      }
      if (filters.patientId) {
        queryParams += `&patientId=${encodeURIComponent(filters.patientId)}`;
      }

      console.log("Fetching appointments with params:", queryParams);
      const response = await api.get(`/appointments/list?${queryParams}`);
      console.log("API Response:", response.data);

      if (response.data.success) {
        const appointmentsData = response.data.data;
        const total = response.data.total;
        setAppointments(appointmentsData);
        setTotalCount(total);
        // Persist to localStorage
        localStorage.setItem(
          "appointments_data",
          JSON.stringify(appointmentsData)
        );
        localStorage.setItem("appointments_total", JSON.stringify(total));
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to fetch appointments");
      setAppointments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, limit, isAdminOrSuper, showError]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  useEffect(() => {
    if (
      filters.officeName &&
      (filters.startDate || filters.patientId) &&
      currentPage > 1
    ) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    // Persist to localStorage
    localStorage.setItem("appointments_filters", JSON.stringify(newFilters));
  };

  const handleSearch = () => {
    if (!filters.officeName) {
      showError("Please select an office");
      return;
    }

    if (!filters.startDate && !filters.patientId) {
      showError("Please select a date or enter patient ID to search");
      return;
    }

    setCurrentPage(1);
    localStorage.setItem("appointments_page", JSON.stringify(1));
    fetchAppointments();
  };

  const handleClearFilters = () => {
    const newFilters = {
      officeName: filters.officeName, // Keep office selection
      startDate: "",
      endDate: "",
      patientId: "",
    };
    setFilters(newFilters);
    setCurrentPage(1);
    // Persist to localStorage
    localStorage.setItem("appointments_filters", JSON.stringify(newFilters));
    localStorage.setItem("appointments_page", JSON.stringify(1));
  };

  const totalPages = Math.ceil(totalCount / limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Persist to localStorage
      localStorage.setItem("appointments_page", JSON.stringify(newPage));
    }
  };

  return (
    <>
      <Navbar />
      <div className="appointments-wrapper">
        <div className="appointments-container">
          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-left">
              <div className="filter-group">
                <label htmlFor="officeName">Office</label>
                <select
                  id="officeName"
                  name="officeName"
                  value={filters.officeName}
                  onChange={handleFilterChange}
                  className="filter-select"
                >
                  <option value="">Select Office</option>
                  {offices.map((office) => (
                    <option key={office._id} value={office.officeName}>
                      {office.officeName}
                    </option>
                  ))}
                </select>
              </div>

              {isAdminOrSuper ? (
                <>
                  <div className="filter-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="filter-input"
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="filter-input"
                    />
                  </div>
                </>
              ) : (
                <div className="filter-group">
                  <label htmlFor="startDate">Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="filter-input"
                  />
                </div>
              )}
            </div>

            <div className="filter-right">
              <div className="filter-group">
                <label htmlFor="patientId">Patient ID</label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={filters.patientId}
                  onChange={handleFilterChange}
                  placeholder="Search Patient ID"
                  className="filter-input"
                />
              </div>

              <div className="filter-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSearch}
                >
                  Search
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pending with?</th>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>WO Submit To LC3?</th>
                  <th>Walkout Status</th>
                  <th>Pending Checks(LC3)</th>
                  <th>On Hold Reasons</th>
                  <th>On-Hold Reasons addressed</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      Loading appointments...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      {filters.officeName
                        ? "No appointments found. Please select date or enter patient ID and click Search."
                        : "Please select an office, date/patient ID and click Search"}
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr
                      key={appt._id}
                      onClick={() =>
                        navigate(`/appointments/${appt._id}`, {
                          state: {
                            appointment: appt,
                            officeName: filters.officeName,
                          },
                        })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td>-</td>
                      <td>
                        <span className="code-badge">{appt["patient-id"]}</span>
                      </td>
                      <td>{appt["patient-name"]}</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && appointments.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, totalCount)} of {totalCount}{" "}
                appointments
              </div>

              <div className="pagination-controls">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="pagination-pages">
                  {currentPage > 2 && (
                    <>
                      <button
                        className="btn btn-sm btn-page"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                      {currentPage > 3 && (
                        <span className="pagination-dots">...</span>
                      )}
                    </>
                  )}

                  {currentPage > 1 && (
                    <button
                      className="btn btn-sm btn-page"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </button>
                  )}

                  <button className="btn btn-sm btn-page active">
                    {currentPage}
                  </button>

                  {currentPage < totalPages && (
                    <button
                      className="btn btn-sm btn-page"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </button>
                  )}

                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && (
                        <span className="pagination-dots">...</span>
                      )}
                      <button
                        className="btn btn-sm btn-page"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Appointments;
