import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./WalkoutForm.css";

const WalkoutForm = () => {
  const location = useLocation();
  const { appointment, officeName } = location.state || {};

  // State for collapsible sections
  const [sections, setSections] = useState({
    office: true,
    lc3: false,
    audit: false,
  });

  // State for radio button sets
  const [radioButtonSets, setRadioButtonSets] = useState([]);
  const [dropdownSets, setDropdownSets] = useState([]);
  const [formData, setFormData] = useState({});

  // Fetch radio button sets
  useEffect(() => {
    const fetchRadioButtonSets = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/radio-buttons/button-sets?isActive=true`
        );
        const result = await response.json();
        if (result.success) {
          setRadioButtonSets(result.data);
        }
      } catch (error) {
        console.error("Error fetching radio button sets:", error);
      }
    };
    fetchRadioButtonSets();
  }, []);

  // Fetch dropdown sets
  useEffect(() => {
    const fetchDropdownSets = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/dropdowns/dropdown-sets?isActive=true`
        );
        const result = await response.json();
        if (result.success) {
          setDropdownSets(result.data);
        }
      } catch (error) {
        console.error("Error fetching dropdown sets:", error);
      }
    };
    fetchDropdownSets();
  }, []);

  // Helper function to get radio buttons by set ID
  const getRadioButtons = (setId) => {
    const set = radioButtonSets.find((s) => s._id === setId);
    return set?.buttons.filter((btn) => btn.isActive && btn.visibility) || [];
  };

  // Helper function to get dropdown options by set ID
  const getDropdownOptions = (setId) => {
    const set = dropdownSets.find((s) => s._id === setId);
    return set?.options.filter((opt) => opt.isActive && opt.visibility) || [];
  };

  // Handle radio button selection
  const handleRadioChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Handle dropdown selection
  const handleDropdownChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

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
    dateOfService: appointment?.dos || "N/A",
  };

  return (
    <div className="walkout-form-container">
      <div className="walkout-main-content">
        {/* Compact appointment details - readonly text display */}
        <div className="appointment-info-header">
          <div className="info-row">
            <div className="info-item">
              <span className="info-label">Office:</span>
              <span className="info-value">{appointmentDetails.office}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Patient ID:</span>
              <span className="info-value">{appointmentDetails.patientId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Doctor 1:</span>
              <span className="info-value">{appointmentDetails.doctor1}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Doctor 2:</span>
              <span className="info-value">{appointmentDetails.doctor2}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Doctor 3:</span>
              <span className="info-value">{appointmentDetails.doctor3}</span>
            </div>
          </div>

          <div className="info-row">
            <div className="info-item">
              <span className="info-label">Date Of Service:</span>
              <span className="info-value">
                {appointmentDetails.dateOfService}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Patient Name:</span>
              <span className="info-value">
                {appointmentDetails.patientName}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Hygienist 1:</span>
              <span className="info-value">
                {appointmentDetails.hygienist1}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Hygienist 2:</span>
              <span className="info-value">
                {appointmentDetails.hygienist2}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Hygienist 3:</span>
              <span className="info-value">
                {appointmentDetails.hygienist3}
              </span>
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
                <div className="fieldsets-container">
                  {/* Left Fieldset */}
                  <fieldset className="form-fieldset">
                    <legend>Appointment Details</legend>

                    <div className="walkout-form-row">
                      <label className="walkout-form-label">
                        Did patient come to the Appointment?*
                      </label>
                      <div className="button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`btn-option ${
                                formData.patientCame === btn.name
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange("patientCame", btn.name)
                              }
                            >
                              {btn.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="walkout-form-row">
                      <label className="walkout-form-label">
                        Is Post op walkout completing with zero production?*
                      </label>
                      <div className="button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`btn-option ${
                                formData.postOpZeroProduction === btn.name
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "postOpZeroProduction",
                                  btn.name
                                )
                              }
                            >
                              {btn.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="walkout-form-row">
                      <label className="walkout-form-label">
                        Patient Type*
                      </label>
                      <select
                        className="walkout-form-select"
                        value={formData.patientType || ""}
                        onChange={(e) =>
                          handleDropdownChange("patientType", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {getDropdownOptions("69486b4a1166cbe2b2c3c2ae").map(
                          (opt) => (
                            <option key={opt._id} value={opt.name}>
                              {opt.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="walkout-form-row">
                      <label className="walkout-form-label">
                        Does patient have Insurance?*
                      </label>
                      <div className="button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`btn-option ${
                                formData.hasInsurance === btn.name
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange("hasInsurance", btn.name)
                              }
                            >
                              {btn.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="walkout-form-row">
                      <label className="walkout-form-label">
                        Insurance Type*
                      </label>
                      <select
                        className="walkout-form-select"
                        value={formData.insuranceType || ""}
                        onChange={(e) =>
                          handleDropdownChange("insuranceType", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {getDropdownOptions("69486b8e1166cbe2b2c3c2db").map(
                          (opt) => (
                            <option key={opt._id} value={opt.name}>
                              {opt.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="walkout-form-row">
                      <label className="walkout-form-label">Insurance*</label>
                      <select
                        className="walkout-form-select"
                        value={formData.insurance || ""}
                        onChange={(e) =>
                          handleDropdownChange("insurance", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {getDropdownOptions("69486c1f1166cbe2b2c3c356").map(
                          (opt) => (
                            <option key={opt._id} value={opt.name}>
                              {opt.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="walkout-form-row">
                      <label className="walkout-form-label">
                        Google Review Request?*
                      </label>
                      <div className="button-group">
                        {getRadioButtons("69486c7e1166cbe2b2c3c3a8").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`btn-option ${
                                formData.googleReviewRequest === btn.name
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "googleReviewRequest",
                                  btn.name
                                )
                              }
                            >
                              {btn.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </fieldset>

                  {/* Right Fieldset */}
                  <fieldset className="form-fieldset">
                    <legend>Patient Portion</legend>

                    {/* First row - 3 number inputs */}
                    <div className="patient-portion-row">
                      <div className="form-group-inline">
                        <label className="form-label">
                          Expected Patient Portion as per Office WO Snip*
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          defaultValue="4"
                        />
                      </div>

                      <div className="form-group-inline">
                        <label className="form-label">
                          Patient Portion Collected
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          defaultValue="1"
                        />
                      </div>

                      <div className="form-group-inline">
                        <label className="form-label">
                          Difference in Patient Portion
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          defaultValue="-3"
                          disabled
                        />
                      </div>
                    </div>

                    {/* Second row - Primary Mode */}
                    <div className="patient-portion-row">
                      <div className="form-group-inline">
                        <label className="form-label">
                          Patient Portion Primary Mode
                        </label>
                        <select className="form-select">
                          <option value="Personal Check">Personal Check</option>
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                        </select>
                      </div>

                      <div className="form-group-inline">
                        <label className="form-label">
                          Amount Collected Using Primary Mode*
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          defaultValue="3"
                        />
                      </div>
                    </div>

                    {/* Third row - Secondary Mode */}
                    <div className="patient-portion-row">
                      <div className="form-group-inline">
                        <label className="form-label">
                          Patient Portion Secondary Mode
                        </label>
                        <select className="form-select">
                          <option value="Debit Card">Debit Card</option>
                          <option value="Personal Check">Personal Check</option>
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                        </select>
                      </div>

                      <div className="form-group-inline">
                        <label className="form-label">
                          Amount Collected Using Secondary Mode*
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          defaultValue="1"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Enter the last four digits of the uploaded check in
                        Forte (Primary)*
                      </label>
                      <input type="text" className="form-input" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Reason Office Collected less Patient Portion than
                        Expected?*
                      </label>
                      <select className="form-select">
                        <option value="">Select</option>
                        <option value="Patient refused">Patient refused</option>
                        <option value="Payment plan">Payment plan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </fieldset>

                  {/* Rule Engine Check Fieldset */}
                  <fieldset className="form-fieldset rule-engine-fieldset">
                    <legend>Rule Engine Check</legend>

                    {/* Row 1: Did Office run + Reason dropdown */}
                    <div className="rule-engine-row">
                      <div className="walkout-form-row">
                        <label className="walkout-form-label">
                          Did Office run the Rules Engine?*
                        </label>
                        <div className="button-group">
                          {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`btn-option ${
                                  formData.ruleEngineRun === btn.name
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange("ruleEngineRun", btn.name)
                                }
                              >
                                {btn.name}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="walkout-form-row">
                        <label className="walkout-form-label">
                          Reason for Rules Engine not run*
                        </label>
                        <select
                          className="walkout-form-select"
                          value={formData.ruleEngineNotRunReason || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "ruleEngineNotRunReason",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Was error found + Remarks textbox */}
                    <div className="rule-engine-row">
                      <div className="walkout-form-row">
                        <label className="walkout-form-label">
                          If Yes, Was any error found?*
                        </label>
                        <div className="button-group">
                          {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`btn-option ${
                                  formData.ruleEngineError === btn.name
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange("ruleEngineError", btn.name)
                                }
                              >
                                {btn.name}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="walkout-form-row">
                        <label className="walkout-form-label">
                          Enter Remarks explaining the changes made to fix the
                          Error*
                        </label>
                        <input
                          type="text"
                          className="walkout-form-input"
                          value={formData.errorFixRemarks || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "errorFixRemarks",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Row 3: Were all issues fixed (single question) */}
                    <div className="rule-engine-row">
                      <div className="walkout-form-row">
                        <label className="walkout-form-label">
                          Were all the Issues fixed?*
                        </label>
                        <div className="button-group">
                          {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`btn-option ${
                                  formData.issuesFixed === btn.name
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange("issuesFixed", btn.name)
                                }
                              >
                                {btn.name}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* Confirmation Fieldset */}
                  <fieldset className="form-fieldset confirmation-fieldset">
                    <legend>
                      Confirmation from office about necessary info available in
                      Eaglesoft.
                    </legend>

                    <div className="checkbox-grid">
                      {/* Column 1 */}
                      <div className="checkbox-column">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.signedGeneralConsent || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "signedGeneralConsent",
                                e.target.checked
                              )
                            }
                          />
                          <span>Signed General Consent*</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.signedTreatmentConsent || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "signedTreatmentConsent",
                                e.target.checked
                              )
                            }
                          />
                          <span>Signed Treatment Consent</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.preAuthAvailable || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "preAuthAvailable",
                                e.target.checked
                              )
                            }
                          />
                          <span>Pre Auth Available</span>
                        </label>
                      </div>

                      {/* Column 2 */}
                      <div className="checkbox-column">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.signedTxPlan || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "signedTxPlan",
                                e.target.checked
                              )
                            }
                          />
                          <span>Signed TX Plan*</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.perioChart || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "perioChart",
                                e.target.checked
                              )
                            }
                          />
                          <span>Perio Chart (D4342/D4342)</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.nvd || false}
                            onChange={(e) =>
                              handleDropdownChange("nvd", e.target.checked)
                            }
                          />
                          <span>NVD</span>
                        </label>
                      </div>

                      {/* Column 3 */}
                      <div className="checkbox-column">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.xRayPanoAttached || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "xRayPanoAttached",
                                e.target.checked
                              )
                            }
                          />
                          <span>X-Ray/Pano Attached*</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.majorServiceForm || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "majorServiceForm",
                                e.target.checked
                              )
                            }
                          />
                          <span>Major Service Form</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.routeSheet || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "routeSheet",
                                e.target.checked
                              )
                            }
                          />
                          <span>Route Sheet*</span>
                        </label>
                      </div>

                      {/* Column 4 */}
                      <div className="checkbox-column">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.prcUpdatedInRouteSheet || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "prcUpdatedInRouteSheet",
                                e.target.checked
                              )
                            }
                          />
                          <span>PRC updated in route sheet*</span>
                        </label>
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.narrative || false}
                            onChange={(e) =>
                              handleDropdownChange(
                                "narrative",
                                e.target.checked
                              )
                            }
                          />
                          <span>Narrative</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
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

export default WalkoutForm;
