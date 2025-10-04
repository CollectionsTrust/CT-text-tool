import { Link, useLocation } from "react-router-dom";

const AdminNavLinks = () => {
  const location = useLocation();
  const active = location.pathname;

  const NavLink = ({ to, label }) => (
    <Link to={to} className={`admin-nav-tab ${active === to ? "active" : ""}`}>
      {label}
    </Link>
  );

  return (
    <div className="admin-nav-tabs">
      <NavLink to="/admin/requests" label="Requests" />
      <NavLink to="/admin/projects" label="Manage projects" />
      <NavLink to="/admin/users" label="Manage users" />
    </div>
  );
};

export default AdminNavLinks;
