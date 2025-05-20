// File: src/components/ProjectSetup/TextSettings.js

import React, { useState, useEffect } from 'react';

const TextSettings = ({ formData, handleFieldChange }) => {
  // State for text status options
  const [textStatuses, setTextStatuses] = useState(['Draft', 'Approved']);
  const [newStatus, setNewStatus] = useState('');
  
  // State for text tag options
  const [textTags, setTextTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  // Load statuses and tags from formData if they exist
  useEffect(() => {
    if (formData.textStatuses) {
      setTextStatuses(formData.textStatuses);
    }
    
    if (formData.textTags) {
      setTextTags(formData.textTags);
    }
  }, [formData.textStatuses, formData.textTags]);

  // Handle checkbox change
  const handleCheckboxChange = (field, checked) => {
    handleFieldChange(field, checked);
  };

  // Handle adding a new text status
  const handleAddStatus = () => {
    if (newStatus && newStatus.trim() !== '' && !textStatuses.includes(newStatus.trim())) {
      const updatedStatuses = [...textStatuses, newStatus.trim()];
      setTextStatuses(updatedStatuses);
      handleFieldChange('textStatuses', updatedStatuses);
      setNewStatus('');
    }
  };

  // Handle removing a text status
  const handleRemoveStatus = (status) => {
    const updatedStatuses = textStatuses.filter(s => s !== status);
    setTextStatuses(updatedStatuses);
    handleFieldChange('textStatuses', updatedStatuses);
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag && newTag.trim() !== '' && !textTags.includes(newTag.trim())) {
      const updatedTags = [...textTags, newTag.trim()];
      setTextTags(updatedTags);
      handleFieldChange('textTags', updatedTags);
      setNewTag('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag) => {
    const updatedTags = textTags.filter(t => t !== tag);
    setTextTags(updatedTags);
    handleFieldChange('textTags', updatedTags);
  };

  // Handle key press in input fields
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="form-section">
      <h3>Text settings</h3>
      
      <div className="form-group">
        <div className="checkbox-item">
          <input
            type="checkbox"
            id="hasHierarchicalText"
            checked={formData.hasHierarchicalText || false}
            onChange={(e) => handleCheckboxChange('hasHierarchicalText', e.target.checked)}
          />
          <label htmlFor="hasHierarchicalText">My project has hierarchical text</label>
        </div>
        
        <div className="checkbox-item">
          <input
            type="checkbox"
            id="tracksTextStatus"
            checked={formData.tracksTextStatus || false}
            onChange={(e) => handleCheckboxChange('tracksTextStatus', e.target.checked)}
          />
          <label htmlFor="tracksTextStatus">I want to track the status of texts</label>
        </div>
        
        <div className="checkbox-item">
          <input
            type="checkbox"
            id="wantsTextTags"
            checked={formData.wantsTextTags || false}
            onChange={(e) => handleCheckboxChange('wantsTextTags', e.target.checked)}
          />
          <label htmlFor="wantsTextTags">I want to add a tag to texts</label>
        </div>
        
        {/* Fix 7: Add new checkbox for author names in archived projects */}
        <div className="checkbox-item">
          <input
            type="checkbox"
            id="doNotSaveAuthorNames"
            checked={formData.doNotSaveAuthorNames || false}
            onChange={(e) => handleCheckboxChange('doNotSaveAuthorNames', e.target.checked)}
          />
          <label htmlFor="doNotSaveAuthorNames">Do not include author names when exporting</label>
        </div>
      </div>
      
      {/* Text statuses section - only visible when tracksTextStatus is true */}
      {formData.tracksTextStatus && (
        <div className="form-group">
          <h3>Text statuses</h3>
          <p>Define the statuses that can be assigned to project texts.</p>
          
          <div className="selected-items-list">
            {textStatuses.map((status) => (
              <div key={status} className="selected-item">
                <span>{status}</span>
                <button 
                  type="button" 
                  className="remove-item-btn"
                  onClick={() => handleRemoveStatus(status)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="input-with-button">
            <input
              type="text"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddStatus)}
              placeholder="Enter new status"
              className="text-input"
            />
            <button
              type="button"
              onClick={handleAddStatus}
              className="add-option-btn"
            >
              Add
            </button>
          </div>
        </div>
      )}
      
      {/* Text tags section - only visible when wantsTextTags is true */}
      {formData.wantsTextTags && (
        <div className="form-group">
          <h3>Text tags</h3>
          <p>Define the tags that can be assigned to project texts.</p>
          
          <div className="selected-items-list">
            {textTags.map((tag) => (
              <div key={tag} className="selected-item">
                <span>{tag}</span>
                <button 
                  type="button" 
                  className="remove-item-btn"
                  onClick={() => handleRemoveTag(tag)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="input-with-button">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddTag)}
              placeholder="Enter new tag"
              className="text-input"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="add-option-btn"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSettings;
