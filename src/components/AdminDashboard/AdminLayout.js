import MainHeader from "../../components/navigation/MainHeader";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <>
      <MainHeader />
      <div className="container">
        <div className="admin-dashboard">
          <div className="admin-header">
            <div className="admin-user-info">
              <span>Logged in as: {user?.email || "Unknown User"}</span>
              <Link
                className="secondary-btn change-password-btn"
                to="/change-password"
              >
                Change password
              </Link>
            </div>
          </div>
          <div className="admin-content"></div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
