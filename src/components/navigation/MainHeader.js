import { useNavigate, useParams, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../hooks/useProject'
import './MainHeader.css';

const MainHeader = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { project } = useProject(projectId)
  const [searchParams] = useSearchParams();
  const editTextId = searchParams.get('editTextId');
  const pathParts = location.pathname.split('/')

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
    // if (window.textFormIsDirty) {
    //   const confirm = window.confirm('You have unsaved changes. Are you sure you want to reset the form?');
    //   if (!confirm) return;
    //   window.textFormIsDirty = false;
    // }

    const isTextsPage = pathParts[pathParts.length - 1] === 'texts';

    if (editTextId || isTextsPage) {
      navigate(`/projects/${projectId}/objects`)
      navigate(0)
      return
    }

    navigate(0)
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

              <Link className="nav-button" onClick={handleCreateTexts}>
                Create texts
              </Link>

              <Link
                to={`/projects/${projectId}/texts`}
                className="nav-button"
                onClick={handleNavigation(`/projects/${projectId}/texts`)}
              >
                Edit texts
              </Link>
            </>
          )}

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
