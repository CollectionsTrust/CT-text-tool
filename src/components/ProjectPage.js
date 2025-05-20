import React from 'react';
import { Link } from 'react-router-dom';

// This is an extremely simplified bridge file with no external dependencies
// All components are defined inline to avoid import issues

const ProjectPage = () => {
  // Form state
  const [token, setToken] = React.useState('');
  const [formData, setFormData] = React.useState({
    projectReferenceNumber: '',
    textNumberPrefix: 'TXT',
  });
  
  // Form handler
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  return (
    <div className="container">
      <div className="header">
        <h1>Project set-up</h1>
        <div className="nav-buttons">
          <Link to="/objects" className="nav-btn">Objects</Link>
          <Link to="/texts" className="nav-btn">Texts</Link>
        </div>
      </div>
      
      <div className="project-settings-buttons">
        <button 
          type="button" 
          className="save-details-btn"
        >
          Save project details
        </button>
        <button 
          type="button" 
          className="clear-details-btn"
        >
          Clear project details
        </button>
      </div>
      
      <form className="project-form">
        {/* Project reference number */}
        <div className="form-group">
          <label htmlFor="projectReferenceNumber">
            Project reference number
            <span className="required-indicator">*</span>
            <span className="tooltip-icon" title="The unique number assigned to your project.">ⓘ</span>
          </label>
          <input
            type="text"
            id="projectReferenceNumber"
            name="projectReferenceNumber"
            value={formData.projectReferenceNumber}
            onChange={handleFormChange}
            className="text-input"
            required
          />
        </div>
        
        {/* Text number prefix */}
        <div className="form-group">
          <label htmlFor="textNumberPrefix">
            Text number prefix
            <span className="required-indicator">*</span>
            <span className="tooltip-icon" title="The default prefix for the text reference number.">ⓘ</span>
          </label>
          <input
            type="text"
            id="textNumberPrefix"
            name="textNumberPrefix"
            value={formData.textNumberPrefix}
            onChange={handleFormChange}
            className="text-input"
            required
          />
        </div>
        
        {/* MDS API Token */}
        <div className="form-group">
          <label htmlFor="token">MDS API token:</label>
          <textarea
            id="token"
            className="token-input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your MDS API token here..."
            rows={6}
            required
          />
        </div>
        
        <div className="form-buttons">
          <button 
            type="button" 
            className="process-btn"
          >
            Fetch MDS Records
          </button>
          <button type="submit" className="submit-btn">Continue to Objects</button>
        </div>
      </form>
    </div>
  );
};

export default ProjectPage;
