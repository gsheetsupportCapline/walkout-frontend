import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./WalkoutForm.css";

const WalkoutForm = () => {
  const location = useLocation();
  const { appointment, officeName } = location.state || {};

  // ===========================================
  // UNIQUE FIELD IDs FOR DROPDOWN & RADIO BUTTON MAPPING
  // These IDs MUST match with RadioButtonSetManagement and DropdownSetManagement
  // ===========================================
  const FIELD_IDS = {
    // === OFFICE SECTION - DROPDOWNS (7) ===
    PATIENT_TYPE: "WFDRP_OFFICE_PATIENT_TYPE",
    INSURANCE_TYPE: "WFDRP_OFFICE_INSURANCE_TYPE",
    INSURANCE: "WFDRP_OFFICE_INSURANCE",
    PATIENT_PORTION_PRIMARY_MODE: "WFDRP_OFFICE_PP_PRIMARY_MODE",
    PATIENT_PORTION_SECONDARY_MODE: "WFDRP_OFFICE_PP_SECONDARY_MODE",
    REASON_LESS_COLLECTION: "WFDRP_OFFICE_REASON_LESS_COLLECTION",
    RULE_ENGINE_NOT_RUN_REASON: "WFDRP_OFFICE_RULE_ENGINE_NOT_RUN",

    // === OFFICE SECTION - RADIO BUTTONS (7) ===
    PATIENT_CAME: "WFRAD_OFFICE_PATIENT_CAME",
    POST_OP_ZERO: "WFRAD_OFFICE_POST_OP_ZERO",
    HAS_INSURANCE: "WFRAD_OFFICE_HAS_INSURANCE",
    GOOGLE_REVIEW_REQUEST: "WFRAD_OFFICE_GOOGLE_REVIEW",
    RULE_ENGINE_RUN: "WFRAD_OFFICE_RULE_ENGINE_RUN",
    RULE_ENGINE_ERROR_FOUND: "WFRAD_OFFICE_RULE_ENGINE_ERROR",
    ISSUES_FIXED: "WFRAD_OFFICE_ISSUES_FIXED",

    // === LC3 SECTION - DROPDOWNS (21) ===
    LC3_REASON_NOT_RUN: "WFDRP_LC3_REASON_NOT_RUN",
    LC3_SIGNED_TREATMENT_PLAN: "WFDRP_LC3_SIGNED_TREATMENT_PLAN",
    LC3_PRC_AVAILABLE: "WFDRP_LC3_PRC_AVAILABLE",
    LC3_SIGNED_CONSENT_GENERAL: "WFDRP_LC3_SIGNED_CONSENT_GENERAL",
    LC3_NVD_AVAILABLE: "WFDRP_LC3_NVD_AVAILABLE",
    LC3_NARRATIVE_AVAILABLE: "WFDRP_LC3_NARRATIVE_AVAILABLE",
    LC3_SIGNED_CONSENT_TX: "WFDRP_LC3_SIGNED_CONSENT_TX",
    LC3_PRE_AUTH: "WFDRP_LC3_PRE_AUTH",
    LC3_ROUTE_SHEET: "WFDRP_LC3_ROUTE_SHEET",
    LC3_PANO: "WFDRP_LC3_PANO",
    LC3_FMX: "WFDRP_LC3_FMX",
    LC3_BITEWING: "WFDRP_LC3_BITEWING",
    LC3_PA: "WFDRP_LC3_PA",
    LC3_PERIO_CHART: "WFDRP_LC3_PERIO_CHART",
    LC3_PP_PRIMARY_MODE: "WFDRP_LC3_PP_PRIMARY_MODE",
    LC3_PAYMENT_VERIFIED_PRIMARY: "WFDRP_LC3_PAYMENT_VERIFIED_PRIMARY",
    LC3_PP_SECONDARY_MODE: "WFDRP_LC3_PP_SECONDARY_MODE",
    LC3_PAYMENT_VERIFIED_SECONDARY: "WFDRP_LC3_PAYMENT_VERIFIED_SECONDARY",
    LC3_REASON_PROD_DIFF: "WFDRP_LC3_REASON_PROD_DIFF",
    LC3_REASON_INS_DIFF: "WFDRP_LC3_REASON_INS_DIFF",
    LC3_ONHOLD_REASONS: "WFDRP_LC3_ONHOLD_REASONS",

    // === LC3 SECTION - RADIO BUTTONS (22) ===
    LC3_RULE_ENGINE_STATUS: "WFRAD_LC3_RULE_ENGINE_STATUS",
    LC3_RUN_RULES: "WFRAD_LC3_RUN_RULES",
    LC3_FAILED_RULES_RESOLVED: "WFRAD_LC3_FAILED_RULES_RESOLVED",
    LC3_DOC_CHECK_STATUS: "WFRAD_LC3_DOC_CHECK_STATUS",
    LC3_ORTHO_QUESTIONNAIRE: "WFRAD_LC3_ORTHO_QUESTIONNAIRE",
    LC3_ATTACH_CHECK_STATUS: "WFRAD_LC3_ATTACH_CHECK_STATUS",
    LC3_PP_CHECK_STATUS: "WFRAD_LC3_PP_CHECK_STATUS",
    LC3_SIGNED_NVD_DIFF: "WFRAD_LC3_SIGNED_NVD_DIFF",
    LC3_VERIFY_CHECK_ES: "WFRAD_LC3_VERIFY_CHECK_ES",
    LC3_FORTE_CHECK: "WFRAD_LC3_FORTE_CHECK",
    LC3_PROD_STATUS: "WFRAD_LC3_PROD_STATUS",
    LC3_INFORMED_OFFICE: "WFRAD_LC3_INFORMED_OFFICE",
    LC3_GOOGLE_REVIEW_SENT: "WFRAD_LC3_GOOGLE_REVIEW_SENT",
    LC3_CONTAINS_CROWN: "WFRAD_LC3_CONTAINS_CROWN",
    LC3_CROWN_PAID_ON: "WFRAD_LC3_CROWN_PAID_ON",
    LC3_DELIVERED_PER_NOTES: "WFRAD_LC3_DELIVERED_PER_NOTES",
    LC3_WALKOUT_ON_HOLD: "WFRAD_LC3_WALKOUT_ON_HOLD",
    LC3_COMPLETING_DEFICIENCY: "WFRAD_LC3_COMPLETING_DEFICIENCY",
    LC3_PROVIDER_NOTES_STATUS: "WFRAD_LC3_PROVIDER_NOTES_STATUS",
    LC3_DOCTOR_NOTE_COMPLETED: "WFRAD_LC3_DOCTOR_NOTE_COMPLETED",
    LC3_NOTES_UPDATED_DOS: "WFRAD_LC3_NOTES_UPDATED_DOS",
    LC3_NOTE_INCLUDES_FOUR: "WFRAD_LC3_NOTE_INCLUDES_FOUR",

    // === AUDIT SECTION - RADIO BUTTONS (2) ===
    AUDIT_DISCREPANCY_FOUND: "WFRAD_AUDIT_DISCREPANCY_FOUND",
    AUDIT_DISCREPANCY_FIXED: "WFRAD_AUDIT_DISCREPANCY_FIXED",
  };

  // State for collapsible sections
  const [sections, setSections] = useState({
    office: true, // Open by default
    lc3: false,
    audit: false,
  });

  // Walkout state management
  const [walkoutId, setWalkoutId] = useState(null);
  const [appointmentId] = useState(appointment?._id || null);
  const [openTime] = useState(new Date().toISOString());
  const [isExistingWalkout, setIsExistingWalkout] = useState(false);

  // State for radio button sets
  const [radioButtonSets, setRadioButtonSets] = useState([]);
  const [dropdownSets, setDropdownSets] = useState([]);
  const [formData, setFormData] = useState({});

  // State for field ID to set ID mapping
  const [fieldToSetMapping, setFieldToSetMapping] = useState({});

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

  // State for sidebar - Timer, Status, Images
  const [sidebarData, setSidebarData] = useState({
    timer: {
      currentSession: {
        isActive: false,
        startTime: "",
        elapsedSeconds: 0,
      },
      lastSession: {
        user: "",
        duration: 0,
        completedAt: "",
      },
      totalTime: 0,
      sessionHistory: [],
    },
    walkoutStatus: "pending", // completed, office-pending, lc3-pending
    images: {
      officeWO: { imageId: "", zoom: 100 },
      checkImage: { imageId: "", zoom: 100 },
      lc3WO: { imageId: "", zoom: 100 },
    },
  });

  const [timerInterval, setTimerInterval] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Will hold user data with teamName array
  const LC3_TEAM_ID = "692b62d7671d81750966a63c";
  const [imageModal, setImageModal] = useState({ isOpen: false, type: null }); // Modal for adding image
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    type: null,
  }); // Modal for preview
  const [onHoldReasons] = useState([
    "Missing Documentation",
    "Pending Provider Approval",
    "Insurance Verification Required",
  ]); // Sample on-hold reasons - replace with actual data

  // Check if current user is LC3 team member
  const isLC3TeamMember = () => {
    return (
      currentUser &&
      currentUser.teamName &&
      Array.isArray(currentUser.teamName) &&
      currentUser.teamName.includes(LC3_TEAM_ID) &&
      currentUser.role === "user"
    );
  };

  // Submission details - dummy data
  const [submissionDetails] = useState({
    submitToLC3Office: "2025-12-22 17:02:26",
    lastUpdateByLC3: "Saransh Sharma",
    lastUpdateOnLC3: "2025-12-22 17:49:45",
    completedByLC3: "Saransh Sharma",
    completedOnLC3: "2025-12-22 17:49:45",
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

          // Create mapping from field IDs to set IDs based on usedIn field
          const mapping = {};
          result.data.forEach((set) => {
            if (set.usedIn && set.usedIn.length > 0) {
              // Each set can have a field ID in its usedIn array
              set.usedIn.forEach((fieldId) => {
                // Check for duplicate mappings
                if (mapping[fieldId]) {
                  console.warn(
                    `⚠️ Duplicate field ID mapping detected: ${fieldId}`,
                    `\nPreviously mapped to set: ${mapping[fieldId]}`,
                    `\nNow being mapped to: ${set._id}`,
                    `\nSet name: ${set.name}`
                  );
                }
                mapping[fieldId] = set._id;
              });
            }
          });

          console.log("🔵 Radio Button Sets Loaded:", result.data.length);
          console.log("🔵 Radio Field Mappings Created:", mapping);

          // Update the mapping state
          setFieldToSetMapping((prev) => ({ ...prev, ...mapping }));
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

          // Create mapping from field IDs to set IDs based on usedIn field
          const mapping = {};
          result.data.forEach((set) => {
            if (set.usedIn && set.usedIn.length > 0) {
              // Each set can have a field ID in its usedIn array
              set.usedIn.forEach((fieldId) => {
                // Check for duplicate mappings
                if (mapping[fieldId]) {
                  console.warn(
                    `⚠️ Duplicate field ID mapping detected: ${fieldId}`,
                    `\nPreviously mapped to set: ${mapping[fieldId]}`,
                    `\nNow being mapped to: ${set._id}`,
                    `\nSet name: ${set.name}`
                  );
                }
                mapping[fieldId] = set._id;
              });
            }
          });

          console.log("🟢 Dropdown Sets Loaded:", result.data.length);
          console.log("🟢 Dropdown Field Mappings Created:", mapping);

          // Update the mapping state
          setFieldToSetMapping((prev) => ({ ...prev, ...mapping }));
        }
      } catch (error) {
        console.error("Error fetching dropdown sets:", error);
      }
    };
    fetchDropdownSets();
  }, []);

  // Check for existing walkout on form open
  useEffect(() => {
    const checkExistingWalkout = async () => {
      if (!appointmentId) return;

      try {
        const API = "http://localhost:5000/api";
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API}/walkouts?appointmentId=${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          const existingWalkout = result.data[0];
          setWalkoutId(existingWalkout._id);
          setIsExistingWalkout(true);

          // Load office section data
          if (existingWalkout.officeSection) {
            setFormData(existingWalkout.officeSection);
          }

          console.log("✅ Existing walkout loaded:", existingWalkout._id);
        }
      } catch (error) {
        console.error("Error checking existing walkout:", error);
      }
    };

    checkExistingWalkout();
  }, [appointmentId]);

  // Log field to set mapping when it updates (for debugging)
  useEffect(() => {
    if (Object.keys(fieldToSetMapping).length > 0) {
      console.log("Field ID to Set ID Mapping:", fieldToSetMapping);
    }
  }, [fieldToSetMapping]);

  // Helper function to get radio buttons by set ID or field ID
  const getRadioButtons = (identifier) => {
    // First check if identifier is a field ID and get the mapped set ID
    const setId = fieldToSetMapping[identifier] || identifier;

    // Debug log to see the mapping
    if (identifier !== setId) {
      console.log(`Radio: Mapped ${identifier} → ${setId}`);
    }

    // Find the set by ID
    const set = radioButtonSets.find((s) => s._id === setId);
    return set?.buttons.filter((btn) => btn.isActive && btn.visibility) || [];
  };

  // Helper function to get dropdown options by set ID or field ID
  const getDropdownOptions = (identifier) => {
    // First check if identifier is a field ID and get the mapped set ID
    const setId = fieldToSetMapping[identifier] || identifier;

    // Debug log to see the mapping
    if (identifier !== setId) {
      console.log(`Dropdown: Mapped ${identifier} → ${setId}`);
    }

    // Find the set by ID
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

  // Timer functions - Only for LC3 Team
  useEffect(() => {
    // Start timer automatically if user is from LC3 Team and timer not already active
    if (isLC3TeamMember() && !sidebarData.timer.currentSession.isActive) {
      const startTime = new Date().toISOString();

      const interval = setInterval(() => {
        setSidebarData((prev) => ({
          ...prev,
          timer: {
            ...prev.timer,
            currentSession: {
              ...prev.timer.currentSession,
              elapsedSeconds: prev.timer.currentSession.elapsedSeconds + 1,
            },
          },
        }));
      }, 1000);

      setTimerInterval(interval);
      setSidebarData((prev) => ({
        ...prev,
        timer: {
          ...prev.timer,
          currentSession: {
            isActive: true,
            startTime: startTime,
            elapsedSeconds: 0,
          },
        },
      }));

      // Cleanup on unmount
      return () => {
        clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Auto-focus paste area when image modal opens
  useEffect(() => {
    if (imageModal.isOpen) {
      const pasteArea = document.querySelector(".WF-paste-area");
      if (pasteArea) {
        pasteArea.focus();
      }
    }
  }, [imageModal.isOpen]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Image upload functions - Backend handles upload, returns imageId
  const handleImageUpload = async (type, file) => {
    if (file && file.type.startsWith("image/")) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", type);

        // TODO: Replace with actual API endpoint
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/upload-image`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (data.imageId) {
          setSidebarData((prev) => ({
            ...prev,
            images: {
              ...prev.images,
              [type]: { imageId: data.imageId, zoom: 100 },
            },
          }));
          alert("Image uploaded successfully!");
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
      }
    }
  };

  const handlePasteImage = async (type, event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        await handleImageUpload(type, file);
        break;
      }
    }
  };

  const handleZoomChange = (type, delta) => {
    setSidebarData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [type]: {
          ...prev.images[type],
          zoom: Math.max(50, Math.min(200, prev.images[type].zoom + delta)),
        },
      },
    }));
  };

  const handleRemoveImage = async (type) => {
    const imageId = sidebarData.images[type].imageId;

    if (imageId) {
      try {
        // TODO: Optional - Delete from Google Drive if needed
        // await fetch(`${process.env.REACT_APP_API_URL}/delete-image/${imageId}`, { method: 'DELETE' });

        setSidebarData((prev) => ({
          ...prev,
          images: {
            ...prev.images,
            [type]: { imageId: "", zoom: 100 },
          },
        }));
        alert("Image removed successfully!");
      } catch (error) {
        console.error("Image removal failed:", error);
        alert("Failed to remove image.");
      }
    }
  };

  // Generate image URL from imageId (Google Drive)
  const getImageUrl = (imageId) => {
    if (!imageId) return null;
    // TODO: Replace with actual Google Drive URL format
    return `https://drive.google.com/uc?id=${imageId}`;
  };

  const handleImageClick = (type, event) => {
    event.stopPropagation(); // Prevent closing preview
    event.preventDefault();
    // Left click - zoom in
    handleZoomChange(type, 10);
  };

  const handleImageRightClick = (type, event) => {
    event.stopPropagation(); // Prevent closing preview
    event.preventDefault();
    // Right click - zoom out
    handleZoomChange(type, -10);
  };

  // Handle form submission
  const handleOfficeSubmit = async () => {
    try {
      const API = "http://localhost:5000/api";
      const token = localStorage.getItem("token");

      // Prepare payload
      const payload = {
        appointmentId,
        openTime,
        officeSection: formData,
      };

      let response;
      if (isExistingWalkout && walkoutId) {
        // Update existing walkout
        response = await fetch(`${API}/walkouts/${walkoutId}/office`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new walkout
        response = await fetch(`${API}/walkouts/submit-office`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (response.ok) {
        alert("Office section submitted successfully!");

        // Save walkoutId after first submit
        if (!isExistingWalkout && result.data._id) {
          setWalkoutId(result.data._id);
          setIsExistingWalkout(true);
          localStorage.setItem(`walkout_${appointmentId}`, result.data._id);
        }
      } else {
        alert(`Error: ${result.message || "Failed to submit"}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Network error. Please check your connection.");
    }
  };

  const handleLC3Submit = async () => {
    // Stop timer and save session for LC3 team
    if (isLC3TeamMember() && sidebarData.timer.currentSession.isActive) {
      clearInterval(timerInterval);

      const sessionDuration = sidebarData.timer.currentSession.elapsedSeconds;
      const completedAt = new Date().toISOString();
      const userName = currentUser.name || currentUser.email || "Unknown User";

      // Create session record
      const sessionRecord = {
        user: userName,
        duration: sessionDuration,
        completedAt: completedAt,
        startTime: sidebarData.timer.currentSession.startTime,
      };

      // Calculate new total time
      const newTotalTime = sidebarData.timer.totalTime + sessionDuration;

      // Update sidebar with session info
      setSidebarData((prev) => ({
        ...prev,
        timer: {
          currentSession: {
            isActive: false,
            startTime: "",
            elapsedSeconds: 0,
          },
          lastSession: {
            user: userName,
            duration: sessionDuration,
            completedAt: completedAt,
          },
          totalTime: newTotalTime,
          sessionHistory: [...prev.timer.sessionHistory, sessionRecord],
        },
      }));

      // Prepare data to send to backend
      const submitData = {
        formData,
        lc3Data,
        sidebarData: {
          ...sidebarData,
          timer: {
            lastSession: {
              user: userName,
              duration: sessionDuration,
              completedAt: completedAt,
            },
            totalTime: newTotalTime,
            sessionHistory: [
              ...sidebarData.timer.sessionHistory,
              sessionRecord,
            ],
          },
        },
      };

      console.log("LC3 Section Data with Timer:", submitData);
      alert("LC3 section submitted successfully! Timer session saved.");
      // TODO: API call to save LC3 section data with timer info
    } else {
      console.log("LC3 Section Data:", { formData, lc3Data });
      alert("LC3 section submitted successfully!");
      // TODO: API call to save LC3 section data
    }
  };

  const handleAuditSubmit = () => {
    console.log("Audit Section Data:", formData);
    alert("Audit section submitted successfully!");
    // TODO: API call to save audit section data
  };

  // Render compact image buttons
  const renderImageButtons = (type, label) => {
    const imageData = sidebarData.images[type];
    const hasImage = imageData.imageId !== "";

    return (
      <div className="WF-image-button-group">
        <button
          className="WF-image-btn"
          onClick={() => setImageModal({ isOpen: true, type })}
        >
          <span className="WF-image-btn-icon">📁</span>
          {hasImage ? "Change Image" : "Add Image"}
          {hasImage && <span className="WF-image-indicator">✓</span>}
        </button>
        <button
          className="WF-image-btn WF-preview-btn"
          onClick={() => setPreviewModal({ isOpen: true, type })}
          disabled={!hasImage}
        >
          <span className="WF-image-btn-icon">👁️</span>
          Preview
        </button>
      </div>
    );
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
      {/* Compact appointment details - Sticky at top */}
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
            <span className="WF-info-value">{appointmentDetails.doctor1}</span>
          </div>
          <div className="WF-info-item">
            <span className="WF-info-label">Doctor 2:</span>
            <span className="WF-info-value">{appointmentDetails.doctor2}</span>
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

      {/* Content with Sidebar Wrapper */}
      <div className="WF-content-with-sidebar">
        <div className="WF-walkout-main-content">
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
                  {sections.office ? "−" : "+"}
                </span>
              </div>
              {sections.office && (
                <div className="WF-section-content">
                  <div className="WF-fieldsets-container">
                    {/* Left Fieldset */}
                    <fieldset className="WF-form-fieldset">
                      <div className="WF-fieldset-header-row">
                        <legend className="WF-legend">
                          Appointment Details
                        </legend>
                      </div>

                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          Did patient come to the Appointment?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.PATIENT_CAME}
                        >
                          {getRadioButtons(FIELD_IDS.PATIENT_CAME).map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.patientCame === btn.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "patientCame",
                                    btn.incrementalId
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
                          Is Post op walkout completing with zero production?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.POST_OP_ZERO}
                        >
                          {getRadioButtons(FIELD_IDS.POST_OP_ZERO).map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.postOpZeroProduction ===
                                  btn.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "postOpZeroProduction",
                                    btn.incrementalId
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
                          Patient Type
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className="WF-walkout-form-select"
                          data-field-id={FIELD_IDS.PATIENT_TYPE}
                          value={formData.patientType || ""}
                          onChange={(e) =>
                            handleDropdownChange("patientType", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.PATIENT_TYPE).map(
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.HAS_INSURANCE}
                        >
                          {getRadioButtons(FIELD_IDS.HAS_INSURANCE).map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.hasInsurance === btn.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "hasInsurance",
                                    btn.incrementalId
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
                          Insurance Type
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className="WF-walkout-form-select"
                          data-field-id={FIELD_IDS.INSURANCE_TYPE}
                          value={formData.insuranceType || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "insuranceType",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.INSURANCE_TYPE).map(
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
                          data-field-id={FIELD_IDS.INSURANCE}
                          value={formData.insurance || ""}
                          onChange={(e) =>
                            handleDropdownChange("insurance", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.INSURANCE).map(
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.GOOGLE_REVIEW_REQUEST}
                        >
                          {getRadioButtons(FIELD_IDS.GOOGLE_REVIEW_REQUEST).map(
                            (btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.googleReviewRequest ===
                                  btn.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "googleReviewRequest",
                                    btn.incrementalId
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
                      <div className="WF-fieldset-header-row">
                        <legend className="WF-legend">Patient Portion</legend>
                      </div>

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
                          <select
                            className="WF-form-select"
                            data-field-id={
                              FIELD_IDS.PATIENT_PORTION_PRIMARY_MODE
                            }
                          >
                            <option value="">Select</option>
                            {getDropdownOptions(
                              FIELD_IDS.PATIENT_PORTION_PRIMARY_MODE
                            ).map((opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ))}
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
                          <select
                            className="WF-form-select"
                            data-field-id={
                              FIELD_IDS.PATIENT_PORTION_SECONDARY_MODE
                            }
                          >
                            <option value="">Select</option>
                            {getDropdownOptions(
                              FIELD_IDS.PATIENT_PORTION_SECONDARY_MODE
                            ).map((opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ))}
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
                        <select
                          className="WF-form-select"
                          data-field-id={FIELD_IDS.REASON_LESS_COLLECTION}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(
                            FIELD_IDS.REASON_LESS_COLLECTION
                          ).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </fieldset>

                    {/* Rule Engine Check Fieldset */}
                    <fieldset className="WF-form-fieldset WF-rule-engine-fieldset">
                      <div className="WF-fieldset-header-row">
                        <legend className="WF-legend">Rule Engine Check</legend>
                      </div>

                      {/* Row 1: Did Office run + Reason dropdown */}
                      <div className="WF-rule-engine-row">
                        <div className="WF-walkout-form-row">
                          <label className="WF-walkout-form-label">
                            Did Office run the Rules Engine?
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div
                            className="WF-button-group"
                            data-field-id={FIELD_IDS.RULE_ENGINE_RUN}
                          >
                            {getRadioButtons(FIELD_IDS.RULE_ENGINE_RUN).map(
                              (btn) => (
                                <button
                                  key={btn._id}
                                  type="button"
                                  className={`WF-radio-button ${
                                    btn.name === "No" || btn.name === "Pending"
                                      ? "WF-no-or-pending-button"
                                      : ""
                                  } ${
                                    formData.ruleEngineRun === btn.incrementalId
                                      ? "WF-selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRadioChange(
                                      "ruleEngineRun",
                                      btn.incrementalId
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
                            Reason for Rules Engine not run
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <select
                            className="WF-walkout-form-select"
                            data-field-id={FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON}
                            value={formData.ruleEngineNotRunReason || ""}
                            onChange={(e) =>
                              handleDropdownChange(
                                "ruleEngineNotRunReason",
                                e.target.value
                              )
                            }
                          >
                            <option value="">Select</option>
                            {getDropdownOptions(
                              FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON
                            ).map((opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ))}
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
                          <div
                            className="WF-button-group"
                            data-field-id={FIELD_IDS.RULE_ENGINE_ERROR_FOUND}
                          >
                            {getRadioButtons(
                              FIELD_IDS.RULE_ENGINE_ERROR_FOUND
                            ).map((btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.ruleEngineError === btn.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "ruleEngineError",
                                    btn.incrementalId
                                  )
                                }
                              >
                                {btn.name}
                              </button>
                            ))}
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
                          <div
                            className="WF-button-group"
                            data-field-id={FIELD_IDS.ISSUES_FIXED}
                          >
                            {getRadioButtons(FIELD_IDS.ISSUES_FIXED).map(
                              (btn) => (
                                <button
                                  key={btn._id}
                                  type="button"
                                  className={`WF-radio-button ${
                                    btn.name === "No" || btn.name === "Pending"
                                      ? "WF-no-or-pending-button"
                                      : ""
                                  } ${
                                    formData.issuesFixed === btn.incrementalId
                                      ? "WF-selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRadioChange(
                                      "issuesFixed",
                                      btn.incrementalId
                                    )
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
                      <div className="WF-fieldset-header-row">
                        <legend className="WF-legend">
                          Confirmation from office about necessary info
                          available in Eaglesoft.
                        </legend>
                      </div>

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

                    {/* Notes Fieldset */}
                    <fieldset className="WF-form-fieldset WF-office-notes-fieldset">
                      <div className="WF-fieldset-header-row">
                        <legend className="WF-legend">
                          Notes ({formData.officeHistoricalNotes?.length || 0})
                        </legend>
                      </div>

                      {/* Office Notes Section */}
                      <div className="WF-notes-subsection">
                        <h4 className="WF-notes-subheading">Office Notes:</h4>
                        <div className="WF-notes-list">
                          {formData.officeHistoricalNotes?.length > 0 ? (
                            formData.officeHistoricalNotes.map(
                              (note, index) => (
                                <div key={index} className="WF-note-item">
                                  <div className="WF-note-datetime">
                                    {note.dateTime}
                                  </div>
                                  <div className="WF-note-author">
                                    {note.author}
                                  </div>
                                  <div className="WF-note-content">
                                    {note.content}
                                  </div>
                                </div>
                              )
                            )
                          ) : (
                            <p className="WF-no-notes-message">
                              No office notes yet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* LC3 Historical Notes Section */}
                      <div className="WF-notes-subsection">
                        <h4 className="WF-notes-subheading">
                          On Hold Details & Notes by LC3 Team:
                        </h4>
                        <div className="WF-notes-list">
                          {formData.lc3HistoricalNotes?.length > 0 ? (
                            formData.lc3HistoricalNotes.map((note, index) => (
                              <div key={index} className="WF-note-item">
                                <div className="WF-note-datetime">
                                  {note.dateTime}
                                </div>
                                <div className="WF-note-author">
                                  {note.author}
                                </div>
                                <div className="WF-note-content">
                                  {note.content}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="WF-no-notes-message">
                              No LC3 notes yet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Add New Office Note */}
                      <div className="WF-add-note-section">
                        <textarea
                          className="WF-add-note-textarea"
                          placeholder="Add new note here."
                          rows="4"
                          value={formData.newOfficeNote || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "newOfficeNote",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </fieldset>
                  </div>

                  {/* Office Section Submit Button */}
                  <div className="WF-section-submit">
                    <button
                      type="button"
                      className="WF-submit-button"
                      onClick={handleOfficeSubmit}
                    >
                      Submit Office Section
                    </button>
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
                <span className="WF-toggle-icon">
                  {sections.lc3 ? "−" : "+"}
                </span>
              </div>
              {sections.lc3 && (
                <div className="WF-section-content">
                  <fieldset className="WF-form-fieldset WF-lc3-rule-engine-fieldset">
                    <div className="WF-fieldset-header-row">
                      <legend className="WF-legend">
                        A. Rule Engine Check
                      </legend>
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_RUN_RULES}
                        >
                          {(() => {
                            const buttons = getRadioButtons(
                              FIELD_IDS.LC3_RUN_RULES
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
                                  lc3Data.didLc3RunRules ===
                                  button.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleLc3Change(
                                    "didLc3RunRules",
                                    button.incrementalId
                                  )
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
                                handleLc3Change(
                                  "reasonForNotRun",
                                  e.target.value
                                )
                              }
                              data-field-id={
                                FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON
                              }
                            >
                              <option value="">Select reason</option>
                              {getDropdownOptions(
                                FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON
                              ).map((option) => (
                                <option key={option._id} value={option.name}>
                                  {option.name}
                                </option>
                              ))}
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
                                Have the failed rules listed below been
                                addressed and resolved?
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
                                    <div
                                      className="WF-button-group"
                                      data-field-id={
                                        FIELD_IDS.LC3_RULE_ERROR_FOUND
                                      }
                                    >
                                      {getRadioButtons(
                                        FIELD_IDS.LC3_RULE_ERROR_FOUND
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
                      <legend className="WF-legend">
                        B. Document Check{" "}
                        <span className="WF-fieldset-subtitle">
                          (Attachment and Service Based Guidelines)
                        </span>
                      </legend>
                      <div
                        className="WF-status-toggle"
                        data-field-id={FIELD_IDS.LC3_DOCUMENT_CHECK_STATUS}
                      >
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
                          PRC Available
                          <span style={{ color: "#dc2626" }}>*</span>
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
                          NVD Available
                          <span style={{ color: "#dc2626" }}>*</span>
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
                      <div className="WF-form-group-compact WF-ortho-question">
                        <label className="WF-form-label-compact">
                          Does the Ortho Questionnaire form available?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_ORTHO_QUESTIONNAIRE}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_ORTHO_QUESTIONNAIRE
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
                          ))}
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* C. Attachments Check Fieldset */}
                  <fieldset className="WF-form-fieldset WF-lc3-attachments-check-fieldset">
                    <div className="WF-fieldset-header-row">
                      <legend className="WF-legend">
                        C. Attachments Check{" "}
                        <span className="WF-fieldset-subtitle">
                          (Attachment and Service Based Guidelines)
                        </span>
                      </legend>
                      <div
                        className="WF-status-toggle"
                        data-field-id={FIELD_IDS.LC3_ATTACHMENT_CHECK_STATUS}
                      >
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
                      <legend className="WF-legend">
                        D. Patient Portion Check
                      </legend>
                      <div
                        className="WF-status-toggle"
                        data-field-id={FIELD_IDS.LC3_PATIENT_PORTION_STATUS}
                      >
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
                      <div
                        className="WF-button-group"
                        data-field-id={FIELD_IDS.LC3_SIGNED_NVD_DIFF}
                      >
                        {getRadioButtons(FIELD_IDS.LC3_SIGNED_NVD_DIFF).map(
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
                            handleDropdownChange(
                              "expectedPPLC3",
                              e.target.value
                            )
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
                            handleDropdownChange(
                              "ppPrimaryMode",
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
                          Did you verify if the attached check matches the
                          payment posted in ES?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_VERIFY_CHECK_ES}
                        >
                          {getRadioButtons(FIELD_IDS.LC3_VERIFY_CHECK_ES).map(
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
                          Do we have the uploaded Forte check available in SD,
                          and does the entered ref# by the office match?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_FORTE_CHECK}
                        >
                          {getRadioButtons(FIELD_IDS.LC3_FORTE_CHECK).map(
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
                      <legend className="WF-legend">
                        E. Production Details and Walkout Submission/Hold
                      </legend>
                      <div
                        className="WF-status-toggle"
                        data-field-id={FIELD_IDS.LC3_PRODUCTION_DETAILS_STATUS}
                      >
                        <label className="WF-status-label">
                          <input
                            type="radio"
                            name="lc3ProductionStatus"
                            value="completed"
                            checked={
                              formData.lc3ProductionStatus === "completed"
                            }
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
                      Difference between LC3 and Office Production [LC3 -
                      Office]
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
                          Explanation of reason for Difference in Total
                          Production
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_INFORMED_OFFICE}
                        >
                          {getRadioButtons(FIELD_IDS.LC3_INFORMED_OFFICE).map(
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_GOOGLE_REVIEW_SENT}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_GOOGLE_REVIEW_SENT
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
                          ))}
                        </div>
                      </div>

                      <div className="WF-walkout-question-row">
                        <label className="WF-form-label-compact">
                          Does walkout contains Crown/Denture/Implant with
                          Prep/Imp?<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_CONTAINS_CROWN}
                        >
                          {getRadioButtons(FIELD_IDS.LC3_CONTAINS_CROWN).map(
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_CROWN_PAID_ON}
                        >
                          {getRadioButtons(FIELD_IDS.LC3_CROWN_PAID_ON).map(
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
                                  formData.crownPaidOn === button.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "crownPaidOn",
                                    button.incrementalId
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
                          Does crown/Denture/Implants delivered as per provider
                          notes?<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_DELIVERED_PER_NOTES}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_DELIVERED_PER_NOTES
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
                          ))}
                        </div>
                      </div>

                      <div className="WF-walkout-question-row">
                        <label className="WF-form-label-compact">
                          Is Walkout getting on Hold?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_WALKOUT_ON_HOLD}
                        >
                          {getRadioButtons(FIELD_IDS.LC3_WALKOUT_ON_HOLD).map(
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
                                  handleRadioChange(
                                    "walkoutOnHold",
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

                      <div className="WF-form-group-compact WF-full-width">
                        <label className="WF-form-label-compact">
                          On Hold Reasons
                        </label>
                        <select
                          className="WF-walkout-form-select"
                          value={formData.onHoldReasons || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "onHoldReasons",
                              e.target.value
                            )
                          }
                          data-field-id={FIELD_IDS.LC3_ONHOLD_REASONS}
                        >
                          <option value="">
                            Type here for search or select from list.
                          </option>
                          {getDropdownOptions(FIELD_IDS.LC3_ONHOLD_REASONS).map(
                            (option) => (
                              <option key={option._id} value={option.name}>
                                {option.name}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="WF-form-group-compact WF-full-width">
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
                      <div
                        className="WF-button-group"
                        data-field-id={FIELD_IDS.LC3_COMPLETING_DEFICIENCY}
                      >
                        {getRadioButtons(
                          FIELD_IDS.LC3_COMPLETING_DEFICIENCY
                        ).map((button) => (
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
                        ))}
                      </div>
                    </div>
                  </fieldset>

                  {/* F. Copy "Provider's Note" from Eaglesoft and Paste below */}
                  <fieldset className="WF-form-fieldset WF-lc3-provider-notes-fieldset">
                    <div className="WF-fieldset-header-row">
                      <legend className="WF-legend">
                        F. Copy "Provider's Note" from Eaglesoft and Paste below
                      </legend>
                      <div
                        className="WF-status-toggle"
                        data-field-id={FIELD_IDS.LC3_PROVIDER_NOTES_STATUS}
                      >
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_DOCTOR_NOTE_COMPLETED}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_DOCTOR_NOTE_COMPLETED
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
                          ))}
                        </div>
                      </div>

                      <div className="WF-provider-note-question-row">
                        <label className="WF-form-label-compact">
                          2. Does the notes updated on DOS?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_NOTES_UPDATED_DOS}
                        >
                          {getRadioButtons(FIELD_IDS.LC3_NOTES_UPDATED_DOS).map(
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
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.LC3_NOTE_INCLUDES_FOUR}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_NOTE_INCLUDES_FOUR
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
                          ))}
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
                    <legend className="WF-legend">
                      On Hold Details & Notes (1)
                    </legend>

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

                  {/* LC3 Section Submit Button */}
                  <div className="WF-section-submit">
                    <button
                      type="button"
                      className="WF-submit-button"
                      onClick={handleLC3Submit}
                    >
                      Submit LC3 Section
                    </button>
                  </div>
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
                  {sections.audit ? "−" : "+"}
                </span>
              </div>
              {sections.audit && (
                <div className="WF-section-content">
                  {/* Office Walkout Image Data Table */}
                  <div className="WF-audit-table-container">
                    <h4 className="WF-audit-table-title">
                      Office Walkout Image Data Extracted by AI
                    </h4>
                    <table className="WF-audit-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Service</th>
                          <th>Provider</th>
                          <th>Description</th>
                          <th>Tooth</th>
                          <th>Surface</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>JAMES TRAPANI</td>
                          <td>IMP</td>
                          <td>Dr. James S...</td>
                          <td>DENTURE/PARTIAL IMPRESSION</td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* LC3 Walkout Image Data Table */}
                  <div className="WF-audit-table-container">
                    <h4 className="WF-audit-table-title">
                      LC3 Walkout Image Data Extracted by AI
                    </h4>
                    <table className="WF-audit-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Patient</th>
                          <th>Provider</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Tooth</th>
                          <th>Surface</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>12/22/2025</td>
                          <td>JAMES</td>
                          <td>Dr. James Song</td>
                          <td>Service</td>
                          <td>
                            Service Code: IMP | Procedure: DENTURE/PARTIAL
                            IMPRESSION
                          </td>
                          <td>LA</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Analysis Section */}
                  <div className="WF-audit-analysis">
                    <h4 className="WF-analysis-title">Analysis</h4>
                    <p className="WF-overall-match-status WF-not-matched">
                      Overall Not Matched
                    </p>

                    <table className="WF-audit-table WF-analysis-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Service Match</th>
                          <th>Tooth & Surface Match</th>
                          <th>All Columns Match</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>IMP</td>
                          <td className="WF-match-check">✓</td>
                          <td className="WF-match-cross">❌</td>
                          <td className="WF-match-cross">❌</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Discrepancy Questions */}
                    <div className="WF-audit-questions">
                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          Discrepancy Found other than LC3 remarks?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.AUDIT_DISCREPANCY_FOUND}
                        >
                          {getRadioButtons(
                            FIELD_IDS.AUDIT_DISCREPANCY_FOUND
                          ).map((btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`WF-radio-button ${
                                btn.name === "No" || btn.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.discrepancyFound === btn.incrementalId
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "discrepancyFound",
                                  btn.incrementalId
                                )
                              }
                            >
                              {btn.name}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          className="WF-walkout-form-input"
                          placeholder="Discrepancy Remarks*"
                          value={formData.discrepancyRemarks || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "discrepancyRemarks",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="WF-walkout-form-row">
                        <label className="WF-walkout-form-label">
                          Discrepancy Fixed by LC3?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className="WF-button-group"
                          data-field-id={FIELD_IDS.AUDIT_DISCREPANCY_FIXED}
                        >
                          {getRadioButtons(
                            FIELD_IDS.AUDIT_DISCREPANCY_FIXED
                          ).map((btn) => (
                            <button
                              key={btn._id}
                              type="button"
                              className={`WF-radio-button ${
                                btn.name === "No" || btn.name === "Pending"
                                  ? "WF-no-or-pending-button"
                                  : ""
                              } ${
                                formData.discrepancyFixed === btn.incrementalId
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "discrepancyFixed",
                                  btn.incrementalId
                                )
                              }
                            >
                              {btn.name}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          className="WF-walkout-form-input"
                          placeholder="LC3 Remarks*"
                          value={formData.lc3Remarks || ""}
                          onChange={(e) =>
                            handleDropdownChange("lc3Remarks", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Audit Section Submit Button */}
                  <div className="WF-section-submit">
                    <button
                      type="button"
                      className="WF-submit-button"
                      onClick={handleAuditSubmit}
                    >
                      Submit Audit Section
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed sidebar */}
        <div className="WF-walkout-sidebar">
          <div className="WF-sidebar-section">
            {/* Timer Section - Only for LC3 Team */}
            {isLC3TeamMember() && (
              <div className="WF-sidebar-item">
                <label className="WF-sidebar-label">Time Tracker</label>

                {/* Current Session Timer */}
                <div className="WF-timer-display">
                  <div className="WF-timer-label">Current Session:</div>
                  <div className="WF-timer-value">
                    {formatTime(
                      sidebarData.timer.currentSession.elapsedSeconds
                    )}
                  </div>
                </div>

                {/* Last Session Info */}
                {sidebarData.timer.lastSession.user && (
                  <div className="WF-last-session">
                    <div className="WF-timer-label">Last Session:</div>
                    <div className="WF-session-info">
                      <div className="WF-session-duration">
                        {formatTime(sidebarData.timer.lastSession.duration)}
                      </div>
                      <div className="WF-session-user">
                        by {sidebarData.timer.lastSession.user}
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Time */}
                {sidebarData.timer.totalTime > 0 && (
                  <div className="WF-total-time">
                    <div className="WF-timer-label">Total Time:</div>
                    <div className="WF-timer-value WF-total">
                      {formatTime(sidebarData.timer.totalTime)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Walkout Status */}
            <div className="WF-sidebar-item">
              <label className="WF-sidebar-label">Walkout Status</label>
              <div
                className={`WF-status-badge WF-status-${sidebarData.walkoutStatus}`}
              >
                {sidebarData.walkoutStatus === "completed"
                  ? "Completed"
                  : sidebarData.walkoutStatus === "office-pending"
                  ? "Office Pending"
                  : "LC3 Pending"}
              </div>
            </div>

            {/* On-Hold Reasons */}
            <div className="WF-sidebar-item">
              <label className="WF-sidebar-label">On-Hold Reasons</label>
              <div className="WF-onhold-reasons">
                {onHoldReasons.length > 0 ? (
                  onHoldReasons.map((reason, index) => (
                    <div key={index} className="WF-reason-item">
                      • {reason}
                    </div>
                  ))
                ) : (
                  <div className="WF-no-reasons">No reasons listed</div>
                )}
              </div>
            </div>

            {/* Image Upload Sections */}
            <div className="WF-sidebar-item">
              <label className="WF-sidebar-label">Office WO Snip</label>
              {renderImageButtons("officeWO", "Office WO")}
            </div>

            <div className="WF-sidebar-item">
              <label className="WF-sidebar-label">Check Image</label>
              {renderImageButtons("checkImage", "Check")}
            </div>

            <div className="WF-sidebar-item">
              <label className="WF-sidebar-label">LC3 WO Snip</label>
              {renderImageButtons("lc3WO", "LC3 WO")}
            </div>

            {/* Submission Details */}
            <div className="WF-sidebar-item">
              <div className="WF-submission-details">
                <div className="WF-detail-row">
                  <span className="WF-detail-label">
                    Submit to LC3(Office):
                  </span>
                  <span className="WF-detail-value">
                    {submissionDetails.submitToLC3Office}
                  </span>
                </div>
                <div className="WF-detail-row">
                  <span className="WF-detail-label">Last Update By(LC3):</span>
                  <span className="WF-detail-value">
                    {submissionDetails.lastUpdateByLC3}
                  </span>
                </div>
                <div className="WF-detail-row">
                  <span className="WF-detail-label">Last Update on(LC3):</span>
                  <span className="WF-detail-value">
                    {submissionDetails.lastUpdateOnLC3}
                  </span>
                </div>
                <div className="WF-detail-row">
                  <span className="WF-detail-label">Completed By(LC3):</span>
                  <span className="WF-detail-value">
                    {submissionDetails.completedByLC3}
                  </span>
                </div>
                <div className="WF-detail-row">
                  <span className="WF-detail-label">Completed on(LC3):</span>
                  <span className="WF-detail-value">
                    {submissionDetails.completedOnLC3}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      {imageModal.isOpen && (
        <div
          className="WF-modal-overlay"
          onClick={() => setImageModal({ isOpen: false, type: null })}
        >
          <div
            className="WF-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="WF-modal-header">
              <h3>Add Image</h3>
              <button
                className="WF-modal-close"
                onClick={() => setImageModal({ isOpen: false, type: null })}
              >
                ×
              </button>
            </div>
            <div className="WF-modal-body">
              <div
                className="WF-paste-area"
                onPaste={(e) => {
                  handlePasteImage(imageModal.type, e);
                  setImageModal({ isOpen: false, type: null });
                }}
                tabIndex={0}
              >
                <p className="WF-paste-instruction">
                  Press Ctrl+V to paste image
                </p>
                <span className="WF-paste-icon">📋</span>
              </div>
              <div className="WF-modal-divider">OR</div>
              <label htmlFor="modal-file-input" className="WF-upload-file-btn">
                <span className="WF-upload-icon">📁</span>
                Choose File
              </label>
              <input
                id="modal-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleImageUpload(imageModal.type, e.target.files[0]);
                  setImageModal({ isOpen: false, type: null });
                }}
                style={{ display: "none" }}
              />
              {sidebarData.images[imageModal.type]?.url && (
                <button
                  className="WF-modal-remove-btn"
                  onClick={() => {
                    handleRemoveImage(imageModal.type);
                    setImageModal({ isOpen: false, type: null });
                  }}
                >
                  Remove Current Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal - Fullscreen */}
      {previewModal.isOpen &&
        sidebarData.images[previewModal.type]?.imageId && (
          <div
            className="WF-fullscreen-preview"
            onClick={() => setPreviewModal({ isOpen: false, type: null })}
          >
            <button
              className="WF-fullscreen-close"
              onClick={() => setPreviewModal({ isOpen: false, type: null })}
            >
              ×
            </button>
            <img
              src={getImageUrl(sidebarData.images[previewModal.type].imageId)}
              alt="Preview"
              style={{
                transform: `scale(${
                  sidebarData.images[previewModal.type].zoom / 100
                })`,
              }}
              className="WF-fullscreen-image"
              onClick={(e) => handleImageClick(previewModal.type, e)}
              onContextMenu={(e) => handleImageRightClick(previewModal.type, e)}
            />
            <div className="WF-zoom-indicator">
              {sidebarData.images[previewModal.type].zoom}%
            </div>
          </div>
        )}
    </div>
  );
};

export default WalkoutForm;
