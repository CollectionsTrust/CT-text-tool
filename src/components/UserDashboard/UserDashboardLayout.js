import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainHeader from "../navigation/MainHeader";
import "./UserDashboard.css";

const UserDashboardLayout = () => {
  const { user, userRoles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userIsOwnerOfAProject = Object.values(userRoles?.projectRoles).includes(
    "owner"
  );

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const activeTab =
    location.pathname === "/dashboard/authors" ? "authors" : "projects";

  return (
    <>
      <MainHeader />
      <div className="container">
        <div className="user-dashboard">
          <div className="user-header">
            <div className="user-info">
              <span>Logged in as: {user?.email}</span>
              <button
                onClick={handleChangePassword}
                className="secondary-btn change-password-btn"
              >
                Change password
              </button>
            </div>
          </div>
          {(userRoles.appRole === "admin" || userIsOwnerOfAProject) && (
            <div className="user-nav-tabs">
              {userIsOwnerOfAProject && (
                <Link
                  to="/dashboard/projects"
                  className={`user-nav-tab ${
                    activeTab === "projects" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    if (activeTab === "projects") e.preventDefault();
                  }}
                >
                  Manage projects
                </Link>
              )}
              {(userRoles.appRole === "admin" || userIsOwnerOfAProject) && (
                <Link
                  to="/dashboard/authors"
                  className={`user-nav-tab ${
                    activeTab === "authors" ? "active" : ""
                  }`}
                  onClick={(e) => {
                    if (activeTab === "authors") e.preventDefault();
                  }}
                >
                  Manage authors
                </Link>
              )}
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default UserDashboardLayout;
