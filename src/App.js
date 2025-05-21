// src/App.js (updated for PBKDF2)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ResetPassword from './components/Auth/ResetPassword';
import PasswordChange from './components/Auth/PasswordChange';
import ForcedPasswordChange from './components/Auth/ForcedPasswordChange';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Navigation
import MainHeader from './components/navigation/MainHeader';

// Public pages
import LandingPage from './components/LandingPage';
import UserGuide from './components/UserGuide';

// Dashboard pages
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

// Project components
import ProjectSetup from './components/ProjectSetup';
import ObjectsPage from './components/ObjectsPage';
import TextsPage from './components/TextsPage';

// Import styles
import './App.css';
import './styles/Auth.css';

// Layout with header for project pages
const ProjectLayout = () => (
  <>
    <MainHeader />
    <Outlet />
  </>
);

// Check if password change is required before allowing access
const RequirePasswordChangeCheck = () => {
  const { passwordChangeRequired } = useAuth();
  
  // If password change is required, redirect to forced password change
  if (passwordChangeRequired) {
    return <Navigate to="/change-password-required" replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/guide" element={<UserGuide isPublic={true} />} />
          
          {/* Forced password change route */}
          <Route path="/change-password-required" element={<ForcedPasswordChange />} />
          
          {/* Protected routes that require password change check */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'author']} />}>
            <Route element={<RequirePasswordChangeCheck />}>
              {/* User dashboard */}
              <Route path="/dashboard" element={<UserDashboard />} />
              
              {/* Admin dashboard */}
              <Route path="/admin" element={<><MainHeader /><AdminDashboard /></>} />
              
              {/* User guide for logged-in users */}
              <Route path="/user-guide" element={<UserGuide isPublic={false} />} />
              
              {/* Password change */}
              <Route path="/change-password" element={<PasswordChange />} />
              
              {/* Project-specific pages */}
              <Route path="/projects/:projectId" element={<ProjectLayout />}>
                <Route index element={<ProjectSetup />} />
                <Route path="objects" element={<ObjectsPage />} />
                <Route path="texts" element={<TextsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
