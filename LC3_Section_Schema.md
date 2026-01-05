# LC3 Section - Complete Backend Schema Keys

## A. RULE ENGINE CHECK

```javascript
{
  // Fieldset Status
  "fieldsetStatus": String,  // Values: "completed" or "pending"

  // Main Question
  "didLc3RunRules": Number,  // incrementalId from radio buttons (Yes/No)

  // Conditional Fields (based on didLc3RunRules answer)
  "ruleEngineUniqueId": String,  // Shows when "Yes" selected - Text input
  "reasonForNotRun": Number,     // Shows when "No" selected - incrementalId from dropdown

  // Failed Rules Array (fetched from API when Yes + Unique ID entered)
  "failedRules": [
    {
      "message": String,    // Rule failure message from API
      "resolved": Number  // incrementalId from radio buttons (Yes/No)
    }
  ],

  // Dynamic fields for each failed rule response
  // Example: "failedRule0": "Yes", "failedRule1": "No", "failedRule2": "Pending"
  // Pattern: failedRule{index} where index is 0, 1, 2, etc.
}
```

---

## B. DOCUMENT CHECK

```javascript
{
  // Fieldset Status
  "lc3DocumentCheckStatus": String,  // Values: "completed" or "pending"

  // Document Availability Dropdowns (all use incrementalId)
  "signedTreatmentPlanAvailable": Number,  // incrementalId from dropdown
  "prcAvailable": Number,
  "signedConsentGeneralAvailable": Number,
  "nvdAvailable": Number,
  "narrativeAvailable": Number,
  "signedConsentTxAvailable": Number,
  "preAuthAvailable": Number,
  "routeSheetAvailable": Number,

  // Special Question - Radio Buttons
  "orthoQuestionnaireAvailable": Number  // incrementalId from radio buttons (Yes/No/NA)
}
```

---

## C. ATTACHMENTS CHECK

```javascript
{
  // Fieldset Status
  "lc3AttachmentsCheckStatus": String,  // Values: "completed" or "pending"

  // X-ray Availability Dropdowns (all use incrementalId)
  "pano": Number,        // incrementalId from dropdown
  "fmx": Number,
  "bitewing": Number,
  "pa": Number,
  "perioChart": Number
}
```

---

## D. PATIENT PORTION CHECK

```javascript
{
  // Fieldset Status
  "lc3PatientPortionStatus": String,  // Values: "completed" or "pending"

  // ========== Patient Portion Calculations and Collection by Office ==========
  "expectedPPOffice": Number,           // Expected PP per Office (amount field)
  "ppCollectedOffice": Number,          // PP Collected by Office per Eaglesoft (amount field)
  "ppDifferenceOffice": Number,         // Difference (auto-calculated or manual)

  // NVD Question
  "signedNVDForDifference": Number  // incrementalId from radio buttons (Yes/No)

  // ========== Patient Portion Calculations by LC3 ==========
  "expectedPPLC3": Number,              // Expected PP per LC3 (amount field)
  "ppDifferenceLC3": Number,            // Difference in Expected PP [LC3 vs. Office] (auto-calculated or manual)

  // ========== Verification of Patient Portion Payment ==========
  // Primary Mode Row
  "ppPrimaryMode": Number,              // incrementalId from dropdown (Pat. Portion Primary Mode)
  "amountPrimaryMode": Number,          // Amount Collected Using Primary Mode
  "paymentVerifiedFromPrimary": Number, // incrementalId from dropdown (Payment verified from)

  // Secondary Mode Row
  "ppSecondaryMode": Number,            // incrementalId from dropdown (Pat. Portion Secondary Mode)
  "amountSecondaryMode": Number,        // Amount Collected Using Secondary Mode
  "paymentVerifiedFromSecondary": Number, // incrementalId from dropdown (Payment verified from)

  // ========== Bottom Questions ==========
  "verifyCheckMatchesES": Number  // incrementalId from radio buttons (Yes/No)
                                        // Question: Did you verify if the attached check matches the payment posted in ES?

  "forteCheckAvailable": Number  // incrementalId from radio buttons (Yes/No)
                                        // Question: Do we have the uploaded Forte check available in SD, and does the entered ref# by the office match?
}
```

---

## E. PRODUCTION DETAILS AND WALKOUT SUBMISSION/HOLD

