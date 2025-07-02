import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MainHeader from '../navigation/MainHeader';

const PasswordChange = ({ forced = false, onComplete = null }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword, passwordChangeRequired } = useAuth();
  const navigate = useNavigate();

  // Check if this is a forced password change
  useEffect(() => {
    if (forced && !passwordChangeRequired) {
      // If password change is not required but component was forced,
      // redirect to dashboard
      navigate('/dashboard');
    }
  }, [forced, passwordChangeRequired, navigate]);

  // Password validation
  const validatePassword = (password) => {
    // At least 8 characters, containing at least one number and one letter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validate inputs
    if (!currentPassword) {
      return setError('Please enter your current password');
    }
    
    if (!newPassword) {
      return setError('Please enter a new password');
    }
    
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }
    
    if (!validatePassword(newPassword)) {
      return setError('Password must be at least 8 characters long and contain at least one letter and one number');
    }
    
    if (newPassword === currentPassword) {
      return setError('New password must be different from your current password');
    }
    
    setLoading(true);
    
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // If this was a forced change, execute the callback or redirect
      if (forced && onComplete) {
        onComplete();
      }
      
      // If not forced, show success message
      if (!forced) {
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <>
      {!forced && <MainHeader />}
      <div className="container">
        <div className="auth-form-container">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>{forced ? 'Password change required' : 'Change password'}</h2>
            
            {forced && (
              <p className="info-message">
                You need to change your temporary password before continuing.
              </p>
            )}
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Password changed successfully!</div>}
            
            <div className="form-group">
              <label htmlFor="current-password">Current password</label>
              <div className="password-input-container">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="text-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={toggleCurrentPasswordVisibility}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrentPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="new-password">New password</label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="text-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={toggleNewPasswordVisibility}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <small className="form-help-text">
                Must be at least 8 characters and include a number
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm new password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="text-input"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Changing password...' : 'Change password'}
            </button>
            
            {!forced && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default PasswordChange;
