import React, { useState, useEffect, useRef } from "react";
import "./MultiSelectDropdown.css";

const MultiSelectDropdown = ({
  options,
  selectedValues = [],
  onChange,
  placeholder = "Select options",
  fieldId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const handleOptionClick = (optionId) => {
    const newValues = selectedValues.includes(optionId)
      ? selectedValues.filter((id) => id !== optionId)
      : [...selectedValues, optionId];
    onChange(newValues);
  };

  const handleRemoveOption = (optionId, e) => {
    e.stopPropagation();
    const newValues = selectedValues.filter((id) => id !== optionId);
    onChange(newValues);
  };

  const getSelectedOptions = () => {
    return options.filter((opt) => selectedValues.includes(opt.incrementalId));
  };

  const getFilteredOptions = () => {
    if (!searchTerm.trim()) {
      return options;
    }
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div
      className="multi-select-container"
      ref={dropdownRef}
      data-field-id={fieldId}
    >
      <div className="multi-select-header" onClick={handleToggle}>
        <div className="multi-select-selected">
          {selectedValues.length > 0 ? (
            <div className="selected-items-inline">
              {getSelectedOptions().map((option) => (
                <span key={option.incrementalId} className="selected-tag">
                  {option.name}
                  <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={(e) => handleRemoveOption(option.incrementalId, e)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="placeholder-text">{placeholder}</span>
          )}
        </div>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          <div className="search-box-container">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="options-list">
            {getFilteredOptions().length > 0 ? (
              getFilteredOptions().map((option) => (
                <div
                  key={option._id}
                  className="multi-select-option"
                  onClick={() => handleOptionClick(option.incrementalId)}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.incrementalId)}
                    readOnly
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label>{option.name}</label>
                </div>
              ))
            ) : (
              <div className="no-options">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
