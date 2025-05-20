import React, { useState } from 'react';
import ProjectMetaFields from './ProjectMetaFields';
import RichTextEditor from './RichTextEditor';
import LanguageSelector from './LanguageSelector';
import AuthorSelector from './AuthorSelector';
import LicenseSelector from './LicenseSelector';
import OptionalFields from './OptionalFields';
import TokenField from './TokenField';

const ProjectForm = ({ 
  formData, 
  handleFormChange, 
  handleSubmit,
  token,
  setToken,
  error,
  selectedLanguages,
  selectedAuthors,
  licenceOptions,
  onAddLanguage,
  onRemoveLanguage,
  onAddAuthor,
  onRemoveAuthor
}) => {
  // New state for text options
  const [showTextStatusOptions, setShowTextStatusOptions] = useState(false);
  const [showTagOptions, setShowTagOptions] = useState(false);
  const [textStatuses, setTextStatuses] = useState(formData.textStatuses || ['Draft', 'Final']);
  const [textTags, setTextTags] = useState(formData.textTags || []);
  const [newStatus, setNewStatus] = useState('');
  const [newTag, setNewTag] = useState('');

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    handleFormChange({
      target: {
        name,
        value: checked
      }
    });
  };

  // Handle adding a new text status
  const handleAddStatus = () => {
    if (newStatus.trim() && !textStatuses.includes(newStatus.trim())) {
      const updatedStatuses = [...textStatuses, newStatus.trim()];
      setTextStatuses(updatedStatuses);
      
      // Update form data
      handleFormChange({
        target: {
          name: 'textStatuses',
          value: updatedStatuses
        }
      });
      
      setNewStatus('');
    }
  };

  // Handle removing a text status
  const handleRemoveStatus = (status) => {
    const updatedStatuses = textStatuses.filter(s => s !== status);
    setTextStatuses(updatedStatuses);
    
    // Update form data
    handleFormChange({
      target: {
        name: 'textStatuses',
        value: updatedStatuses
      }
    });
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !textTags.includes(newTag.trim())) {
      const updatedTags = [...textTags, newTag.trim()];
      setTextTags(updatedTags);
      
      // Update form data
      handleFormChange({
        target: {
          name: 'textTags',
          value: updatedTags
        }
      });
      
      setNewTag('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag) => {
    const updatedTags = textTags.filter(t => t !== tag);
    setTextTags(updatedTags);
    
    // Update form data
    handleFormChange({
      target: {
        name: 'textTags',
        value: updatedTags
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <ProjectMetaFields 
        formData={formData} 
        handleFormChange={handleFormChange} 
      />
      
      <RichTextEditor 
        value={formData.projectNote} 
        onChange={(content) => {
          handleFormChange({
            target: {
              name: 'projectNote',
              value: content
            }
          });
        }} 
      />
      
      <LanguageSelector 
        selectedLanguages={selectedLanguages}
        onAddLanguage={onAddLanguage}
        onRemoveLanguage={onRemoveLanguage}
      />
      
      <AuthorSelector 
        selectedAuthors={selectedAuthors}
        onAddAuthor={onAddAuthor}
        onRemoveAuthor={onRemoveAuthor}
      />
      
      {/* New text options section */}
      <div className="form-section">
        <h3>Text Settings</h3>
        
        <div className="form-group">
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="hasHierarchicalText"
              name="hasHierarchicalText"
              checked={formData.hasHierarchicalText || false}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="hasHierarchicalText">My project has hierarchical text</label>
          </div>
          
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="tracksTextStatus"
              name="tracksTextStatus"
              checked={formData.tracksTextStatus || false}
              onChange={(e) => {
                handleCheckboxChange(e);
                setShowTextStatusOptions(e.target.checked);
              }}
            />
            <label htmlFor="tracksTextStatus">I want to track the status of texts</label>
          </div>
          
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="wantsTextTags"
              name="wantsTextTags"
              checked={formData.wantsTextTags || false}
              onChange={(e) => {
                handleCheckboxChange(e);
                setShowTagOptions(e.target.checked);
              }}
            />
            <label htmlFor="wantsTextTags">I want to add a tag to texts</label>
          </div>
        </div>
        
        {/* Text status options */}
        {(showTextStatusOptions || formData.tracksTextStatus) && (
          <div className="form-group text-status-options">
            <label>Text Statuses</label>
            <p className="help-text">Define the statuses that can be assigned to texts in your project.</p>
            
            <div className="status-list">
              {textStatuses.map(status => (
                <div key={status} className="status-item">
                  <span>{status}</span>
                  <button
                    type="button"
                    className="remove-status-btn"
                    onClick={() => handleRemoveStatus(status)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="add-status-container">
              <input
                type="text"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="Enter new status"
                className="text-input"
              />
              <button
                type="button"
                className="add-status-btn"
                onClick={handleAddStatus}
              >
                Add
              </button>
            </div>
          </div>
        )}
        
        {/* Text tag options */}
        {(showTagOptions || formData.wantsTextTags) && (
          <div className="form-group text-status-options">
            <label>Text Tags</label>
            <p className="help-text">Define the tags that can be assigned to texts in your project.</p>
            
            <div className="status-list">
              {textTags.map(tag => (
                <div key={tag} className="status-item">
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="remove-status-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="add-status-container">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter new tag"
                className="text-input"
              />
              <button
                type="button"
                className="add-status-btn"
                onClick={handleAddTag}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
      
      <LicenseSelector 
        formData={formData} 
        handleFormChange={handleFormChange}
        licenceOptions={licenceOptions}
      />
      
      <OptionalFields 
        formData={formData} 
        handleFormChange={handleFormChange} 
      />
      
      <TokenField 
        token={token} 
        setToken={setToken} 
        error={error} 
      />
    </form>
  );
};

export default ProjectForm;
