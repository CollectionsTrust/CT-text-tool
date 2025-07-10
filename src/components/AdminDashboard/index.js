import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Requests from './Requests';
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
  
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-user-info">
            <span>Logged in as: {currentUser?.email || "Unknown User"}</span>
            <button 
              onClick={handleChangePassword}
              className="secondary-btn change-password-btn"
            >
              Change password
            </button>
          </div>
        </div>

        <div className="admin-content">
          {activeTab === 'requests' && <Requests />}
          {activeTab === 'projects' && <ProjectsList />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
