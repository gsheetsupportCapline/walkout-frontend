import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./WalkoutForm.css";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { fetchWithAuth } from "../../utils/api";
import { getGeminiResponse } from "../../utils/providerNotesChecker";
import {
  validateLC3Section,
  validateOfficeSection,
  clearValidationError,
  hasValidationErrors,
} from "./walkoutValidation";
import LoadingSpinner from "../common/LoadingSpinner";
import Swal from "sweetalert2";

// Note Item Component to fetch and display user name
const NoteItem = ({ note, fetchUserName, formatNoteDate }) => {
  const [userName, setUserName] = useState("Loading...");

  useEffect(() => {
    const loadUserName = async () => {
      // console.log("🔍 Loading user name for note:", note);
      // console.log("🔍 addedBy field:", note.addedBy);
      // console.log("🔍 addedBy type:", typeof note.addedBy);

      if (note.addedBy) {
        // Extract the ID string if addedBy is an object
        let userId = note.addedBy;

        // If addedBy is an object, get the _id field
        if (typeof note.addedBy === "object" && note.addedBy !== null) {
          userId = note.addedBy._id || note.addedBy.id;
          // console.log("🔍 Extracted userId from object:", userId);
        }

        const name = await fetchUserName(userId);
        // console.log("✅ Fetched user name:", name);
        setUserName(name);
      } else {
        // console.log("⚠️ No addedBy field found in note");
        setUserName("Unknown");
      }
    };
    loadUserName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.addedBy]);

  return (
    <div className="WF-note-item">
      <div className="WF-note-datetime">
        {note.addedAt ? formatNoteDate(note.addedAt) : "No date"}
      </div>
      <div className="WF-note-author">{userName}</div>
      <div className="WF-note-content">
        {(note.content || note.text || note.note || "No content")
          .split("\n")
          .map((line, index, array) => (
            <React.Fragment key={index}>
              {line}
              {index < array.length - 1 && <br />}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
};

const WalkoutForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { appointment, officeName } = location.state || {};

  // Provider schedule state
  const [providerSchedule, setProviderSchedule] = useState({
    doctor1: "",
    doctor2: "",
    hygienist1: "",
    hygienist2: "",
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // success, error
  });

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

  // State for office section field dependencies
  const [isPatientPresent, setIsPatientPresent] = useState(false);
  const [isZeroProduction, setIsZeroProduction] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  const [showPrimaryAmount, setShowPrimaryAmount] = useState(false);
  const [showSecondaryAmount, setShowSecondaryAmount] = useState(false);
  const [showLastFourDigits, setShowLastFourDigits] = useState(false);
  const [showReasonLessCollection, setShowReasonLessCollection] =
    useState(false);
  const [showRuleEngineReason, setShowRuleEngineReason] = useState(false);
  const [showErrorFound, setShowErrorFound] = useState(false);
  const [showErrorFields, setShowErrorFields] = useState(false);

  // State for On-Hold Addressed Dialog
  const [showOnHoldDialog, setShowOnHoldDialog] = useState(false);
  const [onHoldAddressedValue, setOnHoldAddressedValue] = useState(null); // "Yes" or "No"
  const [pendingSubmitType, setPendingSubmitType] = useState(null); // "office" or "lc3"

  // State for collapsible sections
  const [sections, setSections] = useState({
    office: false, // Open by default
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
    fieldsetStatus: null, // incrementalId from control panel (Number)
    didLc3RunRules: "",
    ruleEngineUniqueId: "",
    reasonForNotRun: "",
    failedRules: [], // Array of rules fetched from API
    showUpdateButton: false, // Show update button only when textbox has value and changed
    lastFetchedId: "", // Track last fetched ID to hide button after fetch
  });
  const [isFetchingRules, setIsFetchingRules] = useState(false); // Loading state for API call

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
    walkoutStatus: "Walkout not Submitted to LC3",
    pendingWith: "",
    isOnHoldAddressed: null,
    images: {
      officeWO: { file: null, previewUrl: "", imageId: "", zoom: 100 },
      checkImage: { file: null, previewUrl: "", imageId: "", zoom: 100 },
      lc3WO: { file: null, previewUrl: "", imageId: "", zoom: 100 },
    },
  });

  const [timerInterval, setTimerInterval] = useState(null);

  // Load current user from localStorage
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
    return null;
  };

  const [currentUser] = useState(getCurrentUser());
  const LC3_TEAM_ID = "692b62d7671d81750966a63c";

  // Check if current user is LC3 team member
  const isLC3TeamMember = () => {
    if (
      !currentUser ||
      !currentUser.teamName ||
      !Array.isArray(currentUser.teamName)
    ) {
      return false;
    }

    // Check if any team in teamName array has LC3_TEAM_ID
    return currentUser.teamName.some(
      (team) => team.teamId && team.teamId._id === LC3_TEAM_ID,
    );
  };
  const [imageModal, setImageModal] = useState({ isOpen: false, type: null }); // Modal for adding image
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    type: null,
  }); // Modal for preview
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [userNamesCache, setUserNamesCache] = useState({}); // Cache for user names
  const [lc3ValidationErrors, setLc3ValidationErrors] = useState({}); // LC3 validation errors
  const [officeValidationErrors, setOfficeValidationErrors] = useState({}); // Office validation errors
  const [auditValidationErrors, setAuditValidationErrors] = useState({}); // Audit validation errors
  const [imageValidationErrors, setImageValidationErrors] = useState({
    officeWO: false,
    checkImage: false,
  }); // Image upload validation errors
  const [noteElements, setNoteElements] = useState({
    noteElement1: false, // Procedure Name
    noteElement2: false, // Tooth#/Quads/Arch
    noteElement3: false, // Provider Name
    noteElement4: false, // Hygienist Name
  });
  const [isCheckingWithAI, setIsCheckingWithAI] = useState(false);
  const [officeWalkoutData, setOfficeWalkoutData] = useState(null); // Store officeWalkoutSnip data from backend
  const [isRegeneratingOfficeData, setIsRegeneratingOfficeData] =
    useState(false); // Regeneration loading state
  const [regenerationDetails, setRegenerationDetails] = useState(null); // AI regeneration details for rate limiting
  const [lc3WalkoutData, setLc3WalkoutData] = useState(null); // Store lc3WalkoutImage data from backend
  const [isRegeneratingLc3Data, setIsRegeneratingLc3Data] = useState(false); // LC3 regeneration loading state
  const [lc3RegenerationDetails, setLc3RegenerationDetails] = useState(null); // LC3 AI regeneration details
  const [sessionStartTime, setSessionStartTime] = useState(null); // Track when form opens
  const [isSubmitting, setIsSubmitting] = useState(false); // Track form submission state

  // Submission details - dummy data
  const [submissionDetails] = useState({
    submitToLC3Office: "2025-12-22 17:02:26",
    lastUpdateByLC3: "Saransh Sharma",
    lastUpdateOnLC3: "2025-12-22 17:49:45",
    completedByLC3: "Saransh Sharma",
    completedOnLC3: "2025-12-22 17:49:45",
  });

  // Track session start time when component mounts
  useEffect(() => {
    // Get current time in IST timezone and format as ISO string
    const getISTTime = () => {
      const now = new Date();
      // Format date in IST timezone
      const istString = now
        .toLocaleString("en-CA", {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(", ", "T");
      return istString + ".000Z"; // ISO format
    };
    setSessionStartTime(getISTTime());
  }, []); // Only run once on mount

  // Fetch radio button sets
  useEffect(() => {
    const fetchRadioButtonSets = async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.REACT_APP_API_URL}/radio-buttons/button-sets?isActive=true`,
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
                    `\nSet name: ${set.name}`,
                  );
                }
                mapping[fieldId] = set._id;
              });
            }
          });

          // console.log("🔵 Radio Button Sets Loaded:", result.data.length);
          // console.log("🔵 Radio Field Mappings Created:", mapping);

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
        const response = await fetchWithAuth(
          `${process.env.REACT_APP_API_URL}/dropdowns/dropdown-sets?isActive=true`,
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
                    `\nSet name: ${set.name}`,
                  );
                }
                mapping[fieldId] = set._id;
              });
            }
          });

          // console.log("🟢 Dropdown Sets Loaded:", result.data.length);
          // console.log("🟢 Dropdown Field Mappings Created:", mapping);

          // Update the mapping state
          setFieldToSetMapping((prev) => ({ ...prev, ...mapping }));
        }
      } catch (error) {
        console.error("Error fetching dropdown sets:", error);
      }
    };
    fetchDropdownSets();
  }, []);

  // Fetch provider schedule based on office and DOS
  useEffect(() => {
    const fetchProviderSchedule = async () => {
      if (!officeName || !appointment?.dos) {
        console.log("⚠️ Missing required data for provider schedule fetch:", {
          officeName,
          dos: appointment?.dos,
        });
        return;
      }

      try {
        const API =
          process.env.REACT_APP_API_URL || "http://localhost:5000/api";

        // Convert DOS from yyyy-mm-dd to mm/dd/yyyy format
        const convertDateFormat = (dateStr) => {
          // dateStr is in format: yyyy-mm-dd
          const parts = dateStr.split("-");
          if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${month}/${day}/${year}`; // mm/dd/yyyy
          }
          return dateStr; // Return as-is if format is unexpected
        };

        const dosFormatted = convertDateFormat(appointment.dos);

        // console.log("📅 Fetching provider schedule for:", {
        // office: officeName,
        // dos: dosFormatted,
        // originalDOS: appointment.dos,
        // });

        const response = await fetchWithAuth(
          `${API}/provider-schedule/get-by-office-dos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              office: officeName,
              dos: dosFormatted,
            }),
          },
        );

        const result = await response.json();

        // console.log("📅 Provider schedule API response:", {
        //   status: response.status,
        //   ok: response.ok,
        //   result: result,
        // });

        if (response.ok && result.success && result.data) {
          // console.log("📅 Provider schedule fetched:", result.data);

          // Map provider-hygienist values to appointment fields
          const scheduleData = {
            doctor1: "",
            doctor2: "",
            hygienist1: "",
            hygienist2: "",
          };

          result.data.forEach((provider) => {
            const providerType = provider["provider-hygienist"];
            const providerCode = provider["provider-code-with-type"];

            // console.log(
            //   `📋 Mapping provider: ${providerType} → ${providerCode}`,
            // );

            if (providerType === "Doc - 1") {
              scheduleData.doctor1 = providerCode;
            } else if (providerType === "Doc - 2") {
              scheduleData.doctor2 = providerCode;
            } else if (providerType === "Hyg - 1") {
              scheduleData.hygienist1 = providerCode;
            } else if (providerType === "Hyg - 2") {
              scheduleData.hygienist2 = providerCode;
            }
          });

          setProviderSchedule(scheduleData);
          // console.log("✅ Provider schedule updated:", scheduleData);
        } else {
          // console.log("⚠️ No provider schedule found:", {
          //   status: response.status,
          //   success: result.success,
          //   message: result.message,
          // });
        }
      } catch (error) {
        console.error("❌ Error fetching provider schedule:", error);
      }
    };

    fetchProviderSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officeName, appointment?.dos]);

  // Set default value for postOpZeroProduction to "No"
  useEffect(() => {
    if (!walkoutId && !formData.postOpZeroProduction) {
      const buttons = getRadioButtons(FIELD_IDS.POST_OP_ZERO);
      const noButton = buttons.find((btn) => btn.name === "No");
      if (noButton) {
        setFormData((prev) => ({
          ...prev,
          postOpZeroProduction: noButton.incrementalId,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioButtonSets]);

  // Check for existing walkout on form open
  useEffect(() => {
    const checkExistingWalkout = async () => {
      if (!appointmentId) return;

      try {
        const API =
          process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        // Use formRefId to match with appointment ID
        const response = await fetchWithAuth(
          `${API}/walkouts?formRefId=${appointmentId}`,
        );
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          const existingWalkout = result.data[0];
          setWalkoutId(existingWalkout._id);
          setIsExistingWalkout(true);

          // Load walkout status into sidebar
          if (existingWalkout.walkoutStatus) {
            setSidebarData((prev) => ({
              ...prev,
              walkoutStatus: existingWalkout.walkoutStatus,
              pendingWith: existingWalkout.pendingWith || "",
              isOnHoldAddressed: existingWalkout.isOnHoldAddressed || null,
            }));
          }

          // Load all form data from the walkout
          if (existingWalkout.officeSection) {
            // console.log(
            //   "📋 Loading existing office section:",
            //   existingWalkout.officeSection,
            // );
            // console.log(
            //   "🔍 patientCame value:",
            //   existingWalkout.officeSection.patientCame,
            //   "Type:",
            //   typeof existingWalkout.officeSection.patientCame,
            // );

            // Extract only valid form fields (exclude backend-only fields like timestamps, historical notes, etc.)
            const {
              officeSubmittedBy,
              officeSubmittedAt,
              officeLastUpdatedBy,
              officeLastUpdatedAt,
              officeHistoricalNotes,
              lc3HistoricalNotes,
              onHoldNotes,
              _id,
              __v,
              ...validFormFields
            } = existingWalkout.officeSection;

            // console.log("✅ Loading only valid form fields:", validFormFields);

            // Debug: Check rule engine fields specifically
            // console.log("🔍 Rule Engine Fields from Backend:");
            // console.log("  ruleEngineRun:", validFormFields.ruleEngineRun);
            // console.log(
            //   "  ruleEngineNotRunReason:",
            //   validFormFields.ruleEngineNotRunReason,
            // );
            // console.log("  ruleEngineError:", validFormFields.ruleEngineError);
            // console.log("  errorFixRemarks:", validFormFields.errorFixRemarks);
            // console.log("  issuesFixed:", validFormFields.issuesFixed);
            // console.log(
            //   "  lastFourDigitsCheckForte:",
            //   validFormFields.lastFourDigitsCheckForte,
            // );

            // Debug: Check checkbox fields from backend
            // console.log("☑️ Checkbox Fields from Backend:");
            // console.log(
            //   "  signedGeneralConsent:",
            //   validFormFields.signedGeneralConsent,
            // );
            // console.log("  signedTxPlan:", validFormFields.signedTxPlan);
            // console.log(
            //   "  xRayPanoAttached:",
            //   validFormFields.xRayPanoAttached,
            // );
            // console.log(
            //   "  prcUpdatedInRouteSheet:",
            //   validFormFields.prcUpdatedInRouteSheet,
            // );
            // console.log("  routeSheet:", validFormFields.routeSheet);
            // console.log("  narrative:", validFormFields.narrative);
            // console.log(
            //   "  signedTreatmentConsent:",
            //   validFormFields.signedTreatmentConsent,
            // );
            // console.log(
            //   "  preAuthAvailable:",
            //   validFormFields.preAuthAvailable,
            // );
            // console.log("  perioChart:", validFormFields.perioChart);
            // console.log("  nvd:", validFormFields.nvd);
            // console.log(
            //   "  majorServiceForm:",
            //   validFormFields.majorServiceForm,
            // );
            // Convert lastFourDigitsCheckForte to string if it's a number (from backend)
            if (
              validFormFields.lastFourDigitsCheckForte !== undefined &&
              validFormFields.lastFourDigitsCheckForte !== null &&
              typeof validFormFields.lastFourDigitsCheckForte === "number"
            ) {
              validFormFields.lastFourDigitsCheckForte =
                validFormFields.lastFourDigitsCheckForte.toString();
              // console.log(
              //   "✅ Converted lastFourDigitsCheckForte to string:",
              //   validFormFields.lastFourDigitsCheckForte,
              // );
            }

            setFormData(validFormFields);

            // Debug: Check if historical notes are present
            // console.log(
            //   "📝 Office Historical Notes:",
            //   existingWalkout.officeSection.officeHistoricalNotes,
            // );
            // console.log(
            //   "📝 LC3 Historical Notes:",
            //   existingWalkout.officeSection.lc3HistoricalNotes,
            // );

            // Load Office Historical Notes (for display)
            if (officeHistoricalNotes && officeHistoricalNotes.length > 0) {
              setFormData((prev) => ({
                ...prev,
                officeHistoricalNotes: officeHistoricalNotes,
              }));
            }

            // Load LC3 On Hold Notes (for display in office section)
            if (onHoldNotes && onHoldNotes.length > 0) {
              setFormData((prev) => ({
                ...prev,
                onHoldNotes: onHoldNotes,
              }));
            }

            // Load Office WO Snip image if exists (from officeWalkoutSnip object)
            if (existingWalkout.officeWalkoutSnip?.imageId) {
              // Store the complete officeWalkoutSnip data including extractedData
              setOfficeWalkoutData(existingWalkout.officeWalkoutSnip);

              // Store AI regeneration details for rate limiting
              if (existingWalkout.officeWalkoutSnip.aiRegenerationDetails) {
                setRegenerationDetails(
                  existingWalkout.officeWalkoutSnip.aiRegenerationDetails,
                );
              }

              setSidebarData((prev) => ({
                ...prev,
                images: {
                  ...prev.images,
                  officeWO: {
                    file: null,
                    previewUrl: "",
                    imageId: existingWalkout.officeWalkoutSnip.imageId,
                    zoom: 100,
                  },
                },
              }));
              // console.log(
              //   "🖼️ Office WO Image loaded:",
              //   existingWalkout.officeWalkoutSnip.imageId,
              //   "| File:",
              //   existingWalkout.officeWalkoutSnip.fileName,
              //   "| Extracted Data:",
              //   existingWalkout.officeWalkoutSnip.extractedData,
              //   "| Regeneration Details:",
              //   existingWalkout.officeWalkoutSnip.aiRegenerationDetails,
              // );
            } else {
              // No image uploaded
              setOfficeWalkoutData({ imageId: null });
            }

            // Load Check Image if exists (from checkImage object)
            if (existingWalkout.checkImage?.imageId) {
              setSidebarData((prev) => ({
                ...prev,
                images: {
                  ...prev.images,
                  checkImage: {
                    file: null,
                    previewUrl: "",
                    imageId: existingWalkout.checkImage.imageId,
                    zoom: 100,
                  },
                },
              }));
              // console.log(
              //   "🖼️ Check Image loaded:",
              //   existingWalkout.checkImage.imageId,
              //   "| File:",
              //   existingWalkout.checkImage.fileName,
              // );
            }

            // Load LC3 WO Image if exists (from lc3WalkoutImage object)
            if (existingWalkout.lc3WalkoutImage?.imageId) {
              // Store the complete lc3WalkoutImage data including extractedData
              setLc3WalkoutData(existingWalkout.lc3WalkoutImage);

              // Store AI regeneration details for rate limiting
              if (existingWalkout.lc3WalkoutImage.aiRegenerationDetails) {
                setLc3RegenerationDetails(
                  existingWalkout.lc3WalkoutImage.aiRegenerationDetails,
                );
              }

              setSidebarData((prev) => ({
                ...prev,
                images: {
                  ...prev.images,
                  lc3WO: {
                    file: null,
                    previewUrl: "",
                    imageId: existingWalkout.lc3WalkoutImage.imageId,
                    zoom: 100,
                  },
                },
              }));
              // console.log(
              //   "🖼️ LC3 WO Image loaded:",
              //   existingWalkout.lc3WalkoutImage.imageId,
              //   "| File:",
              //   existingWalkout.lc3WalkoutImage.fileName,
              //   "| Extracted Data:",
              //   existingWalkout.lc3WalkoutImage.extractedData,
              //   "| Regeneration Details:",
              //   existingWalkout.lc3WalkoutImage.aiRegenerationDetails,
              // );
            } else {
              // No image uploaded
              setLc3WalkoutData({ imageId: null });
            }

            // Check if patient was present
            const buttons = getRadioButtons(FIELD_IDS.PATIENT_CAME);
            const yesButton = buttons.find((btn) => btn.name === "Yes");
            if (
              existingWalkout.officeSection.patientCame ===
              yesButton?.incrementalId
            ) {
              setIsPatientPresent(true);
            }

            // Check if zero production
            const zeroButtons = getRadioButtons(FIELD_IDS.POST_OP_ZERO);
            const zeroYesButton = zeroButtons.find((btn) => btn.name === "Yes");
            if (
              existingWalkout.officeSection.postOpZeroProduction ===
              zeroYesButton?.incrementalId
            ) {
              setIsZeroProduction(true);
            }
          }

          // Load LC3 section data if exists
          if (existingWalkout.lc3Section) {
            const lc3 = existingWalkout.lc3Section;
            // console.log("📋 Loading LC3 section data:", lc3);

            // Load Rule Engine data into lc3Data state
            if (lc3.ruleEngine) {
              setLc3Data({
                fieldsetStatus: lc3.ruleEngine.fieldsetStatus || null,
                didLc3RunRules: lc3.ruleEngine.didLc3RunRules || "",
                ruleEngineUniqueId: lc3.ruleEngine.ruleEngineUniqueId || "",
                reasonForNotRun: lc3.ruleEngine.reasonForNotRun || "",
                failedRules: lc3.ruleEngine.failedRules || [],
                showUpdateButton: false,
                lastFetchedId: lc3.ruleEngine.lastFetchedId || "",
              });

              // Load failed rules resolved status if they exist
              if (
                lc3.ruleEngine.failedRules &&
                lc3.ruleEngine.failedRules.length > 0
              ) {
                const failedRulesData = {};
                lc3.ruleEngine.failedRules.forEach((rule, index) => {
                  if (rule.resolved !== undefined && rule.resolved !== null) {
                    failedRulesData[`failedRule${index}`] = rule.resolved;
                  }
                });
                // Update formData with failed rules status
                setFormData((prev) => ({ ...prev, ...failedRulesData }));
              }
            }

            // Load all other LC3 fields into formData
            const lc3FormData = {};

            //Document Check fieldset - Backend field names match frontend exactly
            if (lc3.documentCheck) {
              lc3FormData.lc3DocumentCheckStatus =
                lc3.documentCheck.lc3DocumentCheckStatus;
              // All field names are same in backend and frontend
              lc3FormData.signedTreatmentPlanAvailable =
                lc3.documentCheck.signedTreatmentPlanAvailable;
              lc3FormData.prcAvailable = lc3.documentCheck.prcAvailable;
              lc3FormData.signedConsentGeneralAvailable =
                lc3.documentCheck.signedConsentGeneralAvailable;
              lc3FormData.nvdAvailable = lc3.documentCheck.nvdAvailable;
              lc3FormData.narrativeAvailable =
                lc3.documentCheck.narrativeAvailable;
              lc3FormData.signedConsentTxAvailable =
                lc3.documentCheck.signedConsentTxAvailable;
              // NOTE: preAuthAvailable exists in both Office (checkbox) and LC3 (dropdown)
              // Use separate field name for LC3 to avoid conflict
              lc3FormData.lc3PreAuthAvailable =
                lc3.documentCheck.preAuthAvailable;
              lc3FormData.routeSheetAvailable =
                lc3.documentCheck.routeSheetAvailable;
              lc3FormData.orthoQuestionnaireAvailable =
                lc3.documentCheck.orthoQuestionnaireAvailable;
            }

            // Attachments Check fieldset - Backend field names match frontend exactly
            if (lc3.attachmentsCheck) {
              lc3FormData.lc3AttachmentsCheckStatus =
                lc3.attachmentsCheck.lc3AttachmentsCheckStatus;
              // All field names are same in backend and frontend
              lc3FormData.pano = lc3.attachmentsCheck.pano;
              lc3FormData.fmx = lc3.attachmentsCheck.fmx;
              lc3FormData.bitewing = lc3.attachmentsCheck.bitewing;
              lc3FormData.pa = lc3.attachmentsCheck.pa;
              // NOTE: perioChart exists in both Office (checkbox) and LC3 (dropdown)
              // Use separate field name for LC3 to avoid conflict
              lc3FormData.lc3PerioChart = lc3.attachmentsCheck.perioChart;
            }

            // Patient Portion Check fieldset - Backend field names match frontend exactly (15 fields)
            if (lc3.patientPortionCheck) {
              lc3FormData.lc3PatientPortionStatus =
                lc3.patientPortionCheck.lc3PatientPortionStatus;
              // Office calculations
              lc3FormData.expectedPPOffice =
                lc3.patientPortionCheck.expectedPPOffice;
              lc3FormData.ppCollectedOffice =
                lc3.patientPortionCheck.ppCollectedOffice;
              lc3FormData.ppDifferenceOffice =
                lc3.patientPortionCheck.ppDifferenceOffice;
              // NVD question
              lc3FormData.signedNVDForDifference =
                lc3.patientPortionCheck.signedNVDForDifference;
              // LC3 calculations
              lc3FormData.expectedPPLC3 = lc3.patientPortionCheck.expectedPPLC3;
              lc3FormData.ppDifferenceLC3 =
                lc3.patientPortionCheck.ppDifferenceLC3;
              // Primary payment verification
              lc3FormData.ppPrimaryMode = lc3.patientPortionCheck.ppPrimaryMode;
              lc3FormData.amountPrimaryMode =
                lc3.patientPortionCheck.amountPrimaryMode;
              lc3FormData.paymentVerifiedFromPrimary =
                lc3.patientPortionCheck.paymentVerifiedFromPrimary;
              // Secondary payment verification
              lc3FormData.ppSecondaryMode =
                lc3.patientPortionCheck.ppSecondaryMode;
              lc3FormData.amountSecondaryMode =
                lc3.patientPortionCheck.amountSecondaryMode;
              lc3FormData.paymentVerifiedFromSecondary =
                lc3.patientPortionCheck.paymentVerifiedFromSecondary;
              // Bottom questions
              lc3FormData.verifyCheckMatchesES =
                lc3.patientPortionCheck.verifyCheckMatchesES;
              lc3FormData.forteCheckAvailable =
                lc3.patientPortionCheck.forteCheckAvailable;
            }

            // Production Details fieldset - Backend field names match frontend exactly (24 fields)
            if (lc3.productionDetails) {
              lc3FormData.lc3ProductionStatus =
                lc3.productionDetails.lc3ProductionStatus;
              // Office production calculations
              lc3FormData.totalProductionOffice =
                lc3.productionDetails.totalProductionOffice;
              lc3FormData.estInsuranceOffice =
                lc3.productionDetails.estInsuranceOffice;
              lc3FormData.expectedPPOfficeProduction =
                lc3.productionDetails.expectedPPOfficeProduction;
              // LC3 production calculations
              lc3FormData.totalProductionLC3 =
                lc3.productionDetails.totalProductionLC3;
              lc3FormData.estInsuranceLC3 =
                lc3.productionDetails.estInsuranceLC3;
              lc3FormData.expectedPPLC3Production =
                lc3.productionDetails.expectedPPLC3Production;
              // Differences
              lc3FormData.totalProductionDifference =
                lc3.productionDetails.totalProductionDifference;
              lc3FormData.estInsuranceDifference =
                lc3.productionDetails.estInsuranceDifference;
              lc3FormData.expectedPPDifference =
                lc3.productionDetails.expectedPPDifference;
              // Reason fields
              lc3FormData.reasonTotalProductionDiff =
                lc3.productionDetails.reasonTotalProductionDiff;
              lc3FormData.reasonEstInsuranceDiff =
                lc3.productionDetails.reasonEstInsuranceDiff;
              // Explanation fields
              lc3FormData.explanationTotalProductionDiff =
                lc3.productionDetails.explanationTotalProductionDiff;
              lc3FormData.explanationEstInsuranceDiff =
                lc3.productionDetails.explanationEstInsuranceDiff;
              // Walkout questions
              lc3FormData.informedOfficeManager =
                lc3.productionDetails.informedOfficeManager;
              lc3FormData.googleReviewSent =
                lc3.productionDetails.googleReviewSent;
              lc3FormData.containsCrownDentureImplant =
                lc3.productionDetails.containsCrownDentureImplant;
              lc3FormData.crownPaidOn = lc3.productionDetails.crownPaidOn;
              lc3FormData.deliveredAsPerNotes =
                lc3.productionDetails.deliveredAsPerNotes;
              lc3FormData.walkoutOnHold = lc3.productionDetails.walkoutOnHold;
              lc3FormData.onHoldReasons =
                lc3.productionDetails.onHoldReasons || [];
              lc3FormData.otherReasonNotes =
                lc3.productionDetails.otherReasonNotes;
              lc3FormData.completingWithDeficiency =
                lc3.productionDetails.completingWithDeficiency;
            }

            // Provider Notes fieldset - Backend field names match frontend exactly (10 fields)
            if (lc3.providerNotes) {
              lc3FormData.lc3ProviderNotesStatus =
                lc3.providerNotes.lc3ProviderNotesStatus;
              // 3 main questions
              lc3FormData.doctorNoteCompleted =
                lc3.providerNotes.doctorNoteCompleted;
              lc3FormData.notesUpdatedOnDOS =
                lc3.providerNotes.notesUpdatedOnDOS;
              lc3FormData.noteIncludesFourElements =
                lc3.providerNotes.noteIncludesFourElements;
              // 4 element checkboxes
              lc3FormData.noteElement1 = lc3.providerNotes.noteElement1;
              lc3FormData.noteElement2 = lc3.providerNotes.noteElement2;
              lc3FormData.noteElement3 = lc3.providerNotes.noteElement3;
              lc3FormData.noteElement4 = lc3.providerNotes.noteElement4;
              // 2 text areas - map backend fields to frontend field names
              lc3FormData.providerNotesFromES = lc3.providerNotes.providerNotes;
              lc3FormData.hygienistNotesFromES =
                lc3.providerNotes.hygienistNotes;
              // AI check status
              lc3FormData.checkedByAi = lc3.providerNotes.checkedByAi || false;
            }

            // LC3 Remarks
            if (lc3.lc3Remarks) {
              lc3FormData.lc3Remarks = lc3.lc3Remarks;
            }

            // LC3 Historical Notes (for display)
            if (lc3.lc3HistoricalNotes && lc3.lc3HistoricalNotes.length > 0) {
              lc3FormData.lc3HistoricalNotes = lc3.lc3HistoricalNotes;
            }

            // On Hold Notes (structured notes with user info)
            if (lc3.onHoldNotes && lc3.onHoldNotes.length > 0) {
              lc3FormData.onHoldNotes = lc3.onHoldNotes;
            }

            // Merge LC3 data into formData
            setFormData((prev) => {
              // console.log(
              //   "🔄 Before LC3 merge - narrative value:",
              //   prev.narrative,
              // );
              // console.log("🔄 LC3 data being merged:", lc3FormData);
              const merged = { ...prev, ...lc3FormData };
              // console.log(
              //   "🔄 After LC3 merge - narrative value:",
              //   merged.narrative,
              // );
              return merged;
            });

            // Update noteElements state if provider notes exist
            if (lc3.providerNotes) {
              setNoteElements({
                noteElement1: lc3.providerNotes.noteElement1 || false,
                noteElement2: lc3.providerNotes.noteElement2 || false,
                noteElement3: lc3.providerNotes.noteElement3 || false,
                noteElement4: lc3.providerNotes.noteElement4 || false,
              });
              // console.log("✅ Note elements loaded:", {
              //   noteElement1: lc3.providerNotes.noteElement1,
              //   noteElement2: lc3.providerNotes.noteElement2,
              //   noteElement3: lc3.providerNotes.noteElement3,
              //   noteElement4: lc3.providerNotes.noteElement4,
              // });
            }

            // console.log("✅ LC3 section loaded successfully");
          }

          // Load Audit section data if exists
          if (existingWalkout.auditSection) {
            const audit = existingWalkout.auditSection;
            console.log("📋 Loading Audit section data:", audit);

            // Map backend field names to frontend field names
            const auditFormData = {
              // auditAnalysisData is not mapped to form (used internally)
              discrepancyFound:
                audit.auditDiscrepancyFoundOtherThanLC3Remarks || null,
              discrepancyRemarks: audit.auditDiscrepancyRemarks || "",
              discrepancyFixed: audit.auditDiscrepancyFixedByLC3 || null,
              lc3Remarks: audit.auditLc3Remarks || "",
            };

            // Update formData with audit fields
            setFormData((prev) => ({ ...prev, ...auditFormData }));
            console.log("✅ Audit section loaded successfully");
          }

          // console.log("✅ Existing walkout loaded:", existingWalkout._id);
        } else {
          // console.log("📝 No existing walkout found, opening blank form");
        }
      } catch (error) {
        console.error("Error checking existing walkout:", error);
      }
    };

    checkExistingWalkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  // Update isPatientPresent and isZeroProduction when formData changes or radioButtonSets load
  useEffect(() => {
    if (radioButtonSets.length > 0 && formData.patientCame) {
      const buttons = getRadioButtons(FIELD_IDS.PATIENT_CAME);
      const yesButton = buttons.find((btn) => btn.name === "Yes");
      setIsPatientPresent(formData.patientCame === yesButton?.incrementalId);
    }

    if (radioButtonSets.length > 0 && formData.postOpZeroProduction) {
      const zeroButtons = getRadioButtons(FIELD_IDS.POST_OP_ZERO);
      const zeroYesButton = zeroButtons.find((btn) => btn.name === "Yes");
      setIsZeroProduction(
        formData.postOpZeroProduction === zeroYesButton?.incrementalId,
      );
    }

    // Update hasInsurance state
    if (radioButtonSets.length > 0 && formData.hasInsurance) {
      const insuranceButtons = getRadioButtons(FIELD_IDS.HAS_INSURANCE);
      const yesButton = insuranceButtons.find((btn) => btn.name === "Yes");
      setHasInsurance(formData.hasInsurance === yesButton?.incrementalId);
    } else {
      setHasInsurance(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.patientCame,
    formData.postOpZeroProduction,
    formData.hasInsurance,
    radioButtonSets,
  ]);

  // Update showInsuranceDropdown when insuranceType changes
  useEffect(() => {
    if (formData.insuranceType) {
      // Child Medicaid = 2, Chip Medicaid = 6
      if (formData.insuranceType === 2 || formData.insuranceType === 6) {
        setShowInsuranceDropdown(true);
      } else {
        setShowInsuranceDropdown(false);
      }
    } else {
      setShowInsuranceDropdown(false);
    }
  }, [formData.insuranceType]);

  // Update patient portion amount fields visibility
  useEffect(() => {
    // Show primary amount if primary mode is selected
    setShowPrimaryAmount(!!formData.patientPortionPrimaryMode);

    // Show secondary amount if secondary mode is selected
    setShowSecondaryAmount(!!formData.patientPortionSecondaryMode);

    // Show last 4 digits if Personal Check (value 4) is selected in either mode
    const hasPersonalCheck =
      formData.patientPortionPrimaryMode === 4 ||
      formData.patientPortionSecondaryMode === 4;
    setShowLastFourDigits(hasPersonalCheck);
  }, [
    formData.patientPortionPrimaryMode,
    formData.patientPortionSecondaryMode,
  ]);

  // Update reason less collection visibility based on negative difference
  useEffect(() => {
    const difference = parseFloat(formData.differenceInPatientPortion) || 0;
    setShowReasonLessCollection(difference < 0);
  }, [formData.differenceInPatientPortion]);

  // Update rule engine fields visibility
  useEffect(() => {
    if (!formData.ruleEngineRun) {
      // Nothing selected, hide all
      setShowRuleEngineReason(false);
      setShowErrorFound(false);
      setShowErrorFields(false);
      return;
    }

    // Get the Yes button to check if rule engine was run
    const buttons = getRadioButtons(FIELD_IDS.RULE_ENGINE_RUN);
    const yesButton = buttons.find((btn) => btn.name === "Yes");
    const noButton = buttons.find((btn) => btn.name === "No");

    if (formData.ruleEngineRun === yesButton?.incrementalId) {
      // Yes selected - show error found question, hide reason
      setShowRuleEngineReason(false);
      setShowErrorFound(true);
    } else if (formData.ruleEngineRun === noButton?.incrementalId) {
      // No selected - show reason, hide error found
      setShowRuleEngineReason(true);
      setShowErrorFound(false);
      setShowErrorFields(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.ruleEngineRun, radioButtonSets]);

  // Update error fields visibility based on error found selection
  useEffect(() => {
    if (!formData.ruleEngineError) {
      setShowErrorFields(false);
      return;
    }

    const buttons = getRadioButtons(FIELD_IDS.RULE_ENGINE_ERROR_FOUND);
    const yesButton = buttons.find((btn) => btn.name === "Yes");

    if (formData.ruleEngineError === yesButton?.incrementalId) {
      // Yes selected - show remarks and issues fixed
      setShowErrorFields(true);
    } else {
      // No selected - hide fields
      setShowErrorFields(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.ruleEngineError, radioButtonSets]);

  // Helper function to get radio buttons by set ID or field ID
  const getRadioButtons = (identifier) => {
    // First check if identifier is a field ID and get the mapped set ID
    const setId = fieldToSetMapping[identifier] || identifier;

    // Find the set by ID
    const set = radioButtonSets.find((s) => s._id === setId);
    return set?.buttons.filter((btn) => btn.isActive && btn.visibility) || [];
  };

  // Helper function to get dropdown options by set ID or field ID
  const getDropdownOptions = (identifier) => {
    // First check if identifier is a field ID and get the mapped set ID
    const setId = fieldToSetMapping[identifier] || identifier;

    // Find the set by ID
    const set = dropdownSets.find((s) => s._id === setId);
    return set?.options.filter((opt) => opt.isActive && opt.visibility) || [];
  };

  // Function to fetch user name by ID
  const fetchUserName = async (userId) => {
    // console.log("🔎 fetchUserName called with userId:", userId);

    if (!userId) {
      // console.log("⚠️ No userId provided");
      return "Unknown";
    }

    // Check cache first
    if (userNamesCache[userId]) {
      // console.log("✅ Found in cache:", userNamesCache[userId]);
      return userNamesCache[userId];
    }

    try {
      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      // console.log("📡 Fetching user from API:", `${API}/users/${userId}`);

      const response = await fetchWithAuth(`${API}/users/${userId}`);
      const result = await response.json();

      // console.log("📥 API Response:", result);

      if (result.success && result.data) {
        const userName = result.data.name || result.data.userName || "Unknown";
        // console.log("✅ User name extracted:", userName);
        // Update cache
        setUserNamesCache((prev) => ({ ...prev, [userId]: userName }));
        return userName;
      } else {
        // console.log("⚠️ API returned unsuccessful or no data");
      }
    } catch (error) {
      console.error("❌ Error fetching user name:", error);
    }

    return "Unknown";
  };

  // Function to format date from ISO string
  const formatNoteDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return dateString;
    }
  };

  // Handle radio button selection
  const handleRadioChange = (fieldName, value) => {
    // Clear validation error for this field (both LC3 and Office sections)
    if (lc3ValidationErrors[fieldName]) {
      setLc3ValidationErrors((prev) => clearValidationError(prev, fieldName));
    }
    if (officeValidationErrors[fieldName]) {
      setOfficeValidationErrors((prev) =>
        clearValidationError(prev, fieldName),
      );
    }

    // Special handling for "Did Patient come to the appointment?"
    if (fieldName === "patientCame") {
      const buttons = getRadioButtons(FIELD_IDS.PATIENT_CAME);
      const yesButton = buttons.find((btn) => btn.name === "Yes");
      setIsPatientPresent(value === yesButton?.incrementalId);
    }

    // Special handling for "Is Post op walkout completing with zero production?"
    if (fieldName === "postOpZeroProduction") {
      const buttons = getRadioButtons(FIELD_IDS.POST_OP_ZERO);
      const yesButton = buttons.find((btn) => btn.name === "Yes");

      if (value === yesButton?.incrementalId) {
        // Show confirmation dialog
        const confirmed = window.confirm(
          "Are you sure this is a Zero Production Walkout, that does not need to be Walked Out by LC3?",
        );
        if (confirmed) {
          setIsZeroProduction(true);
          setFormData((prev) => ({ ...prev, [fieldName]: value }));
        } else {
          // Revert to "No" if not confirmed
          const noButton = buttons.find((btn) => btn.name === "No");
          setIsZeroProduction(false);
          setFormData((prev) => ({
            ...prev,
            [fieldName]: noButton?.incrementalId || 2,
          }));
        }
        return;
      } else {
        setIsZeroProduction(false);
      }
    }

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Handle multi-select dropdown change
  const handleMultiSelectChange = (fieldName, newValues) => {
    setFormData((prev) => {
      return { ...prev, [fieldName]: newValues };
    });
  };

  const handleDropdownChange = (fieldName, value) => {
    // Debug: Log all changes including checkboxes
    // console.log(
    //   `🔄 handleDropdownChange called: ${fieldName} = ${value} (type: ${typeof value})`,
    // );

    // Clear validation error for this field (both LC3 and Office sections)
    if (lc3ValidationErrors[fieldName]) {
      setLc3ValidationErrors((prev) => clearValidationError(prev, fieldName));
    }
    if (officeValidationErrors[fieldName]) {
      setOfficeValidationErrors((prev) =>
        clearValidationError(prev, fieldName),
      );
    }

    // If provider or hygienist notes are changed, reset checkedByAi
    if (
      fieldName === "providerNotesFromES" ||
      fieldName === "hygienistNotesFromES"
    ) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: value,
        checkedByAi: false, // Reset AI check status
      }));
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [fieldName]: value };

      // Auto-calculate patient portion collected and difference (Office Section)
      if (
        fieldName === "amountCollectedPrimaryMode" ||
        fieldName === "amountCollectedSecondaryMode" ||
        fieldName === "expectedPatientPortionOfficeWO"
      ) {
        const primary = parseFloat(
          fieldName === "amountCollectedPrimaryMode"
            ? value
            : updated.amountCollectedPrimaryMode || 0,
        );
        const secondary = parseFloat(
          fieldName === "amountCollectedSecondaryMode"
            ? value
            : updated.amountCollectedSecondaryMode || 0,
        );
        const expected = parseFloat(
          fieldName === "expectedPatientPortionOfficeWO"
            ? value
            : updated.expectedPatientPortionOfficeWO || 0,
        );

        const collected = primary + secondary;
        const difference = collected - expected;

        updated.patientPortionCollected = collected;
        updated.differenceInPatientPortion = difference;
      }

      // Auto-calculate Patient Portion fields in LC3 Section
      if (
        fieldName === "expectedPPOffice" ||
        fieldName === "ppCollectedOffice" ||
        fieldName === "expectedPPLC3"
      ) {
        const expectedOffice = parseFloat(
          fieldName === "expectedPPOffice"
            ? value
            : updated.expectedPPOffice || 0,
        );
        const collectedOffice = parseFloat(
          fieldName === "ppCollectedOffice"
            ? value
            : updated.ppCollectedOffice || 0,
        );
        const expectedLC3 = parseFloat(
          fieldName === "expectedPPLC3" ? value : updated.expectedPPLC3 || 0,
        );

        // Calculate ppDifferenceOffice = ppCollectedOffice - expectedPPOffice
        updated.ppDifferenceOffice = collectedOffice - expectedOffice;

        // Calculate ppDifferenceLC3 = expectedPPLC3 - expectedPPOffice
        updated.ppDifferenceLC3 = expectedLC3 - expectedOffice;
      }

      // Auto-calculate Production Details fields
      if (
        fieldName === "totalProductionOffice" ||
        fieldName === "estInsuranceOffice" ||
        fieldName === "totalProductionLC3" ||
        fieldName === "estInsuranceLC3"
      ) {
        const totalProdOffice = parseFloat(
          fieldName === "totalProductionOffice"
            ? value
            : updated.totalProductionOffice || 0,
        );
        const estInsOffice = parseFloat(
          fieldName === "estInsuranceOffice"
            ? value
            : updated.estInsuranceOffice || 0,
        );
        const totalProdLC3 = parseFloat(
          fieldName === "totalProductionLC3"
            ? value
            : updated.totalProductionLC3 || 0,
        );
        const estInsLC3 = parseFloat(
          fieldName === "estInsuranceLC3"
            ? value
            : updated.estInsuranceLC3 || 0,
        );

        // Calculate Expected PP (Office) = Total Production (Office) - Est. Insurance (Office)
        updated.expectedPPOfficeProduction = totalProdOffice - estInsOffice;

        // Calculate Expected PP (LC3) = Total Production (LC3) - Est. Insurance (LC3)
        updated.expectedPPLC3Production = totalProdLC3 - estInsLC3;

        // Calculate Total Production Difference = Total Production (LC3) - Total Production (Office)
        updated.totalProductionDifference = totalProdLC3 - totalProdOffice;

        // Calculate Est Insurance Difference = Est. Insurance (LC3) - Est. Insurance (Office)
        updated.estInsuranceDifference = estInsLC3 - estInsOffice;

        // Calculate Expected PP Difference = Total Production Difference - Est Insurance Difference
        updated.expectedPPDifference =
          updated.totalProductionDifference - updated.estInsuranceDifference;

        // Clear conditional fields if difference becomes 0
        if (updated.totalProductionDifference === 0) {
          updated.reasonTotalProductionDiff = "";
          updated.explanationTotalProductionDiff = "";
        }
        if (updated.estInsuranceDifference === 0) {
          updated.reasonEstInsuranceDiff = "";
          updated.explanationEstInsuranceDiff = "";
        }
        // Clear informedOfficeManager if both differences become 0
        if (
          updated.totalProductionDifference === 0 &&
          updated.estInsuranceDifference === 0
        ) {
          updated.informedOfficeManager = "";
        }
      }

      // Auto-clear crown dependency chain
      if (fieldName === "containsCrownDentureImplant" && value !== 1) {
        // If "Does walkout contains Crown/Denture/Implant" is NOT Yes (1), clear dependent fields
        updated.crownPaidOn = "";
        updated.deliveredAsPerNotes = "";
      }

      if (fieldName === "crownPaidOn" && value !== 2) {
        // If "As per IV crown paid on" is NOT 2, clear deliveredAsPerNotes
        updated.deliveredAsPerNotes = "";
      }

      // Auto-clear walkout on hold dependency chain
      if (fieldName === "walkoutOnHold") {
        if (value !== 2) {
          // If NOT on hold (value !== 2), clear on-hold related fields
          updated.onHoldReasons = [];
          updated.otherReasonNotes = "";
        }
        if (value !== 1) {
          // If NOT completing (value !== 1), clear deficiency question
          updated.completingWithDeficiency = "";
        }
      }

      // Clear check image and last four digits when payment mode changes away from Personal Check (4)
      if (
        fieldName === "patientPortionPrimaryMode" ||
        fieldName === "patientPortionSecondaryMode"
      ) {
        const isPrimaryMode4 =
          fieldName === "patientPortionPrimaryMode"
            ? value === 4
            : updated.patientPortionPrimaryMode === 4;
        const isSecondaryMode4 =
          fieldName === "patientPortionSecondaryMode"
            ? value === 4
            : updated.patientPortionSecondaryMode === 4;

        // If neither mode is Personal Check (4), clear check-related data
        if (!isPrimaryMode4 && !isSecondaryMode4) {
          updated.lastFourDigitsCheckForte = "";
          // Clear check image data from sidebar
          setSidebarData((prev) => ({
            ...prev,
            images: {
              ...prev.images,
              checkImage: {
                file: null,
                previewUrl: "",
                imageId: "",
                zoom: 100,
              },
            },
          }));
          // Clear check image validation error
          setImageValidationErrors((prev) => ({ ...prev, checkImage: false }));
        }
      }

      return updated;
    });
  };

  // Handle LC3 data changes
  const handleLc3Change = (fieldName, value) => {
    // Clear validation error for this field
    if (lc3ValidationErrors[fieldName]) {
      setLc3ValidationErrors((prev) => clearValidationError(prev, fieldName));
    }

    if (fieldName === "ruleEngineUniqueId") {
      // Show update button when:
      // 1. Value is not empty AND
      // 2. Value is different from last fetched ID
      // Note: We only check lastFetchedId to ensure failed rules match the current ID
      setLc3Data((prev) => {
        const hasChanged = value.trim() !== "" && value !== prev.lastFetchedId;
        return {
          ...prev,
          [fieldName]: value,
          showUpdateButton: hasChanged,
        };
      });
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
      Swal.fire({
        icon: "warning",
        title: "Missing ID",
        text: "Please enter Rule Engine Unique ID",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "OK",
      });
      return;
    }

    // console.log("Fetching rules with:", { patientId, uniqueId, office });

    setIsFetchingRules(true); // Start loading

    try {
      const response = await fetch(
        `https://caplineruleengine.com/queryrulesstatus?password=&patientId=${patientId}&client=Smilepoint&claimOrTreatmentId=16344&uniqueId=${uniqueId}&office=${office}`,
      );
      const result = await response.json();

      // console.log("API Response:", result);

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
        setIsFetchingRules(false); // Stop loading
        if (result.data.length === 0) {
          // Don't show alert, just update state
          // console.log("No failed rules found");
        }
      } else {
        setLc3Data((prev) => ({
          ...prev,
          failedRules: [],
          showUpdateButton: false,
          lastFetchedId: uniqueId,
        }));
        setIsFetchingRules(false); // Stop loading
      }
    } catch (error) {
      console.error("Error fetching failed rules:", error);
      setIsFetchingRules(false); // Stop loading on error

      Swal.fire({
        icon: "error",
        title: "API Error",
        text: "Failed to fetch rules. Please try again.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
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

  // NOTE: Image preloading removed - images will only load when user clicks Preview button
  // This prevents automatic API calls when opening appointments

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

  // Store image locally - Will upload when Office section is submitted
  const handleImageUpload = (type, file) => {
    if (file && file.type.startsWith("image/")) {
      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);

      setSidebarData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [type]: {
            file: file,
            previewUrl: previewUrl,
            imageId: prev.images[type].imageId, // Keep existing imageId if any
            zoom: 100,
          },
        },
      }));

      // Clear validation error for this image when uploaded
      if (type === "officeWO" || type === "checkImage") {
        setImageValidationErrors((prev) => ({ ...prev, [type]: false }));
      }
      // Clear LC3 validation error for lc3WO image
      if (type === "lc3WO") {
        setLc3ValidationErrors((prev) => ({
          ...prev,
          lc3WalkoutImage: false,
        }));
      }

      // console.log(`📁 Image stored locally for ${type}:`, file.name);
    }
  };

  const handlePasteImage = (type, event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        handleImageUpload(type, file);
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

  const handleRemoveImage = (type) => {
    // Revoke preview URL to free memory
    if (sidebarData.images[type].previewUrl) {
      URL.revokeObjectURL(sidebarData.images[type].previewUrl);
    }

    setSidebarData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [type]: { file: null, previewUrl: "", imageId: "", zoom: 100 },
      },
    }));

    // console.log(`🗑️ Image removed for ${type}`);
  };

  // Generate image URL - use previewUrl if available (before submit), otherwise use imageId (after submit)
  const getImageUrl = (type) => {
    const imageData = sidebarData.images[type];

    // If file is selected but not yet uploaded, use preview URL
    if (imageData.previewUrl) {
      return imageData.previewUrl;
    }

    // If image was uploaded and we have imageId from backend, use API endpoint
    if (imageData.imageId) {
      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      // Encode imageId for S3 paths (e.g., "walkout/2026/January/Dallas_Office/officeWalkoutSnip/patient_123_1706234567890_image.jpg")
      const encodedId = encodeURIComponent(imageData.imageId);
      return `${API}/walkouts/image/${encodedId}`;
    }

    return null;
  };

  // Zoom handler using scroll wheel
  const handleImageWheel = (type, event) => {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? -10 : 10; // Scroll down = zoom out, scroll up = zoom in
    handleZoomChange(type, zoomDelta);
  };

  // Pan handlers - drag to move image
  const handleImageMouseDown = (event) => {
    event.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: event.clientX - imagePan.x,
      y: event.clientY - imagePan.y,
    });
  };

  const handleImageMouseMove = (event) => {
    if (!isDragging) return;
    event.preventDefault();

    // Calculate new pan position with reduced sensitivity
    const panSensitivity = 0.5; // Reduce sensitivity to 50%
    const newX = (event.clientX - dragStart.x) * panSensitivity;
    const newY = (event.clientY - dragStart.y) * panSensitivity;

    // Get current zoom scale
    const currentType = previewModal.type;
    const zoom = sidebarData.images[currentType]?.zoom || 100;
    const scale = zoom / 100;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate image dimensions (assuming image takes full viewport initially)
    const imageWidth = viewportWidth * scale;
    const imageHeight = viewportHeight * scale;

    // Calculate max pan limits to keep image within frame
    const maxPanX =
      Math.max(0, (imageWidth - viewportWidth) / 2) * panSensitivity;
    const maxPanY =
      Math.max(0, (imageHeight - viewportHeight) / 2) * panSensitivity;

    // Constrain pan within boundaries
    const constrainedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
    const constrainedY = Math.max(-maxPanY, Math.min(maxPanY, newY));

    setImagePan({
      x: constrainedX,
      y: constrainedY,
    });
  };

  const handleImageMouseUp = () => {
    setIsDragging(false);
  };

  // Close preview and reset states
  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, type: null });
    setImagePan({ x: 0, y: 0 });
    setIsDragging(false);
    setImageLoading(false);
  };

  // Check provider notes with AI
  const handleCheckWithAI = async () => {
    const providerText = formData.providerNotesFromES || "";
    const hygienistText = formData.hygienistNotesFromES || "";

    if (!providerText.trim() && !hygienistText.trim()) {
      setNotification({
        show: true,
        type: "error",
        message:
          "Please enter provider notes or hygienist notes before checking.",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
      return;
    }

    setIsCheckingWithAI(true);

    try {
      const result = await getGeminiResponse(providerText, hygienistText);
      // console.log("AI Response:", result);

      // result array format:
      // [0] provider_tooth_number, [1] provider_name, [2] provider_procedure_name, [3] provider_surgical_indicators,
      // [4] hygienist_tooth_number, [5] hygienist_name, [6] hygienist_procedure_name, [7] hygienist_surgical_indicators

      // Determine noteElement values based on AI response
      const procedureName = result[2] !== false || result[6] !== false; // provider or hygienist procedure
      const toothNumber = result[0] !== false || result[4] !== false; // provider or hygienist tooth#
      const providerName = result[1] !== false; // provider name
      const hygienistName = result[5] !== false; // hygienist name

      // Update noteElements state - Always show actual AI results
      const updatedNoteElements = {
        noteElement1: procedureName,
        noteElement2: toothNumber,
        noteElement3: providerName,
        noteElement4: hygienistName, // Always show actual AI result
      };

      setNoteElements(updatedNoteElements);

      // Update formData with noteElements and set checkedByAi to true
      setFormData((prev) => ({
        ...prev,
        noteElement1: updatedNoteElements.noteElement1,
        noteElement2: updatedNoteElements.noteElement2,
        noteElement3: updatedNoteElements.noteElement3,
        noteElement4: updatedNoteElements.noteElement4,
        checkedByAi: true, // Mark as checked by AI
      }));

      setNotification({
        show: true,
        type: "success",
        message: "AI check completed successfully!",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (error) {
      console.error("Error checking with AI:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to check with AI. Please try again.",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setIsCheckingWithAI(false);
    }
  };

  // Regenerate office walkout image data
  const handleRegenerateOfficeData = async () => {
    if (!walkoutId) {
      setNotification({
        show: true,
        type: "error",
        message: "Walkout ID not found. Please save the walkout first.",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
      return;
    }

    setIsRegeneratingOfficeData(true);

    try {
      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await fetchWithAuth(
        `${API}/office-walkout-ai/regenerate/${walkoutId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extractionMode: "manual",
            patientId: appointment?.["patient-id"] || "",
            dateOfService: appointment?.dos || "",
            officeName: officeName || "",
          }),
        },
      );

      const result = await response.json();
      // console.log("🔄 Regenerate Response:", result);

      if (result.success) {
        // Success - update with new data
        setOfficeWalkoutData((prev) => ({
          ...prev,
          extractedData: result.data.extractedData,
        }));

        // Update regeneration details for rate limiting
        if (result.data.regenerationDetails) {
          setRegenerationDetails(result.data.regenerationDetails);
        }

        setNotification({
          show: true,
          type: "success",
          message: `Data regenerated successfully! ${result.data.rowsExtracted} row(s) extracted.`,
        });
      } else if (result.errorCode === "RATE_LIMIT_EXCEEDED") {
        // Rate limit exceeded - keep old data, update regeneration details
        if (result.data?.extractedData) {
          setOfficeWalkoutData((prev) => ({
            ...prev,
            extractedData: result.data.extractedData,
          }));
        }

        if (result.details) {
          setRegenerationDetails({
            totalRegenerateCount: result.details.totalCount,
            hourlyRegenerateCount: result.details.hourlyCount,
            lastRegeneratedAt: result.details.lastRegeneratedAt,
            retryAfter: result.details.retryAfter,
          });
        }

        setNotification({
          show: true,
          type: "error",
          message: result.message,
        });
      } else {
        // Other errors
        setNotification({
          show: true,
          type: "error",
          message: result.message || "Failed to regenerate data.",
        });
      }

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
    } catch (error) {
      console.error("❌ Error regenerating office data:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to regenerate data. Please try again.",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setIsRegeneratingOfficeData(false);
    }
  };

  // Check if regeneration is allowed based on rate limit
  const isRegenerationDisabled = () => {
    if (!regenerationDetails) return false;

    const { hourlyRegenerateCount, lastRegeneratedAt, retryAfter } =
      regenerationDetails;

    // If retryAfter is set and in the future, disable button
    if (retryAfter) {
      const retryTime = new Date(retryAfter);
      const now = new Date();
      if (now < retryTime) {
        return true;
      }
    }

    // If hourly count >= 5 (backend limit updated to 5)
    if (hourlyRegenerateCount >= 5) {
      // Check if 1 hour has passed since last regeneration
      const lastRegen = new Date(lastRegeneratedAt);
      const now = new Date();
      const hourPassed = (now - lastRegen) / (1000 * 60 * 60); // hours

      if (hourPassed < 1) {
        return true;
      }
    }

    return false;
  };

  // Regenerate LC3 walkout image data
  const handleRegenerateLc3Data = async () => {
    if (!walkoutId) {
      setNotification({
        show: true,
        type: "error",
        message: "Walkout ID not found. Please save the walkout first.",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
      return;
    }

    setIsRegeneratingLc3Data(true);

    try {
      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const response = await fetchWithAuth(
        `${API}/lc3-walkout-ai/regenerate/${walkoutId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extractionMode: "manual",
            patientId: appointment?.["patient-id"] || "",
            dateOfService: appointment?.dos || "",
            officeName: officeName || "",
          }),
        },
      );

      const result = await response.json();
      // console.log("🔄 LC3 Regenerate Response:", result);

      if (result.success) {
        // Success - update with new data
        setLc3WalkoutData((prev) => ({
          ...prev,
          extractedData: result.data.extractedData,
        }));

        // Update regeneration details for rate limiting
        if (result.data.regenerationDetails) {
          setLc3RegenerationDetails(result.data.regenerationDetails);
        }

        setNotification({
          show: true,
          type: "success",
          message: `Data regenerated successfully! ${result.data.rowsExtracted} row(s) extracted.`,
        });
      } else if (result.errorCode === "RATE_LIMIT_EXCEEDED") {
        // Rate limit exceeded - keep old data, update regeneration details
        if (result.data?.extractedData) {
          setLc3WalkoutData((prev) => ({
            ...prev,
            extractedData: result.data.extractedData,
          }));
        }

        if (result.details) {
          setLc3RegenerationDetails({
            totalRegenerateCount: result.details.totalCount,
            hourlyRegenerateCount: result.details.hourlyCount,
            lastRegeneratedAt: result.details.lastRegeneratedAt,
            retryAfter: result.details.retryAfter,
          });
        }

        setNotification({
          show: true,
          type: "error",
          message: result.message,
        });
      } else {
        // Other errors
        setNotification({
          show: true,
          type: "error",
          message: result.message || "Failed to regenerate data.",
        });
      }

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 5000);
    } catch (error) {
      console.error("❌ Error regenerating LC3 data:", error);
      setNotification({
        show: true,
        type: "error",
        message: "Failed to regenerate data. Please try again.",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setIsRegeneratingLc3Data(false);
    }
  };

  // Check if LC3 regeneration is allowed based on rate limit
  const isLc3RegenerationDisabled = () => {
    if (!lc3RegenerationDetails) return false;

    const { hourlyRegenerateCount, lastRegeneratedAt, retryAfter } =
      lc3RegenerationDetails;

    // If retryAfter is set and in the future, disable button
    if (retryAfter) {
      const retryTime = new Date(retryAfter);
      const now = new Date();
      if (now < retryTime) {
        return true;
      }
    }

    // If hourly count >= 5 (backend limit is 5)
    if (hourlyRegenerateCount >= 5) {
      // Check if 1 hour has passed since last regeneration
      const lastRegen = new Date(lastRegeneratedAt);
      const now = new Date();
      const hourPassed = (now - lastRegen) / (1000 * 60 * 60); // hours

      if (hourPassed < 1) {
        return true;
      }
    }

    return false;
  };

  const handleImageClick = (type, event) => {
    event.stopPropagation(); // Prevent closing preview
    event.preventDefault();
    // Disabled old zoom - now using scroll wheel
  };

  const handleImageRightClick = (type, event) => {
    event.stopPropagation(); // Prevent closing preview
    event.preventDefault();
    // Disabled old zoom - now using scroll wheel
  };

  // On-Hold Addressed Dialog Handlers
  const handleOnHoldDialogOK = () => {
    setShowOnHoldDialog(false);

    // Proceed with the actual submission based on which section triggered the dialog
    if (pendingSubmitType === "office") {
      proceedOfficeSubmit();
    } else if (pendingSubmitType === "lc3") {
      proceedLC3Submit();
    }
  };

  const handleOnHoldDialogCancel = () => {
    setShowOnHoldDialog(false);
    setOnHoldAddressedValue(null);
    setPendingSubmitType(null);
  };

  // Handle form submission
  const handleOfficeSubmit = async () => {
    try {
      // Validate office section before submission
      const errors = validateOfficeSection(
        formData,
        isPatientPresent,
        isZeroProduction,
      );

      if (hasValidationErrors(errors)) {
        setOfficeValidationErrors(errors);

        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please update all the mandatory fields.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK",
        });

        // Scroll to office section
        const officeSection = document.querySelector('[data-section="office"]');
        if (officeSection) {
          officeSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        return;
      }

      // Clear validation errors if all validations pass
      setOfficeValidationErrors({});

      // Check if we need to show On-Hold Addressed dialog
      // Show dialog ONLY when:
      // 1. Walkout is already on-hold with office-side reasons
      // 2. isOnHoldAddressed was "No" or null (meaning issues not addressed yet)
      const currentPendingWith = sidebarData.pendingWith || "";
      const isCurrentlyOnHoldWithOffice =
        currentPendingWith === "Office" ||
        currentPendingWith === "IV Team & Office";

      const wasIssuePreviouslyNotAddressed =
        sidebarData.isOnHoldAddressed === "No" ||
        sidebarData.isOnHoldAddressed === null;

      if (
        isExistingWalkout &&
        isCurrentlyOnHoldWithOffice &&
        wasIssuePreviouslyNotAddressed
      ) {
        // Show dialog and wait for user response
        console.log("🔔 Showing On-Hold Addressed dialog for Office");
        setPendingSubmitType("office");
        setShowOnHoldDialog(true);
        return; // Stop here, will continue in proceedOfficeSubmit after dialog OK
      }

      // If no dialog needed, proceed directly
      await proceedOfficeSubmit();
    } catch (error) {
      console.error("❌ Office Submit Error:", error);
      setIsSubmitting(false);

      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Network error. Please check your connection.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
    }
  };

  // Actual Office submission logic (called after validation or dialog OK)
  const proceedOfficeSubmit = async () => {
    try {
      // Clear validation errors if all validations pass
      setOfficeValidationErrors({});

      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

      // Additional Image Validations
      const isPrimaryMode4 = formData.patientPortionPrimaryMode === 4;
      const isSecondaryMode4 = formData.patientPortionSecondaryMode === 4;
      const isPersonalCheckSelected = isPrimaryMode4 || isSecondaryMode4;

      // Reset image validation errors
      setImageValidationErrors({ officeWO: false, checkImage: false });

      // Validation 1: Check if lastFourDigitsCheckForte is required and valid
      if (
        isPersonalCheckSelected &&
        (!formData.lastFourDigitsCheckForte ||
          formData.lastFourDigitsCheckForte.length !== 4 ||
          !/^\d{4}$/.test(formData.lastFourDigitsCheckForte))
      ) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: "Please update all the mandatory fields.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK",
        });
        return;
      }

      // Validation 2: Check image is mandatory when Personal Check is selected
      if (isPersonalCheckSelected) {
        const hasCheckImage =
          sidebarData.images.checkImage.file ||
          sidebarData.images.checkImage.imageId;

        if (!hasCheckImage) {
          setImageValidationErrors((prev) => ({ ...prev, checkImage: true }));
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please update all the mandatory fields.",
            confirmButtonColor: "#dc2626",
            confirmButtonText: "OK",
          });
          return;
        }
      }

      // Validation 3: Office WO image is mandatory when patient came to appointment
      if (isPatientPresent) {
        const hasOfficeWO =
          sidebarData.images.officeWO.file ||
          sidebarData.images.officeWO.imageId;

        if (!hasOfficeWO) {
          setImageValidationErrors((prev) => ({ ...prev, officeWO: true }));
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: "Please update all the mandatory fields.",
            confirmButtonColor: "#dc2626",
            confirmButtonText: "OK",
          });
          return;
        }
      }

      // Show loading spinner
      setIsSubmitting(true);

      // Determine walkoutStatus and pendingWith based on conditions
      let walkoutStatus = "";
      let pendingWith = "";

      // Get the field values (using incrementalId from radio buttons)
      const patientCameToAppointment = formData.patientCame; // 1 = Yes, 2 = No
      const isPostOpZeroProduction = formData.postOpZeroProduction; // 1 = Yes, 2 = No

      console.log("🔍 Checking conditions:", {
        patientCame: patientCameToAppointment,
        postOpZeroProduction: isPostOpZeroProduction,
        isOnHoldAddressedValue: onHoldAddressedValue,
        currentPendingWith: sidebarData.pendingWith,
      });

      // Check if this is a re-submit after addressing on-hold issues
      const currentPendingWith = sidebarData.pendingWith || "";
      const isResubmitAfterAddressing = onHoldAddressedValue === "Yes";

      if (isResubmitAfterAddressing) {
        // Office has addressed the issues - transition status
        if (currentPendingWith === "Office") {
          walkoutStatus = "On Hold – LC3";
          pendingWith = "LC3";
        } else if (currentPendingWith === "IV Team & Office") {
          walkoutStatus = "On Hold – IV Team";
          pendingWith = "IV Team";
        }
        console.log("✅ Status transitioned after addressing:", {
          walkoutStatus,
          pendingWith,
        });
      } else {
        // Normal office submit logic
        // Condition 1: Patient came (1) AND NOT zero production (2)
        if (patientCameToAppointment === 1 && isPostOpZeroProduction === 2) {
          walkoutStatus = "Not Started";
          pendingWith = "Pending with LC3";
        }
        // Condition 2: Patient did NOT come (2)
        else if (patientCameToAppointment === 2) {
          walkoutStatus = "No Show/Cancel";
          pendingWith = "No Show/Cancel";
        }
        // Condition 3: Patient came (1) AND zero production (1)
        else if (
          patientCameToAppointment === 1 &&
          isPostOpZeroProduction === 1
        ) {
          walkoutStatus = "Completed by Office";
          pendingWith = "Completed";
        }
        console.log("✅ Determined values:", { walkoutStatus, pendingWith });
      }

      // Create FormData for multipart/form-data submission
      const formDataPayload = new FormData();

      // Add walkoutStatus and pendingWith
      if (walkoutStatus) {
        formDataPayload.append("walkoutStatus", walkoutStatus);
      }
      if (pendingWith) {
        formDataPayload.append("pendingWith", pendingWith);
      }

      // Add isOnHoldAddressed if dialog was shown and value selected
      if (onHoldAddressedValue) {
        formDataPayload.append("isOnHoldAddressed", onHoldAddressedValue);
        console.log("📤 Adding isOnHoldAddressed:", onHoldAddressedValue);
      }

      // 1. appointmentInfo (Required JSON string for image upload)
      formDataPayload.append(
        "appointmentInfo",
        JSON.stringify({
          patientId: appointmentDetails.patientId,
          dateOfService: appointmentDetails.dateOfService,
          officeName: appointmentDetails.office,
        }),
      );

      // 2. Office WO Snip image (Optional - send actual file if user selected)
      if (sidebarData.images.officeWO.file) {
        formDataPayload.append(
          "officeWalkoutSnip",
          sidebarData.images.officeWO.file,
        );
        // console.log(
        //   "📤 Uploading Office WO image:",
        //   sidebarData.images.officeWO.file.name,
        // );
      }

      // 2b. Check Image (Optional - send only if Personal Check is selected and file exists)
      // Reuse variables from validation section above

      if (isPersonalCheckSelected && sidebarData.images.checkImage.file) {
        formDataPayload.append(
          "checkImage",
          sidebarData.images.checkImage.file,
        );
        // console.log(
        //   "📤 Uploading Check Image:",
        //   sidebarData.images.checkImage.file.name,
        // );
      } else if (!isPersonalCheckSelected) {
        // If Personal Check is NOT selected, explicitly send blank/null to clear any existing image
        formDataPayload.append("checkImage", "");
        // console.log("🗑️ Clearing Check Image (Personal Check not selected)");
      }

      // 3. Add all office section fields directly to FormData
      // Backend will automatically convert strings to numbers
      if (!isExistingWalkout || !walkoutId) {
        formDataPayload.append("formRefId", appointmentId);
        formDataPayload.append("appointmentId", appointmentId);
        formDataPayload.append("openTime", openTime);
      }

      // Add all form fields as-is (backend handles type conversion)
      // console.log(
      //   "📤 Submitting formData.patientCame:",
      //   formData.patientCame,
      //   "Type:",
      //   typeof formData.patientCame,
      // );
      if (formData.patientCame !== undefined && formData.patientCame !== null) {
        formDataPayload.append("patientCame", formData.patientCame);
        // console.log("✅ patientCame appended to FormData");
      } else {
        // console.log("❌ patientCame is undefined or null - NOT appended!");
      }
      if (
        formData.postOpZeroProduction !== undefined &&
        formData.postOpZeroProduction !== null
      ) {
        formDataPayload.append(
          "postOpZeroProduction",
          formData.postOpZeroProduction,
        );
      }
      if (formData.patientType !== undefined && formData.patientType !== null) {
        formDataPayload.append("patientType", formData.patientType);
      }
      if (
        formData.hasInsurance !== undefined &&
        formData.hasInsurance !== null
      ) {
        formDataPayload.append("hasInsurance", formData.hasInsurance);
      }
      if (
        formData.insuranceType !== undefined &&
        formData.insuranceType !== null
      ) {
        formDataPayload.append("insuranceType", formData.insuranceType);
      }
      if (formData.insurance !== undefined && formData.insurance !== null) {
        formDataPayload.append("insurance", formData.insurance);
      }
      if (
        formData.googleReviewRequest !== undefined &&
        formData.googleReviewRequest !== null
      ) {
        formDataPayload.append(
          "googleReviewRequest",
          formData.googleReviewRequest,
        );
      }
      if (
        formData.expectedPatientPortionOfficeWO !== undefined &&
        formData.expectedPatientPortionOfficeWO !== null &&
        formData.expectedPatientPortionOfficeWO !== ""
      ) {
        formDataPayload.append(
          "expectedPatientPortionOfficeWO",
          formData.expectedPatientPortionOfficeWO,
        );
      }
      if (
        formData.patientPortionCollected !== undefined &&
        formData.patientPortionCollected !== null &&
        formData.patientPortionCollected !== ""
      ) {
        formDataPayload.append(
          "patientPortionCollected",
          formData.patientPortionCollected,
        );
      }
      if (
        formData.differenceInPatientPortion !== undefined &&
        formData.differenceInPatientPortion !== null &&
        formData.differenceInPatientPortion !== ""
      ) {
        formDataPayload.append(
          "differenceInPatientPortion",
          formData.differenceInPatientPortion,
        );
      }
      if (
        formData.patientPortionPrimaryMode !== undefined &&
        formData.patientPortionPrimaryMode !== null
      ) {
        formDataPayload.append(
          "patientPortionPrimaryMode",
          formData.patientPortionPrimaryMode,
        );
      }
      if (
        formData.amountCollectedPrimaryMode !== undefined &&
        formData.amountCollectedPrimaryMode !== null &&
        formData.amountCollectedPrimaryMode !== ""
      ) {
        formDataPayload.append(
          "amountCollectedPrimaryMode",
          formData.amountCollectedPrimaryMode,
        );
      }
      if (
        formData.patientPortionSecondaryMode !== undefined &&
        formData.patientPortionSecondaryMode !== null
      ) {
        formDataPayload.append(
          "patientPortionSecondaryMode",
          formData.patientPortionSecondaryMode,
        );
      }
      if (
        formData.amountCollectedSecondaryMode !== undefined &&
        formData.amountCollectedSecondaryMode !== null &&
        formData.amountCollectedSecondaryMode !== ""
      ) {
        formDataPayload.append(
          "amountCollectedSecondaryMode",
          formData.amountCollectedSecondaryMode,
        );
      }
      if (
        formData.lastFourDigitsCheckForte !== undefined &&
        formData.lastFourDigitsCheckForte !== null &&
        formData.lastFourDigitsCheckForte !== ""
      ) {
        formDataPayload.append(
          "lastFourDigitsCheckForte",
          formData.lastFourDigitsCheckForte,
        );
      }
      if (
        formData.reasonLessCollection !== undefined &&
        formData.reasonLessCollection !== null
      ) {
        formDataPayload.append(
          "reasonLessCollection",
          formData.reasonLessCollection,
        );
      }
      if (
        formData.ruleEngineRun !== undefined &&
        formData.ruleEngineRun !== null
      ) {
        formDataPayload.append("ruleEngineRun", formData.ruleEngineRun);
      }
      if (
        formData.ruleEngineNotRunReason !== undefined &&
        formData.ruleEngineNotRunReason !== null
      ) {
        formDataPayload.append(
          "ruleEngineNotRunReason",
          formData.ruleEngineNotRunReason,
        );
      }
      if (
        formData.ruleEngineError !== undefined &&
        formData.ruleEngineError !== null
      ) {
        formDataPayload.append("ruleEngineError", formData.ruleEngineError);
      }
      if (formData.issuesFixed !== undefined && formData.issuesFixed !== null) {
        formDataPayload.append("issuesFixed", formData.issuesFixed);
      }
      if (
        formData.officeRemarks !== undefined &&
        formData.officeRemarks !== null
      ) {
        formDataPayload.append("officeRemarks", formData.officeRemarks);
      }
      if (
        formData.newOfficeNote !== undefined &&
        formData.newOfficeNote !== null &&
        formData.newOfficeNote !== ""
      ) {
        formDataPayload.append("newOfficeNote", formData.newOfficeNote);
      }

      // Patient Portion fields - additional
      if (
        formData.lastFourDigitsCreditCardPatientCharge !== undefined &&
        formData.lastFourDigitsCreditCardPatientCharge !== null &&
        formData.lastFourDigitsCreditCardPatientCharge !== ""
      ) {
        formDataPayload.append(
          "lastFourDigitsCreditCardPatientCharge",
          formData.lastFourDigitsCreditCardPatientCharge,
        );
      }
      if (
        formData.lastFourDigitsCheckPatientCharge !== undefined &&
        formData.lastFourDigitsCheckPatientCharge !== null &&
        formData.lastFourDigitsCheckPatientCharge !== ""
      ) {
        formDataPayload.append(
          "lastFourDigitsCheckPatientCharge",
          formData.lastFourDigitsCheckPatientCharge,
        );
      }
      if (
        formData.patientPaidAnyAtOffice !== undefined &&
        formData.patientPaidAnyAtOffice !== null
      ) {
        formDataPayload.append(
          "patientPaidAnyAtOffice",
          formData.patientPaidAnyAtOffice,
        );
      }
      if (
        formData.ifPaidHowMuchPatient !== undefined &&
        formData.ifPaidHowMuchPatient !== null &&
        formData.ifPaidHowMuchPatient !== ""
      ) {
        formDataPayload.append(
          "ifPaidHowMuchPatient",
          formData.ifPaidHowMuchPatient,
        );
      }
      if (
        formData.lastFourDigitsCreditCardForte !== undefined &&
        formData.lastFourDigitsCreditCardForte !== null &&
        formData.lastFourDigitsCreditCardForte !== ""
      ) {
        formDataPayload.append(
          "lastFourDigitsCreditCardForte",
          formData.lastFourDigitsCreditCardForte,
        );
      }

      // Rule Engine fields - additional
      if (
        formData.errorFixRemarks !== undefined &&
        formData.errorFixRemarks !== null
      ) {
        formDataPayload.append("errorFixRemarks", formData.errorFixRemarks);
      }

      // Document checkboxes
      if (
        formData.signedGeneralConsent !== undefined &&
        formData.signedGeneralConsent !== null
      ) {
        formDataPayload.append(
          "signedGeneralConsent",
          formData.signedGeneralConsent,
        );
      }
      if (
        formData.signedTreatmentConsent !== undefined &&
        formData.signedTreatmentConsent !== null
      ) {
        formDataPayload.append(
          "signedTreatmentConsent",
          formData.signedTreatmentConsent,
        );
      }
      if (
        formData.preAuthAvailable !== undefined &&
        formData.preAuthAvailable !== null
      ) {
        formDataPayload.append("preAuthAvailable", formData.preAuthAvailable);
      }
      if (
        formData.signedTxPlan !== undefined &&
        formData.signedTxPlan !== null
      ) {
        formDataPayload.append("signedTxPlan", formData.signedTxPlan);
      }
      if (formData.perioChart !== undefined && formData.perioChart !== null) {
        formDataPayload.append("perioChart", formData.perioChart);
      }
      if (formData.nvd !== undefined && formData.nvd !== null) {
        formDataPayload.append("nvd", formData.nvd);
      }
      if (
        formData.xRayPanoAttached !== undefined &&
        formData.xRayPanoAttached !== null
      ) {
        formDataPayload.append("xRayPanoAttached", formData.xRayPanoAttached);
      }
      if (
        formData.majorServiceForm !== undefined &&
        formData.majorServiceForm !== null
      ) {
        formDataPayload.append("majorServiceForm", formData.majorServiceForm);
      }
      if (formData.routeSheet !== undefined && formData.routeSheet !== null) {
        formDataPayload.append("routeSheet", formData.routeSheet);
      }
      if (
        formData.prcUpdatedInRouteSheet !== undefined &&
        formData.prcUpdatedInRouteSheet !== null
      ) {
        formDataPayload.append(
          "prcUpdatedInRouteSheet",
          formData.prcUpdatedInRouteSheet,
        );
      }
      if (formData.narrative !== undefined && formData.narrative !== null) {
        formDataPayload.append("narrative", formData.narrative);
      }

      // console.log("📤 Sending FormData Payload for Office Section");

      // Debug: Log all FormData entries
      // console.log("🔍 FormData Contents:");
      // eslint-disable-next-line no-unused-vars
      for (let [_key, value] of formDataPayload.entries()) {
        if (value instanceof File) {
          // console.log(`  ${_key}: [File] ${value.name}`);
        } else {
          // console.log(`  ${_key}: ${value} (type: ${typeof value})`);
        }
      }

      // console.log("🔍 Submit State Check:", {
      //   isExistingWalkout,
      //   walkoutId,
      //   willUsePUT: isExistingWalkout && walkoutId,
      //   endpoint:
      //     isExistingWalkout && walkoutId
      //       ? `PUT /walkouts/${walkoutId}/office`
      //       : "POST /walkouts/submit-office",
      // });

      let response;
      if (isExistingWalkout && walkoutId) {
        // Update existing walkout
        // console.log(`🔄 Updating existing walkout: ${walkoutId}`);
        response = await fetchWithAuth(`${API}/walkouts/${walkoutId}/office`, {
          method: "PUT",
          // Don't set Content-Type - browser will set it automatically with boundary
          body: formDataPayload,
        });
      } else {
        // Create new walkout
        // console.log("✨ Creating new walkout");
        response = await fetchWithAuth(`${API}/walkouts/submit-office`, {
          method: "POST",
          // Don't set Content-Type - browser will set it automatically with boundary
          body: formDataPayload,
        });
      }

      const result = await response.json();

      // console.log("📥 Backend Response:", {
      //   status: response.status,
      //   ok: response.ok,
      //   isUpdate: isExistingWalkout,
      //   walkoutId: walkoutId,
      //   result: result,
      // });

      if (response.ok) {
        // Update imageId from response if image was uploaded
        if (result.data?.officeWalkoutSnip?.imageId) {
          // Revoke preview URL to free memory
          if (sidebarData.images.officeWO.previewUrl) {
            URL.revokeObjectURL(sidebarData.images.officeWO.previewUrl);
          }

          setSidebarData((prev) => ({
            ...prev,
            images: {
              ...prev.images,
              officeWO: {
                file: null, // Clear file after upload
                previewUrl: "", // Clear preview URL
                imageId: result.data.officeWalkoutSnip.imageId, // Save imageId from backend
                zoom: 100,
              },
            },
          }));
          // console.log(
          //   "🖼️ Office WO Image uploaded successfully! ImageId:",
          //   result.data.officeWalkoutSnip.imageId,
          // );
        }

        // Update Check Image imageId from response if image was uploaded
        if (result.data?.checkImage?.imageId) {
          // Revoke preview URL to free memory
          if (sidebarData.images.checkImage.previewUrl) {
            URL.revokeObjectURL(sidebarData.images.checkImage.previewUrl);
          }

          setSidebarData((prev) => ({
            ...prev,
            images: {
              ...prev.images,
              checkImage: {
                file: null, // Clear file after upload
                previewUrl: "", // Clear preview URL
                imageId: result.data.checkImage.imageId, // Save imageId from backend
                zoom: 100,
              },
            },
          }));
          // console.log(
          //   "🖼️ Check Image uploaded successfully! ImageId:",
          //   result.data.checkImage.imageId,
          // );
        }

        // Show success notification
        setIsSubmitting(false);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Office section submitted successfully!",
          confirmButtonColor: "#10b981",
          confirmButtonText: "OK",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          // Clear form data
          setFormData({});
          setWalkoutId(null);
          setIsExistingWalkout(false);
          // Navigate back to appointments list
          navigate(-1); // Go back to previous page
        });

        // Save walkoutId after first submit
        if (!isExistingWalkout && result.data._id) {
          setWalkoutId(result.data._id);
          setIsExistingWalkout(true);
          localStorage.setItem(`walkout_${appointmentId}`, result.data._id);
        }
      } else {
        console.error("❌ Submit failed:", result);
        setIsSubmitting(false);

        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: result.message || "Failed to submit. Please try again.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setIsSubmitting(false);

      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Network error. Please check your connection.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
    }
  };

  const handleLC3Submit = async () => {
    if (!walkoutId) {
      Swal.fire({
        icon: "error",
        title: "Walkout ID Missing",
        text: "No walkout ID found. Please submit office section first.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validate LC3 section before submitting
    const errors = validateLC3Section(lc3Data, formData, sidebarData);
    setLc3ValidationErrors(errors);

    if (hasValidationErrors(errors)) {
      // Check if the specific error is about pending Update button
      if (errors.updateButtonPending) {
        setNotification({
          show: true,
          message:
            "Please click the 'Update' button to fetch failed rules before submitting.",
          type: "error",
        });
        setTimeout(() => {
          setNotification({ show: false, message: "", type: "" });
        }, 4000);

        // Scroll to rule engine section
        const ruleEngineSection = document.querySelector(
          '[data-field-id="' + FIELD_IDS.LC3_RUN_RULES + '"]',
        );
        if (ruleEngineSection) {
          ruleEngineSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else {
        setNotification({
          show: true,
          message: "Please fill all mandatory fields highlighted in red.",
          type: "error",
        });
        setTimeout(() => {
          setNotification({ show: false, message: "", type: "" });
        }, 4000);

        // Find first error field and scroll to it
        const errorFieldNames = Object.keys(errors);
        if (errorFieldNames.length > 0) {
          const firstErrorName = errorFieldNames[0];

          // Try to find the element by various selectors
          let errorElement =
            document.querySelector(`[name="${firstErrorName}"]`) ||
            document.querySelector(`[data-field-name="${firstErrorName}"]`) ||
            document.querySelector(`.WF-validation-error`);

          if (errorElement) {
            errorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }
      return;
    }

    // Check if LC3 is completing the walkout (not putting on hold)
    const isLC3Completing = formData.walkoutOnHold === 2;

    // If completing, no need for dialog - proceed directly
    if (isLC3Completing) {
      console.log("✅ LC3 completing walkout - no dialog needed");
      await proceedLC3Submit();
      return;
    }

    // Check if we need to show On-Hold Addressed dialog for LC3
    // Case 1: Office has indicated they addressed issues (isOnHoldAddressed = "Yes")
    const officeClaimsAddressed = sidebarData.isOnHoldAddressed === "Yes";
    const currentPendingWith = sidebarData.pendingWith || "";
    const isCurrentlyOnHold =
      currentPendingWith === "LC3" ||
      currentPendingWith === "IV Team" ||
      currentPendingWith === "Office" ||
      currentPendingWith === "IV Team & Office";

    // Case 2: LC3 is putting walkout on-hold again (walkoutOnHold = 1)
    const isLC3PuttingOnHold = formData.walkoutOnHold === 1;

    if (officeClaimsAddressed && isCurrentlyOnHold && isLC3PuttingOnHold) {
      // Pre-fill with "Yes" since office claims they addressed issues
      console.log(
        "🔔 Showing On-Hold Addressed dialog for LC3 (pre-filled with Yes - Office addressed)",
      );
      setOnHoldAddressedValue("Yes"); // Pre-fill with Yes
      setPendingSubmitType("lc3");
      setShowOnHoldDialog(true);
      return; // Stop here, will continue in proceedLC3Submit after dialog OK
    } else if (isLC3PuttingOnHold && sidebarData.isOnHoldAddressed === "Yes") {
      // LC3 is putting on-hold again, but previously it was marked as addressed
      // Show dialog to confirm if issues are still addressed or not
      console.log(
        "🔔 Showing On-Hold Addressed dialog for LC3 (re-checking addressed status)",
      );
      setOnHoldAddressedValue("Yes"); // Pre-fill with previous value
      setPendingSubmitType("lc3");
      setShowOnHoldDialog(true);
      return;
    }

    // If no dialog needed, proceed directly
    await proceedLC3Submit();
  };

  // Actual LC3 submission logic (called after validation or dialog OK)
  const proceedLC3Submit = async () => {
    try {
      // Show loading spinner
      setIsSubmitting(true);

      // Stop timer and save session for LC3 team
      if (isLC3TeamMember() && sidebarData.timer.currentSession.isActive) {
        clearInterval(timerInterval);

        const sessionDuration = sidebarData.timer.currentSession.elapsedSeconds;
        const completedAt = new Date().toISOString();
        const userName =
          currentUser.name || currentUser.email || "Unknown User";

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
      }

      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

      // Determine walkoutStatus, isOnHoldAddressed, and pendingWith based on LC3 conditions
      let walkoutStatus = "";
      let isOnHoldAddressed = null; // Will be set based on conditions or dialog
      let pendingWith = "";

      // Get the field values
      const walkoutOnHold = formData.walkoutOnHold; // 1 = Yes, 2 = No
      const completingWithDeficiency = formData.completingWithDeficiency; // 1 = Yes, 2 = No
      const onHoldReasons = formData.onHoldReasons || []; // Array of numbers

      console.log("🔍 LC3 Submit - Checking conditions:", {
        walkoutOnHold,
        completingWithDeficiency,
        onHoldReasons,
        dateOfService: appointmentDetails.dateOfService,
      });

      // Check if On Hold (walkoutOnHold = 1)
      if (walkoutOnHold === 1) {
        // Check which teams are responsible for on-hold
        const hasIVTeamReasons = onHoldReasons.some(
          (reason) => reason === 13 || reason === 142,
        );
        const hasOfficeReasons = onHoldReasons.some(
          (reason) => reason !== 13 && reason !== 142,
        );

        console.log("🔍 On Hold Reasons Analysis:", {
          hasIVTeamReasons,
          hasOfficeReasons,
        });

        // Determine walkoutStatus based on which teams have reasons
        if (hasIVTeamReasons && hasOfficeReasons) {
          walkoutStatus = "On Hold – IV Team & Office";
          pendingWith = "IV Team & Office";
        } else if (hasIVTeamReasons) {
          walkoutStatus = "On Hold – IV Team";
          pendingWith = "IV Team";
        } else if (hasOfficeReasons) {
          walkoutStatus = "On Hold – Office";
          pendingWith = "Office";
        }

        // Use dialog value if available, otherwise default to "No"
        isOnHoldAddressed = onHoldAddressedValue || "No";
      }
      // Check if completed (walkoutOnHold = 2)
      else if (walkoutOnHold === 2) {
        // Compare DOS with today's date to determine Same Day or With Delay
        const dosDate = new Date(appointmentDetails.dateOfService);
        const today = new Date();

        // Reset time to compare only dates
        dosDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const isSameDay = dosDate.getTime() === today.getTime();

        console.log("📅 Date comparison:", {
          dosDate: dosDate.toISOString(),
          today: today.toISOString(),
          isSameDay,
        });

        // Determine walkoutStatus based on date and deficiency
        if (isSameDay) {
          if (completingWithDeficiency === 2) {
            walkoutStatus = "Completed – Same Day";
          } else if (completingWithDeficiency === 1) {
            walkoutStatus = "Completed – Same Day with Deficiency";
          }
        } else {
          if (completingWithDeficiency === 2) {
            walkoutStatus = "Completed – With Delay";
          } else if (completingWithDeficiency === 1) {
            walkoutStatus = "Completed – With Delay & Deficiency";
          }
        }

        pendingWith = "Completed";
        // When completing, don't send isOnHoldAddressed (set to null/empty)
        isOnHoldAddressed = null;
      }

      console.log("✅ LC3 Determined values:", {
        walkoutStatus,
        pendingWith,
        isOnHoldAddressed,
      });

      // Build LC3 payload according to EXACT backend schema from LC3_IMPLEMENTATION_SUMMARY.md
      const lc3Payload = {
        // 1. Rule Engine
        ruleEngine: {
          fieldsetStatus: lc3Data.fieldsetStatus, // "incomplete" | "complete"
          didLc3RunRules: lc3Data.didLc3RunRules, // Number (1=Yes, 2=No)
          ruleEngineUniqueId: lc3Data.ruleEngineUniqueId, // String
          reasonForNotRun: lc3Data.reasonForNotRun, // String
          failedRules: lc3Data.failedRules.map((rule, index) => ({
            ...rule,
            resolved: formData[`failedRule${index}`] || null, // Radio button value (1=Yes, 2=No, etc.)
          })), // Array of {message: String, resolved: Number}
          lastFetchedId: lc3Data.lastFetchedId, // String
        },

        // 2. Document Check - 10 fields (status + 9 documents)
        documentCheck: {
          lc3DocumentCheckStatus: formData.lc3DocumentCheckStatus, // Number (incrementalId)
          signedTreatmentPlanAvailable: formData.signedTreatmentPlanAvailable, // Number
          prcAvailable: formData.prcAvailable, // Number
          signedConsentGeneralAvailable: formData.signedConsentGeneralAvailable, // Number
          nvdAvailable: formData.nvdAvailable, // Number
          narrativeAvailable: formData.narrativeAvailable, // Number
          signedConsentTxAvailable: formData.signedConsentTxAvailable, // Number
          preAuthAvailable: formData.lc3PreAuthAvailable, // Number
          routeSheetAvailable: formData.routeSheetAvailable, // Number
          orthoQuestionnaireAvailable: formData.orthoQuestionnaireAvailable, // Number
        },

        // 3. Attachments Check - 6 fields (status + 5 attachments)
        attachmentsCheck: {
          lc3AttachmentsCheckStatus: formData.lc3AttachmentsCheckStatus, // Number (incrementalId)
          pano: formData.pano, // Number
          fmx: formData.fmx, // Number
          bitewing: formData.bitewing, // Number
          pa: formData.pa, // Number
          perioChart: formData.lc3PerioChart, // Number
        },

        // 4. Patient Portion Check - 15 fields as per backend schema
        patientPortionCheck: {
          lc3PatientPortionStatus: formData.lc3PatientPortionStatus, // Number (incrementalId)
          // Office calculations (3 fields)
          expectedPPOffice: formData.expectedPPOffice, // Number
          ppCollectedOffice: formData.ppCollectedOffice, // Number
          ppDifferenceOffice: formData.ppDifferenceOffice, // Number
          // NVD question
          signedNVDForDifference: formData.signedNVDForDifference, // Number (1=Yes, 2=No)
          // LC3 calculations (2 fields)
          expectedPPLC3: formData.expectedPPLC3, // Number
          ppDifferenceLC3: formData.ppDifferenceLC3, // Number (calculated)
          // Primary payment verification (3 fields)
          ppPrimaryMode: formData.ppPrimaryMode, // Number (dropdown ID)
          amountPrimaryMode: formData.amountPrimaryMode, // Number
          paymentVerifiedFromPrimary: formData.paymentVerifiedFromPrimary, // Number (dropdown ID)
          // Secondary payment verification (3 fields)
          ppSecondaryMode: formData.ppSecondaryMode, // Number (dropdown ID)
          amountSecondaryMode: formData.amountSecondaryMode, // Number
          paymentVerifiedFromSecondary: formData.paymentVerifiedFromSecondary, // Number (dropdown ID)
          // Bottom questions (2 fields)
          verifyCheckMatchesES: formData.verifyCheckMatchesES, // Number (1=Yes, 2=No)
          forteCheckAvailable: formData.forteCheckAvailable, // Number (1=Yes, 2=No)
        },

        // 5. Production Details - 24 fields as per backend schema
        productionDetails: {
          lc3ProductionStatus: formData.lc3ProductionStatus, // Number (incrementalId)
          // Office production calculations (3 fields)
          totalProductionOffice: formData.totalProductionOffice, // Number
          estInsuranceOffice: formData.estInsuranceOffice, // Number
          expectedPPOfficeProduction: formData.expectedPPOfficeProduction, // Number
          // LC3 production calculations (3 fields)
          totalProductionLC3: formData.totalProductionLC3, // Number
          estInsuranceLC3: formData.estInsuranceLC3, // Number
          expectedPPLC3Production: formData.expectedPPLC3Production, // Number
          // Differences [LC3 - Office] (3 fields)
          totalProductionDifference: formData.totalProductionDifference, // Number (calculated)
          estInsuranceDifference: formData.estInsuranceDifference, // Number (calculated)
          expectedPPDifference: formData.expectedPPDifference, // Number (calculated)
          // Reason fields - only send if difference != 0
          reasonTotalProductionDiff:
            (Number(formData.totalProductionDifference) || 0) !== 0
              ? formData.reasonTotalProductionDiff
              : "", // Number (dropdown ID) or empty
          reasonEstInsuranceDiff:
            (Number(formData.estInsuranceDifference) || 0) !== 0
              ? formData.reasonEstInsuranceDiff
              : "", // Number (dropdown ID) or empty
          // Explanation fields - only send if difference != 0
          explanationTotalProductionDiff:
            (Number(formData.totalProductionDifference) || 0) !== 0
              ? formData.explanationTotalProductionDiff
              : "", // String or empty
          explanationEstInsuranceDiff:
            (Number(formData.estInsuranceDifference) || 0) !== 0
              ? formData.explanationEstInsuranceDiff
              : "", // String or empty
          // Walkout questions (9 fields)
          // informedOfficeManager - only send if any difference != 0
          informedOfficeManager:
            (Number(formData.totalProductionDifference) || 0) !== 0 ||
            (Number(formData.estInsuranceDifference) || 0) !== 0
              ? formData.informedOfficeManager
              : "", // Number (1=Yes, 2=No) or empty
          // googleReviewSent - only send if Office googleReviewRequest === 1
          googleReviewSent:
            formData.googleReviewRequest === 1 ? formData.googleReviewSent : "", // Number (1=Yes, 2=No) or empty
          containsCrownDentureImplant: formData.containsCrownDentureImplant, // Number (1=Yes, 2=No)
          // crownPaidOn - only send if containsCrownDentureImplant === 1
          crownPaidOn:
            formData.containsCrownDentureImplant === 1
              ? formData.crownPaidOn
              : "", // Number (dropdown ID) or empty
          // deliveredAsPerNotes - only send if crownPaidOn === 2
          deliveredAsPerNotes:
            formData.containsCrownDentureImplant === 1 &&
            formData.crownPaidOn === 2
              ? formData.deliveredAsPerNotes
              : "", // Number (1=Yes, 2=No) or empty
          walkoutOnHold: formData.walkoutOnHold, // Number (1=Yes, 2=No)
          // onHoldReasons - only send if walkoutOnHold === 1
          onHoldReasons:
            formData.walkoutOnHold === 1 ? formData.onHoldReasons || [] : [], // Array of Numbers or empty array
          // otherReasonNotes - only send if walkoutOnHold === 1
          otherReasonNotes:
            formData.walkoutOnHold === 1 ? formData.otherReasonNotes : "", // String or empty
          // completingWithDeficiency - only send if walkoutOnHold === 2
          completingWithDeficiency:
            formData.walkoutOnHold === 2
              ? formData.completingWithDeficiency
              : "", // Number (1=Yes, 2=No) or empty
        },

        // 6. Provider Notes - 11 fields as per backend schema
        providerNotes: {
          lc3ProviderNotesStatus: formData.lc3ProviderNotesStatus, // Number (incrementalId)
          // 3 main questions
          doctorNoteCompleted: formData.doctorNoteCompleted, // Number (1=Yes, 2=No)
          notesUpdatedOnDOS: formData.notesUpdatedOnDOS, // Number (1=Yes, 2=No)
          noteIncludesFourElements: formData.noteIncludesFourElements, // Number (1=Yes, 2=No)
          // 4 element checkboxes
          noteElement1: formData.noteElement1, // String or Boolean
          noteElement2: formData.noteElement2, // String or Boolean
          noteElement3: formData.noteElement3, // String or Boolean
          noteElement4: formData.noteElement4, // String or Boolean
          // 2 text areas - map frontend field names to backend fields
          providerNotes: formData.providerNotesFromES, // String
          hygienistNotes: formData.hygienistNotesFromES, // String
          // AI check status
          checkedByAi: formData.checkedByAi || false, // Boolean - indicates if "Check with AI" was performed
        },

        // Additional LC3 Fields
        lc3Remarks: formData.lc3Remarks, // String - Overall LC3 remarks
      };

      // Add current lc3Remarks to lc3HistoricalNotes array if present
      if (formData.lc3Remarks && formData.lc3Remarks.trim()) {
        lc3Payload.lc3HistoricalNotes = [
          ...(formData.lc3HistoricalNotes || []),
          formData.lc3Remarks.trim(),
        ];
      }

      // Add on-hold note if present (backend will add to onHoldNotes array)
      if (formData.newOnHoldNote && formData.newOnHoldNote.trim()) {
        lc3Payload.onHoldNote = formData.newOnHoldNote.trim();
      }

      // console.log("📤 Submitting LC3 Payload:", lc3Payload);

      // Get current time in IST timezone and format as ISO string
      const getISTTime = () => {
        const now = new Date();
        // Format date in IST timezone
        const istString = now
          .toLocaleString("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
          .replace(", ", "T");
        return istString + ".000Z"; // ISO format
      };
      const sessionEndTime = getISTTime();

      // Create FormData for LC3 submission
      const formDataPayload = new FormData();

      // Add walkoutStatus, isOnHoldAddressed, and pendingWith
      if (walkoutStatus) {
        formDataPayload.append("walkoutStatus", walkoutStatus);
      }
      if (isOnHoldAddressed) {
        formDataPayload.append("isOnHoldAddressed", isOnHoldAddressed);
      }
      if (pendingWith) {
        formDataPayload.append("pendingWith", pendingWith);
      }

      // Add session start and end times (both in IST)
      formDataPayload.append(
        "sessionStartDateTime",
        sessionStartTime || sessionEndTime,
      );
      formDataPayload.append("sessionEndDateTime", sessionEndTime);

      // 1. Add LC3 WO Image first (optional)
      if (sidebarData.images.lc3WO.file) {
        formDataPayload.append(
          "lc3WalkoutImage",
          sidebarData.images.lc3WO.file,
        );
        // console.log(
        //   "📤 Including LC3 WO image in FormData:",
        //   sidebarData.images.lc3WO.file.name,
        //   "| Size:",
        //   sidebarData.images.lc3WO.file.size,
        //   "bytes",
        // );
      } else {
        // console.log("ℹ️ No LC3 WO image to upload");
      }

      // 2. Rule Engine (as JSON string)
      formDataPayload.append(
        "ruleEngine",
        JSON.stringify(lc3Payload.ruleEngine),
      );

      // 3. Document Check (as JSON string)
      formDataPayload.append(
        "documentCheck",
        JSON.stringify(lc3Payload.documentCheck),
      );

      // 4. Attachments Check (as JSON string)
      formDataPayload.append(
        "attachmentsCheck",
        JSON.stringify(lc3Payload.attachmentsCheck),
      );

      // 5. Patient Portion Check (as JSON string)
      formDataPayload.append(
        "patientPortionCheck",
        JSON.stringify(lc3Payload.patientPortionCheck),
      );

      // 6. Production Details (as JSON string)
      formDataPayload.append(
        "productionDetails",
        JSON.stringify(lc3Payload.productionDetails),
      );

      // 7. Provider Notes (as JSON string)
      formDataPayload.append(
        "providerNotes",
        JSON.stringify(lc3Payload.providerNotes),
      );

      // 8. LC3 Remarks (plain string, optional)
      if (lc3Payload.lc3Remarks) {
        formDataPayload.append("lc3Remarks", lc3Payload.lc3Remarks);
      }

      // 9. LC3 Historical Notes (as JSON string array, optional)
      if (lc3Payload.lc3HistoricalNotes) {
        formDataPayload.append(
          "lc3HistoricalNotes",
          JSON.stringify(lc3Payload.lc3HistoricalNotes),
        );
      }

      // 10. On Hold Note (plain string, optional)
      if (lc3Payload.onHoldNote) {
        formDataPayload.append("onHoldNote", lc3Payload.onHoldNote);
      }

      // console.log("📤 Sending to:", `${API}/walkouts/${walkoutId}/lc3`);
      // console.log("📤 FormData keys:", Array.from(formDataPayload.keys()));

      const response = await fetchWithAuth(`${API}/walkouts/${walkoutId}/lc3`, {
        method: "PUT",
        body: formDataPayload, // Send FormData with separate fields
      });

      const result = await response.json();

      // console.log("📥 LC3 Backend Response:", result);

      if (response.ok && result.success) {
        // Clear LC3 WO image from sidebar if it was uploaded
        if (sidebarData.images.lc3WO.file) {
          // Revoke preview URL to free memory
          if (sidebarData.images.lc3WO.previewUrl) {
            URL.revokeObjectURL(sidebarData.images.lc3WO.previewUrl);
          }

          setSidebarData((prev) => ({
            ...prev,
            images: {
              ...prev.images,
              lc3WO: {
                file: null,
                previewUrl: "",
                imageId: result.data?.lc3WalkoutImage?.imageId || "",
                zoom: 100,
              },
            },
          }));

          // console.log(
          //   "🖼️ LC3 WO Image uploaded successfully! ImageId:",
          //   result.data?.lc3WalkoutImage?.imageId,
          // );
        }

        setIsSubmitting(false);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: result.message || "LC3 section submitted successfully!",
          confirmButtonColor: "#10b981",
          confirmButtonText: "OK",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          // Clear form data
          setFormData({});
          setWalkoutId(null);
          setIsExistingWalkout(false);
          // Navigate back to appointments list
          navigate(-1); // Go back to previous page
        });

        // Clear the new note field after successful submission
        setFormData((prev) => ({ ...prev, newOnHoldNote: "" }));

        // Update the walkout data if needed
        if (result.data && result.data.lc3Section) {
          // Update onHoldNotes if they exist in response
          if (result.data.lc3Section.onHoldNotes) {
            setFormData((prev) => ({
              ...prev,
              onHoldNotes: result.data.lc3Section.onHoldNotes,
            }));
          }
        }
      } else {
        setIsSubmitting(false);

        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text:
            result.message || "Failed to submit LC3 section. Please try again.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("❌ Error submitting LC3 section:", error);
      setIsSubmitting(false);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error submitting LC3 section. Please try again.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
    }
  };

  const handleAuditSubmit = async () => {
    if (!walkoutId) {
      Swal.fire({
        icon: "error",
        title: "Walkout ID Missing",
        text: "No walkout ID found. Please submit office and LC3 sections first.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
      return;
    }

    // Validate audit section
    const errors = {};

    // Check if discrepancyFound is 1 (Yes) and discrepancyRemarks is empty
    if (
      formData.discrepancyFound === 1 &&
      !formData.discrepancyRemarks?.trim()
    ) {
      errors.discrepancyRemarks = true;
    }

    // Check if discrepancyFixed is 1 (Yes) and lc3Remarks is empty
    if (formData.discrepancyFixed === 1 && !formData.lc3Remarks?.trim()) {
      errors.lc3Remarks = true;
    }

    // If there are validation errors, show message and don't submit
    if (Object.keys(errors).length > 0) {
      setAuditValidationErrors(errors);
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill in all required remarks fields.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
      return;
    }

    // Clear validation errors
    setAuditValidationErrors({});

    try {
      // Show loading spinner
      setIsSubmitting(true);

      const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

      // Build audit payload
      const auditPayload = {
        auditAnalysisData: "", // Blank for now as per user requirement
        auditDiscrepancyFoundOtherThanLC3Remarks:
          formData.discrepancyFound || null,
        auditDiscrepancyRemarks: formData.discrepancyRemarks || "",
        auditDiscrepancyFixedByLC3: formData.discrepancyFixed || null,
        auditLc3Remarks: formData.lc3Remarks || "",
      };

      console.log("📤 Submitting Audit Payload:", auditPayload);

      const response = await fetchWithAuth(
        `${API}/walkouts/${walkoutId}/audit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(auditPayload),
        },
      );

      const result = await response.json();

      console.log("📥 Audit Backend Response:", result);

      if (response.ok && result.success) {
        setIsSubmitting(false);

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: result.message || "Audit section submitted successfully!",
          confirmButtonColor: "#10b981",
          confirmButtonText: "OK",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          // Clear form data
          setFormData({});
          setWalkoutId(null);
          setIsExistingWalkout(false);
          // Navigate back to appointments list
          navigate(-1);
        });
      } else {
        setIsSubmitting(false);

        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text:
            result.message ||
            "Failed to submit Audit section. Please try again.",
          confirmButtonColor: "#dc2626",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("❌ Error submitting Audit section:", error);
      setIsSubmitting(false);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error submitting Audit section. Please try again.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
      });
    }
  };

  // Render compact image buttons
  const renderImageButtons = (type, label) => {
    const imageData = sidebarData.images[type];
    const hasImage = imageData.file !== null || imageData.imageId !== "";
    // Check both office validation errors and LC3 validation errors
    const hasValidationError =
      imageValidationErrors[type] ||
      (type === "lc3WO" && lc3ValidationErrors.lc3WalkoutImage) ||
      false;

    return (
      <div className="WF-image-button-group">
        <button
          className={`WF-image-btn ${
            hasValidationError ? "WF-validation-error" : ""
          }`}
          onClick={() => setImageModal({ isOpen: true, type })}
        >
          <span className="WF-image-btn-icon">📁</span>
          {hasImage ? "Change Image" : "Add Image"}
          {hasImage && <span className="WF-image-indicator">✓</span>}
        </button>
        <button
          className="WF-image-btn WF-preview-btn"
          onClick={() => {
            setImageLoading(true);
            setImagePan({ x: 0, y: 0 });
            setPreviewModal({ isOpen: true, type });
          }}
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
    doctor1: providerSchedule.doctor1 || appointment?.["doctor-1"] || "-",
    doctor2: providerSchedule.doctor2 || appointment?.["doctor-2"] || "-",
    doctor3: appointment?.["doctor-3"] || "-",
    hygienist1:
      providerSchedule.hygienist1 || appointment?.["hygienist-1"] || "-",
    hygienist2:
      providerSchedule.hygienist2 || appointment?.["hygienist-2"] || "-",
    hygienist3: appointment?.["hygienist-3"] || "-",
    patientId: appointment?.["patient-id"] || "N/A",
    patientName: appointment?.["patient-name"] || "N/A",
    dateOfService: appointment?.dos || "N/A",
  };

  return (
    <div className="WF-walkout-form-container">
      {/* Loading Spinner Overlay */}
      {isSubmitting && <LoadingSpinner message="Submitting..." />}

      {/* Success/Error Notification */}
      {notification.show && (
        <div
          className={`WF-notification ${
            notification.type === "success"
              ? "WF-notification-success"
              : "WF-notification-error"
          }`}
        >
          {notification.message}
        </div>
      )}

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
            <div className="WF-section" data-section="office">
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
                          className={`WF-button-group ${
                            officeValidationErrors.patientCame
                              ? "WF-validation-error"
                              : ""
                          }`}
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
                                    btn.incrementalId,
                                  )
                                }
                              >
                                {btn.name}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Show remaining fields only when patient is present */}
                      {isPatientPresent && (
                        <>
                          <div className="WF-walkout-form-row">
                            <label className="WF-walkout-form-label">
                              Is Post op walkout completing with zero
                              production?
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <div
                              className={`WF-button-group ${
                                officeValidationErrors.postOpZeroProduction
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.POST_OP_ZERO}
                            >
                              {getRadioButtons(FIELD_IDS.POST_OP_ZERO).map(
                                (btn) => (
                                  <button
                                    key={btn._id}
                                    type="button"
                                    className={`WF-radio-button ${
                                      btn.name === "No" ||
                                      btn.name === "Pending"
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
                                        btn.incrementalId,
                                      )
                                    }
                                  >
                                    {btn.name}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="WF-walkout-form-row">
                            <label className="WF-walkout-form-label">
                              Patient Type
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <select
                              className={`WF-walkout-form-select ${
                                officeValidationErrors.patientType
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.PATIENT_TYPE}
                              value={formData.patientType || ""}
                              onChange={(e) =>
                                handleDropdownChange(
                                  "patientType",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(FIELD_IDS.PATIENT_TYPE).map(
                                (opt) => (
                                  <option
                                    key={opt._id}
                                    value={opt.incrementalId}
                                  >
                                    {opt.name}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>

                          <div className="WF-walkout-form-row">
                            <label className="WF-walkout-form-label">
                              Does patient have Insurance?
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <div
                              className={`WF-button-group ${
                                officeValidationErrors.hasInsurance
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.HAS_INSURANCE}
                            >
                              {getRadioButtons(FIELD_IDS.HAS_INSURANCE).map(
                                (btn) => (
                                  <button
                                    key={btn._id}
                                    type="button"
                                    className={`WF-radio-button ${
                                      btn.name === "No" ||
                                      btn.name === "Pending"
                                        ? "WF-no-or-pending-button"
                                        : ""
                                    } ${
                                      formData.hasInsurance ===
                                      btn.incrementalId
                                        ? "WF-selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleRadioChange(
                                        "hasInsurance",
                                        btn.incrementalId,
                                      )
                                    }
                                  >
                                    {btn.name}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Insurance Type - Show only when hasInsurance is Yes */}
                          {hasInsurance && (
                            <div className="WF-walkout-form-row">
                              <label className="WF-walkout-form-label">
                                Insurance Type
                                <span style={{ color: "#dc2626" }}>*</span>
                              </label>
                              <select
                                className={`WF-walkout-form-select ${
                                  officeValidationErrors.insuranceType
                                    ? "WF-validation-error"
                                    : ""
                                }`}
                                data-field-id={FIELD_IDS.INSURANCE_TYPE}
                                value={formData.insuranceType || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleDropdownChange(
                                    "insuranceType",
                                    value === "" ? null : parseInt(value),
                                  );
                                }}
                              >
                                <option value="">Select</option>
                                {getDropdownOptions(
                                  FIELD_IDS.INSURANCE_TYPE,
                                ).map((opt) => (
                                  <option
                                    key={opt._id}
                                    value={opt.incrementalId}
                                  >
                                    {opt.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Insurance - Show only when Child Medicaid or Chip Medicaid selected */}
                          {hasInsurance && showInsuranceDropdown && (
                            <div className="WF-walkout-form-row">
                              <label className="WF-walkout-form-label">
                                Insurance
                                <span style={{ color: "#dc2626" }}>*</span>
                              </label>
                              <select
                                className={`WF-walkout-form-select ${
                                  officeValidationErrors.insurance
                                    ? "WF-validation-error"
                                    : ""
                                }`}
                                data-field-id={FIELD_IDS.INSURANCE}
                                value={formData.insurance || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleDropdownChange(
                                    "insurance",
                                    value === "" ? null : parseInt(value),
                                  );
                                }}
                              >
                                <option value="">Select</option>
                                {getDropdownOptions(FIELD_IDS.INSURANCE).map(
                                  (opt) => (
                                    <option
                                      key={opt._id}
                                      value={opt.incrementalId}
                                    >
                                      {opt.name}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>
                          )}

                          <div className="WF-walkout-form-row">
                            <label className="WF-walkout-form-label">
                              Google Review Request?
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <div
                              className={`WF-button-group ${
                                officeValidationErrors.googleReviewRequest
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.GOOGLE_REVIEW_REQUEST}
                            >
                              {getRadioButtons(
                                FIELD_IDS.GOOGLE_REVIEW_REQUEST,
                              ).map((btn) => (
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
                                      btn.incrementalId,
                                    )
                                  }
                                >
                                  {btn.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </fieldset>

                    {/* Right Fieldset - Patient Portion (Hidden when patient absent OR Zero Production) */}
                    {isPatientPresent && !isZeroProduction && (
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
                              step="1"
                              min="0"
                              className={`WF-form-input ${
                                officeValidationErrors.expectedPatientPortionOfficeWO
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              value={
                                formData.expectedPatientPortionOfficeWO !==
                                undefined
                                  ? formData.expectedPatientPortionOfficeWO
                                  : ""
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                handleDropdownChange(
                                  "expectedPatientPortionOfficeWO",
                                  val === "" ? 0 : parseFloat(val),
                                );
                              }}
                            />
                          </div>

                          <div className="WF-form-group-inline">
                            <label className="WF-form-label">
                              Patient Portion Collected
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="WF-form-input"
                              value={formData.patientPortionCollected || 0}
                              disabled
                              title="Auto-calculated from primary + secondary amounts"
                            />
                          </div>

                          <div className="WF-form-group-inline">
                            <label className="WF-form-label">
                              Difference in Patient Portion
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="WF-form-input"
                              value={formData.differenceInPatientPortion || 0}
                              disabled
                              title="Auto-calculated: Expected - Collected"
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
                              value={formData.patientPortionPrimaryMode || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleDropdownChange(
                                  "patientPortionPrimaryMode",
                                  value === "" ? null : parseInt(value),
                                );
                              }}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(
                                FIELD_IDS.PATIENT_PORTION_PRIMARY_MODE,
                              ).map((opt) => (
                                <option key={opt._id} value={opt.incrementalId}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {showPrimaryAmount ? (
                            <div className="WF-form-group-inline">
                              <label className="WF-form-label">
                                Amount Collected Using Primary Mode
                                <span style={{ color: "#dc2626" }}>*</span>
                              </label>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                className={`WF-form-input ${
                                  officeValidationErrors.amountCollectedPrimaryMode
                                    ? "WF-validation-error"
                                    : ""
                                }`}
                                value={
                                  formData.amountCollectedPrimaryMode !==
                                  undefined
                                    ? formData.amountCollectedPrimaryMode
                                    : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleDropdownChange(
                                    "amountCollectedPrimaryMode",
                                    val === "" ? 0 : parseFloat(val),
                                  );
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="WF-form-group-inline"
                              style={{ visibility: "hidden" }}
                            >
                              {/* Placeholder to maintain half-size layout */}
                            </div>
                          )}
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
                              value={formData.patientPortionSecondaryMode || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleDropdownChange(
                                  "patientPortionSecondaryMode",
                                  value === "" ? null : parseInt(value),
                                );
                              }}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(
                                FIELD_IDS.PATIENT_PORTION_SECONDARY_MODE,
                              ).map((opt) => (
                                <option key={opt._id} value={opt.incrementalId}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {showSecondaryAmount ? (
                            <div className="WF-form-group-inline">
                              <label className="WF-form-label">
                                Amount Collected Using Secondary Mode
                                <span style={{ color: "#dc2626" }}>*</span>
                              </label>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                className={`WF-form-input ${
                                  officeValidationErrors.amountCollectedSecondaryMode
                                    ? "WF-validation-error"
                                    : ""
                                }`}
                                value={
                                  formData.amountCollectedSecondaryMode !==
                                  undefined
                                    ? formData.amountCollectedSecondaryMode
                                    : ""
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleDropdownChange(
                                    "amountCollectedSecondaryMode",
                                    val === "" ? 0 : parseFloat(val),
                                  );
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="WF-form-group-inline"
                              style={{ visibility: "hidden" }}
                            >
                              {/* Placeholder to maintain half-size layout */}
                            </div>
                          )}
                        </div>

                        {showLastFourDigits && (
                          <div className="WF-form-group">
                            <label className="WF-form-label">
                              Enter the last four digits of the uploaded check
                              in Forte (Primary)
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <input
                              type="text"
                              maxLength="4"
                              pattern="\d{4}"
                              className={`WF-form-input ${
                                officeValidationErrors.lastFourDigitsCheckForte
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              placeholder="Enter exactly last 4 digits"
                              value={formData.lastFourDigitsCheckForte || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Only allow digits
                                if (value === "" || /^\d+$/.test(value)) {
                                  handleDropdownChange(
                                    "lastFourDigitsCheckForte",
                                    value,
                                  );
                                }
                              }}
                            />
                            {formData.lastFourDigitsCheckForte &&
                              formData.lastFourDigitsCheckForte.length !==
                                4 && (
                                <span
                                  style={{
                                    color: "#dc2626",
                                    fontSize: "12px",
                                  }}
                                >
                                  Must be exactly 4 digits
                                </span>
                              )}
                          </div>
                        )}

                        {showReasonLessCollection && (
                          <div className="WF-form-group">
                            <label className="WF-form-label">
                              Reason Office Collected less Patient Portion than
                              Expected?
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <select
                              className={`WF-form-select ${
                                officeValidationErrors.reasonLessCollection
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.REASON_LESS_COLLECTION}
                              value={formData.reasonLessCollection || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleDropdownChange(
                                  "reasonLessCollection",
                                  value === "" ? null : parseInt(value),
                                );
                              }}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(
                                FIELD_IDS.REASON_LESS_COLLECTION,
                              ).map((opt) => (
                                <option key={opt._id} value={opt.incrementalId}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </fieldset>
                    )}

                    {/* Rule Engine Check Fieldset (Hidden when patient absent OR Zero Production) */}
                    {isPatientPresent && !isZeroProduction && (
                      <fieldset className="WF-form-fieldset WF-rule-engine-fieldset">
                        <div className="WF-fieldset-header-row">
                          <legend className="WF-legend">
                            Rule Engine Check
                          </legend>
                        </div>

                        {/* Row 1: Did Office run + Reason dropdown */}
                        <div className="WF-rule-engine-row">
                          <div className="WF-walkout-form-row">
                            <label className="WF-walkout-form-label">
                              Did Office run the Rules Engine?
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <div
                              className={`WF-button-group ${
                                officeValidationErrors.ruleEngineRun
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.RULE_ENGINE_RUN}
                            >
                              {getRadioButtons(FIELD_IDS.RULE_ENGINE_RUN).map(
                                (btn) => (
                                  <button
                                    key={btn._id}
                                    type="button"
                                    className={`WF-radio-button ${
                                      btn.name === "No" ||
                                      btn.name === "Pending"
                                        ? "WF-no-or-pending-button"
                                        : ""
                                    } ${
                                      formData.ruleEngineRun ===
                                      btn.incrementalId
                                        ? "WF-selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleRadioChange(
                                        "ruleEngineRun",
                                        btn.incrementalId,
                                      )
                                    }
                                  >
                                    {btn.name}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>

                          {showRuleEngineReason && (
                            <div className="WF-walkout-form-row">
                              <label className="WF-walkout-form-label">
                                Reason for Rules Engine not run
                                <span style={{ color: "#dc2626" }}>*</span>
                              </label>
                              <select
                                className={`WF-walkout-form-select ${
                                  officeValidationErrors.ruleEngineNotRunReason
                                    ? "WF-validation-error"
                                    : ""
                                }`}
                                data-field-id={
                                  FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON
                                }
                                value={formData.ruleEngineNotRunReason || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleDropdownChange(
                                    "ruleEngineNotRunReason",
                                    value === "" ? null : parseInt(value),
                                  );
                                }}
                              >
                                <option value="">Select</option>
                                {getDropdownOptions(
                                  FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON,
                                ).map((opt) => (
                                  <option
                                    key={opt._id}
                                    value={opt.incrementalId}
                                  >
                                    {opt.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        {/* Row 2: Was error found + Remarks textbox */}
                        {showErrorFound && (
                          <div className="WF-rule-engine-row">
                            <div className="WF-walkout-form-row">
                              <label className="WF-walkout-form-label">
                                If Yes, Was any error found?
                                <span style={{ color: "#dc2626" }}>*</span>
                              </label>
                              <div
                                className={`WF-button-group ${
                                  officeValidationErrors.ruleEngineError
                                    ? "WF-validation-error"
                                    : ""
                                }`}
                                data-field-id={
                                  FIELD_IDS.RULE_ENGINE_ERROR_FOUND
                                }
                              >
                                {getRadioButtons(
                                  FIELD_IDS.RULE_ENGINE_ERROR_FOUND,
                                ).map((btn) => (
                                  <button
                                    key={btn._id}
                                    type="button"
                                    className={`WF-radio-button ${
                                      btn.name === "No" ||
                                      btn.name === "Pending"
                                        ? "WF-no-or-pending-button"
                                        : ""
                                    } ${
                                      formData.ruleEngineError ===
                                      btn.incrementalId
                                        ? "WF-selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      handleRadioChange(
                                        "ruleEngineError",
                                        btn.incrementalId,
                                      )
                                    }
                                  >
                                    {btn.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {showErrorFields && (
                              <div className="WF-walkout-form-row">
                                <label className="WF-walkout-form-label">
                                  Enter Remarks explaining the changes made to
                                  fix the Error
                                  <span style={{ color: "#dc2626" }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  className={`WF-walkout-form-input ${
                                    officeValidationErrors.errorFixRemarks
                                      ? "WF-validation-error"
                                      : ""
                                  }`}
                                  value={formData.errorFixRemarks || ""}
                                  onChange={(e) =>
                                    handleDropdownChange(
                                      "errorFixRemarks",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        )}
                        {/* Row 3: Were all issues fixed (single question) */}
                        {showErrorFields && (
                          <div className="WF-rule-engine-row">
                            <div className="WF-walkout-form-row">
                              <label className="WF-walkout-form-label">
                                Were all the Issues fixed?
                                <span style={{ color: "#dc2626" }}>*</span>
                              </label>
                              <div
                                className={`WF-button-group ${
                                  officeValidationErrors.issuesFixed
                                    ? "WF-validation-error"
                                    : ""
                                }`}
                                data-field-id={FIELD_IDS.ISSUES_FIXED}
                              >
                                {getRadioButtons(FIELD_IDS.ISSUES_FIXED).map(
                                  (btn) => (
                                    <button
                                      key={btn._id}
                                      type="button"
                                      className={`WF-radio-button ${
                                        btn.name === "No" ||
                                        btn.name === "Pending"
                                          ? "WF-no-or-pending-button"
                                          : ""
                                      } ${
                                        formData.issuesFixed ===
                                        btn.incrementalId
                                          ? "WF-selected"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        handleRadioChange(
                                          "issuesFixed",
                                          btn.incrementalId,
                                        )
                                      }
                                    >
                                      {btn.name}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </fieldset>
                    )}

                    {/* Confirmation Fieldset (Hidden when patient absent OR Zero Production) */}
                    {isPatientPresent && !isZeroProduction && (
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
                            <label
                              className={`WF-checkbox-label ${
                                officeValidationErrors.signedGeneralConsent
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.signedGeneralConsent || false}
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "signedGeneralConsent",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>
                                Signed General Consent
                                <span style={{ color: "#dc2626" }}>*</span>
                              </span>
                            </label>
                            <label className="WF-checkbox-label">
                              <input
                                type="checkbox"
                                checked={
                                  formData.signedTreatmentConsent || false
                                }
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "signedTreatmentConsent",
                                    e.target.checked,
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
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>Pre Auth Available</span>
                            </label>
                          </div>

                          {/* Column 2 */}
                          <div className="WF-checkbox-column">
                            <label
                              className={`WF-checkbox-label ${
                                officeValidationErrors.signedTxPlan
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.signedTxPlan || false}
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "signedTxPlan",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>
                                Signed TX Plan
                                <span style={{ color: "#dc2626" }}>*</span>
                              </span>
                            </label>
                            <label className="WF-checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.perioChart || false}
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "perioChart",
                                    e.target.checked,
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
                            <label
                              className={`WF-checkbox-label ${
                                officeValidationErrors.xRayPanoAttached
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.xRayPanoAttached || false}
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "xRayPanoAttached",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>
                                X-Ray/Pano Attached
                                <span style={{ color: "#dc2626" }}>*</span>
                              </span>
                            </label>
                            <label className="WF-checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.majorServiceForm || false}
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "majorServiceForm",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>Major Service Form</span>
                            </label>
                            <label
                              className={`WF-checkbox-label ${
                                officeValidationErrors.routeSheet
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.routeSheet || false}
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "routeSheet",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>
                                Route Sheet
                                <span style={{ color: "#dc2626" }}>*</span>
                              </span>
                            </label>
                          </div>

                          {/* Column 4 */}
                          <div className="WF-checkbox-column">
                            <label
                              className={`WF-checkbox-label ${
                                officeValidationErrors.prcUpdatedInRouteSheet
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  formData.prcUpdatedInRouteSheet || false
                                }
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "prcUpdatedInRouteSheet",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>
                                PRC updated in route sheet
                                <span style={{ color: "#dc2626" }}>*</span>
                              </span>
                            </label>
                            <label className="WF-checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.narrative || false}
                                onChange={(e) =>
                                  handleDropdownChange(
                                    "narrative",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>Narrative</span>
                            </label>
                          </div>
                        </div>
                      </fieldset>
                    )}

                    {/* Notes Fieldset (Shown when patient is present) */}
                    {isPatientPresent && (
                      <fieldset className="WF-form-fieldset WF-office-notes-fieldset">
                        <div className="WF-fieldset-header-row">
                          <legend className="WF-legend">
                            Notes ({formData.officeHistoricalNotes?.length || 0}
                            )
                          </legend>
                        </div>

                        {/* Office Notes Section */}
                        <div className="WF-notes-subsection">
                          <h4 className="WF-notes-subheading">Office Notes:</h4>
                          <div className="WF-notes-list">
                            {formData.officeHistoricalNotes?.length > 0 ? (
                              formData.officeHistoricalNotes.map(
                                (note, index) => (
                                  <NoteItem
                                    key={index}
                                    note={note}
                                    fetchUserName={fetchUserName}
                                    formatNoteDate={formatNoteDate}
                                  />
                                ),
                              )
                            ) : (
                              <p className="WF-no-notes-message">
                                No office notes yet.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* LC3 On Hold Notes Section */}
                        <div className="WF-notes-subsection">
                          <h4 className="WF-notes-subheading">
                            On Hold Details & Notes by LC3 Team:
                          </h4>
                          <div className="WF-notes-list">
                            {formData.onHoldNotes?.length > 0 ? (
                              formData.onHoldNotes.map((note, index) => (
                                <NoteItem
                                  key={note._id || index}
                                  note={note}
                                  fetchUserName={fetchUserName}
                                  formatNoteDate={formatNoteDate}
                                />
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
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </fieldset>
                    )}
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
                      <div
                        className={`WF-status-toggle ${
                          lc3ValidationErrors.fieldsetStatus
                            ? "WF-validation-error"
                            : ""
                        }`}
                        data-field-id={FIELD_IDS.LC3_RULE_ENGINE_STATUS}
                      >
                        {getRadioButtons(FIELD_IDS.LC3_RULE_ENGINE_STATUS).map(
                          (button) => (
                            <label key={button._id} className="WF-status-label">
                              <input
                                type="radio"
                                name="lc3FieldsetStatus"
                                value={button.incrementalId}
                                checked={
                                  lc3Data.fieldsetStatus ===
                                  button.incrementalId
                                }
                                onChange={(e) =>
                                  handleLc3Change(
                                    "fieldsetStatus",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <span
                                className={`WF-status-text ${
                                  button.name === "Completed"
                                    ? "WF-completed"
                                    : "WF-pending"
                                }`}
                              >
                                {button.name}
                              </span>
                            </label>
                          ),
                        )}
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
                          className={`WF-button-group ${
                            lc3ValidationErrors.didLc3RunRules
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_RUN_RULES}
                        >
                          {(() => {
                            const buttons = getRadioButtons(
                              FIELD_IDS.LC3_RUN_RULES,
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
                                    button.incrementalId,
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
                        {(() => {
                          const buttons = getRadioButtons(
                            FIELD_IDS.LC3_RUN_RULES,
                          );
                          const yesButton = buttons.find(
                            (btn) => btn.name === "Yes",
                          );
                          return (
                            lc3Data.didLc3RunRules ===
                              yesButton?.incrementalId && (
                              <div className="WF-rule-unique-id-group">
                                <label className="WF-form-label">
                                  Rule Engine Unique ID
                                  <span style={{ color: "#dc2626" }}>*</span>
                                </label>
                                <div className="WF-unique-id-input-row">
                                  <input
                                    type="text"
                                    className={`WF-form-input ${
                                      lc3ValidationErrors.ruleEngineUniqueId
                                        ? "WF-validation-error"
                                        : ""
                                    }`}
                                    value={lc3Data.ruleEngineUniqueId}
                                    onChange={(e) =>
                                      handleLc3Change(
                                        "ruleEngineUniqueId",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter Unique ID"
                                    disabled={isFetchingRules}
                                  />
                                  {(lc3Data.showUpdateButton ||
                                    isFetchingRules) && (
                                    <button
                                      type="button"
                                      className={`WF-update-button ${
                                        lc3ValidationErrors.updateButtonPending
                                          ? "WF-validation-error"
                                          : ""
                                      }`}
                                      onClick={fetchFailedRules}
                                      disabled={isFetchingRules}
                                    >
                                      {isFetchingRules ? (
                                        <span className="WF-button-loading">
                                          <span className="WF-spinner-small"></span>
                                          Loading...
                                        </span>
                                      ) : (
                                        "Update"
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          );
                        })()}

                        {(() => {
                          const buttons = getRadioButtons(
                            FIELD_IDS.LC3_RUN_RULES,
                          );
                          const noButton = buttons.find(
                            (btn) => btn.name === "No",
                          );
                          return (
                            lc3Data.didLc3RunRules ===
                              noButton?.incrementalId && (
                              <div className="WF-reason-not-run-group">
                                <label className="WF-form-label">
                                  Reason for Rules Engine not run
                                </label>
                                <select
                                  className={`WF-walkout-form-select ${
                                    lc3ValidationErrors.reasonForNotRun
                                      ? "WF-validation-error"
                                      : ""
                                  }`}
                                  value={lc3Data.reasonForNotRun}
                                  onChange={(e) =>
                                    handleLc3Change(
                                      "reasonForNotRun",
                                      e.target.value,
                                    )
                                  }
                                  data-field-id={
                                    FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON
                                  }
                                >
                                  <option value="">Select reason</option>
                                  {getDropdownOptions(
                                    FIELD_IDS.RULE_ENGINE_NOT_RUN_REASON,
                                  ).map((option) => (
                                    <option
                                      key={option._id}
                                      value={option.incrementalId}
                                    >
                                      {option.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )
                          );
                        })()}
                      </div>
                    </div>

                    {/* Failed Rules Section - Show when Yes is selected and failedRules exist */}
                    {(() => {
                      const buttons = getRadioButtons(FIELD_IDS.LC3_RUN_RULES);
                      const yesButton = buttons.find(
                        (btn) => btn.name === "Yes",
                      );

                      return (
                        lc3Data.didLc3RunRules === yesButton?.incrementalId &&
                        lc3Data.failedRules !== undefined && (
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
                                        className={`WF-button-group ${
                                          lc3ValidationErrors[
                                            `failedRule${index}`
                                          ]
                                            ? "WF-validation-error"
                                            : ""
                                        }`}
                                        data-field-id={
                                          FIELD_IDS.LC3_FAILED_RULES_RESOLVED
                                        }
                                      >
                                        {getRadioButtons(
                                          FIELD_IDS.LC3_FAILED_RULES_RESOLVED,
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
                                              button.incrementalId
                                                ? "WF-selected"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              handleRadioChange(
                                                `failedRule${index}`,
                                                button.incrementalId,
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
                        )
                      );
                    })()}
                  </fieldset>

                  {/* B. Document Check Fieldset */}
                  <fieldset className="WF-form-fieldset WF-lc3-document-check-fieldset">
                    <div className="WF-fieldset-header-row">
                      <legend className="WF-legend">
                        B. Document Check{" "}
                        <span className="WF-fieldset-subtitle">
                          (
                          <a
                            href="https://docs.google.com/spreadsheets/d/1ZhbN8euu7VIVsSUuqA0pSwpQJU5JxtvTgQMwWsHkUcE/edit?gid=1705912886#gid=1705912886"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="WF-guidelines-link"
                          >
                            Attachment and Service Based Guidelines
                          </a>
                          )
                        </span>
                      </legend>
                      <div
                        className={`WF-status-toggle ${
                          lc3ValidationErrors.lc3DocumentCheckStatus
                            ? "WF-validation-error"
                            : ""
                        }`}
                        data-field-id={FIELD_IDS.LC3_DOC_CHECK_STATUS}
                      >
                        {getRadioButtons(FIELD_IDS.LC3_DOC_CHECK_STATUS).map(
                          (button) => (
                            <label key={button._id} className="WF-status-label">
                              <input
                                type="radio"
                                name="lc3DocumentCheckStatus"
                                value={button.incrementalId}
                                checked={
                                  formData.lc3DocumentCheckStatus ===
                                  button.incrementalId
                                }
                                onChange={(e) =>
                                  handleRadioChange(
                                    "lc3DocumentCheckStatus",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <span
                                className={`WF-status-text ${
                                  button.name === "Completed"
                                    ? "WF-completed"
                                    : "WF-pending"
                                }`}
                              >
                                {button.name}
                              </span>
                            </label>
                          ),
                        )}
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
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.signedTreatmentPlanAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_SIGNED_TREATMENT_PLAN}
                          value={formData.signedTreatmentPlanAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "signedTreatmentPlanAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(
                            FIELD_IDS.LC3_SIGNED_TREATMENT_PLAN,
                          ).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          PRC Available
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.prcAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_PRC_AVAILABLE}
                          value={formData.prcAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "prcAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_PRC_AVAILABLE).map(
                            (opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Signed Consent - General Available
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.signedConsentGeneralAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_SIGNED_CONSENT_GENERAL}
                          value={formData.signedConsentGeneralAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "signedConsentGeneralAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(
                            FIELD_IDS.LC3_SIGNED_CONSENT_GENERAL,
                          ).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          NVD Available
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.nvdAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_NVD_AVAILABLE}
                          value={formData.nvdAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "nvdAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_NVD_AVAILABLE).map(
                            (opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      {/* Row 2 */}
                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Narrative Available
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.narrativeAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_NARRATIVE_AVAILABLE}
                          value={formData.narrativeAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "narrativeAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(
                            FIELD_IDS.LC3_NARRATIVE_AVAILABLE,
                          ).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Signed Consent Tx. Available
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.signedConsentTxAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_SIGNED_CONSENT_TX}
                          value={formData.signedConsentTxAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "signedConsentTxAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(
                            FIELD_IDS.LC3_SIGNED_CONSENT_TX,
                          ).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Pre Auth Available
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.lc3PreAuthAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_PRE_AUTH}
                          value={formData.lc3PreAuthAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "lc3PreAuthAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_PRE_AUTH).map(
                            (opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Route Sheet Available
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.routeSheetAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_ROUTE_SHEET}
                          value={formData.routeSheetAvailable || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "routeSheetAvailable",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_ROUTE_SHEET).map(
                            (opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      {/* Row 3 - Ortho Questionnaire */}
                      <div className="WF-form-group-compact WF-ortho-question">
                        <label className="WF-form-label-compact">
                          Does the Ortho Questionnaire form available?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className={`WF-button-group ${
                            lc3ValidationErrors.orthoQuestionnaireAvailable
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_ORTHO_QUESTIONNAIRE}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_ORTHO_QUESTIONNAIRE,
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
                                button.incrementalId
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "orthoQuestionnaireAvailable",
                                  button.incrementalId,
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
                          (
                          <a
                            href="https://docs.google.com/spreadsheets/d/1ZhbN8euu7VIVsSUuqA0pSwpQJU5JxtvTgQMwWsHkUcE/edit?gid=1705912886#gid=1705912886"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="WF-guidelines-link"
                          >
                            Attachment and Service Based Guidelines
                          </a>
                          )
                        </span>
                      </legend>
                      <div
                        className={`WF-status-toggle ${
                          lc3ValidationErrors.lc3AttachmentsCheckStatus
                            ? "WF-validation-error"
                            : ""
                        }`}
                        data-field-id={FIELD_IDS.LC3_ATTACH_CHECK_STATUS}
                      >
                        {getRadioButtons(FIELD_IDS.LC3_ATTACH_CHECK_STATUS).map(
                          (button) => (
                            <label key={button._id} className="WF-status-label">
                              <input
                                type="radio"
                                name="lc3AttachmentsCheckStatus"
                                value={button.incrementalId}
                                checked={
                                  formData.lc3AttachmentsCheckStatus ===
                                  button.incrementalId
                                }
                                onChange={(e) =>
                                  handleRadioChange(
                                    "lc3AttachmentsCheckStatus",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <span
                                className={`WF-status-text ${
                                  button.name === "Completed"
                                    ? "WF-completed"
                                    : "WF-pending"
                                }`}
                              >
                                {button.name}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="WF-attachments-check-grid">
                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Pano<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.pano
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_PANO}
                          value={formData.pano || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "pano",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_PANO).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          FMX<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.fmx ? "WF-validation-error" : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_FMX}
                          value={formData.fmx || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "fmx",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_FMX).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Bitewing<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.bitewing
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_BITEWING}
                          value={formData.bitewing || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "bitewing",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_BITEWING).map(
                            (opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          PA<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.pa ? "WF-validation-error" : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_PA}
                          value={formData.pa || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "pa",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_PA).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Perio Chart<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <select
                          className={`WF-walkout-form-select ${
                            lc3ValidationErrors.lc3PerioChart
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_PERIO_CHART}
                          value={formData.lc3PerioChart || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleDropdownChange(
                              "lc3PerioChart",
                              value === "" ? null : parseInt(value),
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(FIELD_IDS.LC3_PERIO_CHART).map(
                            (opt) => (
                              <option key={opt._id} value={opt.incrementalId}>
                                {opt.name}
                              </option>
                            ),
                          )}
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
                        className={`WF-status-toggle ${
                          lc3ValidationErrors.lc3PatientPortionStatus
                            ? "WF-validation-error"
                            : ""
                        }`}
                        data-field-id={FIELD_IDS.LC3_PP_CHECK_STATUS}
                      >
                        {getRadioButtons(FIELD_IDS.LC3_PP_CHECK_STATUS).map(
                          (button) => (
                            <label key={button._id} className="WF-status-label">
                              <input
                                type="radio"
                                name="lc3PatientPortionStatus"
                                value={button.incrementalId}
                                checked={
                                  formData.lc3PatientPortionStatus ===
                                  button.incrementalId
                                }
                                onChange={(e) =>
                                  handleRadioChange(
                                    "lc3PatientPortionStatus",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <span
                                className={`WF-status-text ${
                                  button.name === "Completed"
                                    ? "WF-completed"
                                    : "WF-pending"
                                }`}
                              >
                                {button.name}
                              </span>
                            </label>
                          ),
                        )}
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
                          className={`WF-form-input ${
                            lc3ValidationErrors.expectedPPOffice
                              ? "WF-validation-error"
                              : ""
                          }`}
                          value={
                            formData.expectedPPOffice !== null &&
                            formData.expectedPPOffice !== undefined
                              ? formData.expectedPPOffice
                              : ""
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "expectedPPOffice",
                              e.target.value,
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
                          className={`WF-form-input ${
                            lc3ValidationErrors.ppCollectedOffice
                              ? "WF-validation-error"
                              : ""
                          }`}
                          value={
                            formData.ppCollectedOffice !== null &&
                            formData.ppCollectedOffice !== undefined
                              ? formData.ppCollectedOffice
                              : ""
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "ppCollectedOffice",
                              e.target.value,
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
                          value={formData.ppDifferenceOffice || 0}
                          readOnly
                          style={{
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </div>

                    {/* NVD Question - Conditionally shown only if ppDifferenceOffice is negative */}
                    {formData.ppDifferenceOffice < 0 && (
                      <div className="WF-nvd-question-row">
                        <label className="WF-form-label-compact">
                          Is there a signed NVD for the Difference?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className={`WF-button-group ${
                            lc3ValidationErrors.signedNVDForDifference
                              ? "WF-validation-error"
                              : ""
                          }`}
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
                                  formData.signedNVDForDifference ===
                                  button.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "signedNVDForDifference",
                                    button.incrementalId,
                                  )
                                }
                              >
                                {button.name}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    )}

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
                          className={`WF-form-input ${
                            lc3ValidationErrors.expectedPPLC3
                              ? "WF-validation-error"
                              : ""
                          }`}
                          value={
                            formData.expectedPPLC3 !== null &&
                            formData.expectedPPLC3 !== undefined
                              ? formData.expectedPPLC3
                              : ""
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "expectedPPLC3",
                              e.target.value,
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
                          value={formData.ppDifferenceLC3 || 0}
                          readOnly
                          style={{
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </div>

                    {/* Verification of Patient Portion Payment */}
                    <div className="WF-section-subheader">
                      Verification of Patient Portion Payment
                    </div>

                    {/* Primary Mode Row */}
                    <div className="WF-payment-verification-grid">
                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Pat. Portion Primary Mode
                        </label>
                        <select
                          className="WF-walkout-form-select"
                          data-field-id={FIELD_IDS.LC3_PP_PRIMARY_MODE}
                          value={formData.ppPrimaryMode || ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value)
                              : null;
                            handleDropdownChange("ppPrimaryMode", value);
                            // Clear related fields if deselected
                            if (!value) {
                              setFormData((prev) => ({
                                ...prev,
                                amountPrimaryMode: "",
                                paymentVerifiedFromPrimary: "",
                              }));
                            }
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(
                            FIELD_IDS.LC3_PP_PRIMARY_MODE,
                          ).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Conditionally show if Primary Mode is selected */}
                      {formData.ppPrimaryMode && (
                        <>
                          <div className="WF-form-group-compact">
                            <label className="WF-form-label-compact">
                              Amount Collected Using Primary Mode
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <input
                              type="number"
                              className={`WF-form-input ${
                                lc3ValidationErrors.amountPrimaryMode
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              value={formData.amountPrimaryMode || ""}
                              onChange={(e) =>
                                handleDropdownChange(
                                  "amountPrimaryMode",
                                  e.target.value,
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
                              className={`WF-walkout-form-select ${
                                lc3ValidationErrors.paymentVerifiedFromPrimary
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={
                                FIELD_IDS.LC3_PAYMENT_VERIFIED_PRIMARY
                              }
                              value={formData.paymentVerifiedFromPrimary || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                handleDropdownChange(
                                  "paymentVerifiedFromPrimary",
                                  value,
                                );
                              }}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(
                                FIELD_IDS.LC3_PAYMENT_VERIFIED_PRIMARY,
                              ).map((opt) => (
                                <option key={opt._id} value={opt.incrementalId}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Secondary Mode Row */}
                    <div className="WF-payment-verification-grid">
                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Pat. Portion Secondary Mode
                        </label>
                        <select
                          className="WF-walkout-form-select"
                          data-field-id={FIELD_IDS.LC3_PP_SECONDARY_MODE}
                          value={formData.ppSecondaryMode || ""}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value)
                              : null;
                            handleDropdownChange("ppSecondaryMode", value);
                            // Clear related fields if deselected
                            if (!value) {
                              setFormData((prev) => ({
                                ...prev,
                                amountSecondaryMode: "",
                                paymentVerifiedFromSecondary: "",
                              }));
                            }
                          }}
                        >
                          <option value="">Select</option>
                          {getDropdownOptions(
                            FIELD_IDS.LC3_PP_SECONDARY_MODE,
                          ).map((opt) => (
                            <option key={opt._id} value={opt.incrementalId}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Conditionally show if Secondary Mode is selected */}
                      {formData.ppSecondaryMode && (
                        <>
                          <div className="WF-form-group-compact">
                            <label className="WF-form-label-compact">
                              Amount Collected Using Secondary Mode
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <input
                              type="number"
                              className={`WF-form-input ${
                                lc3ValidationErrors.amountSecondaryMode
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              value={formData.amountSecondaryMode || ""}
                              onChange={(e) =>
                                handleDropdownChange(
                                  "amountSecondaryMode",
                                  e.target.value,
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
                              className={`WF-walkout-form-select ${
                                lc3ValidationErrors.paymentVerifiedFromSecondary
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={
                                FIELD_IDS.LC3_PAYMENT_VERIFIED_SECONDARY
                              }
                              value={
                                formData.paymentVerifiedFromSecondary || ""
                              }
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                handleDropdownChange(
                                  "paymentVerifiedFromSecondary",
                                  value,
                                );
                              }}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(
                                FIELD_IDS.LC3_PAYMENT_VERIFIED_SECONDARY,
                              ).map((opt) => (
                                <option key={opt._id} value={opt.incrementalId}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Bottom Questions - Conditionally shown if Personal Check (incrementalId = 4) selected */}
                    {(formData.ppPrimaryMode === 4 ||
                      formData.ppSecondaryMode === 4) && (
                      <div className="WF-payment-questions">
                        <div className="WF-payment-question-row">
                          <label className="WF-form-label-compact">
                            Did you verify if the attached check matches the
                            payment posted in ES?
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div
                            className={`WF-button-group ${
                              lc3ValidationErrors.verifyCheckMatchesES
                                ? "WF-validation-error"
                                : ""
                            }`}
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
                                    formData.verifyCheckMatchesES ===
                                    button.incrementalId
                                      ? "WF-selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRadioChange(
                                      "verifyCheckMatchesES",
                                      button.incrementalId,
                                    )
                                  }
                                >
                                  {button.name}
                                </button>
                              ),
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
                            className={`WF-button-group ${
                              lc3ValidationErrors.forteCheckAvailable
                                ? "WF-validation-error"
                                : ""
                            }`}
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
                                    formData.forteCheckAvailable ===
                                    button.incrementalId
                                      ? "WF-selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRadioChange(
                                      "forteCheckAvailable",
                                      button.incrementalId,
                                    )
                                  }
                                >
                                  {button.name}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </fieldset>

                  {/* E. Production Details and Walkout Submission/Hold */}
                  <fieldset className="WF-form-fieldset WF-lc3-production-fieldset">
                    <div className="WF-fieldset-header-row">
                      <legend className="WF-legend">
                        E. Production Details and Walkout Submission/Hold
                      </legend>
                      <div
                        className={`WF-status-toggle ${
                          lc3ValidationErrors.lc3ProductionStatus
                            ? "WF-validation-error"
                            : ""
                        }`}
                        data-field-id={FIELD_IDS.LC3_PROD_STATUS}
                      >
                        {getRadioButtons(FIELD_IDS.LC3_PROD_STATUS).map(
                          (button) => (
                            <label key={button._id} className="WF-status-label">
                              <input
                                type="radio"
                                name="lc3ProductionStatus"
                                value={button.incrementalId}
                                checked={
                                  formData.lc3ProductionStatus ===
                                  button.incrementalId
                                }
                                onChange={(e) =>
                                  handleRadioChange(
                                    "lc3ProductionStatus",
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <span
                                className={`WF-status-text ${
                                  button.name === "Completed"
                                    ? "WF-completed"
                                    : "WF-pending"
                                }`}
                              >
                                {button.name}
                              </span>
                            </label>
                          ),
                        )}
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
                          className={`WF-form-input ${
                            lc3ValidationErrors.totalProductionOffice
                              ? "WF-validation-error"
                              : ""
                          }`}
                          value={
                            formData.totalProductionOffice !== null &&
                            formData.totalProductionOffice !== undefined
                              ? formData.totalProductionOffice
                              : ""
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "totalProductionOffice",
                              e.target.value,
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
                          className={`WF-form-input ${
                            lc3ValidationErrors.estInsuranceOffice
                              ? "WF-validation-error"
                              : ""
                          }`}
                          value={
                            formData.estInsuranceOffice !== null &&
                            formData.estInsuranceOffice !== undefined
                              ? formData.estInsuranceOffice
                              : ""
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "estInsuranceOffice",
                              e.target.value,
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
                          value={formData.expectedPPOfficeProduction || 0}
                          readOnly
                          style={{
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
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
                          className={`WF-form-input ${
                            lc3ValidationErrors.totalProductionLC3
                              ? "WF-validation-error"
                              : ""
                          }`}
                          value={
                            formData.totalProductionLC3 !== null &&
                            formData.totalProductionLC3 !== undefined
                              ? formData.totalProductionLC3
                              : ""
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "totalProductionLC3",
                              e.target.value,
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
                          className={`WF-form-input ${
                            lc3ValidationErrors.estInsuranceLC3
                              ? "WF-validation-error"
                              : ""
                          }`}
                          value={
                            formData.estInsuranceLC3 !== null &&
                            formData.estInsuranceLC3 !== undefined
                              ? formData.estInsuranceLC3
                              : ""
                          }
                          onChange={(e) =>
                            handleDropdownChange(
                              "estInsuranceLC3",
                              e.target.value,
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
                          value={formData.expectedPPLC3Production || 0}
                          readOnly
                          style={{
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </div>

                    {/* Difference between LC3 and Office Production */}
                    <div className="WF-section-subheader">
                      Difference between LC3 and Office Production [LC3 -
                      Office]
                    </div>

                    <div className="WF-production-difference-grid">
                      {/* Column 1: Total Production Difference and related fields */}
                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Total Production Difference
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          value={formData.totalProductionDifference || 0}
                          readOnly
                          style={{
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        />

                        {/* Conditional: Show if Total Production Difference != 0 */}
                        {(Number(formData.totalProductionDifference) || 0) !==
                          0 && (
                          <>
                            <label
                              className="WF-form-label-compact"
                              style={{ marginTop: "12px" }}
                            >
                              Reason for Difference in Total Production
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <select
                              className={`WF-walkout-form-select ${
                                lc3ValidationErrors.reasonTotalProductionDiff
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.LC3_REASON_PROD_DIFF}
                              value={formData.reasonTotalProductionDiff || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                handleDropdownChange(
                                  "reasonTotalProductionDiff",
                                  value,
                                );
                              }}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(
                                FIELD_IDS.LC3_REASON_PROD_DIFF,
                              ).map((opt) => (
                                <option key={opt._id} value={opt.incrementalId}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>

                            <label
                              className="WF-form-label-compact"
                              style={{ marginTop: "12px" }}
                            >
                              Explanation of reason for Difference in Total
                              Production
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <input
                              type="text"
                              className={`WF-form-input ${
                                lc3ValidationErrors.explanationTotalProductionDiff
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              value={
                                formData.explanationTotalProductionDiff || ""
                              }
                              onChange={(e) =>
                                handleDropdownChange(
                                  "explanationTotalProductionDiff",
                                  e.target.value,
                                )
                              }
                            />
                          </>
                        )}
                      </div>

                      {/* Column 2: Est Insurance Difference and related fields */}
                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Est Insurance Difference
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          value={formData.estInsuranceDifference || 0}
                          readOnly
                          style={{
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        />

                        {/* Conditional: Show if Est Insurance Difference != 0 */}
                        {(Number(formData.estInsuranceDifference) || 0) !==
                          0 && (
                          <>
                            <label
                              className="WF-form-label-compact"
                              style={{ marginTop: "12px" }}
                            >
                              Reason for Difference in Est Insurance
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <select
                              className={`WF-walkout-form-select ${
                                lc3ValidationErrors.reasonEstInsuranceDiff
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.LC3_REASON_INS_DIFF}
                              value={formData.reasonEstInsuranceDiff || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseInt(e.target.value)
                                  : null;
                                handleDropdownChange(
                                  "reasonEstInsuranceDiff",
                                  value,
                                );
                              }}
                            >
                              <option value="">Select</option>
                              {getDropdownOptions(
                                FIELD_IDS.LC3_REASON_INS_DIFF,
                              ).map((opt) => (
                                <option key={opt._id} value={opt.incrementalId}>
                                  {opt.name}
                                </option>
                              ))}
                            </select>

                            <label
                              className="WF-form-label-compact"
                              style={{ marginTop: "12px" }}
                            >
                              Explanation of reason for Difference in Est
                              Insurance
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <input
                              type="text"
                              className={`WF-form-input ${
                                lc3ValidationErrors.explanationEstInsuranceDiff
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              value={formData.explanationEstInsuranceDiff || ""}
                              onChange={(e) =>
                                handleDropdownChange(
                                  "explanationEstInsuranceDiff",
                                  e.target.value,
                                )
                              }
                            />
                          </>
                        )}
                      </div>

                      {/* Column 3: Expected PP Difference (no conditional fields) */}
                      <div className="WF-form-group-compact">
                        <label className="WF-form-label-compact">
                          Expected PP Difference
                        </label>
                        <input
                          type="number"
                          className="WF-form-input"
                          value={formData.expectedPPDifference || 0}
                          readOnly
                          style={{
                            backgroundColor: "#f3f4f6",
                            cursor: "not-allowed",
                          }}
                        />
                      </div>
                    </div>

                    {/* Walkout Questions */}
                    <div className="WF-walkout-questions">
                      {/* Conditional: Show if Total Production Difference != 0 OR Est Insurance Difference != 0 */}
                      {((Number(formData.totalProductionDifference) || 0) !==
                        0 ||
                        (Number(formData.estInsuranceDifference) || 0) !==
                          0) && (
                        <div className="WF-walkout-question-row">
                          <label className="WF-form-label-compact">
                            Have we informed office manager on HQ for changes
                            made in the walkout?
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div
                            className={`WF-button-group ${
                              lc3ValidationErrors.informedOfficeManager
                                ? "WF-validation-error"
                                : ""
                            }`}
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
                                    formData.informedOfficeManager ===
                                    button.incrementalId
                                      ? "WF-selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRadioChange(
                                      "informedOfficeManager",
                                      button.incrementalId,
                                    )
                                  }
                                >
                                  {button.name}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Conditional: Show only if Office googleReviewRequest === 1 (Patient Happy, Send) */}
                      {formData.googleReviewRequest === 1 && (
                        <div className="WF-walkout-question-row">
                          <label className="WF-form-label-compact">
                            Has the request for a Google review been sent?
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div
                            className={`WF-button-group ${
                              lc3ValidationErrors.googleReviewSent
                                ? "WF-validation-error"
                                : ""
                            }`}
                            data-field-id={FIELD_IDS.LC3_GOOGLE_REVIEW_SENT}
                          >
                            {getRadioButtons(
                              FIELD_IDS.LC3_GOOGLE_REVIEW_SENT,
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
                                  formData.googleReviewSent ===
                                  button.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "googleReviewSent",
                                    button.incrementalId,
                                  )
                                }
                              >
                                {button.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="WF-walkout-question-row">
                        <label className="WF-form-label-compact">
                          Does walkout contains Crown/Denture/Implant with
                          Prep/Imp?<span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className={`WF-button-group ${
                            lc3ValidationErrors.containsCrownDentureImplant
                              ? "WF-validation-error"
                              : ""
                          }`}
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
                                  button.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "containsCrownDentureImplant",
                                    button.incrementalId,
                                  )
                                }
                              >
                                {button.name}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Conditional: Show only if containsCrownDentureImplant === 1 (Yes) */}
                      {formData.containsCrownDentureImplant === 1 && (
                        <div className="WF-walkout-question-row">
                          <label className="WF-form-label-compact">
                            As per IV crown paid on -{" "}
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div
                            className={`WF-button-group ${
                              lc3ValidationErrors.crownPaidOn
                                ? "WF-validation-error"
                                : ""
                            }`}
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
                                    formData.crownPaidOn ===
                                    button.incrementalId
                                      ? "WF-selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRadioChange(
                                      "crownPaidOn",
                                      button.incrementalId,
                                    )
                                  }
                                >
                                  {button.name}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Conditional: Show only if crownPaidOn === 2 */}
                      {formData.containsCrownDentureImplant === 1 &&
                        formData.crownPaidOn === 2 && (
                          <div className="WF-walkout-question-row">
                            <label className="WF-form-label-compact">
                              Does crown/Denture/Implants delivered as per
                              provider notes?
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <div
                              className={`WF-button-group ${
                                lc3ValidationErrors.deliveredAsPerNotes
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              data-field-id={FIELD_IDS.LC3_DELIVERED_PER_NOTES}
                            >
                              {getRadioButtons(
                                FIELD_IDS.LC3_DELIVERED_PER_NOTES,
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
                                    formData.deliveredAsPerNotes ===
                                    button.incrementalId
                                      ? "WF-selected"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleRadioChange(
                                      "deliveredAsPerNotes",
                                      button.incrementalId,
                                    )
                                  }
                                >
                                  {button.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                      <div className="WF-walkout-question-row">
                        <label className="WF-form-label-compact">
                          Is Walkout getting on Hold?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className={`WF-button-group ${
                            lc3ValidationErrors.walkoutOnHold
                              ? "WF-validation-error"
                              : ""
                          }`}
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
                                  formData.walkoutOnHold ===
                                  button.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "walkoutOnHold",
                                    button.incrementalId,
                                  )
                                }
                              >
                                {button.name}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {/* Conditional: Show only if walkoutOnHold === 1 (Yes/Completing) */}
                      {formData.walkoutOnHold === 1 && (
                        <>
                          <div className="WF-form-group-compact WF-full-width">
                            <label className="WF-form-label-compact">
                              On Hold Reasons
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <MultiSelectDropdown
                              options={getDropdownOptions(
                                FIELD_IDS.LC3_ONHOLD_REASONS,
                              )}
                              selectedValues={formData.onHoldReasons || []}
                              onChange={(newValues) =>
                                handleMultiSelectChange(
                                  "onHoldReasons",
                                  newValues,
                                )
                              }
                              placeholder="Type here for search or select from list."
                              fieldId={FIELD_IDS.LC3_ONHOLD_REASONS}
                              hasError={lc3ValidationErrors.onHoldReasons}
                            />
                          </div>

                          <div className="WF-form-group-compact WF-full-width">
                            <label className="WF-form-label-compact">
                              Other Reason/Notes
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <input
                              type="text"
                              className={`WF-form-input ${
                                lc3ValidationErrors.otherReasonNotes
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              value={formData.otherReasonNotes || ""}
                              onChange={(e) =>
                                handleDropdownChange(
                                  "otherReasonNotes",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Conditional: Show only if walkoutOnHold === 2 (No/Hold) */}
                    {formData.walkoutOnHold === 2 && (
                      <div className="WF-final-question-row">
                        <label className="WF-form-label-compact">
                          Is walkout completing with deficiency?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className={`WF-button-group ${
                            lc3ValidationErrors.completingWithDeficiency
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_COMPLETING_DEFICIENCY}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_COMPLETING_DEFICIENCY,
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
                                formData.completingWithDeficiency ===
                                button.incrementalId
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "completingWithDeficiency",
                                  button.incrementalId,
                                )
                              }
                            >
                              {button.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </fieldset>

                  {/* F. Copy "Provider's Note" from Eaglesoft and Paste below */}
                  <fieldset className="WF-form-fieldset WF-lc3-provider-notes-fieldset">
                    <div className="WF-fieldset-header-row">
                      <legend className="WF-legend">
                        F. Copy "Provider's Note" from Eaglesoft and Paste below
                      </legend>
                      <div
                        className={`WF-status-toggle ${
                          lc3ValidationErrors.lc3ProviderNotesStatus
                            ? "WF-validation-error"
                            : ""
                        }`}
                        data-field-id={FIELD_IDS.LC3_PROVIDER_NOTES_STATUS}
                      >
                        {getRadioButtons(
                          FIELD_IDS.LC3_PROVIDER_NOTES_STATUS,
                        ).map((button) => (
                          <label key={button._id} className="WF-status-label">
                            <input
                              type="radio"
                              name="lc3ProviderNotesStatus"
                              value={button.incrementalId}
                              checked={
                                formData.lc3ProviderNotesStatus ===
                                button.incrementalId
                              }
                              onChange={(e) =>
                                handleRadioChange(
                                  "lc3ProviderNotesStatus",
                                  parseInt(e.target.value),
                                )
                              }
                            />
                            <span
                              className={`WF-status-text ${
                                button.name === "Completed"
                                  ? "WF-completed"
                                  : "WF-pending"
                              }`}
                            >
                              {button.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="WF-provider-notes-questions">
                      <div className="WF-provider-note-question-row">
                        <label className="WF-form-label-compact">
                          1. Doctor note completed?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className={`WF-button-group ${
                            lc3ValidationErrors.doctorNoteCompleted
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_DOCTOR_NOTE_COMPLETED}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_DOCTOR_NOTE_COMPLETED,
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
                                formData.doctorNoteCompleted ===
                                button.incrementalId
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "doctorNoteCompleted",
                                  button.incrementalId,
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
                          className={`WF-button-group ${
                            lc3ValidationErrors.notesUpdatedOnDOS
                              ? "WF-validation-error"
                              : ""
                          }`}
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
                                  formData.notesUpdatedOnDOS ===
                                  button.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "notesUpdatedOnDOS",
                                    button.incrementalId,
                                  )
                                }
                              >
                                {button.name}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="WF-provider-note-question-row">
                        <label className="WF-form-label-compact">
                          3. Does the Note include following 4 things?
                          <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <div
                          className={`WF-button-group ${
                            lc3ValidationErrors.noteIncludesFourElements
                              ? "WF-validation-error"
                              : ""
                          }`}
                          data-field-id={FIELD_IDS.LC3_NOTE_INCLUDES_FOUR}
                        >
                          {getRadioButtons(
                            FIELD_IDS.LC3_NOTE_INCLUDES_FOUR,
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
                                formData.noteIncludesFourElements ===
                                button.incrementalId
                                  ? "WF-selected"
                                  : ""
                              }`}
                              onClick={() =>
                                handleRadioChange(
                                  "noteIncludesFourElements",
                                  button.incrementalId,
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
                          <span className="WF-checklist-icon">
                            {noteElements.noteElement1 ? "✓" : "❌"}
                          </span>
                        </div>
                        <div className="WF-checklist-item">
                          <span className="WF-checklist-label">
                            b. Tooth#/Quads/Arch and Surface (if applicable)
                          </span>
                          <span className="WF-checklist-icon">
                            {noteElements.noteElement2 ? "✓" : "❌"}
                          </span>
                        </div>
                        <div className="WF-checklist-item">
                          <span className="WF-checklist-label">
                            c. Provider Name
                          </span>
                          <span className="WF-checklist-icon">
                            {noteElements.noteElement3 ? "✓" : "❌"}
                          </span>
                        </div>
                        <div className="WF-checklist-item">
                          <span className="WF-checklist-label">
                            d. Hygienist Name
                          </span>
                          <span className="WF-checklist-icon">
                            {noteElements.noteElement4 ? "✓" : "❌"}
                          </span>
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
                          className={`WF-notes-textarea ${
                            lc3ValidationErrors.providerNotesFromES
                              ? "WF-validation-error"
                              : ""
                          }`}
                          placeholder="Paste the provider's notes here."
                          rows="6"
                          value={formData.providerNotesFromES || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "providerNotesFromES",
                              e.target.value,
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
                          placeholder="Paste the hygienist's notes here."
                          rows="6"
                          value={formData.hygienistNotesFromES || ""}
                          onChange={(e) =>
                            handleDropdownChange(
                              "hygienistNotesFromES",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="WF-check-ai-button-container">
                      <button
                        type="button"
                        className={`WF-check-ai-button ${
                          lc3ValidationErrors.checkedByAi
                            ? "WF-validation-error"
                            : ""
                        }`}
                        onClick={handleCheckWithAI}
                        disabled={isCheckingWithAI}
                      >
                        {isCheckingWithAI ? "Checking..." : "Check with AI*"}
                      </button>
                    </div>
                  </fieldset>

                  {/* On Hold Details & Notes */}
                  <fieldset className="WF-form-fieldset WF-lc3-onhold-notes-fieldset">
                    <legend className="WF-legend">
                      On Hold Details & Notes (
                      {formData.onHoldNotes?.length || 0})
                    </legend>

                    {/* Existing Notes Display */}
                    <div className="WF-onhold-notes-list">
                      {formData.onHoldNotes?.length > 0 ? (
                        formData.onHoldNotes.map((note, index) => (
                          <NoteItem
                            key={note._id || index}
                            note={note}
                            fetchUserName={fetchUserName}
                            formatNoteDate={formatNoteDate}
                          />
                        ))
                      ) : (
                        <p className="WF-no-notes-message">
                          No on-hold notes yet.
                        </p>
                      )}
                    </div>

                    {/* Add New Note */}
                    <div className="WF-add-note-section">
                      <label className="WF-form-label-compact">
                        LC3 Note
                        <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        className={`WF-add-note-textarea ${
                          lc3ValidationErrors.newOnHoldNote
                            ? "WF-validation-error"
                            : ""
                        }`}
                        placeholder="Add new note here.*"
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <h4
                        className="WF-audit-table-title"
                        style={{ margin: 0 }}
                      >
                        Office Walkout Image Data Extracted by AI
                      </h4>
                      {officeWalkoutData?.imageId && (
                        <button
                          type="button"
                          onClick={handleRegenerateOfficeData}
                          disabled={
                            isRegeneratingOfficeData || isRegenerationDisabled()
                          }
                          title={
                            isRegenerationDisabled()
                              ? "Hourly limit reached. Please try again later."
                              : "Regenerate data from image"
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor:
                              isRegeneratingOfficeData ||
                              isRegenerationDisabled()
                                ? "not-allowed"
                                : "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            opacity:
                              isRegeneratingOfficeData ||
                              isRegenerationDisabled()
                                ? 0.4
                                : 1,
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              animation: isRegeneratingOfficeData
                                ? "spin 1s linear infinite"
                                : "none",
                            }}
                          >
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                          </svg>
                        </button>
                      )}
                    </div>
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
                        {isRegeneratingOfficeData ? (
                          // Show spinner during regeneration
                          <tr>
                            <td
                              colSpan="6"
                              style={{ textAlign: "center", padding: "40px" }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  width: "40px",
                                  height: "40px",
                                  border: "4px solid #f3f4f6",
                                  borderTop: "4px solid #3b82f6",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite",
                                }}
                              />
                              <p
                                style={{ marginTop: "12px", color: "#6b7280" }}
                              >
                                Regenerating data...
                              </p>
                            </td>
                          </tr>
                        ) : !officeWalkoutData ? (
                          // No data loaded yet
                          <tr>
                            <td
                              colSpan="6"
                              style={{ textAlign: "center", color: "#6b7280" }}
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : !officeWalkoutData.imageId ? (
                          // No image uploaded
                          <tr>
                            <td
                              colSpan="6"
                              style={{ textAlign: "center", color: "#dc2626" }}
                            >
                              Office walkout image not available
                            </td>
                          </tr>
                        ) : !officeWalkoutData.extractedData ? (
                          // Image exists but no extracted data
                          <tr>
                            <td
                              colSpan="6"
                              style={{ textAlign: "center", color: "#dc2626" }}
                            >
                              No data extracted from office image
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            // Parse and render JSON data
                            try {
                              // Handle both string (from DB) and object (from API) formats
                              let parsedData;
                              if (
                                typeof officeWalkoutData.extractedData ===
                                "string"
                              ) {
                                // If empty string, show no data message
                                if (
                                  officeWalkoutData.extractedData.trim() === ""
                                ) {
                                  return (
                                    <tr>
                                      <td
                                        colSpan="6"
                                        style={{
                                          textAlign: "center",
                                          color: "#dc2626",
                                        }}
                                      >
                                        No data extracted from office image
                                      </td>
                                    </tr>
                                  );
                                }
                                parsedData = JSON.parse(
                                  officeWalkoutData.extractedData,
                                );
                              } else {
                                // Already an object
                                parsedData = officeWalkoutData.extractedData;
                              }

                              // Check if data array exists and has items
                              if (
                                parsedData.data &&
                                Array.isArray(parsedData.data) &&
                                parsedData.data.length > 0
                              ) {
                                return parsedData.data.map((row, index) => (
                                  <tr key={index}>
                                    <td>{row.Patient || ""}</td>
                                    <td>{row.Service || ""}</td>
                                    <td>{row.Provider || ""}</td>
                                    <td>{row.Description || ""}</td>
                                    <td>{row.Tooth || ""}</td>
                                    <td>{row.Surface || ""}</td>
                                  </tr>
                                ));
                              } else {
                                // Valid JSON but no data array
                                return (
                                  <tr>
                                    <td
                                      colSpan="6"
                                      style={{
                                        textAlign: "center",
                                        color: "#dc2626",
                                      }}
                                    >
                                      No data extracted from office image
                                    </td>
                                  </tr>
                                );
                              }
                            } catch (error) {
                              // Invalid JSON - show error message
                              return (
                                <tr>
                                  <td
                                    colSpan="6"
                                    style={{
                                      textAlign: "center",
                                      color: "#dc2626",
                                    }}
                                  >
                                    No data extracted from office image
                                  </td>
                                </tr>
                              );
                            }
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* LC3 Walkout Image Data Table */}
                  <div className="WF-audit-table-container">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <h4
                        className="WF-audit-table-title"
                        style={{ margin: 0 }}
                      >
                        LC3 Walkout Image Data Extracted by AI
                      </h4>
                      {lc3WalkoutData?.imageId && (
                        <button
                          type="button"
                          onClick={handleRegenerateLc3Data}
                          disabled={
                            isRegeneratingLc3Data || isLc3RegenerationDisabled()
                          }
                          title={
                            isLc3RegenerationDisabled()
                              ? "Hourly limit reached. Please try again later."
                              : "Regenerate data from image"
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor:
                              isRegeneratingLc3Data ||
                              isLc3RegenerationDisabled()
                                ? "not-allowed"
                                : "pointer",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            opacity:
                              isRegeneratingLc3Data ||
                              isLc3RegenerationDisabled()
                                ? 0.4
                                : 1,
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              animation: isRegeneratingLc3Data
                                ? "spin 1s linear infinite"
                                : "none",
                            }}
                          >
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                          </svg>
                        </button>
                      )}
                    </div>
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
                        {isRegeneratingLc3Data ? (
                          // Show spinner during regeneration
                          <tr>
                            <td
                              colSpan="7"
                              style={{ textAlign: "center", padding: "40px" }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  width: "40px",
                                  height: "40px",
                                  border: "4px solid #f3f4f6",
                                  borderTop: "4px solid #3b82f6",
                                  borderRadius: "50%",
                                  animation: "spin 1s linear infinite",
                                }}
                              />
                              <p
                                style={{ marginTop: "12px", color: "#6b7280" }}
                              >
                                Regenerating data...
                              </p>
                            </td>
                          </tr>
                        ) : !lc3WalkoutData ? (
                          // No data loaded yet
                          <tr>
                            <td
                              colSpan="7"
                              style={{ textAlign: "center", color: "#6b7280" }}
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : !lc3WalkoutData.imageId ? (
                          // No image uploaded
                          <tr>
                            <td
                              colSpan="7"
                              style={{ textAlign: "center", color: "#dc2626" }}
                            >
                              LC3 walkout image not available
                            </td>
                          </tr>
                        ) : !lc3WalkoutData.extractedData ? (
                          // Image exists but no extracted data
                          <tr>
                            <td
                              colSpan="7"
                              style={{ textAlign: "center", color: "#dc2626" }}
                            >
                              No data extracted from LC3 image
                            </td>
                          </tr>
                        ) : (
                          (() => {
                            // Parse and render JSON data
                            try {
                              // Handle both string (from DB) and object (from API) formats
                              let parsedData;
                              if (
                                typeof lc3WalkoutData.extractedData === "string"
                              ) {
                                // If empty string, show no data message
                                if (
                                  lc3WalkoutData.extractedData.trim() === ""
                                ) {
                                  return (
                                    <tr>
                                      <td
                                        colSpan="7"
                                        style={{
                                          textAlign: "center",
                                          color: "#dc2626",
                                        }}
                                      >
                                        No data extracted from LC3 image
                                      </td>
                                    </tr>
                                  );
                                }
                                parsedData = JSON.parse(
                                  lc3WalkoutData.extractedData,
                                );
                              } else {
                                // Already an object
                                parsedData = lc3WalkoutData.extractedData;
                              }

                              // Check if data array exists and has items
                              if (
                                parsedData.data &&
                                Array.isArray(parsedData.data) &&
                                parsedData.data.length > 0
                              ) {
                                return parsedData.data.map((row, index) => {
                                  // Handle Description field - can be string or object
                                  let descriptionText = "";
                                  if (row.Description) {
                                    if (typeof row.Description === "object") {
                                      // If object, format as "Service Code: X | Procedure: Y"
                                      const code =
                                        row.Description.service_code || "";
                                      const procedure =
                                        row.Description.procedure_name || "";
                                      descriptionText =
                                        code && procedure
                                          ? `Service Code: ${code} | Procedure: ${procedure}`
                                          : code || procedure;
                                    } else {
                                      // If string, use directly
                                      descriptionText = row.Description;
                                    }
                                  }

                                  return (
                                    <tr key={index}>
                                      <td>{row.Date || ""}</td>
                                      <td>{row.Patient || ""}</td>
                                      <td>{row.Provider || ""}</td>
                                      <td>{row.Type || ""}</td>
                                      <td>{descriptionText}</td>
                                      <td>{row.Tooth || ""}</td>
                                      <td>{row.Surface || ""}</td>
                                    </tr>
                                  );
                                });
                              } else {
                                // Valid JSON but no data array
                                return (
                                  <tr>
                                    <td
                                      colSpan="7"
                                      style={{
                                        textAlign: "center",
                                        color: "#dc2626",
                                      }}
                                    >
                                      No data extracted from LC3 image
                                    </td>
                                  </tr>
                                );
                              }
                            } catch (error) {
                              // Invalid JSON - show error message
                              return (
                                <tr>
                                  <td
                                    colSpan="7"
                                    style={{
                                      textAlign: "center",
                                      color: "#dc2626",
                                    }}
                                  >
                                    No data extracted from LC3 image
                                  </td>
                                </tr>
                              );
                            }
                          })()
                        )}
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
                      {/* Question 1: Discrepancy Found */}
                      <div className="WF-audit-collapsible-row">
                        <div className="WF-audit-question-header">
                          <label className="WF-walkout-form-label">
                            Discrepancy Found other than LC3 remarks?
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div
                            className="WF-button-group"
                            data-field-id={FIELD_IDS.AUDIT_DISCREPANCY_FOUND}
                          >
                            {getRadioButtons(
                              FIELD_IDS.AUDIT_DISCREPANCY_FOUND,
                            ).map((btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.discrepancyFound ===
                                  btn.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "discrepancyFound",
                                    btn.incrementalId,
                                  )
                                }
                              >
                                {btn.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {formData.discrepancyFound === 1 && (
                          <div className="WF-audit-collapsible-content">
                            <label className="WF-audit-textarea-label">
                              Discrepancy Remarks
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <textarea
                              className={`WF-walkout-form-textarea ${
                                auditValidationErrors.discrepancyRemarks
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              placeholder="Enter discrepancy remarks..."
                              value={formData.discrepancyRemarks || ""}
                              onChange={(e) => {
                                handleDropdownChange(
                                  "discrepancyRemarks",
                                  e.target.value,
                                );
                                // Clear validation error when user types
                                if (auditValidationErrors.discrepancyRemarks) {
                                  setAuditValidationErrors((prev) => ({
                                    ...prev,
                                    discrepancyRemarks: false,
                                  }));
                                }
                              }}
                              rows={3}
                            />
                          </div>
                        )}
                      </div>

                      {/* Question 2: Discrepancy Fixed */}
                      <div className="WF-audit-collapsible-row">
                        <div className="WF-audit-question-header">
                          <label className="WF-walkout-form-label">
                            Discrepancy Fixed by LC3?
                            <span style={{ color: "#dc2626" }}>*</span>
                          </label>
                          <div
                            className="WF-button-group"
                            data-field-id={FIELD_IDS.AUDIT_DISCREPANCY_FIXED}
                          >
                            {getRadioButtons(
                              FIELD_IDS.AUDIT_DISCREPANCY_FIXED,
                            ).map((btn) => (
                              <button
                                key={btn._id}
                                type="button"
                                className={`WF-radio-button ${
                                  btn.name === "No" || btn.name === "Pending"
                                    ? "WF-no-or-pending-button"
                                    : ""
                                } ${
                                  formData.discrepancyFixed ===
                                  btn.incrementalId
                                    ? "WF-selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleRadioChange(
                                    "discrepancyFixed",
                                    btn.incrementalId,
                                  )
                                }
                              >
                                {btn.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        {formData.discrepancyFixed === 1 && (
                          <div className="WF-audit-collapsible-content">
                            <label className="WF-audit-textarea-label">
                              LC3 Remarks
                              <span style={{ color: "#dc2626" }}>*</span>
                            </label>
                            <textarea
                              className={`WF-walkout-form-textarea ${
                                auditValidationErrors.lc3Remarks
                                  ? "WF-validation-error"
                                  : ""
                              }`}
                              placeholder="Enter LC3 remarks..."
                              value={formData.lc3Remarks || ""}
                              onChange={(e) => {
                                handleDropdownChange(
                                  "lc3Remarks",
                                  e.target.value,
                                );
                                // Clear validation error when user types
                                if (auditValidationErrors.lc3Remarks) {
                                  setAuditValidationErrors((prev) => ({
                                    ...prev,
                                    lc3Remarks: false,
                                  }));
                                }
                              }}
                              rows={3}
                            />
                          </div>
                        )}
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
                      sidebarData.timer.currentSession.elapsedSeconds,
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
              <div className="WF-status-badge">
                {sidebarData.walkoutStatus || "Walkout not Submitted to LC3"}
              </div>
            </div>

            {/* On-Hold Reasons - Show only if reasons are selected in LC3 section */}
            {formData.onHoldReasons && formData.onHoldReasons.length > 0 && (
              <div className="WF-sidebar-item">
                <label className="WF-sidebar-label">On-Hold Reasons</label>
                <div className="WF-onhold-reasons">
                  {formData.onHoldReasons.map((reasonId, index) => {
                    // Get dropdown options for LC3 On-Hold Reasons
                    const options = getDropdownOptions(
                      FIELD_IDS.LC3_ONHOLD_REASONS,
                    );
                    // Find the option name by incrementalId
                    const option = options.find(
                      (opt) => opt.incrementalId === reasonId,
                    );
                    const reasonName =
                      option?.name || `Unknown (ID: ${reasonId})`;
                    return (
                      <div key={index} className="WF-reason-item">
                        • {reasonName}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Image Upload Sections */}
            <div className="WF-sidebar-item">
              <label className="WF-sidebar-label">Office WO Snip</label>
              {renderImageButtons("officeWO", "Office WO")}
            </div>

            {/* Check Image - Show only when Personal Check is selected */}
            {showLastFourDigits && (
              <div className="WF-sidebar-item">
                <label className="WF-sidebar-label">Check Image</label>
                {renderImageButtons("checkImage", "Check")}
              </div>
            )}

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

      {/* On-Hold Addressed Dialog */}
      {showOnHoldDialog && (
        <div className="WF-modal-overlay" onClick={handleOnHoldDialogCancel}>
          <div
            className="WF-modal-content WF-onhold-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="WF-modal-header">
              <h3>On-Hold Status Check</h3>
              <button
                className="WF-modal-close"
                onClick={handleOnHoldDialogCancel}
              >
                ×
              </button>
            </div>
            <div className="WF-modal-body">
              <p className="WF-onhold-question">
                Have all on-hold reasons identified by LC3 been addressed by the
                office?
              </p>
              <div className="WF-button-group WF-onhold-radio-group">
                <button
                  type="button"
                  className={`WF-radio-button ${onHoldAddressedValue === "Yes" ? "WF-selected" : ""}`}
                  onClick={() => setOnHoldAddressedValue("Yes")}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`WF-radio-button ${onHoldAddressedValue === "No" ? "WF-selected WF-no-or-pending-button" : ""}`}
                  onClick={() => setOnHoldAddressedValue("No")}
                >
                  No
                </button>
              </div>
            </div>
            <div className="WF-modal-footer">
              <button
                type="button"
                className="WF-modal-btn WF-modal-btn-secondary"
                onClick={handleOnHoldDialogCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="WF-modal-btn WF-modal-btn-primary"
                onClick={handleOnHoldDialogOK}
                disabled={!onHoldAddressedValue}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

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
        (sidebarData.images[previewModal.type]?.imageId ||
          sidebarData.images[previewModal.type]?.previewUrl) && (
          <div className="WF-fullscreen-preview" onClick={closePreviewModal}>
            <button className="WF-fullscreen-close" onClick={closePreviewModal}>
              ×
            </button>
            {imageLoading && (
              <div className="WF-image-loader">
                <div className="WF-loader-spinner"></div>
                <p>Loading...</p>
              </div>
            )}
            <img
              src={getImageUrl(previewModal.type)}
              alt="Preview"
              style={{
                transform: `scale(${
                  sidebarData.images[previewModal.type].zoom / 100
                }) translate(${imagePan.x}px, ${imagePan.y}px)`,
                cursor: isDragging ? "grabbing" : "grab",
              }}
              className="WF-fullscreen-image"
              onClick={(e) => handleImageClick(previewModal.type, e)}
              onContextMenu={(e) => handleImageRightClick(previewModal.type, e)}
              onWheel={(e) => handleImageWheel(previewModal.type, e)}
              onMouseDown={handleImageMouseDown}
              onMouseMove={handleImageMouseMove}
              onMouseUp={handleImageMouseUp}
              onMouseLeave={handleImageMouseUp}
              onError={(e) => {
                console.error("❌ Image failed to load!");
                console.error("Image URL:", getImageUrl(previewModal.type));
                console.error(
                  "ImageId:",
                  sidebarData.images[previewModal.type].imageId,
                );
                console.error(
                  "PreviewUrl:",
                  sidebarData.images[previewModal.type].previewUrl,
                );
                setImageLoading(false);
              }}
              onLoad={() => {
                // console.log("✅ Image loaded successfully!");
                // console.log("Image URL:", getImageUrl(previewModal.type));
                setImageLoading(false);
              }}
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
