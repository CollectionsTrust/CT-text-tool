import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainHeader from "../navigation/MainHeader";
import { validatePassword } from "../../utils/passwordUtils";

const PasswordChange = ({ onComplete = null }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { changePassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!currentPassword) {
      return setError("Please enter your current password");
    }

    if (!newPassword) {
      return setError("Please enter a new password");
    }

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match");
    }

    const passwordValidity = validatePassword(newPassword);

    if (!passwordValidity.isValid) {
      return setError(passwordValidity.message);
    }

    setLoading(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoading(false);
    }
  };

  return (
    <>
      <MainHeader />
      <div className="container">
        <div className="auth-form-container">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>Change password</h2>

            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message">
                Password changed successfully!
              </div>
            )}

            <div className="form-group">
              <label htmlFor="current-password">Current password</label>
              <div className="password-input-container">
                <input
                  type={showCurrentPassword ? "text" : "password"}
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
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New password</label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
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
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
              <small className="form-help-text">
                Must be at least 8 characters and include uppercase and
                lowercase letters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm new password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn password-change-btn"
              disabled={loading}
            >
              {loading ? "Changing password..." : "Change password"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PasswordChange;
