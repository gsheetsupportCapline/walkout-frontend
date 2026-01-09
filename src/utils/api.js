import axios from "axios";
import { handleTokenExpiry, getToken } from "./tokenManager";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors - GLOBAL for ALL axios calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check for TOKEN_EXPIRED in response body
      const errorData = error.response?.data;
      if (
        errorData?.error === "TOKEN_EXPIRED" ||
        errorData?.message?.includes("Token expired") ||
        errorData?.message?.includes("token")
      ) {
        handleTokenExpiry();
      } else {
        // Any other 401 error - still logout
        handleTokenExpiry();
      }
    }
    return Promise.reject(error);
  }
);

// Fetch wrapper with automatic token expiry handling - GLOBAL for ALL fetch calls
export const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();

  // Add Authorization header if token exists
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check for token expiry or unauthorized
    if (response.status === 401) {
      try {
        const data = await response.json();

        // If token expired, redirect to login
        if (
          data.error === "TOKEN_EXPIRED" ||
          data.message?.includes("Token expired") ||
          data.message?.includes("token")
        ) {
          handleTokenExpiry();
          throw new Error("Token expired. Redirecting to login...");
        }
      } catch (jsonError) {
        // If response is not JSON, still treat as token expiry
        handleTokenExpiry();
        throw new Error("Unauthorized. Redirecting to login...");
      }
    }

    return response;
  } catch (error) {
    // Network error or other issues
    throw error;
  }
};

export default api;
