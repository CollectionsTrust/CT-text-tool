import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserGuide.css';

function UserGuide({ isPublic = false }) {
  const [guideContent, setGuideContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/user-guide.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load user guide');
        }
        return response.text();
      })
      .then(html => {
        setGuideContent(html);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading user guide:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleClose = () => {
    if (isPublic) {
      // For public access from landing page, go back to home
      navigate('/');
    } else {
      // For logged-in users, try to return to where they came from
      const returnPath = sessionStorage.getItem('returnPath');
      if (returnPath) {
        sessionStorage.removeItem('returnPath');
        navigate(returnPath);
      } else {
        // Fallback to dashboard if no return path
        navigate('/dashboard');
      }
    }
  };

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isPublic]);

  // Handle click outside popup to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="user-guide-overlay"
      onClick={handleBackdropClick}
    >
      <div className="user-guide-modal">
        {/* Header with close button */}
        <div className="user-guide-header">
          <h2 className="user-guide-title">/h2>
          <button
            onClick={handleClose}
            className="user-guide-close-btn"
            aria-label="Close user guide"
          >
            ×
          </button>
        </div>

        {/* Content area */}
        <div className="user-guide-content-wrapper">
          {loading && (
            <div className="user-guide-loading">
              <div className="loading-spinner"></div>
              <p>Loading user guide...</p>
            </div>
          )}
          
          {error && (
            <div className="user-guide-error">
              <div className="error-message">
                <p>Error loading user guide: {error}</p>
              </div>
            </div>
          )}
          
          {!loading && !error && (
            <div 
              className="user-guide-content"
              dangerouslySetInnerHTML={{ __html: guideContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default UserGuide;
