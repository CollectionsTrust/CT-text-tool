import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Requests from './Requests';
import ProjectsList from './ProjectsList';
import UserManagement from './UserManagement';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
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

    if (user && userRole === 'admin') {
      checkForPendingRequests();
    }
  }, [user, userRole, navigate, location]);

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
  
  // @todo handle this in the routes?
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container">
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-user-info">
            <span>Logged in as: {user?.email || "Unknown User"}</span>
            <Link className="secondary-btn change-password-btn" to="/change-password">
              Change password
            </Link>
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