```javascript
{
  // Fieldset Status
  "lc3ProductionStatus": String,  // Values: "completed" or "pending"

  // ========== Production Calculations per Office Walkout ==========
  "totalProductionOffice": Number,       // Total Production (Office) - Amount field
  "estInsuranceOffice": Number,          // Est. Insurance (Office) - Amount field
  "expectedPPOfficeProduction": Number,  // Expected PP (Office) - Amount field (auto-calculated or manual)

  // ========== Production Calculations per LC3 Walkout ==========
  "totalProductionLC3": Number,          // Total Production (LC3) - Amount field
  "estInsuranceLC3": Number,             // Est. Insurance (LC3) - Amount field
  "expectedPPLC3Production": Number,     // Expected PP (LC3) - Amount field (auto-calculated or manual)

  // ========== Difference between LC3 and Office Production [LC3 - Office] ==========
  "totalProductionDifference": Number,   // Total Production Difference - Amount field (auto-calculated or manual)
  "estInsuranceDifference": Number,      // Est Insurance Difference - Amount field (auto-calculated or manual)
  "expectedPPDifference": Number,        // Expected PP Difference - Amount field (auto-calculated or manual)

  // ========== Reason Fields for Differences ==========
  "reasonTotalProductionDiff": Number,      // Reason for Difference in Total Production - incrementalId from dropdown
  "reasonEstInsuranceDiff": Number,         // Reason for Difference in Est Insurance - incrementalId from dropdown

  // ========== Explanation Fields for Differences ==========
  "explanationTotalProductionDiff": String, // Explanation of reason for Difference in Total Production - Text field
  "explanationEstInsuranceDiff": String,    // Explanation of reason for Difference in Est Insurance - Text field

  // ========== Walkout Questions ==========
  "informedOfficeManager": Number,          // incrementalId from radio buttons (Yes/No/Pending)
                                            // Question: Have we informed office manager on HQ for changes made in the walkout?

  "googleReviewSent": Number,               // incrementalId from radio buttons (Yes/No/Pending)
                                            // Question: Has the request for a Google review been sent?

  "containsCrownDentureImplant": Number,    // incrementalId from radio buttons (Yes/No/Pending)
                                            // Question: Does walkout contains Crown/Denture/Implant with Prep/Imp?

  "crownPaidOn": Number,                    // incrementalId from radio buttons (Seat/Prep/NA etc.)
                                            // Question: As per IV crown paid on -

  "deliveredAsPerNotes": Number,            // incrementalId from radio buttons (Yes/No/Pending)
                                            // Question: Does crown/Denture/Implants delivered as per provider notes?

  "walkoutOnHold": Number,                  // incrementalId from radio buttons (Yes/No/Pending)
                                            // Question: Is Walkout getting on Hold?

  "onHoldReasons": Number,                  // incrementalId from dropdown (single select, not array)
                                            // On Hold Reasons dropdown

  "otherReasonNotes": String,               // Other Reason/Notes - Text field

  // ========== Final Question ==========
  "completingWithDeficiency": Number        // incrementalId from radio buttons (Yes/No/Pending)
                                            // Question: Is walkout completing with deficiency?
}
```

---

## F. PROVIDER NOTES

```javascript
{
  // Fieldset Status
  "lc3ProviderNotesStatus": String,  // Values: "completed" or "pending"

  // Provider Notes Questions (all radio buttons)
  "doctorNoteCompleted": String,           // Values: "Yes" or "No" or "Pending"
                                           // Question: Doctor Note Completed?

  "notesUpdatedOnDOS": String,             // Values: "Yes" or "No" or "Pending"
                                           // Question: Notes updated on DOS?

  "noteIncludesFourElements": String       // Values: "Yes" or "No" or "Pending"
                                           // Question: Does the note include all four elements?
}
```

---

## G. REMARKS

```javascript
{
  "lc3Remarks": String  // Text area - Long text field for any additional remarks
}
```

---

## ADDITIONAL FIELDS (Historical/Reference)

```javascript
{
  "lc3HistoricalNotes": [String]  // Array of historical notes (if maintained from previous versions)
}
```

---

## FIELD TYPE SUMMARY

### String Type Fields (Radio Buttons - Values: "Yes" / "No" / "Pending")

- fieldsetStatus (but values are "completed" / "pending")
- lc3DocumentCheckStatus
- lc3AttachmentsCheckStatus
- lc3PatientPortionStatus
- lc3ProductionStatus
- lc3ProviderNotesStatus
- orthoQuestionnaireAvailable
- signedNVDForDifference
- verifyCheckMatchesES
- forteCheckAvailable
- productionAsPerOfficeWO
- informedOfficeForDifference
- googleReviewSent
- containsCrown
- crownPaidOn
- crownDeliveredPerNotes
- walkoutOnHold
- completingDeficiency
- doctorNoteCompleted
- notesUpdatedOnDOS
- noteIncludesFourElements
- lc3Remarks (text area)
- ruleEngineUniqueId (text input)

