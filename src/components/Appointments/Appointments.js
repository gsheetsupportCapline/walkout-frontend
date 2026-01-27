import React, { useState, useEffect, useCallback, useRef } from "react";
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

  // Helper to load persisted data from localStorage
  const getStoredData = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // State management
  const [appointments, setAppointments] = useState(() =>
    getStoredData("appointments_data", []),
  );
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(() =>
    getStoredData("appointments_total", 0),
  );

  // Filter states - load from localStorage
  const [filters, setFilters] = useState(() =>
    getStoredData("appointments_filters", {
      officeName: "",
      startDate: "",
      endDate: "",
      patientId: "",
    }),
  );

  // Column filters for multi-column filtering
  const [columnFilters, setColumnFilters] = useState({});
  const [tempColumnFilters, setTempColumnFilters] = useState({}); // Temporary selections before OK
  const [showFilterDropdown, setShowFilterDropdown] = useState(null);
  const [allAppointmentsData, setAllAppointmentsData] = useState([]); // All data for client-side filtering
  const [pageBeforeFilter, setPageBeforeFilter] = useState(1); // Track page before applying filter

  // Pagination states - load from localStorage
  const [currentPage, setCurrentPage] = useState(() =>
    getStoredData("appointments_page", 1),
  );
  const [limit] = useState(50);
  const [searchType, setSearchType] = useState(() =>
    getStoredData("appointments_searchType", "dateRange"),
  ); // "dateRange" or "patientId"

  const lastFetchParams = useRef(null);
  const isManualSearch = useRef(false);

  // Check if user is admin or superAdmin
  const isAdminOrSuper = user?.role === "admin" || user?.role === "superAdmin";

  // Fetch offices
  const fetchOffices = useCallback(async () => {
    try {
      const response = await api.get("/offices");
      if (response.data.success) {
        const activeOffices = response.data.data.filter(
          (office) => office.isActive && office.visibility === "on",
        );
        setOffices(activeOffices);
      }
    } catch (err) {
      console.error("Failed to fetch offices:", err);
    }
  }, []);

  // Fetch appointments by date range
  const fetchAppointments = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!filters.officeName) {
        return;
      }

      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const skip = (currentPage - 1) * limit;
        let queryParams = `officeName=${encodeURIComponent(
          filters.officeName,
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

        // Store current fetch params
        const currentParams = { queryParams, currentPage };
        lastFetchParams.current = currentParams;

        console.log("Fetching appointments with params:", queryParams);
        const response = await api.get(`/appointments/list?${queryParams}`);
        console.log("API Response:", response.data);

        if (response.data.success) {
          const appointmentsData = response.data.data;
          const total = response.data.total;

          if (isBackgroundRefresh) {
            // Smart update - only update changed rows
            setAppointments((prevAppointments) => {
              // Check if data actually changed
              let hasChanges =
                appointmentsData.length !== prevAppointments.length;

              if (!hasChanges) {
                for (let i = 0; i < appointmentsData.length; i++) {
                  if (
                    JSON.stringify(appointmentsData[i]) !==
                    JSON.stringify(prevAppointments[i])
                  ) {
                    hasChanges = true;
                    break;
                  }
                }
              }

              return hasChanges ? appointmentsData : prevAppointments;
            });
          } else {
            setAppointments(appointmentsData);
          }

          setTotalCount(total);
          // Persist to localStorage
          localStorage.setItem(
            "appointments_data",
            JSON.stringify(appointmentsData),
          );
          localStorage.setItem("appointments_total", JSON.stringify(total));
          localStorage.setItem(
            "appointments_lastFetch",
            new Date().toISOString(),
          );
        }
      } catch (err) {
        if (!isBackgroundRefresh) {
          showError(
            err.response?.data?.message || "Failed to fetch appointments",
          );
          setAppointments([]);
          setTotalCount(0);
        }
      } finally {
        if (!isBackgroundRefresh) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [filters, currentPage, limit, isAdminOrSuper, showError],
  );

  // Fetch appointments by patient ID (separate API)
  const fetchAppointmentsByPatient = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!filters.officeName || !filters.patientId) {
        return;
      }

      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const skip = (currentPage - 1) * limit;
        const queryParams = `officeName=${encodeURIComponent(
          filters.officeName,
        )}&patientId=${encodeURIComponent(
          filters.patientId,
        )}&limit=${limit}&skip=${skip}`;

        // Store current fetch params
        const currentParams = { queryParams, currentPage };
        lastFetchParams.current = currentParams;

        console.log("Fetching appointments by patient:", queryParams);
        const response = await api.get(
          `/appointments/by-patient?${queryParams}`,
        );
        console.log("Patient API Response:", response.data);

        if (response.data.success) {
          const appointmentsData = response.data.data;
          const total = response.data.total;

          if (isBackgroundRefresh) {
            // Smart update - only update changed rows
            setAppointments((prevAppointments) => {
              const hasChanges =
                JSON.stringify(appointmentsData) !==
                JSON.stringify(prevAppointments);
              return hasChanges ? appointmentsData : prevAppointments;
            });
          } else {
            setAppointments(appointmentsData);
          }

          setTotalCount(total);
          // Persist to localStorage
          localStorage.setItem(
            "appointments_data",
            JSON.stringify(appointmentsData),
          );
          localStorage.setItem("appointments_total", JSON.stringify(total));
          localStorage.setItem(
            "appointments_lastFetch",
            new Date().toISOString(),
          );
        }
      } catch (err) {
        if (!isBackgroundRefresh) {
          showError(
            err.response?.data?.message ||
              "Failed to fetch appointments by patient ID",
          );
          setAppointments([]);
          setTotalCount(0);
        }
      } finally {
        if (!isBackgroundRefresh) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [filters.officeName, filters.patientId, currentPage, limit, showError],
  );

  // Load offices on mount
  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  // Refresh on page focus (when coming back from walkout)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && filters.officeName) {
        console.log("📱 Page became visible - refreshing appointments");
        if (searchType === "dateRange") {
          fetchAppointments(true);
        } else {
          fetchAppointmentsByPatient(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    filters.officeName,
    searchType,
    fetchAppointments,
    fetchAppointmentsByPatient,
  ]);

  // Polling for real-time updates (every 30 seconds) - ONLY for date range searches
  useEffect(() => {
    if (!filters.officeName || searchType !== "dateRange") return;

    const pollInterval = setInterval(() => {
      console.log("🔄 Polling for updates (date range)...");
      fetchAppointments(true); // Background refresh
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [filters.officeName, searchType, fetchAppointments]);

  // Refresh when coming back to page (on mount if data exists)
  useEffect(() => {
    const lastFetch = localStorage.getItem("appointments_lastFetch");
    if (lastFetch && filters.officeName) {
      const timeSinceLastFetch = Date.now() - new Date(lastFetch).getTime();
      // If last fetch was more than 1 minute ago, refresh
      if (timeSinceLastFetch > 60000) {
        console.log("🔃 Data is stale - refreshing appointments");
        if (searchType === "dateRange") {
          fetchAppointments(true);
        } else {
          fetchAppointmentsByPatient(true);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Fetch when currentPage changes (proper pagination)
  useEffect(() => {
    // Skip if this is a manual search (handleSearch/handlePatientSearch already fetched)
    if (isManualSearch.current) {
      isManualSearch.current = false;
      return;
    }

    if (filters.officeName && (filters.startDate || filters.patientId)) {
      if (searchType === "dateRange" && filters.startDate) {
        fetchAppointments();
      } else if (searchType === "patientId" && filters.patientId) {
        fetchAppointmentsByPatient();
      }
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

    if (!filters.startDate) {
      showError("Please select a date to search");
      return;
    }

    isManualSearch.current = true;
    setCurrentPage(1);
    setSearchType("dateRange");
    localStorage.setItem("appointments_page", JSON.stringify(1));
    localStorage.setItem(
      "appointments_searchType",
      JSON.stringify("dateRange"),
    );
    fetchAppointments();
  };

  // Handle patient ID search on Enter/Tab
  const handlePatientSearch = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      if (!filters.officeName) {
        showError("Please select an office first");
        e.preventDefault();
        return;
      }

      if (!filters.patientId) {
        showError("Please enter a patient ID");
        e.preventDefault();
        return;
      }

      isManualSearch.current = true;
      setCurrentPage(1);
      setSearchType("patientId");
      localStorage.setItem("appointments_page", JSON.stringify(1));
      localStorage.setItem(
        "appointments_searchType",
        JSON.stringify("patientId"),
      );
      fetchAppointmentsByPatient();
      e.preventDefault(); // Prevent tab navigation
    }
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
    setAppointments([]);
    setTotalCount(0);
    setColumnFilters({});
    // Persist to localStorage
    localStorage.setItem("appointments_filters", JSON.stringify(newFilters));
    localStorage.setItem("appointments_page", JSON.stringify(1));
    localStorage.removeItem("appointments_data");
    localStorage.removeItem("appointments_total");
  };

  // Get unique values for column (from currently filtered data)
  const getUniqueColumnValues = (columnKey) => {
    // Get data based on current filter state
    let dataSource = [];

    if (allAppointmentsData.length > 0) {
      // If we have all data loaded (filters are active), use that
      dataSource = allAppointmentsData;
    } else if (appointments.length > 0) {
      // Otherwise use current page data (not ideal but better than nothing)
      dataSource = appointments;
    }

    // Apply existing filters EXCEPT the current column being filtered
    let filteredData = [...dataSource];

    Object.keys(columnFilters).forEach((filterKey) => {
      // Skip the column we're currently filtering
      if (filterKey !== columnKey) {
        const selectedValues = columnFilters[filterKey];
        if (selectedValues && selectedValues.length > 0) {
          filteredData = filteredData.filter((appt) => {
            const value = appt[filterKey];
            return selectedValues.includes(value);
          });
        }
      }
    });

    // Extract unique values from filtered data
    const values = new Set();
    filteredData.forEach((appt) => {
      const value = appt[columnKey];
      if (value && value !== "-") {
        values.add(value);
      }
    });

    return Array.from(values).sort();
  };

  // Load unique values when filter dropdown opens
  const handleFilterButtonClick = async (columnKey, dropdownId) => {
    if (showFilterDropdown === dropdownId) {
      setShowFilterDropdown(null);
    } else {
      setShowFilterDropdown(dropdownId);

      // Initialize temp filters with current filters
      setTempColumnFilters({ ...columnFilters });

      // Fetch all data if not already loaded (needed for accurate filtering)
      if (allAppointmentsData.length === 0 && filters.officeName) {
        await fetchAllDataForFiltering();
      }
    }
  };

  // Apply column filters to appointments
  const getFilteredAppointments = () => {
    // Use all data if filters are active, otherwise use paginated data
    const hasActiveFilters = Object.keys(columnFilters).length > 0;
    const dataToFilter =
      hasActiveFilters && allAppointmentsData.length > 0
        ? allAppointmentsData
        : appointments;

    let filtered = [...dataToFilter];

    // Sort by Date of Service first, then Patient ID (ascending)
    filtered.sort((a, b) => {
      const dosA = a.dos || a["dos"] || "";
      const dosB = b.dos || b["dos"] || "";

      // Compare Date of Service first (as dates)
      if (dosA !== dosB) {
        // Convert to Date objects for proper date comparison
        const dateA = dosA ? new Date(dosA) : new Date(0);
        const dateB = dosB ? new Date(dosB) : new Date(0);
        return dateA - dateB;
      }

      // If dates are same, compare Patient ID (as numbers)
      const patientIdA = a["patient-id"] || "";
      const patientIdB = b["patient-id"] || "";

      // Convert to numbers for proper numeric comparison
      const numA = parseInt(patientIdA) || 0;
      const numB = parseInt(patientIdB) || 0;
      return numA - numB;
    });

    // Apply column filters only if active
    if (hasActiveFilters) {
      Object.keys(columnFilters).forEach((columnKey) => {
        const selectedValues = columnFilters[columnKey];
        if (selectedValues && selectedValues.length > 0) {
          filtered = filtered.filter((appt) => {
            const value = appt[columnKey];
            return selectedValues.includes(value);
          });
        }
      });
    }

    return filtered;
  };

  const hasActiveFilters = Object.keys(columnFilters).length > 0;
  const allFilteredAppointments = getFilteredAppointments();

  // Client-side pagination ONLY for filtered data, otherwise use server pagination
  let filteredAppointments;
  let startIndex, endIndex;

  if (hasActiveFilters) {
    // Client-side pagination for filtered data
    startIndex = (currentPage - 1) * limit;
    endIndex = startIndex + limit;
    filteredAppointments = allFilteredAppointments.slice(startIndex, endIndex);
  } else {
    // Server-side pagination (use appointments as-is)
    filteredAppointments = allFilteredAppointments;
    startIndex = (currentPage - 1) * limit;
    endIndex = Math.min(currentPage * limit, totalCount);
  }

  // Toggle column filter (temporary until OK is clicked)
  const toggleColumnFilter = (columnKey, value) => {
    setTempColumnFilters((prev) => {
      const currentFilters = prev[columnKey] || [];
      const isSelected = currentFilters.includes(value);

      if (isSelected) {
        const newFilters = currentFilters.filter((v) => v !== value);
        if (newFilters.length === 0) {
          const { [columnKey]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [columnKey]: newFilters };
      } else {
        return { ...prev, [columnKey]: [...currentFilters, value] };
      }
    });
  };

  // Apply filter (OK button)
  const applyColumnFilter = async (columnKey) => {
    // Save current page before applying filter (only if no filters are currently active)
    if (Object.keys(columnFilters).length === 0) {
      setPageBeforeFilter(currentPage);
    }

    setColumnFilters({ ...tempColumnFilters });
    setShowFilterDropdown(null);
    setCurrentPage(1); // Reset to page 1 when applying filter

    // Fetch all data when filters are applied
    if (Object.keys(tempColumnFilters).length > 0) {
      await fetchAllDataForFiltering();
    }
  };

  // Cancel filter (Cancel button)
  const cancelColumnFilter = () => {
    setTempColumnFilters({ ...columnFilters });
    setShowFilterDropdown(null);
  };

  // Fetch all data for client-side filtering
  const fetchAllDataForFiltering = async () => {
    if (!filters.officeName) return;

    try {
      let queryParams = `officeName=${encodeURIComponent(filters.officeName)}`;

      if (searchType === "dateRange" && filters.startDate) {
        queryParams += `&startDate=${filters.startDate}`;
        if (filters.endDate && isAdminOrSuper) {
          queryParams += `&endDate=${filters.endDate}`;
        } else if (!isAdminOrSuper) {
          queryParams += `&endDate=${filters.startDate}`;
        }
      }

      const response = await api.get(
        `/appointments/list?${queryParams}&limit=10000`,
      );

      if (response.data.success) {
        setAllAppointmentsData(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch all data for filtering:", err);
    }
  };

  // Clear all column filters
  const clearAllColumnFilters = () => {
    setColumnFilters({});
    setTempColumnFilters({});
    setShowFilterDropdown(null);
    setAllAppointmentsData([]); // Clear all data cache
    setCurrentPage(pageBeforeFilter); // Restore page before filter was applied
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".th-content")) {
        setShowFilterDropdown(null);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showFilterDropdown]);

  // Calculate total pages based on filtered data if filters are active
  const effectiveTotal = hasActiveFilters
    ? allFilteredAppointments.length
    : totalCount;
  const totalPages = Math.ceil(effectiveTotal / limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
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

            {/* Search and Clear Buttons */}
            <div className="filter-right">
              <div className="filter-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSearch}
                  disabled={loading}
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

              {/* Separate Patient ID Search */}
              <div className="filter-group" style={{ marginTop: "0" }}>
                <label htmlFor="patientId">
                  Patient ID Search
                  <small
                    style={{
                      display: "block",
                      color: "#666",
                      fontSize: "10px",
                      fontWeight: "normal",
                      marginTop: "2px",
                    }}
                  >
                    (Press Enter or Tab)
                  </small>
                </label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={filters.patientId}
                  onChange={handleFilterChange}
                  onKeyDown={handlePatientSearch}
                  placeholder="Enter Patient ID"
                  className="filter-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            {isRefreshing && !loading && (
              <div className="refresh-indicator">
                <span>🔄 Updating...</span>
              </div>
            )}
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <div className="th-content">
                      Pending with?
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick("pending-with", "pending")
                        }
                        title="Filter"
                      >
                        {columnFilters["pending-with"] &&
                        columnFilters["pending-with"].length > 0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "pending" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["pending-with"] &&
                                tempColumnFilters["pending-with"].length > 0 &&
                                `(${tempColumnFilters["pending-with"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues("pending-with").map(
                              (value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["pending-with"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter("pending-with", value)
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ),
                            )}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() => applyColumnFilter("pending-with")}
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  {isAdminOrSuper && (
                    <th>
                      <div className="th-content">
                        Date of Service
                        <button
                          className="filter-btn"
                          onClick={() => handleFilterButtonClick("dos", "dos")}
                          title="Filter"
                        >
                          {columnFilters["dos"] &&
                          columnFilters["dos"].length > 0 ? (
                            <span className="filter-icon-active">▼</span>
                          ) : (
                            <span className="filter-icon">▽</span>
                          )}
                        </button>
                        {showFilterDropdown === "dos" && (
                          <div className="filter-dropdown">
                            <div className="filter-dropdown-header">
                              <span>
                                Filter Options{" "}
                                {tempColumnFilters["dos"] &&
                                  tempColumnFilters["dos"].length > 0 &&
                                  `(${tempColumnFilters["dos"].length} selected)`}
                              </span>
                            </div>
                            <div className="filter-options">
                              {getUniqueColumnValues("dos").map((value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["dos"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter("dos", value)
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ))}
                            </div>
                            <div className="filter-actions-row">
                              <button
                                className="btn-filter-cancel"
                                onClick={cancelColumnFilter}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn-filter-ok"
                                onClick={() => applyColumnFilter("dos")}
                              >
                                OK
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  )}
                  <th>
                    <div className="th-content">
                      Patient ID
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick("patient-id", "patientId")
                        }
                        title="Filter"
                      >
                        {columnFilters["patient-id"] &&
                        columnFilters["patient-id"].length > 0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "patientId" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["patient-id"] &&
                                tempColumnFilters["patient-id"].length > 0 &&
                                `(${tempColumnFilters["patient-id"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues("patient-id").map(
                              (value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["patient-id"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter("patient-id", value)
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ),
                            )}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() => applyColumnFilter("patient-id")}
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      Patient Name
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick("patient-name", "patientName")
                        }
                        title="Filter"
                      >
                        {columnFilters["patient-name"] &&
                        columnFilters["patient-name"].length > 0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "patientName" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["patient-name"] &&
                                tempColumnFilters["patient-name"].length > 0 &&
                                `(${tempColumnFilters["patient-name"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues("patient-name").map(
                              (value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["patient-name"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter("patient-name", value)
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ),
                            )}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() => applyColumnFilter("patient-name")}
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      WO Submit To LC3?
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick(
                            "wo-submit-lc3",
                            "woSubmitLc3",
                          )
                        }
                        title="Filter"
                      >
                        {columnFilters["wo-submit-lc3"] &&
                        columnFilters["wo-submit-lc3"].length > 0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "woSubmitLc3" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["wo-submit-lc3"] &&
                                tempColumnFilters["wo-submit-lc3"].length > 0 &&
                                `(${tempColumnFilters["wo-submit-lc3"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues("wo-submit-lc3").map(
                              (value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["wo-submit-lc3"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter("wo-submit-lc3", value)
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ),
                            )}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() => applyColumnFilter("wo-submit-lc3")}
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      Walkout Status
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick(
                            "walkout-status",
                            "walkoutStatus",
                          )
                        }
                        title="Filter"
                      >
                        {columnFilters["walkout-status"] &&
                        columnFilters["walkout-status"].length > 0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "walkoutStatus" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["walkout-status"] &&
                                tempColumnFilters["walkout-status"].length >
                                  0 &&
                                `(${tempColumnFilters["walkout-status"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues("walkout-status").map(
                              (value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["walkout-status"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter(
                                        "walkout-status",
                                        value,
                                      )
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ),
                            )}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() =>
                                applyColumnFilter("walkout-status")
                              }
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      Pending Checks(LC3)
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick(
                            "pending-checks",
                            "pendingChecks",
                          )
                        }
                        title="Filter"
                      >
                        {columnFilters["pending-checks"] &&
                        columnFilters["pending-checks"].length > 0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "pendingChecks" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["pending-checks"] &&
                                tempColumnFilters["pending-checks"].length >
                                  0 &&
                                `(${tempColumnFilters["pending-checks"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues("pending-checks").map(
                              (value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["pending-checks"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter(
                                        "pending-checks",
                                        value,
                                      )
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ),
                            )}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() =>
                                applyColumnFilter("pending-checks")
                              }
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      On Hold Reasons
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick(
                            "on-hold-reasons",
                            "onHoldReasons",
                          )
                        }
                        title="Filter"
                      >
                        {columnFilters["on-hold-reasons"] &&
                        columnFilters["on-hold-reasons"].length > 0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "onHoldReasons" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["on-hold-reasons"] &&
                                tempColumnFilters["on-hold-reasons"].length >
                                  0 &&
                                `(${tempColumnFilters["on-hold-reasons"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues("on-hold-reasons").map(
                              (value) => (
                                <label key={value} className="filter-option">
                                  <input
                                    type="checkbox"
                                    checked={(
                                      tempColumnFilters["on-hold-reasons"] || []
                                    ).includes(value)}
                                    onChange={() =>
                                      toggleColumnFilter(
                                        "on-hold-reasons",
                                        value,
                                      )
                                    }
                                  />
                                  <span>{value}</span>
                                </label>
                              ),
                            )}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() =>
                                applyColumnFilter("on-hold-reasons")
                              }
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      On-Hold Reasons addressed
                      <button
                        className="filter-btn"
                        onClick={() =>
                          handleFilterButtonClick(
                            "on-hold-reasons-addressed",
                            "onHoldReasonsAddressed",
                          )
                        }
                        title="Filter"
                      >
                        {columnFilters["on-hold-reasons-addressed"] &&
                        columnFilters["on-hold-reasons-addressed"].length >
                          0 ? (
                          <span className="filter-icon-active">▼</span>
                        ) : (
                          <span className="filter-icon">▽</span>
                        )}
                      </button>
                      {showFilterDropdown === "onHoldReasonsAddressed" && (
                        <div className="filter-dropdown">
                          <div className="filter-dropdown-header">
                            <span>
                              Filter Options{" "}
                              {tempColumnFilters["on-hold-reasons-addressed"] &&
                                tempColumnFilters["on-hold-reasons-addressed"]
                                  .length > 0 &&
                                `(${tempColumnFilters["on-hold-reasons-addressed"].length} selected)`}
                            </span>
                          </div>
                          <div className="filter-options">
                            {getUniqueColumnValues(
                              "on-hold-reasons-addressed",
                            ).map((value) => (
                              <label key={value} className="filter-option">
                                <input
                                  type="checkbox"
                                  checked={(
                                    tempColumnFilters[
                                      "on-hold-reasons-addressed"
                                    ] || []
                                  ).includes(value)}
                                  onChange={() =>
                                    toggleColumnFilter(
                                      "on-hold-reasons-addressed",
                                      value,
                                    )
                                  }
                                />
                                <span>{value}</span>
                              </label>
                            ))}
                          </div>
                          <div className="filter-actions-row">
                            <button
                              className="btn-filter-cancel"
                              onClick={cancelColumnFilter}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-filter-ok"
                              onClick={() =>
                                applyColumnFilter("on-hold-reasons-addressed")
                              }
                            >
                              OK
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={isAdminOrSuper ? "10" : "9"}
                      className="text-center"
                    >
                      Loading appointments...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdminOrSuper ? "10" : "9"}
                      className="text-center"
                    >
                      {appointments.length === 0
                        ? filters.officeName
                          ? "No appointments found. Please select date or enter patient ID and click Search."
                          : "Please select an office, date/patient ID and click Search"
                        : "No results match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
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
                      <td>{appt["pending-with"] || "-"}</td>
                      {isAdminOrSuper && (
                        <td>
                          <span className="code-badge">
                            {appt.dos || appt["dos"] || "-"}
                          </span>
                        </td>
                      )}
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
          {!loading && filteredAppointments.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {endIndex} of {effectiveTotal}{" "}
                {hasActiveFilters ? "filtered " : ""}appointments
                {hasActiveFilters && ` (${totalCount} total)`}
                {Object.keys(columnFilters).length > 0 && (
                  <button
                    className="btn-clear-filters"
                    onClick={clearAllColumnFilters}
                    title="Clear all column filters"
                  >
                    🗑️ Clear Filters
                  </button>
                )}
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
