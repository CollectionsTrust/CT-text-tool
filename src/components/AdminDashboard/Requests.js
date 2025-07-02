import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { generateTempPassword, hashPassword } from '../../utils/passwordUtils';
import './AdminDashboard.css';

const Requests = () => {
  const [projectRequests, setProjectRequests] = useState([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const { currentUser } = useAuth();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch project requests
      const projectRequestsRef = collection(db, 'projectRequests');
      const projectQuery = query(projectRequestsRef, where('status', '==', 'pending'));
      const projectSnapshot = await getDocs(projectQuery);

      const projectRequestsData = [];
      projectSnapshot.forEach((doc) => {
        projectRequestsData.push({ id: doc.id, ...doc.data() });
      });

      // Fetch password reset requests
      const passwordResetRequestsRef = collection(db, 'passwordResetRequests');
      const passwordQuery = query(passwordResetRequestsRef, where('status', '==', 'pending'));
      const passwordSnapshot = await getDocs(passwordQuery);

      const passwordResetRequestsData = [];
      passwordSnapshot.forEach((doc) => {
        passwordResetRequestsData.push({ id: doc.id, ...doc.data() });
      });

      setProjectRequests(projectRequestsData);
      setPasswordResetRequests(passwordResetRequestsData);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Invalid Date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleApproveProject = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError('');
      setSuccessMessage('');

      const request = projectRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // First create the project with the correct title from the project request
      const projectRef = await addDoc(collection(db, 'projects'), {
        title: request.projectTitle || `${request.organization} Project`,
        description: request.projectDescription,
        owner: request.email,
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: currentUser.email
      });

      // Generate a temporary password
      const tempPassword = generateTempPassword();
      const hashedPassword = await hashPassword(tempPassword);

      // Check if user already exists in Firestore
      const usersRef = collection(db, 'projectUsers');
      const userQuery = query(usersRef, where('email', '==', request.email));
      const userSnapshot = await getDocs(userQuery);
      
      let projectUserRef;
      let projectUserId;
      
      if (userSnapshot.empty) {
        // User doesn't exist, create a new projectUser with hashed password
        projectUserRef = await addDoc(collection(db, 'projectUsers'), {
          email: request.email,
          name: request.name,
          organization: request.organization,
          role: 'owner',
          createdAt: serverTimestamp(),
          status: 'approved',
          approvedBy: currentUser.email,
          passwordHash: hashedPassword,
          passwordSettings: {
            isTemporary: true,
            lastChanged: null,
            createdAt: new Date().toISOString()
          },
          projectRoles: {
            [projectRef.id]: 'owner'
          }
        });
        projectUserId = projectUserRef.id;
      } else {
        // User already exists, update their projectRoles
        const existingUserDoc = userSnapshot.docs[0];
        projectUserId = existingUserDoc.id;
        
        const userData = existingUserDoc.data();
        const currentProjectRoles = userData.projectRoles || {};
        
        await updateDoc(doc(db, 'projectUsers', projectUserId), {
          projectRoles: {
            ...currentProjectRoles,
            [projectRef.id]: 'owner'
          },
          name: userData.name || request.name,
          organization: userData.organization || request.organization
        });
      }

      // Update the project request record
      await updateDoc(doc(db, 'projectRequests', requestId), {
        status: 'approved',
        processedAt: serverTimestamp(),
        projectId: projectRef.id,
        projectUserId: projectUserId,
        approvedBy: currentUser.email,
        tempPassword: tempPassword
      });

      // Generate a mailto link with pre-populated content for the admin to send
      const emailSubject = encodeURIComponent(`Your CT Text Tool project "${request.projectTitle || 'Project Request'}" has been approved`);
      const emailBody = encodeURIComponent(
        `Hello ${request.name},\n\n` +
        `Your project request for "${request.projectTitle || 'the CT Text Tool'}" has been approved. You can now log in to the CT Text Tool with the following credentials:\n\n` +
        `Email: ${request.email}\n` +
        `Temporary Password: ${tempPassword}\n\n` +
        `Important: You will be required to change your password when you first log in.\n\n` +
        `Your project "${request.projectTitle || 'Project'}" is now set up and ready for you to begin working on.\n\n` +
        `For any questions, please contact us.\n\n` +
        `Thank you,\n` +
        `Collections Trust Team`
      );
      
      const mailtoLink = `mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');

      setSuccessMessage(`Project request for ${request.name} has been approved. A draft email has been opened in your email client.`);
      setProjectRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error approving project request:', err);
      setError(`Failed to approve request: ${err.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectProject = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError('');
      setSuccessMessage('');

      const request = projectRequests.find(r => r.id === requestId);
      await updateDoc(doc(db, 'projectRequests', requestId), {
        status: 'rejected',
        processedAt: serverTimestamp(),
        rejectedBy: currentUser.email
      });

      // Generate a mailto link for rejection email
      const emailSubject = encodeURIComponent(`Regarding your project request: ${request.projectTitle || 'Project Request'}`);
      const emailBody = encodeURIComponent(
        `Hello ${request.name},\n\n` +
        `We've reviewed your project request for "${request.projectTitle || 'Project'}" and we regret to inform you that we are unable to approve it at this time.\n\n` +
        `If you have any questions or would like to discuss this further, please feel free to reply to this email.\n\n` +
        `Thank you for your interest in the CT Text Tool.\n\n` +
        `Regards,\n` +
        `Collections Trust Team`
      );
      
      const mailtoLink = `mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');

      setSuccessMessage(`Project request for ${request.name} has been rejected. A draft email has been opened in your email client.`);
      setProjectRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error rejecting project request:', err);
      setError(`Failed to reject request: ${err.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleApprovePasswordReset = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError('');
      setSuccessMessage('');

      const request = passwordResetRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Generate a new temporary password
      const tempPassword = generateTempPassword();
      const hashedPassword = await hashPassword(tempPassword);

      // Find and update the user's password in Firestore
      const usersRef = collection(db, 'projectUsers');
      const userQuery = query(usersRef, where('email', '==', request.email));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error('User not found');
      }

      const userDoc = userSnapshot.docs[0];
      await updateDoc(doc(db, 'projectUsers', userDoc.id), {
        passwordHash: hashedPassword,
        passwordSettings: {
          isTemporary: true,
          lastChanged: null,
          createdAt: new Date().toISOString()
        },
        password: null // Remove old password field if it exists
      });

      // Update the password reset request
      await updateDoc(doc(db, 'passwordResetRequests', requestId), {
        status: 'approved',
        processedAt: serverTimestamp(),
        approvedBy: currentUser.email,
        tempPassword: tempPassword
      });

      // Generate mailto link
      const emailSubject = encodeURIComponent('Your CT Text Tool password has been reset');
      const emailBody = encodeURIComponent(
        `Hello ${request.name},\n\n` +
        `Your password reset request has been approved. You can now log in to the CT Text Tool with your new temporary password:\n\n` +
        `Email: ${request.email}\n` +
        `Temporary Password: ${tempPassword}\n\n` +
        `Important: You will be required to change this password when you next log in.\n\n` +
        `If you have any questions, please contact us.\n\n` +
        `Thank you,\n` +
        `Collections Trust Team`
      );
      
      const mailtoLink = `mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');

      setSuccessMessage(`Password reset approved for ${request.name}. A draft email has been opened in your email client.`);
      setPasswordResetRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error approving password reset:', err);
      setError(`Failed to approve password reset: ${err.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectPasswordReset = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError('');
      setSuccessMessage('');

      const request = passwordResetRequests.find(r => r.id === requestId);
      await updateDoc(doc(db, 'passwordResetRequests', requestId), {
        status: 'rejected',
        processedAt: serverTimestamp(),
        rejectedBy: currentUser.email
      });

      // Generate mailto link for rejection
      const emailSubject = encodeURIComponent('Regarding your password reset request');
      const emailBody = encodeURIComponent(
        `Hello ${request.name},\n\n` +
        `We've reviewed your password reset request and we are unable to process it at this time.\n\n` +
        `If you have any questions or believe this is an error, please contact us directly.\n\n` +
        `Thank you,\n` +
        `Collections Trust Team`
      );
      
      const mailtoLink = `mailto:${request.email}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');

      setSuccessMessage(`Password reset request for ${request.name} has been rejected. A draft email has been opened in your email client.`);
      setPasswordResetRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error rejecting password reset:', err);
      setError(`Failed to reject password reset: ${err.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="admin-section requests">
      <div className="admin-nav-tabs">
        <Link to="/admin#requests" className="admin-nav-tab active">Requests</Link>
        <Link to="/admin#projects" className="admin-nav-tab">Manage projects</Link>
        <Link to="/admin#users" className="admin-nav-tab">Manage users</Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Project Requests Section */}
      <h2 className="section-title">Project requests</h2>
      {projectRequests.length === 0 ? (
        <div className="no-content-message">There are no pending project requests at this time.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Request date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.email}</td>
                  <td>{request.organization}</td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td className="description-cell">
                    <div className="truncated-text">{request.projectDescription}</div>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="primary-btn approve-btn" 
                      onClick={() => handleApproveProject(request.id)} 
                      disabled={processingRequestId === request.id}
                    >
                      {processingRequestId === request.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      className="secondary-btn reject-btn" 
                      onClick={() => handleRejectProject(request.id)} 
                      disabled={processingRequestId === request.id}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Reset Requests Section */}
      <h2 className="section-title" style={{ marginTop: '3rem' }}>Password reset requests</h2>
      {passwordResetRequests.length === 0 ? (
        <div className="no-content-message">There are no pending password reset requests at this time.</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Request date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {passwordResetRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.email}</td>
                  <td>{request.organization}</td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td className="actions-cell">
                    <button 
                      className="primary-btn approve-btn" 
                      onClick={() => handleApprovePasswordReset(request.id)} 
                      disabled={processingRequestId === request.id}
                    >
                      {processingRequestId === request.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button 
                      className="secondary-btn reject-btn" 
                      onClick={() => handleRejectPasswordReset(request.id)} 
                      disabled={processingRequestId === request.id}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Requests;
