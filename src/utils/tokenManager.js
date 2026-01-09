// Centralized Token Management & Expiry Handling
// This ensures consistent logout behavior across the entire app

/**
 * Handle token expiry - Centralized logout logic
 * Called from:
 * - Axios interceptor (for all axios API calls)
 * - fetchWithAuth wrapper (for all fetch API calls)
 * - Manual logout
 */
export const handleTokenExpiry = () => {
  console.log("🔒 Token expired - Logging out and redirecting to login");

  // Clear all authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Redirect to login page
  // Using window.location ensures complete page reload and state reset
  window.location.href = "/login";
};

/**
 * Check if token exists
 */
export const hasToken = () => {
  return !!localStorage.getItem("token");
};

/**
 * Get current token
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Set token
 */
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

/**
 * Clear token
 */
export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
