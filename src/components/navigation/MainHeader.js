import {
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  Link,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProject } from "../../hooks/useProject";
import "./MainHeader.css";

const MainHeader = () => {
  const { user, userRoles, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const [searchParams] = useSearchParams();
  const editTextId = searchParams.get("editTextId");
  const pathParts = location.pathname.split("/");

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Specific handler for the Create texts button
  const handleCreateTexts = (e) => {
    e.preventDefault();

    const isTextsPage = pathParts[pathParts.length - 1] === "texts";

    if (editTextId || isTextsPage) {
      navigate(`/projects/${projectId}/objects`);
      navigate(0);
      return;
    }

    navigate(0);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="project-identity">
          <Link to="/" className="header-logo-link">
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
              state: { returnPath: location.pathname + location.search },
            }}
            className="help-icon-link"
            title="User Guide"
          >
            <span className="help-icon">?</span>
            <span className="sr-only">Help</span>
          </Link>

          {location.pathname.includes("/projects/") && (
            <>
              {(userRoles.appRole === "admin" ||
                user?.email === project?.owner) && (
                <Link
                  to={`/projects/${projectId}?edit=true`}
                  className="nav-button"
                >
                  Project setup
                </Link>
              )}

              <Link className="nav-button" onClick={handleCreateTexts}>
                Create texts
              </Link>

              <Link to={`/projects/${projectId}/texts`} className="nav-button">
                Edit texts
              </Link>
            </>
          )}

          {userRoles.appRole === "nonAdminUser" && (
            <Link to="/dashboard" className="nav-button">
              Dashboard
            </Link>
          )}

          <button onClick={handleLogout} className="nav-button logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
