import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component - Controls access to routes based on user role
 * Enhanced to handle authentication race conditions using sessionStorage
 * 
 * @param {Array} props.allowedRoles - Array of roles allowed to access this route
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, userRole, loading } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();

  if (loading) {
    return null
  }

  // Check if user has permission to access this route based on their role
  const hasPermission = allowedRoles.includes(userRole);
    
  if (!user || !hasPermission) {
    return <Navigate to="/" replace />;
  }
  
  // Special case for project setup page - authors can't access it
  const isProjectSetupPage = location.pathname === `/projects/${projectId}`;

  if (isProjectSetupPage && userRole === 'author') {
    // Redirect authors to objects page for this project
    return <Navigate to={`/projects/${projectId}/objects`} replace />;
  }
  
  // Redirect admins to admin dashboard if they try to access user dashboard
  if (location.pathname === '/dashboard' && userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // User has permission, render the route
  return <Outlet />;
};

export default ProtectedRoute;
