import React, { useState, useEffect } from 'react';

function UserGuide() {
  const [guideContent, setGuideContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div 
      className="user-guide-wrapper"
      dangerouslySetInnerHTML={{ __html: guideContent }}
    />
  );
}

export default UserGuide;
