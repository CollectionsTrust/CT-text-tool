import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Auth components
import PasswordChange from "./components/Auth/PasswordChange";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import SignUp from "./components/Auth/SignUp";

// Navigation
import MainHeader from "./components/navigation/MainHeader";

// Public pages
import LandingPage from "./components/LandingPage";
import UserGuide from "./components/UserGuide";
import TermsPage from "./components/TermsPage";

// Dashboard pages
import UserDashboardLayout from "./components/UserDashboard/UserDashboardLayout";
import AdminDefaultRedirect from "./components/AdminDashboard/AdminDefaultRedirect";
import AdminLayout from "./components/AdminDashboard/AdminLayout";
import Requests from "./components/AdminDashboard/Requests";
import AdminProjectsList from "./components/AdminDashboard/AdminProjectsList";
import UserManagement from "./components/AdminDashboard/UserManagement";
import AuthorManagement from "./components/UserDashboard/AuthorManagement";
import UserProjectsList from "./components/UserDashboard/UserProjectsList";

// Project components
import ProjectSetup from "./components/ProjectSetup";
import ObjectsPage from "./components/ObjectsPage";
import TextsPage from "./components/TextsPage";

// Import styles
import "./App.css";

// Layout with header for project pages
const ProjectLayout = () => (
  <>
    <MainHeader />
    <Outlet />
  </>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected routes that require user to be logged in */}
          <Route element={<ProtectedRoute allowedRoles={["nonAdminUser"]} />}>
            <Route path="/dashboard" element={<UserDashboardLayout />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<UserProjectsList />} />
              <Route path="authors" element={<AuthorManagement />} />
            </Route>
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["nonAdminUser", "admin"]} />
            }
          >
            {/* Project-specific pages */}
            <Route path="/projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<ProjectSetup />} />
              <Route path="objects" element={<ObjectsPage />} />
              <Route path="texts" element={<TextsPage />} />
            </Route>
          </Route>

          {/* Protected routes for site admin users */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              {/* Index route for when path is exactly /admin, redirect to requests if there are any */}
              <Route index element={<AdminDefaultRedirect />} />
              <Route path="requests" element={<Requests />} />
              <Route path="projects" element={<AdminProjectsList />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["admin", "nonAdminUser"]} />
            }
          >
            <Route path="/change-password" element={<PasswordChange />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
