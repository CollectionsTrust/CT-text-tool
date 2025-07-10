import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../hooks/useProject'
import './MainHeader.css';

const MainHeader = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const { project } = useProject(projectId)

  const handleLogout = async () => {
    try {
      // Check for unsaved changes before logout
      if (window.textFormIsDirty) {
        const confirmLogout = window.confirm('You have unsaved changes in your text. Are you sure you want to logout without saving?');
        if (!confirmLogout) {
          return;
        }
        // Clear the flag if user confirms
        window.textFormIsDirty = false;
      }

      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Custom navigation handler specifically checking textFormIsDirty
  const handleNavigation = (path) => (e) => {
    // Only check textFormIsDirty to avoid false positives on other forms
    if (window.textFormIsDirty === true) {
      // Prevent default link behavior
      e.preventDefault();

      // Show confirmation dialog
      const confirmNavigation = window.confirm('You have unsaved changes in your text. Are you sure you want to leave without saving?');

      // If user confirms, clear flag and navigate
      if (confirmNavigation) {
        window.textFormIsDirty = false;
        navigate(path);
      }
    }
  };

  // Specific handler for the Create texts button
  const handleCreateTexts = (e) => {
    e.preventDefault();

    // Check for unsaved changes
    if (window.textFormIsDirty) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to reset the form?');
      if (!confirm) return;
      window.textFormIsDirty = false;
    }

    // If already on objects page, just reset the form
    if (location.pathname.includes('/objects')) {
      console.log('Resetting form from same page');
      window.RESET_TEXT_FORM = Date.now();
      window.dispatchEvent(new Event('resetTextForm'));
    }
    // Otherwise navigate and set the reset flag
    else {
      console.log('Navigating to objects page and resetting');
      window.RESET_TEXT_FORM = Date.now();
      navigate(`/projects/${projectId}/objects`);
    }
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="project-identity">
          <Link to="/" className='header-logo-link'>
            <div className="logo-container">
              <div className="logo">CT</div>
            </div>
          </Link>
          <div className="project-info">
            <h1>{project?.title}</h1>
            {project?.reference && <p>{project?.reference}</p>}
          </div>
        </div>

        <div className="header-actions">
          {location.pathname.includes('/projects/') && (
            <>
              {(userRole === 'admin' || user?.email === project?.owner) && (
                <Link
                  to={`/projects/${projectId}?edit=true`}
                  className="nav-button"
                  onClick={handleNavigation(`/projects/${projectId}?edit=true`)}
                >
                  Project setup
                </Link>
              )}

              {/* Create texts button as a button element */}
              <button
                className="nav-button"
                onClick={handleCreateTexts}
              >
                Create texts
              </button>

              <Link
                to={`/projects/${projectId}/texts`}
                className="nav-button"
                onClick={handleNavigation(`/projects/${projectId}/texts`)}
              >
                Edit texts
              </Link>
            </>
          )}

          {/* Help icon - just a white circle with question mark */}
          <Link
            to={{
              pathname: "/user-guide",
              state: { returnPath: location.pathname + location.search }
            }}
            className="help-icon-link"
            title="User Guide"
          >
            <span className="help-icon">?</span>
            <span className="sr-only">Help</span>
          </Link>

          {(userRole === 'admin' || userRole === 'owner' || userRole === 'author') && (
            <Link
              to="/dashboard"
              className="nav-button"
              onClick={handleNavigation('/dashboard')}
            >
              Dashboard
            </Link>
          )}

          <button onClick={handleLogout} className="nav-button logout-button">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
