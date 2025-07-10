import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Auth components
import PasswordChange from './components/Auth/PasswordChange';
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
          <Route path="/user-guide" element={<UserGuide />} />
          
          {/* Protected routes that require user to be logged in */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'author']} />}>
            <Route path="/dashboard" element={<UserDashboard />} />            
            <Route path="/admin" element={<><MainHeader /><AdminDashboard /></>} />
            <Route path="/change-password" element={<PasswordChange />} />
            
            {/* Project-specific pages */}
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
