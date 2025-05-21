import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProjectRequests from './ProjectRequests';
import ProjectsList from './ProjectsList';
import UserManagement from './UserManagement';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminDashboard = () => {
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [pendingRequestsExist, setPendingRequestsExist] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Debug: Log the current user and role
  useEffect(() => {
    console.log("AdminDashboard - Current User:", currentUser);
    console.log("AdminDashboard - User Role:", userRole);
  }, [currentUser, userRole]);

  // Check for pending project requests when component mounts
  useEffect(() => {
    const checkForPendingRequests = async () => {
      try {
        const requestsRef = collection(db, 'projectRequests');
        const q = query(requestsRef, where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        
        const hasPendingRequests = !querySnapshot.empty;
        setPendingRequestsExist(hasPendingRequests);
        
        // If no hash in URL and no pending requests, redirect to projects tab
        if (!location.hash && !hasPendingRequests) {
          navigate('/admin#projects');
        }
        
        setInitialCheckDone(true);
      } catch (error) {
        console.error('Error checking for pending requests:', error);
        setInitialCheckDone(true);
      }
    };

    if (currentUser && userRole === 'admin') {
      checkForPendingRequests();
    } else {
      // Debug: Log why check isn't running
      console.log("Not checking for pending requests:", { 
        hasCurrentUser: !!currentUser, 
        userRole 
      });
    }
  }, [currentUser, userRole, navigate, location]);

  // Set active tab based on URL hash or default based on pending requests
  useEffect(() => {
    if (!initialCheckDone) return;
    
    const hash = location.hash.replace('#', '');
    if (['requests', 'projects', 'users'].includes(hash)) {
      setActiveTab(hash);
    } else {
      // Default tab based on pending requests
      setActiveTab(pendingRequestsExist ? 'requests' : 'projects');
    }
  }, [location, pendingRequestsExist, initialCheckDone]);

  // Check if user is authorized to access this page
  if (!currentUser) {
    console.log("No current user, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }
  
  if (userRole !== 'admin') {
    console.log("User role is not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-user-info">
            Logged in as: {currentUser?.email || "Unknown User"}
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'requests' && <ProjectRequests />}
          {activeTab === 'projects' && <ProjectsList />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
