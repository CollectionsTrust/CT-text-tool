// src/components/Auth/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component - Controls access to routes based on user role
 * 
 * @param {Object} props
 * @param {Array} props.allowedRoles - Array of roles allowed to access this route
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();
  
  // If auth is still loading, show nothing
  if (loading) {
    return null;
  }
  
  // If no user is logged in, redirect to landing page
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has permission to access this route based on their role
  const hasPermission = allowedRoles.includes(userRole);
  
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
  
  // If user doesn't have permission, redirect to appropriate dashboard
  if (!hasPermission) {
    const redirectPath = userRole === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }
  
  // User has permission, render the route
  return <Outlet />;
};

export default ProtectedRoute;
