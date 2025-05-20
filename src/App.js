// src/App.js (updated)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Navigation
import MainHeader from './components/navigation/MainHeader';

// Public pages
import LandingPage from './components/LandingPage';
import UserGuide from './components/UserGuide'; // Import the new component

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
          <Route path="/guide" element={<UserGuide isPublic={true} />} /> {/* New public route */}
          
          {/* User dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['owner', 'author']} />}>
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>
          
          {/* Admin dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<><MainHeader /><AdminDashboard /></>} />
          </Route>
          
          {/* User guide for logged-in users */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'author']} />}>
            <Route path="/user-guide" element={<UserGuide isPublic={false} />} />
          </Route>
          
          {/* Project-specific pages wrapped in layout */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'author']} />}>
            <Route path="/projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<ProjectSetup />} />
              <Route path="objects" element={<ObjectsPage />} />
              <Route path="texts" element={<TextsPage />} />
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
