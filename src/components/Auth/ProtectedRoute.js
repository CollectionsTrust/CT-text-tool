import { useState, useEffect } from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component - Controls access to routes based on user role
 * Enhanced to handle authentication race conditions using sessionStorage
 * 
 * @param {Object} props
 * @param {Array} props.allowedRoles - Array of roles allowed to access this route
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();
  const [verificationCount, setVerificationCount] = useState(0);
  
  // Add a fallback check for sessionStorage
  const [fallbackRole, setFallbackRole] = useState(null);
  
  // Check sessionStorage as a fallback if context doesn't have the values yet
  useEffect(() => {
    if (!userRole && !loading && verificationCount < 3) {
      const storedRole = sessionStorage.getItem('userRole');
      if (storedRole) {
        console.log("Using fallback role from sessionStorage:", storedRole);
        setFallbackRole(storedRole);
      }
      
      // Increment verification count to limit retries
      setVerificationCount(prev => prev + 1);
    }
  }, [userRole, loading, verificationCount]);
  
  // If auth is still loading, show nothing
  if (loading) {
    return null;
  }
  
  // If no user is logged in (check both context and sessionStorage)
  const effectiveUser = currentUser || (sessionStorage.getItem('userEmail') ? { email: sessionStorage.getItem('userEmail') } : null);
  
  if (!effectiveUser) {
    return <Navigate to="/" replace />;
  }
  
  // Use userRole from context if available, otherwise fall back to sessionStorage value
  const effectiveRole = userRole || fallbackRole || sessionStorage.getItem('userRole');
  
  // Check if user has permission to access this route based on their role
  const hasPermission = allowedRoles.includes(effectiveRole);
  
  // Special case for project setup page - authors can't access it
  const isProjectSetupPage = location.pathname === `/projects/${projectId}`;
  if (isProjectSetupPage && effectiveRole === 'author') {
    // Redirect authors to objects page for this project
    return <Navigate to={`/projects/${projectId}/objects`} replace />;
  }
  
  // Redirect admins to admin dashboard if they try to access user dashboard
  if (location.pathname === '/dashboard' && effectiveRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // If user doesn't have permission, redirect to appropriate dashboard
  if (!hasPermission) {
    const redirectPath = effectiveRole === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  // User has permission, render the route
  return <Outlet />;
};

export default ProtectedRoute;
