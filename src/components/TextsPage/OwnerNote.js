import React from 'react';
import { Link } from 'react-router-dom';

const OwnerNote = ({ projectId, setupComplete }) => {
  return (
    <div className="owner-note">
      <h3>Project Owner Note</h3>
      <p>The text management feature will allow you to create and manage text content related to your collection objects.</p>
      
      {!setupComplete && (
        <div className="setup-warning">
          <p>⚠️ Your project setup is incomplete. Please <Link to={`/projects/${projectId}`}>complete the setup</Link> to enable all features.</p>
        </div>
      )}
      
      <div className="owner-navigation">
        <Link to={`/projects/${projectId}/objects`} className="nav-link">
          View Objects
        </Link>
        <Link to={`/projects/${projectId}?edit=true`} className="nav-link">
          Edit Project Settings
        </Link>
        <Link to="/dashboard" className="nav-link">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default OwnerNote;
