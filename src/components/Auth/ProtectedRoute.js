// src/components/Auth/ProtectedRoute.js
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component - Controls access to routes based on user role
 * Uses Firestore as the authentication authority with local validation
 * 
 * @param {Object} props
 * @param {Array} props.allowedRoles - Array of roles allowed to access this route
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userRole, loading, validateSession } = useAuth();
  const { projectId } = useParams();
  const location = useLocation();
  const [validatingSession, setValidatingSession] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

  // Validate session when accessing sensitive routes
  // This effect will check with Firestore on initial access to protected routes
  useEffect(() => {
    const checkSession = async () => {
      if (!currentUser) return;
      
      setValidatingSession(true);
      
      try {
        // Force a Firestore validation for admin routes and project setup routes
        const isAdminRoute = location.pathname.includes('/admin');
        const isProjectSetupRoute = projectId && location.pathname === `/projects/${projectId}`;
        const needsValidation = isAdminRoute || isProjectSetupRoute;
        
        const isValid = await validateSession(needsValidation);
        setSessionValid(isValid);
      } catch (error) {
        console.error('Session validation error:', error);
        setSessionValid(false);
      } finally {
        setValidatingSession(false);
      }
    };
    
    checkSession();
  }, [currentUser, location.pathname, projectId, validateSession]);
  
  // If auth is still loading, show nothing
  if (loading || validatingSession) {
    return null;
  }
  
  // If session is invalid, redirect to login
  if (!sessionValid) {
    return <Navigate to="/" replace />;
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
