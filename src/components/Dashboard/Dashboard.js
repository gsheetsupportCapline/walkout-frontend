import React, { useState } from "react";
import Navbar from "../Layout/Navbar";
import "./Dashboard.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Get month-to-date default dates
const getMonthToDate = () => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return { startDate: firstDayOfMonth, endDate: today };
};

const Dashboard = () => {
  const [selectedDashboard, setSelectedDashboard] = useState("walkout-status");
  const monthToDate = getMonthToDate();
  const [dateRange, setDateRange] = useState([
    monthToDate.startDate,
    monthToDate.endDate,
  ]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = useState({
    patientType: "All",
  });

  // Dummy data for Walkout Status Dashboard
  const summaryCards = [
    { label: "Completed", count: 403, color: "#10b981" },
    { label: "Pending with LC3", count: 171, color: "#3b82f6" },
    { label: "Pending with Office", count: 356, color: "#f59e0b" },
  ];

  const tableData = [
    {
      region: "Houston - East",
      office: "Crosby",
      completed: 6,
      pendingWithLC3: 5,
      pendingSinceLC3: "2026-01-27",
      pendingWithOffice: 30,
      pendingSinceOffice: "2026-01-27",
      totalProdOffice: "$330",
      totalProdLC3: "$330",
      difference: "$0",
    },
    {
      region: "Houston - East",
      office: "Splendora",
      completed: 12,
      pendingWithLC3: 7,
      pendingSinceLC3: "2026-01-27",
      pendingWithOffice: 11,
      pendingSinceOffice: "2026-01-27",
      totalProdOffice: "$1,767",
      totalProdLC3: "$1,695",
      difference: "$72",
    },
    {
      region: "Houston - East",
      office: "Beaumont",
      completed: 29,
      pendingWithLC3: 0,
      pendingSinceLC3: "-",
      pendingWithOffice: 35,
      pendingSinceOffice: "2026-01-27",
      totalProdOffice: "$13,942",
      totalProdLC3: "$13,510",
      difference: "$432",
    },
    {
      region: "Houston - East",
      office: "Jasper",
      completed: 26,
      pendingWithLC3: 2,
      pendingSinceLC3: "2026-01-28",
      pendingWithOffice: 50,
      pendingSinceOffice: "2026-01-27",
      totalProdOffice: "$7,354",
      totalProdLC3: "$7,310",
      difference: "$44",
    },
  ];

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Fetching data with filters:", filters);
    // API call will be added later
  };

  return (
    <>
      <Navbar />
      <div className="wsd-dashboard-container">
        {/* Sidebar */}
        <div className="wsd-sidebar">
          <div className="wsd-sidebar-section">
            <h3 className="wsd-sidebar-title">Office Dashboards</h3>
            <button
              className={`wsd-sidebar-item ${selectedDashboard === "walkout-status" ? "wsd-active" : ""}`}
              onClick={() => setSelectedDashboard("walkout-status")}
            >
              Walkout Status Dashboard
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="wsd-content">
          {selectedDashboard === "walkout-status" && (
            <>
              {/* Filters and Summary Cards */}
              <div className="wsd-header">
                <div className="wsd-filters">
                  <div className="wsd-filter-group">
                    <label>Date Range</label>
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                      }}
                      dateFormat="MMM d, yyyy"
                      className="wsd-datepicker"
                      placeholderText="Select date range"
                    />
                  </div>
                  <div className="wsd-filter-group">
                    <label>Patient Type</label>
                    <select
                      name="patientType"
                      value={filters.patientType}
                      onChange={handleFilterChange}
                    >
                      <option value="All">All</option>
                      <option value="New">New</option>
                      <option value="Existing">Existing</option>
                    </select>
                  </div>
                  <button className="wsd-btn-submit" onClick={handleSubmit}>
                    Submit
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="wsd-summary-cards">
                  {summaryCards.map((card, index) => (
                    <div key={index} className="wsd-summary-card">
                      <div className="wsd-card-count">{card.count}</div>
                      <div className="wsd-card-label">{card.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="wsd-table-container">
                <table className="wsd-table">
                  <thead>
                    <tr>
                      <th>Region</th>
                      <th>Office</th>
                      <th>Completed</th>
                      <th>Pending With LC3</th>
                      <th>Pending Since LC3</th>
                      <th>Pending With Office</th>
                      <th>Pending Since Office</th>
                      <th>Total Production (Office)</th>
                      <th>Total Production (LC3)</th>
                      <th>Difference (Office-LC3)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.region}</td>
                        <td>{row.office}</td>
                        <td>{row.completed}</td>
                        <td>{row.pendingWithLC3}</td>
                        <td>{row.pendingSinceLC3}</td>
                        <td>{row.pendingWithOffice}</td>
                        <td>{row.pendingSinceOffice}</td>
                        <td>{row.totalProdOffice}</td>
                        <td>{row.totalProdLC3}</td>
                        <td>{row.difference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {selectedDashboard !== "walkout-status" && (
            <div className="wsd-placeholder">
              <h2>Dashboard Coming Soon</h2>
              <p>This dashboard will be implemented later.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
