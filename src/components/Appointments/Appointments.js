import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../utils/api";
import Navbar from "../Layout/Navbar";
import Swal from "sweetalert2";
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [allAppointmentsData, setAllAppointmentsData] = useState([]); // All data for client-side filtering
  const [pageBeforeFilter, setPageBeforeFilter] = useState(1); // Track page before applying filter

  // Pagination states
  const [currentPage, setCurrentPage] = useState(() =>
    getStoredData("appointments_page", 1),
  );
  const [limit] = useState(50);
  const [searchType, setSearchType] = useState(() =>
    getStoredData("appointments_searchType", "dateRange"),
  ); // "dateRange" or "patientId"

  const lastFetchParams = useRef(null);

  // Check if user is admin or superAdmin
  const isAdminOrSuper = user?.role === "admin" || user?.role === "superAdmin";

  // Fetch offices
  const fetchOffices = useCallback(async () => {
    try {
      const response = await api.get("/offices");
      if (response.data.success) {
        let activeOffices = response.data.data.filter(
          (office) => office.isActive && office.visibility === "on",
        );

        // Filter offices for Office team and LC3 Team users - show only assigned offices
        const isOfficeTeamUser = user?.teamName?.some(
          (team) => team.teamId?.teamName === "Office",
        );

        const isLC3TeamUser = user?.teamName?.some(
          (team) => team.teamId?.teamName === "LC3 Team",
        );

        if (
          (isOfficeTeamUser || isLC3TeamUser) &&
          user?.assignedOffice?.length > 0
        ) {
          const assignedOfficeIds = user.assignedOffice.map((o) => {
            if (typeof o === "string") return o;
            if (o.officeId?._id) return o.officeId._id.toString();
            if (o._id) return o._id.toString();
            return o.toString();
          });

          activeOffices = activeOffices.filter((office) =>
            assignedOfficeIds.includes(office._id.toString()),
          );
        }

        setOffices(activeOffices);

        // Auto-select if only one office is available
        if (activeOffices.length === 1 && !filters.officeName) {
          setFilters((prev) => ({
            ...prev,
            officeName: activeOffices[0].officeName,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch offices:", err);
    }
  }, [user, filters.officeName]);

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
        )}&skip=${skip}&limit=${limit}`;

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
        const currentParams = { queryParams };
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
    [filters, isAdminOrSuper, showError, currentPage, limit],
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
        )}&patientId=${encodeURIComponent(filters.patientId)}&skip=${skip}&limit=${limit}`;

        // Store current fetch params
        const currentParams = { queryParams };
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
    [filters.officeName, filters.patientId, showError, currentPage, limit],
  );

  // Handle No Show/Cancel button click
  const handleNoShowCancel = async (appointment, e) => {
    e.stopPropagation(); // Prevent row click

    // Show confirmation dialog with appointment details
    const result = await Swal.fire({
      title: "Confirm No Show/Cancel",
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.4;">
          <p style="margin: 6px 0;"><strong>Patient Name:</strong> ${appointment["patient-name"] || "N/A"}</p>
          <p style="margin: 6px 0;"><strong>Patient ID:</strong> ${appointment["patient-id"] || "N/A"}</p>
          <p style="margin: 6px 0;"><strong>Date of Service:</strong> ${appointment.dos || appointment["dos"] || "N/A"}</p>
          <p style="margin-top: 12px; color: #dc2626; font-size: 12px;">Are you sure you want to mark this as No Show/Cancel?</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, mark it!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "swal-compact",
        title: "swal-compact-title",
        htmlContainer: "swal-compact-html",
        confirmButton: "swal-compact-button",
        cancelButton: "swal-compact-button",
      },
      width: "400px",
    });

    // If user cancels, return early
    if (!result.isConfirmed) {
      return;
    }

    try {
      const API_URL =
        process.env.REACT_APP_API_URL || "http://localhost:5000/api";

      const formData = new FormData();
      formData.append("formRefId", appointment._id);
      formData.append("appointmentId", appointment._id);
      formData.append("patientCame", 2); // 2 = No/Cancel
      formData.append("walkoutStatus", "No Show/Cancel");
      formData.append("pendingWith", "No Show/Cancel");

      // Add appointmentInfo (Required)
      formData.append(
        "appointmentInfo",
        JSON.stringify({
          patientId: appointment["patient-id"] || "",
          dateOfService: appointment.dos || appointment["dos"] || "",
          officeName: filters.officeName || "",
        }),
      );

      const response = await fetch(`${API_URL}/walkouts/submit-office`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh appointments list
        if (searchType === "dateRange") {
          await fetchAppointments();
        } else {
          await fetchAppointmentsByPatient();
        }

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Appointment marked as No Show/Cancel successfully!",
          confirmButtonColor: "#10b981",
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Failed to mark as No Show/Cancel",
          confirmButtonColor: "#dc2626",
          timer: 1500,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      console.error("Error marking No Show/Cancel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to mark as No Show/Cancel. Please try again.",
        confirmButtonColor: "#dc2626",
        timer: 1500,
        timerProgressBar: true,
      });
    }
  };

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

  // Fetch data when currentPage changes (server-side pagination)
  // Only triggers on page change, NOT on filter changes
  useEffect(() => {
    // Only fetch if we already have data (means search has been done)
    if (appointments.length > 0 || totalCount > 0) {
      if (searchType === "dateRange") {
        fetchAppointments();
      } else if (searchType === "patientId") {
        fetchAppointmentsByPatient();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Only currentPage - NOT filters!

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

    // Clear previous fetch params to force fresh API call
    lastFetchParams.current = null;

    // Clear old data before fetching new data
    setAppointments([]);
    setTotalCount(0);

    // Reset pagination and filters before search
    setCurrentPage(1);
    setSearchType("dateRange");
    setColumnFilters({});
    setTempColumnFilters({});
    setAllAppointmentsData([]);
    setShowFilterDropdown(null);

    // Save fresh parameters to localStorage
    localStorage.setItem("appointments_page", JSON.stringify(1));
    localStorage.setItem(
      "appointments_searchType",
      JSON.stringify("dateRange"),
    );
    localStorage.setItem("appointments_filters", JSON.stringify(filters));

    // Trigger fresh API call
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

      // Clear previous fetch params to force fresh API call
      lastFetchParams.current = null;

      // Clear old data before fetching new data
      setAppointments([]);
      setTotalCount(0);

      // Reset pagination and filters before search
      setCurrentPage(1);
      setSearchType("patientId");
      setColumnFilters({});
      setTempColumnFilters({});
      setAllAppointmentsData([]);
      setShowFilterDropdown(null);

      // Save fresh parameters to localStorage
      localStorage.setItem("appointments_page", JSON.stringify(1));
      localStorage.setItem(
        "appointments_searchType",
        JSON.stringify("patientId"),
      );
      localStorage.setItem("appointments_filters", JSON.stringify(filters));

      // Trigger fresh API call
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
            let value;

            // Handle nested walkout object properties (same as in main filter logic)
            if (filterKey === "walkout-status") {
              value = appt.walkout?.walkoutStatus;
            } else if (filterKey === "pending-with") {
              value = appt.walkout?.pendingWith;
            } else if (filterKey === "on-hold-reasons") {
              // For array values, check if any selected value is in the array
              if (
                appt.walkout?.onHoldReasons &&
                Array.isArray(appt.walkout.onHoldReasons)
              ) {
                return appt.walkout.onHoldReasons.some((reason) =>
                  selectedValues.includes(reason),
                );
              }
              return false;
            } else if (filterKey === "pending-checks") {
              // For pending checks status
              if (appt.walkout?.pendingChecks) {
                const checks = appt.walkout.pendingChecks;
                const pendingCount = Object.values(checks).filter(
                  (v) => v === 2,
                ).length;
                const completeCount = Object.values(checks).filter(
                  (v) => v === 1,
                ).length;
                if (pendingCount > 0) {
                  value = `${pendingCount} Pending`;
                } else if (completeCount > 0) {
                  value = "Complete";
                }
              }
            } else {
              value = appt[filterKey];
            }

            return selectedValues.includes(value);
          });
        }
      }
    });

    // Extract unique values from filtered data
    const values = new Set();
    filteredData.forEach((appt) => {
      let value;

      // Handle nested walkout object properties
      if (columnKey === "walkout-status") {
        value = appt.walkout?.walkoutStatus;
      } else if (columnKey === "wo-submit-lc3") {
        value = appt.walkout?.isWalkoutSubmittedToLC3;
      } else if (columnKey === "on-hold-reasons") {
        // For array values, add each item separately
        if (
          appt.walkout?.onHoldReasons &&
          Array.isArray(appt.walkout.onHoldReasons)
        ) {
          appt.walkout.onHoldReasons.forEach((reason) => {
            if (reason && reason !== "-") {
              values.add(reason);
            }
          });
          return; // Skip the regular add below
        }
      } else if (columnKey === "pending-checks") {
        // For pending checks, we can show overall status or count
        if (appt.walkout?.pendingChecks) {
          const checks = appt.walkout.pendingChecks;
          const pendingCount = Object.values(checks).filter(
            (v) => v === 2,
          ).length;
          const completeCount = Object.values(checks).filter(
            (v) => v === 1,
          ).length;
          if (pendingCount > 0) {
            value = `${pendingCount} Pending`;
          } else if (completeCount > 0) {
            value = "Complete";
          }
        }
      } else {
        value = appt[columnKey];
      }

      if (value && value !== "-") {
        values.add(value);
      }
    });

    return Array.from(values).sort();
  };

  // Load unique values when filter dropdown opens
  const handleFilterButtonClick = async (columnKey, dropdownId, event) => {
    if (showFilterDropdown === dropdownId) {
      setShowFilterDropdown(null);
    } else {
      setShowFilterDropdown(dropdownId);

      const button = event?.currentTarget || null;

      // Initialize temp filters with current filters
      setTempColumnFilters({ ...columnFilters });

      // Fetch all data if not already loaded (needed for accurate filtering)
      if (allAppointmentsData.length === 0 && filters.officeName) {
        await fetchAllDataForFiltering();
      }

      // Calculate position for dropdown
      if (button) {
        const th = button.closest("th");

        if (th) {
          const thRect = th.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();

          // Position dropdown below the entire header row
          setDropdownPosition({
            top: thRect.bottom + 4,
            left: buttonRect.left,
          });
        }
      }
    }
  };

  const hasActiveFilters = Object.keys(columnFilters).length > 0;

  // Apply column filters to data
  const filteredAppointments = (() => {
    // If no column filters are active, use server-paginated data
    if (!hasActiveFilters) {
      return appointments;
    }

    // If column filters are active, use all data and apply filters client-side
    let filtered =
      allAppointmentsData.length > 0 ? allAppointmentsData : appointments;

    Object.keys(columnFilters).forEach((filterKey) => {
      const selectedValues = columnFilters[filterKey];
      if (selectedValues && selectedValues.length > 0) {
        filtered = filtered.filter((appt) => {
          let value;

          // Handle nested walkout object properties
          if (filterKey === "walkout-status") {
            value = appt.walkout?.walkoutStatus;
          } else if (filterKey === "pending-with") {
            value = appt.walkout?.pendingWith;
          } else if (filterKey === "on-hold-reasons") {
            // For array values, check if any selected value is in the array
            if (
              appt.walkout?.onHoldReasons &&
              Array.isArray(appt.walkout.onHoldReasons)
            ) {
              return appt.walkout.onHoldReasons.some((reason) =>
                selectedValues.includes(reason),
              );
            }
            return false;
          } else if (filterKey === "pending-checks") {
            // For pending checks status
            if (appt.walkout?.pendingChecks) {
              const checks = appt.walkout.pendingChecks;
              const pendingCount = Object.values(checks).filter(
                (v) => v === 2,
              ).length;
              const completeCount = Object.values(checks).filter(
                (v) => v === 1,
              ).length;
              if (pendingCount > 0) {
                value = `${pendingCount} Pending`;
              } else if (completeCount > 0) {
                value = "Complete";
              }
            }
          } else {
            value = appt[filterKey];
          }

          return selectedValues.includes(value);
        });
      }
    });

    return filtered;
  })();

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

  // Render filter dropdown outside table
  const renderFilterDropdown = (columnKey, dropdownId) => {
    if (showFilterDropdown !== dropdownId) return null;

    return (
      <div
        id={dropdownId}
        className="filter-dropdown"
        style={{
          position: "fixed",
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 99999,
        }}
      >
        <div className="filter-dropdown-header">
          <span>
            Filter Options{" "}
            {tempColumnFilters[columnKey] &&
              tempColumnFilters[columnKey].length > 0 &&
              `(${tempColumnFilters[columnKey].length} selected)`}
          </span>
        </div>
        <div className="filter-options">
          {getUniqueColumnValues(columnKey).map((value) => (
            <label key={value} className="filter-option">
              <input
                type="checkbox"
                checked={(tempColumnFilters[columnKey] || []).includes(value)}
                onChange={() => toggleColumnFilter(columnKey, value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
        <div className="filter-actions-row">
          <button className="btn-filter-cancel" onClick={cancelColumnFilter}>
            Cancel
          </button>
          <button
            className="btn-filter-ok"
            onClick={() => applyColumnFilter(columnKey)}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".th-content") &&
        !event.target.closest(".filter-dropdown")
      ) {
        setShowFilterDropdown(null);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showFilterDropdown]);

  // Calculate total pages based on filtered data or server response
  const effectiveTotal = hasActiveFilters
    ? filteredAppointments.length
    : totalCount;
  const totalPages = Math.ceil(effectiveTotal / limit);

  // For client-side filtered data, we need to paginate it manually
  const paginatedFilteredAppointments = hasActiveFilters
    ? filteredAppointments.slice((currentPage - 1) * limit, currentPage * limit)
    : filteredAppointments;

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
                  {offices.length > 1 && (
                    <option value="">Select Office</option>
                  )}
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

              {/* Search and Clear Buttons - Right after date */}
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
            </div>

            {/* Patient ID Search - Extreme Right */}
            <div className="filter-right">
              <div className="filter-group-inline">
                <div className="inline-label-wrapper">
                  <label htmlFor="patientId" className="inline-label">
                    Patient ID
                  </label>
                  <small className="inline-hint">(Press Enter or Tab)</small>
                </div>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={filters.patientId}
                  onChange={handleFilterChange}
                  onKeyDown={handlePatientSearch}
                  placeholder="Enter patient id"
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
                        onClick={(e) =>
                          handleFilterButtonClick("pending-with", "pending", e)
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
                    </div>
                  </th>
                  {isAdminOrSuper && (
                    <th>
                      <div className="th-content">
                        Date of Service
                        <button
                          className="filter-btn"
                          onClick={(e) =>
                            handleFilterButtonClick("dos", "dos", e)
                          }
                          title="Filter"
                        >
                          {columnFilters["dos"] &&
                          columnFilters["dos"].length > 0 ? (
                            <span className="filter-icon-active">▼</span>
                          ) : (
                            <span className="filter-icon">▽</span>
                          )}
                        </button>
                      </div>
                    </th>
                  )}
                  <th>
                    <div className="th-content">
                      Patient ID
                      <button
                        className="filter-btn"
                        onClick={(e) =>
                          handleFilterButtonClick("patient-id", "patientId", e)
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
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      Patient Name
                      <button
                        className="filter-btn"
                        onClick={(e) =>
                          handleFilterButtonClick(
                            "patient-name",
                            "patientName",
                            e,
                          )
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
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      WO Submit To LC3?
                      <button
                        className="filter-btn"
                        onClick={(e) =>
                          handleFilterButtonClick(
                            "wo-submit-lc3",
                            "woSubmitLc3",
                            e,
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
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      Walkout Status
                      <button
                        className="filter-btn"
                        onClick={(e) =>
                          handleFilterButtonClick(
                            "walkout-status",
                            "walkoutStatus",
                            e,
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
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      Pending Checks(LC3)
                      <button
                        className="filter-btn"
                        onClick={(e) =>
                          handleFilterButtonClick(
                            "pending-checks",
                            "pendingChecks",
                            e,
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
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      On Hold Reasons
                      <button
                        className="filter-btn"
                        onClick={(e) =>
                          handleFilterButtonClick(
                            "on-hold-reasons",
                            "onHoldReasons",
                            e,
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
                    </div>
                  </th>
                  <th>
                    <div className="th-content">
                      On-Hold Reasons addressed
                      <button
                        className="filter-btn"
                        onClick={(e) =>
                          handleFilterButtonClick(
                            "on-hold-reasons-addressed",
                            "onHoldReasonsAddressed",
                            e,
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
                ) : paginatedFilteredAppointments.length === 0 ? (
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
                  paginatedFilteredAppointments.map((appt) => (
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
                      <td>{appt.walkout?.pendingWith || "-"}</td>
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
                      <td>{appt.isWalkoutSubmittedToLC3 || "-"}</td>
                      <td>{appt.walkout?.walkoutStatus || "-"}</td>
                      <td>
                        <div className="pending-checks-boxes">
                          <span
                            className={`check-box ${
                              appt.walkout?.pendingChecks?.ruleEngine === 1
                                ? "check-complete"
                                : appt.walkout?.pendingChecks?.ruleEngine === 2
                                  ? "check-pending"
                                  : "check-gray"
                            }`}
                            title="Rule Engine"
                          >
                            A
                          </span>
                          <span
                            className={`check-box ${
                              appt.walkout?.pendingChecks?.documentCheck === 1
                                ? "check-complete"
                                : appt.walkout?.pendingChecks?.documentCheck ===
                                    2
                                  ? "check-pending"
                                  : "check-gray"
                            }`}
                            title="Document Check"
                          >
                            B
                          </span>
                          <span
                            className={`check-box ${
                              appt.walkout?.pendingChecks?.attachmentsCheck ===
                              1
                                ? "check-complete"
                                : appt.walkout?.pendingChecks
                                      ?.attachmentsCheck === 2
                                  ? "check-pending"
                                  : "check-gray"
                            }`}
                            title="Attachments Check"
                          >
                            C
                          </span>
                          <span
                            className={`check-box ${
                              appt.walkout?.pendingChecks
                                ?.patientPortionCheck === 1
                                ? "check-complete"
                                : appt.walkout?.pendingChecks
                                      ?.patientPortionCheck === 2
                                  ? "check-pending"
                                  : "check-gray"
                            }`}
                            title="Patient Portion Check"
                          >
                            D
                          </span>
                          <span
                            className={`check-box ${
                              appt.walkout?.pendingChecks?.productionDetails ===
                              1
                                ? "check-complete"
                                : appt.walkout?.pendingChecks
                                      ?.productionDetails === 2
                                  ? "check-pending"
                                  : "check-gray"
                            }`}
                            title="Production Details"
                          >
                            E
                          </span>
                          <span
                            className={`check-box ${
                              appt.walkout?.pendingChecks?.providerNotes === 1
                                ? "check-complete"
                                : appt.walkout?.pendingChecks?.providerNotes ===
                                    2
                                  ? "check-pending"
                                  : "check-gray"
                            }`}
                            title="Provider Notes"
                          >
                            F
                          </span>
                        </div>
                      </td>
                      <td>
                        {appt.walkout?.onHoldReasons &&
                        appt.walkout.onHoldReasons.length > 0
                          ? appt.walkout.onHoldReasons.join(", ")
                          : "-"}
                      </td>
                      <td>-</td>
                      <td>
                        {appt.walkout?.walkoutStatus ===
                          "Walkout not Submitted to LC3" && (
                          <button
                            className="btn-action-no-show"
                            onClick={(e) => handleNoShowCancel(appt, e)}
                          >
                            No Show/Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading &&
            (hasActiveFilters
              ? filteredAppointments.length > 0
              : totalCount > 0) && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, effectiveTotal)} of{" "}
                  {effectiveTotal} {hasActiveFilters ? "filtered " : ""}
                  appointments
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

        {/* Filter Dropdowns - Rendered outside table for proper positioning */}
        {renderFilterDropdown("pending-with", "pending")}
        {renderFilterDropdown("dos", "dos")}
        {renderFilterDropdown("patient-id", "patientId")}
        {renderFilterDropdown("patient-name", "patientName")}
        {renderFilterDropdown("wo-submit-lc3", "woSubmitLc3")}
        {renderFilterDropdown("walkout-status", "walkoutStatus")}
        {renderFilterDropdown("pending-checks", "pendingChecks")}
        {renderFilterDropdown("on-hold-reasons", "onHoldReasons")}
        {renderFilterDropdown(
          "on-hold-reasons-addressed",
          "onHoldReasonsAddressed",
        )}
      </div>
    </>
  );
};

export default Appointments;
