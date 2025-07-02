import { useState, useEffect } from 'react';

const LicenseSelector = ({ formData, handleFormChange, licenceOptions, setLicenceOptions }) => {
  const [newLicence, setNewLicence] = useState('');
  
  // Load saved license options from localStorage on mount
  useEffect(() => {
    const savedOptions = localStorage.getItem('licenceOptions');
    if (savedOptions) {
      try {
        const parsedOptions = JSON.parse(savedOptions);
        if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
          setLicenceOptions(parsedOptions);
        }
      } catch (e) {
        console.error('Error parsing saved license options:', e);
      }
    }
  }, [setLicenceOptions]);
  
  const handleAddLicence = () => {
    if (newLicence && !licenceOptions.includes(newLicence)) {
      const updatedOptions = [...licenceOptions, newLicence];
      setLicenceOptions(updatedOptions);
      
      // Auto-select the new license
      handleFormChange({
        target: {
          name: 'usageLicence',
          value: newLicence
        }
      });
      
      setNewLicence('');
      
      // Store updated options in localStorage for persistence
      localStorage.setItem('licenceOptions', JSON.stringify(updatedOptions));
    }
  };

  return (
    <>
      {/* Copyright licensor */}
      <div className="form-group">
        <label htmlFor="copyrightLicensor">
          Copyright licensor
          <span className="required-indicator">*</span>
          <span className="tooltip-icon" title="The person or organisation who is authorised to grant usage permission(s) associated with the text. This is not necessarily the copyright holder.">ⓘ</span>
        </label>
        <input
          type="text"
          id="copyrightLicensor"
          name="copyrightLicensor"
          value={formData.copyrightLicensor || ''}
          onChange={handleFormChange}
          className="text-input"
          required
        />
      </div>
      
      {/* Usage licence - Prepopulated with Creative Commons options */}
      <div className="form-group">
        <label htmlFor="usageLicence">
          Usage licence
          <span className="required-indicator">*</span>
          <span className="tooltip-icon" title="The type of licence that has been granted. For example, CC BY 4.0. You may also want to list any restrictions on the use.">ⓘ</span>
        </label>
        <div className="licence-selection">
          <select
            id="usageLicence"
            name="usageLicence"
            value={formData.usageLicence || ''}
            onChange={handleFormChange}
            className="select-input"
            required
          >
            <option value="">Select licence</option>
            {licenceOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
            <option value="custom">+ Add new licence...</option>
          </select>
          {formData.usageLicence === 'custom' && (
            <div className="custom-option-input">
              <input
                type="text"
                value={newLicence}
                onChange={(e) => setNewLicence(e.target.value)}
                placeholder="Enter licence type"
                className="text-input custom-input"
              />
              <button
                type="button"
                onClick={handleAddLicence}
                className="add-option-btn"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LicenseSelector;
