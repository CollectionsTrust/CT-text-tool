import { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ProjectRequestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    projectTitle: '',
    projectDescription: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTermsCheckbox = (e) => {
    setAcceptTerms(e.target.checked);
  };

  const handleShowTerms = (e) => {
    e.preventDefault();
    setShowTerms(true);
    setTermsLoading(true);
    setTermsError(null);

    fetch('/terms-and-conditions.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load terms and conditions');
        }
        return response.text();
      })
      .then(html => {
        setTermsContent(html);
        setTermsLoading(false);
      })
      .catch(error => {
        console.error('Error loading terms and conditions:', error);
        setTermsError(error.message);
        setTermsLoading(false);
      });
  };

  const handleCloseTerms = () => {
    setShowTerms(false);
    setTermsContent('');
    setTermsError(null);
  };

  // Handle escape key to close terms popup
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showTerms) {
        handleCloseTerms();
      }
    };

    if (showTerms) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTerms]);

  // Handle click outside popup to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseTerms();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptTerms) {
      setErrorMessage('You must accept the terms and conditions to submit your request.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await addDoc(collection(db, 'projectRequests'), {
        ...formData,
        status: 'pending',
        createdAt: Timestamp.now(),
        acceptedTerms: true
      });
      setSuccessMessage('Your request has been submitted successfully.');
      setFormData({
        name: '',
        email: '',
        organization: '',
        projectTitle: '',
        projectDescription: ''
      });
      setAcceptTerms(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      window.localStorage.setItem('emailForSignIn', formData.email);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="landing-form">
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="form-group">
          <label htmlFor="name">Your name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="request-email">Email address</label>
          <input
            type="email"
            id="request-email"
            name="email"
            autoComplete="username"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="organization">Your organization</label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectTitle">Proposed project title</label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={formData.projectTitle}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Brief project description</label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            required
            className="form-textarea"
            rows="4"
          />
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={handleTermsCheckbox}
              required
              className="checkbox-input"
            />
            <label htmlFor="acceptTerms" className="checkbox-label">
              I accept the{' '}
              <button
                type="button"
                className="terms-link"
                onClick={handleShowTerms}
              >
                CT Text Tool terms and conditions
              </button>
            </label>
          </div>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <button type="submit" className="submit-btn" disabled={submitting || !acceptTerms}>
          {submitting ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {/* Terms and Conditions Popup */}
      {showTerms && (
        <div className="terms-overlay" onClick={handleBackdropClick}>
          <div className="terms-modal">
            {/* Header with close button */}
            <div className="terms-header">
              <h2 className="terms-title">CT Text Tool Terms and Conditions</h2>
              <button
                onClick={handleCloseTerms}
                className="terms-close-btn"
                aria-label="Close terms and conditions"
              >
                ×
              </button>
            </div>

            {/* Content area */}
            <div className="terms-content-wrapper">
              {termsLoading && (
                <div className="terms-loading">
                  <div className="loading-spinner"></div>
                  <p className="sr-only">Loading terms and conditions...</p>
                </div>
              )}
              
              {termsError && (
                <div className="terms-error">
                  <div className="error-message">
                    <p>Error loading terms and conditions: {termsError}</p>
                  </div>
                </div>
              )}
              
              {!termsLoading && !termsError && (
                <div 
                  className="terms-content"
                  dangerouslySetInnerHTML={{ __html: termsContent }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectRequestForm;
