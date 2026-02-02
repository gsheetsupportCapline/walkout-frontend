/**
 * Provider Notes Checker - Backend AI Integration
 * Calls backend API instead of directly calling Gemini
 * This keeps the API key secure on the backend
 */

/**
 * Get AI response to analyze provider and hygienist notes
 * @param {string} providerText - Provider notes text
 * @param {string} hygienistText - Hygienist notes text
 * @returns {Promise<Array>} Array of extracted data in order:
 *   [provider_tooth_number, provider_name, provider_procedure_name, provider_surgical_indicators,
 *    hygienist_tooth_number, hygienist_name, hygienist_procedure_name, hygienist_surgical_indicators]
 */
export async function getGeminiResponse(providerText, hygienistText) {
  console.log("🤖 Sending to backend AI service...");
  console.log("📝 Provider Text:", providerText);
  console.log("📝 Hygienist Text:", hygienistText);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  try {
    const response = await fetch(`${API_URL}/ai/check-notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Auth token
      },
      body: JSON.stringify({
        providerText: providerText || "",
        hygienistText: hygienistText || "",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to analyze notes with AI");
    }

    const responseData = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.message || "AI analysis failed");
    }

    console.log("✅ AI Response from backend:", responseData.data);

    // Return the flat array from backend
    // Format: [provider_tooth#, provider_name, provider_procedure, provider_surgical,
    //          hygienist_tooth#, hygienist_name, hygienist_procedure, hygienist_surgical]
    return responseData.data;
  } catch (error) {
    console.error("❌ Error in getGeminiResponse:", error);
    // Return default false values on error
    return [false, false, false, false, false, false, false, false];
  }
}
