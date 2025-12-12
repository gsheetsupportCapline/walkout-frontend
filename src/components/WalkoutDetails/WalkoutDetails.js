import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./WalkoutDetails.css";

const WalkoutDetails = () => {
  const location = useLocation();
  const { appointment, officeName } = location.state || {};

  // State for collapsible sections
  const [sections, setSections] = useState({
    office: true,
    lc3: false,
    audit: false,
  });

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Extract data from appointment object
  const appointmentDetails = {
    office: officeName || "N/A",
    doctor1: appointment?.["doctor-1"] || "N/A",
    doctor2: appointment?.["doctor-2"] || "N/A",
    doctor3: appointment?.["doctor-3"] || "N/A",
    hygienist1: appointment?.["hygienist-1"] || "N/A",
    hygienist2: appointment?.["hygienist-2"] || "N/A",
    hygienist3: appointment?.["hygienist-3"] || "N/A",
    patientId: appointment?.["patient-id"] || "N/A",
    patientName: appointment?.["patient-name"] || "N/A",
    dateOfService:
      appointment?.["date-of-service"] || appointment?.date || "N/A",
  };

  return (
    <div className="walkout-details-container">
      <div className="walkout-main-content">
        {/* Non-editable appointment details */}
        <div className="appointment-details-section">
          <h2>Appointment Details</h2>

          <div className="details-row">
            <div className="detail-item">
              <label>Office:</label>
              <span>{appointmentDetails.office}</span>
            </div>
            <div className="detail-item">
              <label>Doctor 1:</label>
              <span>{appointmentDetails.doctor1}</span>
            </div>
            <div className="detail-item">
              <label>Doctor 2:</label>
              <span>{appointmentDetails.doctor2}</span>
            </div>
            <div className="detail-item">
              <label>Doctor 3:</label>
              <span>{appointmentDetails.doctor3}</span>
            </div>
            <div className="detail-item">
              <label>Hygienist 1:</label>
              <span>{appointmentDetails.hygienist1}</span>
            </div>
          </div>

          <div className="details-row">
            <div className="detail-item">
              <label>Hygienist 2:</label>
              <span>{appointmentDetails.hygienist2}</span>
            </div>
            <div className="detail-item">
              <label>Hygienist 3:</label>
              <span>{appointmentDetails.hygienist3}</span>
            </div>
            <div className="detail-item">
              <label>Patient ID:</label>
              <span>{appointmentDetails.patientId}</span>
            </div>
            <div className="detail-item">
              <label>Patient Name:</label>
              <span>{appointmentDetails.patientName}</span>
            </div>
            <div className="detail-item">
              <label>Date Of Service:</label>
              <span>{appointmentDetails.dateOfService}</span>
            </div>
          </div>
        </div>

        {/* Collapsible sections */}
        <div className="collapsible-sections">
          {/* Office Section */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection("office")}
            >
              <h3>Office Section</h3>
              <span className="toggle-icon">{sections.office ? "▼" : "▶"}</span>
            </div>
            {sections.office && (
              <div className="section-content">
                <p>Office section content will go here...</p>
              </div>
            )}
          </div>

          {/* LC3 Section */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection("lc3")}
            >
              <h3>LC3 Section</h3>
              <span className="toggle-icon">{sections.lc3 ? "▼" : "▶"}</span>
            </div>
            {sections.lc3 && (
              <div className="section-content">
                <p>LC3 section content will go here...</p>
              </div>
            )}
          </div>

          {/* Audit Section */}
          <div className="section">
            <div
              className="section-header"
              onClick={() => toggleSection("audit")}
            >
              <h3>Audit Section</h3>
              <span className="toggle-icon">{sections.audit ? "▼" : "▶"}</span>
            </div>
            {sections.audit && (
              <div className="section-content">
                <p>Audit section content will go here...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed sidebar */}
      <div className="walkout-sidebar">
        <h3>Walkout Information</h3>
        <div className="sidebar-content">
          <p>Sidebar details will go here...</p>
        </div>
      </div>
    </div>
  );
};

export default WalkoutDetails;
