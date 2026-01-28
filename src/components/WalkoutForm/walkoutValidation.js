/**
 * Walkout Form Validation Functions
 * Separated validation logic for better maintainability
 */

/**
 * Validate LC3 Section
 * @param {Object} lc3Data - LC3 specific data (rule engine, etc.)
 * @param {Object} formData - Main form data containing all LC3 fields
 * @returns {Object} - Object with field names as keys and true as values for fields with errors
 */
export const validateLC3Section = (lc3Data, formData) => {
  const errors = {};

  // 1. Rule Engine Check - Did LC3 run rules? (mandatory)
  if (!lc3Data.didLc3RunRules) {
    errors.didLc3RunRules = true;
  } else {
    // If Yes (assuming incrementalId 1 = Yes), then ruleEngineUniqueId is mandatory
    // If No (assuming incrementalId 2 = No), then reasonForNotRun is mandatory
    if (lc3Data.didLc3RunRules === 1) {
      if (!lc3Data.ruleEngineUniqueId || !lc3Data.ruleEngineUniqueId.trim()) {
        errors.ruleEngineUniqueId = true;
      }
    } else if (lc3Data.didLc3RunRules === 2) {
      if (!lc3Data.reasonForNotRun) {
        errors.reasonForNotRun = true;
      }
    }
  }

  // 2. All Check Status fields are mandatory
  if (!lc3Data.fieldsetStatus) {
    errors.fieldsetStatus = true; // Rule Engine status
  }
  if (!formData.lc3DocumentCheckStatus) {
    errors.lc3DocumentCheckStatus = true;
  }
  if (!formData.lc3AttachmentsCheckStatus) {
    errors.lc3AttachmentsCheckStatus = true;
  }
  if (!formData.lc3PatientPortionStatus) {
    errors.lc3PatientPortionStatus = true;
  }
  if (!formData.lc3ProductionStatus) {
    errors.lc3ProductionStatus = true;
  }
  if (!formData.lc3ProviderNotesStatus) {
    errors.lc3ProviderNotesStatus = true;
  }

  // 3. Document Check - All 9 dropdowns are mandatory
  if (!formData.signedTreatmentPlanAvailable) {
    errors.signedTreatmentPlanAvailable = true;
  }
  if (!formData.prcAvailable) {
    errors.prcAvailable = true;
  }
  if (!formData.signedConsentGeneralAvailable) {
    errors.signedConsentGeneralAvailable = true;
  }
  if (!formData.nvdAvailable) {
    errors.nvdAvailable = true;
  }
  if (!formData.narrativeAvailable) {
    errors.narrativeAvailable = true;
  }
  if (!formData.signedConsentTxAvailable) {
    errors.signedConsentTxAvailable = true;
  }
  if (!formData.lc3PreAuthAvailable) {
    errors.lc3PreAuthAvailable = true;
  }
  if (!formData.routeSheetAvailable) {
    errors.routeSheetAvailable = true;
  }
  if (!formData.orthoQuestionnaireAvailable) {
    errors.orthoQuestionnaireAvailable = true;
  }

  // 4. Attachments Check - All 5 dropdowns are mandatory
  if (!formData.pano) {
    errors.pano = true;
  }
  if (!formData.fmx) {
    errors.fmx = true;
  }
  if (!formData.bitewing) {
    errors.bitewing = true;
  }
  if (!formData.pa) {
    errors.pa = true;
  }
  if (!formData.lc3PerioChart) {
    errors.lc3PerioChart = true;
  }

  // 5. Patient Portion Check - Conditional mandatory fields
  // Note: 0 value is valid, only blank/null/undefined is error

  // Expected PP per Office - mandatory (0 is allowed)
  if (
    formData.expectedPPOffice === null ||
    formData.expectedPPOffice === undefined ||
    formData.expectedPPOffice === ""
  ) {
    errors.expectedPPOffice = true;
  }

  // PP Collected by Office - mandatory (0 is allowed)
  if (
    formData.ppCollectedOffice === null ||
    formData.ppCollectedOffice === undefined ||
    formData.ppCollectedOffice === ""
  ) {
    errors.ppCollectedOffice = true;
  }

  // Expected PP per LC3 - mandatory (0 is allowed)
  if (
    formData.expectedPPLC3 === null ||
    formData.expectedPPLC3 === undefined ||
    formData.expectedPPLC3 === ""
  ) {
    errors.expectedPPLC3 = true;
  }

  // Signed NVD for Difference - conditionally mandatory
  // Only mandatory if ppDifferenceOffice is negative
  const ppDifferenceOffice =
    (formData.ppCollectedOffice || 0) - (formData.expectedPPOffice || 0);
  if (ppDifferenceOffice < 0) {
    // Difference is negative, so NVD question is mandatory
    if (!formData.signedNVDForDifference) {
      errors.signedNVDForDifference = true;
    }
  }

  // Primary Mode Amount & Verification - conditionally mandatory
  // Only mandatory if ppPrimaryMode is selected
  if (formData.ppPrimaryMode) {
    if (
      formData.amountPrimaryMode === null ||
      formData.amountPrimaryMode === undefined ||
      formData.amountPrimaryMode === ""
    ) {
      errors.amountPrimaryMode = true;
    }
    if (!formData.paymentVerifiedFromPrimary) {
      errors.paymentVerifiedFromPrimary = true;
    }
  }

  // Secondary Mode Amount & Verification - conditionally mandatory
  // Only mandatory if ppSecondaryMode is selected
  if (formData.ppSecondaryMode) {
    if (
      formData.amountSecondaryMode === null ||
      formData.amountSecondaryMode === undefined ||
      formData.amountSecondaryMode === ""
    ) {
      errors.amountSecondaryMode = true;
    }
    if (!formData.paymentVerifiedFromSecondary) {
      errors.paymentVerifiedFromSecondary = true;
    }
  }

  // Check verification questions - conditionally mandatory
  // Only mandatory if "Personal Check" (incrementalId = 4) is selected in either primary or secondary mode
  const hasPrimaryPersonalCheck = formData.ppPrimaryMode === 4;
  const hasSecondaryPersonalCheck = formData.ppSecondaryMode === 4;

  if (hasPrimaryPersonalCheck || hasSecondaryPersonalCheck) {
    // Personal Check is selected, so both questions are mandatory
    if (!formData.verifyCheckMatchesES) {
      errors.verifyCheckMatchesES = true;
    }
    if (!formData.forteCheckAvailable) {
      errors.forteCheckAvailable = true;
    }
  }

  // 6. Production Details - Mandatory fields
  if (
    formData.totalProductionOffice === null ||
    formData.totalProductionOffice === undefined ||
    formData.totalProductionOffice === ""
  ) {
    errors.totalProductionOffice = true;
  }

  if (
    formData.estInsuranceOffice === null ||
    formData.estInsuranceOffice === undefined ||
    formData.estInsuranceOffice === ""
  ) {
    errors.estInsuranceOffice = true;
  }

  if (
    formData.totalProductionLC3 === null ||
    formData.totalProductionLC3 === undefined ||
    formData.totalProductionLC3 === ""
  ) {
    errors.totalProductionLC3 = true;
  }

  if (
    formData.estInsuranceLC3 === null ||
    formData.estInsuranceLC3 === undefined ||
    formData.estInsuranceLC3 === ""
  ) {
    errors.estInsuranceLC3 = true;
  }

  // Conditional mandatory: If Total Production Difference != 0
  if ((Number(formData.totalProductionDifference) || 0) !== 0) {
    if (!formData.reasonTotalProductionDiff) {
      errors.reasonTotalProductionDiff = true;
    }
    if (
      !formData.explanationTotalProductionDiff ||
      !formData.explanationTotalProductionDiff.trim()
    ) {
      errors.explanationTotalProductionDiff = true;
    }
  }

  // Conditional mandatory: If Est Insurance Difference != 0
  if ((Number(formData.estInsuranceDifference) || 0) !== 0) {
    if (!formData.reasonEstInsuranceDiff) {
      errors.reasonEstInsuranceDiff = true;
    }
    if (
      !formData.explanationEstInsuranceDiff ||
      !formData.explanationEstInsuranceDiff.trim()
    ) {
      errors.explanationEstInsuranceDiff = true;
    }
  }

  // Conditional mandatory: informedOfficeManager
  // Only mandatory if Total Production Difference != 0 OR Est Insurance Difference != 0
  if (
    (Number(formData.totalProductionDifference) || 0) !== 0 ||
    (Number(formData.estInsuranceDifference) || 0) !== 0
  ) {
    if (!formData.informedOfficeManager) {
      errors.informedOfficeManager = true;
    }
  }

  // Conditional mandatory: googleReviewSent
  // Only mandatory if Office googleReviewRequest === 1 (Patient Happy, Send)
  if (formData.googleReviewRequest === 1) {
    if (!formData.googleReviewSent) {
      errors.googleReviewSent = true;
    }
  }

  // Always mandatory: containsCrownDentureImplant
  if (
    formData.containsCrownDentureImplant === null ||
    formData.containsCrownDentureImplant === undefined
  ) {
    errors.containsCrownDentureImplant = true;
  }

  // Conditional mandatory: crownPaidOn
  // Only mandatory if containsCrownDentureImplant === 1 (Yes)
  if (formData.containsCrownDentureImplant === 1) {
    if (formData.crownPaidOn === null || formData.crownPaidOn === undefined) {
      errors.crownPaidOn = true;
    }
  }

  // Conditional mandatory: deliveredAsPerNotes
  // Only mandatory if crownPaidOn === 2
  if (
    formData.containsCrownDentureImplant === 1 &&
    formData.crownPaidOn === 2
  ) {
    if (
      formData.deliveredAsPerNotes === null ||
      formData.deliveredAsPerNotes === undefined
    ) {
      errors.deliveredAsPerNotes = true;
    }
  }

  // Always mandatory: walkoutOnHold
  if (formData.walkoutOnHold === null || formData.walkoutOnHold === undefined) {
    errors.walkoutOnHold = true;
  }

  // Conditional mandatory: onHoldReasons
  // Only mandatory if walkoutOnHold === 1 (Yes/Completing)
  if (formData.walkoutOnHold === 1) {
    if (!formData.onHoldReasons || formData.onHoldReasons.length === 0) {
      errors.onHoldReasons = true;
    }
  }

  // Conditional mandatory: otherReasonNotes
  // Only mandatory if walkoutOnHold === 1 (Yes/Completing)
  if (formData.walkoutOnHold === 1) {
    if (
      formData.otherReasonNotes === null ||
      formData.otherReasonNotes === undefined ||
      formData.otherReasonNotes.trim() === ""
    ) {
      errors.otherReasonNotes = true;
    }
  }

  // Conditional mandatory: completingWithDeficiency
  // Only mandatory if walkoutOnHold === 2 (No/Hold)
  if (formData.walkoutOnHold === 2) {
    if (
      formData.completingWithDeficiency === null ||
      formData.completingWithDeficiency === undefined
    ) {
      errors.completingWithDeficiency = true;
    }
  }

  // 7. Provider Notes - Mandatory validations

  // Provider's note from ES - mandatory
  if (!formData.providerNotesFromES || !formData.providerNotesFromES.trim()) {
    errors.providerNotesFromES = true;
  }

  // Doctor note completed - mandatory
  if (!formData.doctorNoteCompleted) {
    errors.doctorNoteCompleted = true;
  }

  // Notes updated on DOS - mandatory
  if (!formData.notesUpdatedOnDOS) {
    errors.notesUpdatedOnDOS = true;
  }

  // Note includes 4 elements - mandatory
  if (!formData.noteIncludesFourElements) {
    errors.noteIncludesFourElements = true;
  }

  // Check with AI button - mandatory
  // If provider notes exist, AI check must be performed
  if (formData.providerNotesFromES && formData.providerNotesFromES.trim()) {
    if (!formData.checkedByAi) {
      errors.checkedByAi = true;
    }
  }

  // 8. On Hold Note (newOnHoldNote) - mandatory for LC3 submission
  if (!formData.newOnHoldNote || !formData.newOnHoldNote.trim()) {
    errors.newOnHoldNote = true;
  }

  return errors;
};

