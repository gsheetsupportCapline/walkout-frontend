import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./WalkoutForm.css";

const WalkoutForm = () => {
  const location = useLocation();
  const { appointment, officeName } = location.state || {};

  // State for collapsible sections
  const [sections, setSections] = useState({
    office: true,
    lc3: true,
    audit: false,
  });

  // State for radio button sets
  const [radioButtonSets, setRadioButtonSets] = useState([]);
  const [dropdownSets, setDropdownSets] = useState([]);
  const [formData, setFormData] = useState({});

  // State for LC3 section
  const [lc3Data, setLc3Data] = useState({
    fieldsetStatus: "pending", // completed or pending
    didLc3RunRules: "",
    ruleEngineUniqueId: "",
    reasonForNotRun: "",
    failedRules: [], // Array of rules fetched from API
    showUpdateButton: false, // Show update button only when textbox has value and changed
    lastFetchedId: "", // Track last fetched ID to hide button after fetch
  });

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

  // Handle LC3 data changes
  const handleLc3Change = (fieldName, value) => {
    if (fieldName === "ruleEngineUniqueId") {
      // Show update button when value changes and is not empty
      setLc3Data((prev) => ({
        ...prev,
        [fieldName]: value,
        showUpdateButton: value.trim() !== "" && value !== prev.lastFetchedId,
      }));
    } else {
      setLc3Data((prev) => ({ ...prev, [fieldName]: value }));
    }
  };

  // Fetch failed rules from Rule Engine API
  const fetchFailedRules = async () => {
    const patientId = appointmentDetails.patientId;
    const uniqueId = lc3Data.ruleEngineUniqueId;
    const office = appointmentDetails.office;

    if (!uniqueId) {
      alert("Please enter Rule Engine Unique ID");
      return;
    }

    console.log("Fetching rules with:", { patientId, uniqueId, office });

    try {
      const response = await fetch(
        `https://caplineruleengine.com/queryrulesstatus?password=&patientId=${patientId}&client=Smilepoint&claimOrTreatmentId=16344&uniqueId=${uniqueId}&office=${office}`
      );
      const result = await response.json();

      console.log("API Response:", result);

      // Parse the response structure: { message, data: [{message, createdDate, messageType}], status }
      if (
        result &&
        result.status === "OK" &&
        result.data &&
        Array.isArray(result.data)
      ) {
        setLc3Data((prev) => ({
          ...prev,
          failedRules: result.data,
          showUpdateButton: false,
          lastFetchedId: uniqueId,
        }));
        if (result.data.length === 0) {
          // Don't show alert, just update state
          console.log("No failed rules found");
        }
      } else {
        setLc3Data((prev) => ({
          ...prev,
          failedRules: [],
          showUpdateButton: false,
          lastFetchedId: uniqueId,
        }));
      }
    } catch (error) {
      console.error("Error fetching failed rules:", error);
      alert("Failed to fetch rules. Please try again.");
    }
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
    <div className="WF-walkout-form-container">
      <div className="WF-walkout-main-content">
        {/* Compact appointment details - readonly text display */}
        <div className="WF-appointment-info-header">
          <div className="WF-info-row">
            <div className="WF-info-item">
              <span className="WF-info-label">Office:</span>
              <span className="WF-info-value">{appointmentDetails.office}</span>
            </div>
            <div className="WF-info-item">
              <span className="WF-info-label">Patient ID:</span>
              <span className="WF-info-value">
                {appointmentDetails.patientId}
              </span>
            </div>
            <div className="WF-info-item">
              <span className="WF-info-label">Doctor 1:</span>
              <span className="WF-info-value">
                {appointmentDetails.doctor1}
              </span>
            </div>
            <div className="WF-info-item">
              <span className="WF-info-label">Doctor 2:</span>
              <span className="WF-info-value">
                {appointmentDetails.doctor2}
              </span>
            </div>
          </div>

          <div className="WF-info-row">
            <div className="WF-info-item">
              <span className="WF-info-label">Date Of Service:</span>
              <span className="WF-info-value">
                {appointmentDetails.dateOfService}
              </span>
            </div>
            <div className="WF-info-item">
              <span className="WF-info-label">Patient Name:</span>
              <span className="WF-info-value">
                {appointmentDetails.patientName}
              </span>
            </div>
            <div className="WF-info-item">
              <span className="WF-info-label">Hygienist 1:</span>
              <span className="WF-info-value">
                {appointmentDetails.hygienist1}
              </span>
            </div>
            <div className="WF-info-item">
              <span className="WF-info-label">Hygienist 2:</span>
              <span className="WF-info-value">
                {appointmentDetails.hygienist2}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible sections */}
        <div className="WF-collapsible-sections">
          {/* Office Section */}
          <div className="WF-section">
            <div
              className="WF-section-header"
              onClick={() => toggleSection("office")}
            >
              <h3>Office Section</h3>
              <span className="WF-toggle-icon">
                {sections.office ? "▼" : "▶"}
              </span>
            </div>
            {sections.office && (
              <div className="WF-section-content">
                <div className="WF-fieldsets-container">
                  {/* Left Fieldset */}
                  <fieldset className="WF-form-fieldset">
                    <legend>Appointment Details</legend>

                    <div className="WF-walkout-form-row">
                      <label className="WF-walkout-form-label">
                        Did patient come to the Appointment?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`WF-radio-button ${
                                btn.name === "No" || btn.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.patientCame === btn.name
                                  ? "WF-selected"
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

                    <div className="WF-walkout-form-row">
                      <label className="WF-walkout-form-label">
                        Is Post op walkout completing with zero production?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`WF-radio-button ${
                                btn.name === "No" || btn.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.postOpZeroProduction === btn.name
                                  ? "WF-selected"
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

                    <div className="WF-walkout-form-row">
                      <label className="WF-walkout-form-label">
                        Patient Type<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
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

                    <div className="WF-walkout-form-row">
                      <label className="WF-walkout-form-label">
                        Does patient have Insurance?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`WF-radio-button ${
                                btn.name === "No" || btn.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.hasInsurance === btn.name
                                  ? "WF-selected"
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

                    <div className="WF-walkout-form-row">
                      <label className="WF-walkout-form-label">
                        Insurance Type
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
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

                    <div className="WF-walkout-form-row">
                      <label className="WF-walkout-form-label">
                        Insurance<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
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

                    <div className="WF-walkout-form-row">
                      <label className="WF-walkout-form-label">
                        Google Review Request?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("69486c7e1166cbe2b2c3c3a8").map(
                          (btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`WF-radio-button ${
                                btn.name === "No" || btn.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.googleReviewRequest === btn.name
                                  ? "WF-selected"
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
                  <fieldset className="WF-form-fieldset">
                    <legend>Patient Portion</legend>

                    {/* First row - 3 number inputs */}
                    <div className="WF-patient-portion-row">
                      <div className="WF-form-group-inline">
                        <label className="WF-form-label">
                          Expected Patient Portion as per Office WO Snip
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          defaultValue="4"
                        />
                      </div>

                      <div className="WF-form-group-inline">
                        <label className="WF-form-label">
                          Patient Portion Collected
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          defaultValue="1"
                        />
                      </div>

                      <div className="WF-form-group-inline">
                        <label className="WF-form-label">
                          Difference in Patient Portion
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          defaultValue="-3"
                          disabled
                        />
                      </div>
                    </div>

                    {/* Second row - Primary Mode */}
                    <div className="WF-patient-portion-row">
                      <div className="WF-form-group-inline">
                        <label className="WF-form-label">
                          Patient Portion Primary Mode
                        </label>
                        <select className="WF-form-select">
                          <option value="Personal Check">Personal Check</option>
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Debit Card">Debit Card</option>
                        </select>
                      </div>

                      <div className="WF-form-group-inline">
                        <label className="WF-form-label">
                          Amount Collected Using Primary Mode
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          defaultValue="3"
                        />
                      </div>
                    </div>

                    {/* Third row - Secondary Mode */}
                    <div className="WF-patient-portion-row">
                      <div className="WF-form-group-inline">
                        <label className="WF-form-label">
                          Patient Portion Secondary Mode
                        </label>
                        <select className="WF-form-select">
                          <option value="Debit Card">Debit Card</option>
                          <option value="Personal Check">Personal Check</option>
                          <option value="Cash">Cash</option>
                          <option value="Credit Card">Credit Card</option>
                        </select>
                      </div>

                      <div className="WF-form-group-inline">
                        <label className="WF-form-label">
                          Amount Collected Using Secondary Mode
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          defaultValue="1"
                        />
                      </div>
                    </div>

                    <div className="WF-form-group">
                      <label className="WF-form-label">
                        Enter the last four digits of the uploaded check in
                        Forte (Primary)
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input type="text" className="WF-form-input" />
                    </div>

                    <div className="WF-form-group">
                      <label className="WF-form-label">
                        Reason Office Collected less Patient Portion than
                        Expected?<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select className="WF-form-select">
                        <option value="">Select</option>
                        <option value="Patient refused">Patient refused</option>
                        <option value="Payment plan">Payment plan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </fieldset>

                  {/* Rule Engine Check Fieldset */}
                  <fieldset className="WF-form-fieldset WF-rule-engine-fieldset">
                    <legend>Rule Engine Check</legend>

                    {/* Row 1: Did Office run + Reason dropdown */}
                    <div className="WF-rule-engine-row">
                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          Did Office run the Rules Engine?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div className="WF-button-group">
                          {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.ruleEngineRun === btn.name
                                    ? "WF-selected"
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

                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          Reason for Rules Engine not run
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className="WF-walkout-form-select"
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
                    <div className="WF-rule-engine-row">
                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          If Yes, Was any error found?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div className="WF-button-group">
                          {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.ruleEngineError === btn.name
                                    ? "WF-selected"
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

                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          Enter Remarks explaining the changes made to fix the
                          Error<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="WF-walkout-form-input"
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
                    <div className="WF-rule-engine-row">
                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          Were all the Issues fixed?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div className="WF-button-group">
                          {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.issuesFixed === btn.name
                                    ? "WF-selected"
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
                  <fieldset className="WF-form-fieldset WF-confirmation-fieldset">
                    <legend>
                      Confirmation from office about necessary info available in
                      Eaglesoft.
                    </legend>

                    <div className="WF-checkbox-grid">
                      {/* Column 1 */}
                      <div className="WF-checkbox-column">
                        <label className="WF-checkbox-label">
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
                        <label className="WF-checkbox-label">
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
                        <label className="WF-checkbox-label">
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
                      <div className="WF-checkbox-column">
                        <label className="WF-checkbox-label">
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
                        <label className="WF-checkbox-label">
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
                        <label className="WF-checkbox-label">
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
                      <div className="WF-checkbox-column">
                        <label className="WF-checkbox-label">
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
                        <label className="WF-checkbox-label">
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
                        <label className="WF-checkbox-label">
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
                      <div className="WF-checkbox-column">
                        <label className="WF-checkbox-label">
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
                        <label className="WF-checkbox-label">
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
          <div className="WF-section">
            <div
              className="WF-section-header"
              onClick={() => toggleSection("lc3")}
            >
              <h3>LC3 Section</h3>
              <span className="WF-toggle-icon">{sections.lc3 ? "▼" : "▶"}</span>
            </div>
            {sections.lc3 && (
              <div className="WF-section-content">
                <fieldset className="WF-form-fieldset WF-lc3-rule-engine-fieldset">
                  <div className="WF-fieldset-header-row">
                    <legend>A. Rule Engine Check</legend>
                    <div className="WF-status-toggle">
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3FieldsetStatus"
                          value="completed"
                          checked={lc3Data.fieldsetStatus === "completed"}
                          onChange={(e) =>
                            handleLc3Change("fieldsetStatus", e.target.value)
                          }
                        />
                        <span className="WF-status-text WF-completed">
                          Completed
                        </span>
                      </label>
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3FieldsetStatus"
                          value="pending"
                          checked={lc3Data.fieldsetStatus === "pending"}
                          onChange={(e) =>
                            handleLc3Change("fieldsetStatus", e.target.value)
                          }
                        />
                        <span className="WF-status-text WF-pending">
                          Pending
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* First Question with conditional right side elements */}
                  <div className="WF-lc3-main-question-row">
                    {/* Left side - Main question */}
                    <div className="WF-lc3-question-left">
                      <label className="WF-walkout-form-label">
                        1. Did LC3 run the Rules Engine?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {(() => {
                          const buttons = getRadioButtons(
                            "6948272c1166cbe2b2c332e0"
                          );
                          console.log("LC3 Radio Buttons:", buttons);
                          console.log(
                            "All Radio Button Sets:",
                            radioButtonSets
                          );
                          return buttons.map((button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                lc3Data.didLc3RunRules === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleLc3Change("didLc3RunRules", button.name)
                              }
                            >
                              {button.name}
                            </button>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Right side - Conditional elements */}
                    <div className="WF-lc3-question-right">
                      {lc3Data.didLc3RunRules === "Yes" && (
                        <div className="WF-rule-unique-id-group">
                          <label className="WF-form-label">
                            Rule Engine Unique ID
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div className="WF-unique-id-input-row">
                            <input
                              type="text"
                              className="WF-form-input"
                              value={lc3Data.ruleEngineUniqueId}
                              onChange={(e) =>
                                handleLc3Change(
                                  "ruleEngineUniqueId",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Unique ID"
                            />
                            {lc3Data.showUpdateButton && (
                              <button
                                type="button"
                                className="WF-update-button"
                                onClick={fetchFailedRules}
                              >
                                Update
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {lc3Data.didLc3RunRules === "No" && (
                        <div className="WF-reason-not-run-group">
                          <label className="WF-form-label">
                            Reason for Rules Engine not run
                          </label>
                          <select
                            className="WF-walkout-form-select"
                            value={lc3Data.reasonForNotRun}
                            onChange={(e) =>
                              handleLc3Change("reasonForNotRun", e.target.value)
                            }
                          >
                            <option value="">Select reason</option>
                            {/* Dropdown options will be added once API ID is provided */}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Failed Rules Section - Only show when Yes is selected and API has been called */}
                  {lc3Data.didLc3RunRules === "Yes" &&
                    lc3Data.lastFetchedId && (
                      <div className="WF-failed-rules-section">
                        {lc3Data.failedRules.length === 0 ? (
                          <p className="WF-no-failed-rules-message">
                            None of the rules failed by the engine!
                          </p>
                        ) : (
                          <>
                            <h4 className="WF-failed-rules-header">
                              Have the failed rules listed below been addressed
                              and resolved?
                            </h4>
                            <div className="WF-failed-rules-list">
                              {lc3Data.failedRules.map((rule, index) => (
                                <div key={index} className="WF-rule-item">
                                  <span className="WF-rule-number">
                                    {index + 1}.
                                  </span>
                                  <span
                                    className="WF-rule-text"
                                    dangerouslySetInnerHTML={{
                                      __html: rule.message,
                                    }}
                                  />
                                  <div className="WF-button-group">
                                    {getRadioButtons(
                                      "6948272c1166cbe2b2c332e0"
                                    ).map((button) => (
                                      <button
                                        key={button._id}
                                        type="button"
                                        className={`WF-radio-button ${
                                          button.name === "No" ||
                                          button.name === "Pending"
                                            ? "WF-no-or-pending-button"
                                            : ""
                                        } ${
                                          formData[`failedRule${index}`] ===
                                          button.name
                                            ? "WF-selected"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          handleRadioChange(
                                            `failedRule${index}`,
                                            button.name
                                          )
                                        }
                                      >
                                        {button.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                </fieldset>

                {/* B. Document Check Fieldset */}
                <fieldset className="WF-form-fieldset WF-lc3-document-check-fieldset">
                  <div className="WF-fieldset-header-row">
                    <legend>
                      B. Document Check{" "}
                      <span className="WF-fieldset-subtitle">
                        (Attachment and Service Based Guidelines)
                      </span>
                    </legend>
                    <div className="WF-status-toggle">
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3DocumentCheckStatus"
                          value="completed"
                          checked={
                            formData.lc3DocumentCheckStatus === "completed"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3DocumentCheckStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-completed">
                          Completed
                        </span>
                      </label>
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3DocumentCheckStatus"
                          value="pending"
                          checked={
                            formData.lc3DocumentCheckStatus === "pending"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3DocumentCheckStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-pending">
                          Pending
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="WF-document-check-grid">
                    {/* Row 1 */}
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Signed Treatment Plan Available
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.signedTreatmentPlanAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "signedTreatmentPlanAvailable",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        PRC Available<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.prcAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange("prcAvailable", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Signed Consent - General Available
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.signedConsentGeneralAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "signedConsentGeneralAvailable",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        NVD Available<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.nvdAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange("nvdAvailable", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    {/* Row 2 */}
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Narrative Available
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.narrativeAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "narrativeAvailable",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Signed Consent Tx. Available
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.signedConsentTxAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "signedConsentTxAvailable",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Pre Auth Available
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.preAuthAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "preAuthAvailable",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Route Sheet Available
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.routeSheetAvailable || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "routeSheetAvailable",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    {/* Row 3 - Ortho Questionnaire */}
                    <div className="form-group-compact ortho-question">
                      <label className="WF-form-label-compact">
                        Does the Ortho Questionnaire form available?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948270d1166cbe2b2c332bb").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.orthoQuestionnaireAvailable ===
                                button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "orthoQuestionnaireAvailable",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* C. Attachments Check Fieldset */}
                <fieldset className="WF-form-fieldset WF-lc3-attachments-check-fieldset">
                  <div className="WF-fieldset-header-row">
                    <legend>
                      C. Attachments Check{" "}
                      <span className="WF-fieldset-subtitle">
                        (Attachment and Service Based Guidelines)
                      </span>
                    </legend>
                    <div className="WF-status-toggle">
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3AttachmentsCheckStatus"
                          value="completed"
                          checked={
                            formData.lc3AttachmentsCheckStatus === "completed"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3AttachmentsCheckStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-completed">
                          Completed
                        </span>
                      </label>
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3AttachmentsCheckStatus"
                          value="pending"
                          checked={
                            formData.lc3AttachmentsCheckStatus === "pending"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3AttachmentsCheckStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-pending">
                          Pending
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="WF-attachments-check-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Pano<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.pano || ""}
                        onChange={(e) =>
                          handleDropdownChange("pano", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        FMX<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.fmx || ""}
                        onChange={(e) =>
                          handleDropdownChange("fmx", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Bitewing<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.bitewing || ""}
                        onChange={(e) =>
                          handleDropdownChange("bitewing", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        PA<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.pa || ""}
                        onChange={(e) =>
                          handleDropdownChange("pa", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Perio Chart<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.perioChart || ""}
                        onChange={(e) =>
                          handleDropdownChange("perioChart", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* D. Patient Portion Check Fieldset */}
                <fieldset className="WF-form-fieldset WF-lc3-patient-portion-fieldset">
                  <div className="WF-fieldset-header-row">
                    <legend>D. Patient Portion Check</legend>
                    <div className="WF-status-toggle">
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3PatientPortionStatus"
                          value="completed"
                          checked={
                            formData.lc3PatientPortionStatus === "completed"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3PatientPortionStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-completed">
                          Completed
                        </span>
                      </label>
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3PatientPortionStatus"
                          value="pending"
                          checked={
                            formData.lc3PatientPortionStatus === "pending"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3PatientPortionStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-pending">
                          Pending
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Patient Portion Calculations and Collection by Office */}
                  <div className="WF-section-subheader">
                    Patient Portion (PP) Calculations and Collection by Office
                  </div>

                  <div className="WF-pp-office-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Expected PP per Office
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.expectedPPOffice || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "expectedPPOffice",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        PP Collected by Office (per Eaglesoft)
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.ppCollectedOffice || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "ppCollectedOffice",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Difference
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.ppDifferenceOffice || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "ppDifferenceOffice",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="WF-nvd-question-row">
                    <label className="WF-form-label-compact">
                      Is there a signed NVD for the Difference?
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <div className="WF-button-group">
                      {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                        (button) => (
                          <button
                            key={button._id}
                            type="button"
                            className={`WF-radio-button ${
                              button.name === "No" || button.name === "Pending"
                                ? "WF-no-or-pending-button"
                                : ""
                            } ${
                              formData.signedNVDForDifference === button.name
                                ? "WF-selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleRadioChange(
                                "signedNVDForDifference",
                                button.name
                              )
                            }
                          >
                            {button.name}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Patient Portion Calculations by LC3 */}
                  <div className="WF-section-subheader">
                    Patient Portion Calculations by LC3
                  </div>

                  <div className="WF-pp-lc3-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Expected PP per LC3
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.expectedPPLC3 || ""}
                        onChange={(e) =>
                          handleDropdownChange("expectedPPLC3", e.target.value)
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Difference in Expected PP [LC3 vs. Office]
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.ppDifferenceLC3 || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "ppDifferenceLC3",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Verification of Patient Portion Payment */}
                  <div className="WF-section-subheader">
                    Verification of Patient Portion Payment
                  </div>

                  <div className="WF-payment-verification-grid">
                    {/* Row 1 */}
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Pat. Portion Primary Mode
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.ppPrimaryMode || ""}
                        onChange={(e) =>
                          handleDropdownChange("ppPrimaryMode", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Amount Collected Using Primary Mode
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.amountPrimaryMode || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "amountPrimaryMode",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Payment verified from
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.paymentVerifiedFromPrimary || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "paymentVerifiedFromPrimary",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    {/* Row 2 */}
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Pat. Portion Secondary Mode
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.ppSecondaryMode || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "ppSecondaryMode",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Amount Collected Using Secondary Mode
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.amountSecondaryMode || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "amountSecondaryMode",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Payment verified from
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.paymentVerifiedFromSecondary || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "paymentVerifiedFromSecondary",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>
                  </div>

                  {/* Bottom Questions */}
                  <div className="WF-payment-questions">
                    <div className="WF-payment-question-row">
                      <label className="WF-form-label-compact">
                        Did you verify if the attached check matches the payment
                        posted in ES?<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.verifyCheckMatchesES === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "verifyCheckMatchesES",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-payment-question-row">
                      <label className="WF-form-label-compact">
                        Do we have the uploaded Forte check available in SD, and
                        does the entered ref# by the office match?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.forteCheckAvailable === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "forteCheckAvailable",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* E. Production Details and Walkout Submission/Hold */}
                <fieldset className="WF-form-fieldset WF-lc3-production-fieldset">
                  <div className="WF-fieldset-header-row">
                    <legend>
                      E. Production Details and Walkout Submission/Hold
                    </legend>
                    <div className="WF-status-toggle">
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3ProductionStatus"
                          value="completed"
                          checked={formData.lc3ProductionStatus === "completed"}
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3ProductionStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-completed">
                          Completed
                        </span>
                      </label>
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3ProductionStatus"
                          value="pending"
                          checked={formData.lc3ProductionStatus === "pending"}
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3ProductionStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-pending">
                          Pending
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Production Calculations per Office Walkout */}
                  <div className="WF-section-subheader">
                    Production Calculations per Office Walkout
                  </div>

                  <div className="WF-production-office-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Total Production (Office)
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.totalProductionOffice || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "totalProductionOffice",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Est. Insurance (Office)
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.estInsuranceOffice || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "estInsuranceOffice",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Expected PP (Office)
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.expectedPPOfficeProduction || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "expectedPPOfficeProduction",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Production Calculations per LC3 Walkout */}
                  <div className="WF-section-subheader">
                    Production Calculations per LC3 Walkout
                  </div>

                  <div className="WF-production-lc3-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Total Production (LC3)
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.totalProductionLC3 || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "totalProductionLC3",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Est. Insurance (LC3)
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.estInsuranceLC3 || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "estInsuranceLC3",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Expected PP (LC3)
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.expectedPPLC3Production || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "expectedPPLC3Production",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Difference between LC3 and Office Production */}
                  <div className="WF-section-subheader">
                    Difference between LC3 and Office Production [LC3 - Office]
                  </div>

                  <div className="WF-production-difference-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Total Production Difference
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.totalProductionDifference || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "totalProductionDifference",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Est Insurance Difference
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.estInsuranceDifference || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "estInsuranceDifference",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Expected PP Difference
                      </label>
                      <input
                        type="number"
                        className="WF-form-input"
                        value={formData.expectedPPDifference || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "expectedPPDifference",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="WF-production-reason-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Reason for Difference in Total Production
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.reasonTotalProductionDiff || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "reasonTotalProductionDiff",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Reason for Difference in Est Insurance
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.reasonEstInsuranceDiff || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "reasonEstInsuranceDiff",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>
                  </div>

                  <div className="WF-production-explanation-grid">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Explanation of reason for Difference in Total Production
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="WF-form-input"
                        value={formData.explanationTotalProductionDiff || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "explanationTotalProductionDiff",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Explanation of reason for Difference in Est Insurance
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="WF-form-input"
                        value={formData.explanationEstInsuranceDiff || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "explanationEstInsuranceDiff",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Walkout Questions */}
                  <div className="WF-walkout-questions">
                    <div className="WF-walkout-question-row">
                      <label className="WF-form-label-compact">
                        Have we informed office manager on HQ for changes made
                        in the walkout?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.informedOfficeManager === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "informedOfficeManager",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-walkout-question-row">
                      <label className="WF-form-label-compact">
                        Has the request for a Google review been sent?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("69486c7e1166cbe2b2c3c3a8").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.googleReviewSent === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "googleReviewSent",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-walkout-question-row">
                      <label className="WF-form-label-compact">
                        Does walkout contains Crown/Denture/Implant with
                        Prep/Imp?<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.containsCrownDentureImplant ===
                                button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "containsCrownDentureImplant",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-walkout-question-row">
                      <label className="WF-form-label-compact">
                        As per IV crown paid on -{" "}
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948270d1166cbe2b2c332bb").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.crownPaidOn === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange("crownPaidOn", button.name)
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-walkout-question-row">
                      <label className="WF-form-label-compact">
                        Does crown/Denture/Implants delivered as per provider
                        notes?<span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.deliveredAsPerNotes === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "deliveredAsPerNotes",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-walkout-question-row">
                      <label className="WF-form-label-compact">
                        Is Walkout getting on Hold?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.walkoutOnHold === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange("walkoutOnHold", button.name)
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="form-group-compact full-width">
                      <label className="WF-form-label-compact">
                        On Hold Reasons
                      </label>
                      <select
                        className="WF-walkout-form-select"
                        value={formData.onHoldReasons || ""}
                        onChange={(e) =>
                          handleDropdownChange("onHoldReasons", e.target.value)
                        }
                      >
                        <option value="">
                          Type here for search or select from list.
                        </option>
                        {/* Dropdown options will be added */}
                      </select>
                    </div>

                    <div className="form-group-compact full-width">
                      <label className="WF-form-label-compact">
                        Other Reason/Notes
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="WF-form-input"
                        value={formData.otherReasonNotes || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "otherReasonNotes",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Final Question */}
                  <div className="WF-final-question-row">
                    <label className="WF-form-label-compact">
                      Is walkout completing with deficiency?
                      <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <div className="WF-button-group">
                      {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                        (button) => (
                          <button
                            key={button._id}
                            type="button"
                            className={`WF-radio-button ${
                              button.name === "No" || button.name === "Pending"
                                ? "WF-no-or-pending-button"
                                : ""
                            } ${
                              formData.completingWithDeficiency === button.name
                                ? "WF-selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleRadioChange(
                                "completingWithDeficiency",
                                button.name
                              )
                            }
                          >
                            {button.name}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* F. Copy "Provider's Note" from Eaglesoft and Paste below */}
                <fieldset className="WF-form-fieldset WF-lc3-provider-notes-fieldset">
                  <div className="WF-fieldset-header-row">
                    <legend>
                      F. Copy "Provider's Note" from Eaglesoft and Paste below
                    </legend>
                    <div className="WF-status-toggle">
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3ProviderNotesStatus"
                          value="completed"
                          checked={
                            formData.lc3ProviderNotesStatus === "completed"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3ProviderNotesStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-completed">
                          Completed
                        </span>
                      </label>
                      <label className="WF-status-label">
                        <input
                          type="radio"
                          name="lc3ProviderNotesStatus"
                          value="pending"
                          checked={
                            formData.lc3ProviderNotesStatus === "pending"
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "lc3ProviderNotesStatus",
                              e.target.value
                            )
                          }
                        />
                        <span className="WF-status-text WF-pending">
                          Pending
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="WF-provider-notes-questions">
                    <div className="WF-provider-note-question-row">
                      <label className="WF-form-label-compact">
                        1. Doctor note completed?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.doctorNoteCompleted === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "doctorNoteCompleted",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-provider-note-question-row">
                      <label className="WF-form-label-compact">
                        2. Does the notes updated on DOS?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.notesUpdatedOnDOS === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "notesUpdatedOnDOS",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-provider-note-question-row">
                      <label className="WF-form-label-compact">
                        3. Does the Note include following 4 things?
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <div className="WF-button-group">
                        {getRadioButtons("6948272c1166cbe2b2c332e0").map(
                          (button) => (
                            <button
                              key={button._id}
                              type="button"
                              className={`WF-radio-button ${
                                button.name === "No" ||
                                button.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.noteIncludesFourThings === button.name
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "noteIncludesFourThings",
                                  button.name
                                )
                              }
                            >
                              {button.name}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div className="WF-note-checklist">
                      <div className="WF-checklist-item">
                        <span className="WF-checklist-label">
                          a. Procedure Name
                        </span>
                        <span className="WF-checklist-icon">❌</span>
                      </div>
                      <div className="WF-checklist-item">
                        <span className="WF-checklist-label">
                          b. Tooth#/Quads/Arch and Surface (if applicable)
                        </span>
                        <span className="WF-checklist-icon">❌</span>
                      </div>
                      <div className="WF-checklist-item">
                        <span className="WF-checklist-label">
                          c. Provider Name
                        </span>
                        <span className="WF-checklist-icon">❌</span>
                      </div>
                      <div className="WF-checklist-item">
                        <span className="WF-checklist-label">
                          d. Hygienist Name
                        </span>
                        <span className="WF-checklist-icon">❌</span>
                      </div>
                    </div>
                  </div>

                  <div className="WF-notes-textarea-section">
                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Provider's note from ES
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        className="WF-notes-textarea"
                        placeholder="Paste the provider's notes here."
                        rows="6"
                        value={formData.providerNotesFromES || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "providerNotesFromES",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="WF-form-group-compact">
                      <label className="WF-form-label-compact">
                        Hygienist's note from ES
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        className="WF-notes-textarea"
                        placeholder="Paste the provider's notes here."
                        rows="6"
                        value={formData.hygienistNotesFromES || ""}
                        onChange={(e) =>
                          handleDropdownChange(
                            "hygienistNotesFromES",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="WF-check-ai-button-container">
                    <button
                      type="button"
                      className="WF-check-ai-button"
                      onClick={() => {
                        // AI check functionality will be added
                        console.log("Check with AI clicked");
                      }}
                    >
                      Check with AI*
                    </button>
                  </div>
                </fieldset>

                {/* On Hold Details & Notes */}
                <fieldset className="WF-form-fieldset WF-lc3-onhold-notes-fieldset">
                  <legend>On Hold Details & Notes (1)</legend>

                  {/* Existing Notes Display */}
                  <div className="WF-onhold-notes-list">
                    <div className="WF-onhold-note-item">
                      <div className="WF-note-datetime">
                        2025-12-22 17:49:45
                      </div>
                      <div className="WF-note-author">Soransh Sharma</div>
                      <div className="WF-note-content">WO completed.</div>
                    </div>
                  </div>

                  {/* Add New Note */}
                  <div className="WF-add-note-section">
                    <textarea
                      className="WF-add-note-textarea"
                      placeholder="Add new note here."
                      rows="4"
                      value={formData.newOnHoldNote || ""}
                      onChange={(e) =>
                        handleDropdownChange("newOnHoldNote", e.target.value)
                      }
                    />
                  </div>
                </fieldset>
              </div>
            )}
          </div>

          {/* Audit Section */}
          <div className="WF-section">
            <div
              className="WF-section-header"
              onClick={() => toggleSection("audit")}
            >
              <h3>Audit Section</h3>
              <span className="WF-toggle-icon">
                {sections.audit ? "▼" : "▶"}
              </span>
            </div>
            {sections.audit && (
              <div className="WF-section-content">
                <p>Audit section content will go here...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed sidebar */}
      <div className="WF-walkout-sidebar">
        <h3>Walkout Information</h3>
        <div className="WF-sidebar-content">
          <p>Sidebar details will go here...</p>
        </div>
      </div>
    </div>
  );
};

export default WalkoutForm;
