import React from "react";
import "./LoadingSpinner.css";

/**
 * Full-screen loading spinner component with overlay
 * Shows a modern, animated spinner in the center of the screen
 * with a semi-transparent white background overlay
 */
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner-container">
        <div className="spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-dot"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