### Number Type Fields (Dropdown incrementalIds, Radio incrementalIds, or Amount Fields)

- didLc3RunRules (radio incrementalId)
- reasonForNotRun (dropdown incrementalId)
- signedTreatmentPlanAvailable through routeSheetAvailable (dropdown incrementalIds)
- orthoQuestionnaireAvailable (radio incrementalId)
- pano, fmx, bitewing, pa, perioChart (dropdown incrementalIds)
- All PP amount fields (expectedPPOffice, ppCollectedOffice, ppDifferenceOffice, expectedPPLC3, ppDifferenceLC3)
- All Production amount fields (totalProductionOffice, estInsuranceOffice, expectedPPOfficeProduction, totalProductionLC3, estInsuranceLC3, expectedPPLC3Production, totalProductionDifference, estInsuranceDifference, expectedPPDifference)
- ppPrimaryMode, ppSecondaryMode (dropdown incrementalIds)
- amountPrimaryMode, amountSecondaryMode (amount fields)
- paymentVerifiedFromPrimary, paymentVerifiedFromSecondary (dropdown incrementalIds)
- signedNVDForDifference (radio incrementalId)
- verifyCheckMatchesES, forteCheckAvailable (radio incrementalIds)
- reasonTotalProductionDiff, reasonEstInsuranceDiff (dropdown incrementalIds)
- informedOfficeManager, googleReviewSent, containsCrownDentureImplant, crownPaidOn, deliveredAsPerNotes, walkoutOnHold, completingWithDeficiency (all radio incrementalIds)
- onHoldReasons (dropdown incrementalId - single value, not array)

### String Type Fields (Radio Buttons - Values: "Yes" / "No" / "Pending")

- fieldsetStatus (but values are "completed" / "pending")
- lc3DocumentCheckStatus
- lc3AttachmentsCheckStatus
- lc3PatientPortionStatus
- lc3ProductionStatus
- lc3ProviderNotesStatus
- orthoQuestionnaireAvailable
- signedNVDForDifference
- verifyCheckMatchesES
- forteCheckAvailable
- productionAsPerOfficeWO
- informedOfficeForDifference
- googleReviewSent
- containsCrown
- crownPaidOn
- crownDeliveredPerNotes
- walkoutOnHold
- completingDeficiency
- doctorNoteCompleted
- notesUpdatedOnDOS
- noteIncludesFourElements
- lc3Remarks (text area)
- ruleEngineUniqueId (text input)

### Array Type Fields

- failedRules: Array of objects with {message: String, resolved: Number (incrementalId)}
- lc3HistoricalNotes: Array of Strings

### Dynamic Fields (Created at Runtime)

- failedRule0, failedRule1, failedRule2, etc. (Number values: incrementalId from radio buttons for Yes/No/Pending)

---

## NOTES FOR BACKEND IMPLEMENTATION

1. **Validation Rules:**

   - Status fields should only accept "completed" or "pending"
   - Radio button fields store incrementalId (Number type)
   - Dropdown fields store incrementalId (Number type)
   - Number fields should validate as positive numbers or zero
   - incrementalId fields should validate against actual dropdown/radio options

2. **Conditional Fields:**

   - `ruleEngineUniqueId` required when `didLc3RunRules` is "Yes" incrementalId
   - `reasonForNotRun` required when `didLc3RunRules` is "No" incrementalId
   - `crownPaidOn` always visible (not conditional)
   - `deliveredAsPerNotes` always visible (not conditional)
   - `onHoldReasons` dropdown always visible (not conditional on walkoutOnHold)

3. **Auto-calculated Fields (Optional):**

   - `ppDifferenceOffice` = expectedPPOffice - ppCollectedOffice
   - `ppDifferenceLC3` = expectedPPLC3 - expectedPPOffice
   - `expectedPPOfficeProduction` = totalProductionOffice - estInsuranceOffice
   - `expectedPPLC3Production` = totalProductionLC3 - estInsuranceLC3
   - `totalProductionDifference` = totalProductionLC3 - totalProductionOffice
   - `estInsuranceDifference` = estInsuranceLC3 - estInsuranceOffice
   - `expectedPPDifference` = expectedPPLC3Production - expectedPPOfficeProduction

4. **Required Fields:**
   - Most fields marked with \* in the UI are required
   - Status fields (completed/pending) are always required
   - All radio button and dropdown fields are typically required
   - Text explanation fields are required when there are differences
