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
  if (!formData.preAuthAvailable) {
    errors.preAuthAvailable = true;
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
  if (!formData.perioChart) {
    errors.perioChart = true;
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
  // Only mandatory if walkoutOnHold === 2 (No/Hold)
  if (formData.walkoutOnHold === 2) {
    if (!formData.onHoldReasons || formData.onHoldReasons.length === 0) {
      errors.onHoldReasons = true;
    }
  }

  // Conditional mandatory: otherReasonNotes
  // Only mandatory if walkoutOnHold === 2 (No/Hold)
  if (formData.walkoutOnHold === 2) {
    if (
      formData.otherReasonNotes === null ||
      formData.otherReasonNotes === undefined ||
      formData.otherReasonNotes.trim() === ""
    ) {
      errors.otherReasonNotes = true;
    }
  }

  // Conditional mandatory: completingWithDeficiency
  // Only mandatory if walkoutOnHold === 1 (Yes/Completing)
  if (formData.walkoutOnHold === 1) {
    if (
      formData.completingWithDeficiency === null ||
      formData.completingWithDeficiency === undefined
    ) {
      errors.completingWithDeficiency = true;
    }
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
export const validateOfficeSection = (
  formData,
  isPatientPresent,
  isZeroProduction
) => {
  const errors = {};

  // Add office section validation logic here if needed in future
  // For now, return empty errors object

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