/**
 * Validate Office Section
 * @param {Object} formData - Form data object
 * @param {boolean} isPatientPresent - Whether patient came to appointment
 * @param {boolean} isZeroProduction - Whether it's a zero production walkout
 * @returns {Object} - Object with field names as keys and true as values for fields with errors
 */
/**
 * Validate Office Section
 * @param {Object} formData - Form data object
 * @param {boolean} isPatientPresent - Whether patient came to appointment
 * @param {boolean} isZeroProduction - Whether it's a zero production walkout
 * @returns {Object} - Object with field names as keys and true as values for fields with errors
 */
export const validateOfficeSection = (
  formData,
  isPatientPresent,
  isZeroProduction,
) => {
  const errors = {};

  // LEVEL 1: Patient Came (ALWAYS MANDATORY)
  if (
    formData.patientCame === undefined ||
    formData.patientCame === null ||
    formData.patientCame === ""
  ) {
    errors.patientCame = true;
  }

  // If patient didn't come, no other validations needed
  if (formData.patientCame === 2 || !isPatientPresent) {
    return errors;
  }

  // LEVEL 2: Post-Op Zero Production (Mandatory if patient came)
  if (
    formData.postOpZeroProduction === undefined ||
    formData.postOpZeroProduction === null ||
    formData.postOpZeroProduction === ""
  ) {
    errors.postOpZeroProduction = true;
  }

  // LEVEL 3: Patient Type (Mandatory if patient came)
  if (
    formData.patientType === undefined ||
    formData.patientType === null ||
    formData.patientType === ""
  ) {
    errors.patientType = true;
  }

  // LEVEL 4: Has Insurance (Mandatory if patient came)
  if (
    formData.hasInsurance === undefined ||
    formData.hasInsurance === null ||
    formData.hasInsurance === ""
  ) {
    errors.hasInsurance = true;
  }

  // LEVEL 5: Insurance Type (Mandatory if hasInsurance = Yes)
  if (formData.hasInsurance === 1) {
    if (
      formData.insuranceType === undefined ||
      formData.insuranceType === null ||
      formData.insuranceType === ""
    ) {
      errors.insuranceType = true;
    }

    // LEVEL 5b: Specific Insurance (Mandatory if insuranceType = 2 or 6)
    if (formData.insuranceType === 2 || formData.insuranceType === 6) {
      if (
        formData.insurance === undefined ||
        formData.insurance === null ||
        formData.insurance === ""
      ) {
        errors.insurance = true;
      }
    }
  }

  // LEVEL 6: Google Review Request (Mandatory if patient came)
  if (
    formData.googleReviewRequest === undefined ||
    formData.googleReviewRequest === null ||
    formData.googleReviewRequest === ""
  ) {
    errors.googleReviewRequest = true;
  }

  // If zero production, no payment/document validations needed
  if (formData.postOpZeroProduction === 1 || isZeroProduction) {
    return errors;
  }

  // === PAYMENT SECTION VALIDATIONS (Only if NOT zero production) ===

  // LEVEL 7: Expected Patient Portion (Mandatory, can be 0)
  if (
    formData.expectedPatientPortionOfficeWO === undefined ||
    formData.expectedPatientPortionOfficeWO === null ||
    formData.expectedPatientPortionOfficeWO === ""
  ) {
    errors.expectedPatientPortionOfficeWO = true;
  }

  // LEVEL 10: Primary Payment Mode & Amount
  if (
    formData.patientPortionPrimaryMode !== undefined &&
    formData.patientPortionPrimaryMode !== null &&
    formData.patientPortionPrimaryMode !== ""
  ) {
    // If primary mode selected, amount is mandatory
    if (
      formData.amountCollectedPrimaryMode === undefined ||
      formData.amountCollectedPrimaryMode === null ||
      formData.amountCollectedPrimaryMode === ""
    ) {
      errors.amountCollectedPrimaryMode = true;
    }
  }

  // LEVEL 11: Secondary Payment Mode & Amount
  if (
    formData.patientPortionSecondaryMode !== undefined &&
    formData.patientPortionSecondaryMode !== null &&
    formData.patientPortionSecondaryMode !== ""
  ) {
    // If secondary mode selected, amount is mandatory
    if (
      formData.amountCollectedSecondaryMode === undefined ||
      formData.amountCollectedSecondaryMode === null ||
      formData.amountCollectedSecondaryMode === ""
    ) {
      errors.amountCollectedSecondaryMode = true;
    }
  }

  // LEVEL 12: Check/Forte Last Four Digits
  const isPrimaryMode4 = formData.patientPortionPrimaryMode === 4;
  const isSecondaryMode4 = formData.patientPortionSecondaryMode === 4;

  if (isPrimaryMode4 || isSecondaryMode4) {
    if (
      formData.lastFourDigitsCheckForte === undefined ||
      formData.lastFourDigitsCheckForte === null ||
      formData.lastFourDigitsCheckForte === ""
    ) {
      errors.lastFourDigitsCheckForte = true;
    } else {
      // Validate exactly 4 digits
      const digits = formData.lastFourDigitsCheckForte.toString();
      if (digits.length !== 4) {
        errors.lastFourDigitsCheckForte = true;
      }
    }
  }

  // LEVEL 13: Reason for Less Collection (if difference is negative)
  const difference = formData.differenceInPatientPortion || 0;
  if (difference < 0) {
    if (
      formData.reasonLessCollection === undefined ||
      formData.reasonLessCollection === null ||
      formData.reasonLessCollection === ""
    ) {
      errors.reasonLessCollection = true;
    }
  }

  // === RULE ENGINE SECTION ===

  // LEVEL 14: Rule Engine Run Status (Mandatory)
  if (
    formData.ruleEngineRun === undefined ||
    formData.ruleEngineRun === null ||
    formData.ruleEngineRun === ""
  ) {
    errors.ruleEngineRun = true;
  }

  // LEVEL 15a: If rule engine ran
  if (formData.ruleEngineRun === 1) {
    // Rule Engine Error is mandatory
    if (
      formData.ruleEngineError === undefined ||
      formData.ruleEngineError === null ||
      formData.ruleEngineError === ""
    ) {
      errors.ruleEngineError = true;
    }

    // LEVEL 15b: If error occurred
    if (formData.ruleEngineError === 1) {
      // Error Fix Remarks is mandatory
      if (!formData.errorFixRemarks || formData.errorFixRemarks.trim() === "") {
        errors.errorFixRemarks = true;
      }

      // Issues Fixed is mandatory
      if (
        formData.issuesFixed === undefined ||
        formData.issuesFixed === null ||
        formData.issuesFixed === ""
      ) {
        errors.issuesFixed = true;
      }
    }
  }

  // LEVEL 15c: If rule engine did NOT run
  if (formData.ruleEngineRun === 2) {
    // Rule Engine Not Run Reason is mandatory
    if (
      formData.ruleEngineNotRunReason === undefined ||
      formData.ruleEngineNotRunReason === null ||
      formData.ruleEngineNotRunReason === ""
    ) {
      errors.ruleEngineNotRunReason = true;
    }
  }

  // === DOCUMENT SECTION (Boolean fields) ===

  // LEVEL 16: Document Boolean Fields (All mandatory - must be checked/true)
  if (
    formData.signedGeneralConsent === undefined ||
    formData.signedGeneralConsent === null ||
    formData.signedGeneralConsent === false
  ) {
    errors.signedGeneralConsent = true;
  }

  if (
    formData.signedTxPlan === undefined ||
    formData.signedTxPlan === null ||
    formData.signedTxPlan === false
  ) {
    errors.signedTxPlan = true;
  }

  if (
    formData.xRayPanoAttached === undefined ||
    formData.xRayPanoAttached === null ||
    formData.xRayPanoAttached === false
  ) {
    errors.xRayPanoAttached = true;
  }

  if (
    formData.prcUpdatedInRouteSheet === undefined ||
    formData.prcUpdatedInRouteSheet === null ||
    formData.prcUpdatedInRouteSheet === false
  ) {
    errors.prcUpdatedInRouteSheet = true;
  }

  if (
    formData.routeSheet === undefined ||
    formData.routeSheet === null ||
    formData.routeSheet === false
  ) {
    errors.routeSheet = true;
  }

  return errors;
};

/**
 * Check if validation errors object has any errors
 * @param {Object} errors - Errors object from validation functions
 * @returns {boolean} - True if there are errors, false otherwise
 */
export const hasValidationErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Clear specific validation error
 * @param {Object} errors - Current errors object
 * @param {string} fieldName - Field name to clear error for
 * @returns {Object} - Updated errors object
 */
export const clearValidationError = (errors, fieldName) => {
  const updated = { ...errors };
  delete updated[fieldName];
  return updated;
};
