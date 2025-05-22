import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserGuide() {
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

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading user guide...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error loading user guide: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-width-1200px mx-auto px-4 py-3">
          <button 
            onClick={handleBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg 
              className="w-4 h-4 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Back
          </button>
        </div>
      </div>
      
      {/* User guide content */}
      <div 
        className="user-guide-wrapper"
        dangerouslySetInnerHTML={{ __html: guideContent }}
      />
    </div>
  );
}

export default UserGuide;

export default UserGuide;
