import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-[50vw] max-w-[50vw] h-[80vh] flex flex-col">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">User Guide</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            aria-label="Close user guide"
          >
            ×
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-lg">Loading user guide...</div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600">Error loading user guide: {error}</div>
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
