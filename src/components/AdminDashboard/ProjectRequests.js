// src/components/AdminDashboard/ProjectRequests.js (updated)
import React, { useState, useEffect } from 'react';
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

const ProjectRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const { currentUser } = useAuth();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const requestsRef = collection(db, 'projectRequests');
      const q = query(requestsRef, where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);

      const requestsData = [];
      querySnapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });

      setRequests(requestsData);
    } catch (err) {
      console.error('Error fetching project requests:', err);
      setError('Failed to load project requests. Please try again.');
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

  const handleApprove = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError('');
      setSuccessMessage('');

      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // First create the project with the correct title from the project request
      const projectRef = await addDoc(collection(db, 'projects'), {
        title: request.projectTitle || `${request.organization} Project`, // Use projectTitle if available, else fallback
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
          role: 'owner',  // Overall user role
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
            [projectRef.id]: 'owner'  // Set role for this specific project
          }
        });
        projectUserId = projectUserRef.id;
      } else {
        // User already exists, update their projectRoles
        const existingUserDoc = userSnapshot.docs[0];
        projectUserId = existingUserDoc.id;
        
        const userData = existingUserDoc.data();
        const currentProjectRoles = userData.projectRoles || {};
        
        // Add new project role
        await updateDoc(doc(db, 'projectUsers', projectUserId), {
          projectRoles: {
            ...currentProjectRoles,
            [projectRef.id]: 'owner'
          },
          // Only update these fields if they're empty
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
        tempPassword: tempPassword // Store temp password in the request record for email generation
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
      
      // Open the mailto link in a new window/tab
      window.open(mailtoLink, '_blank');

      setSuccessMessage(`Project request for ${request.name} has been approved. A draft email has been opened in your email client.`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error approving request:', err);
      setError(`Failed to approve request: ${err.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingRequestId(requestId);
      setError('');
      setSuccessMessage('');

      const request = requests.find(r => r.id === requestId);
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
      
      // Open the mailto link in a new window/tab
      window.open(mailtoLink, '_blank');

      setSuccessMessage(`Project request for ${request.name} has been rejected. A draft email has been opened in your email client.`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(`Failed to reject request: ${err.message}`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (loading) return <div className="loading">Loading project requests...</div>;

  return (
    <div className="admin-section project-requests">
      <div className="admin-nav-tabs">
        <Link to="/admin#requests" className="admin-nav-tab active">Project requests</Link>
        <Link to="/admin#projects" className="admin-nav-tab">Manage projects</Link>
        <Link to="/admin#users" className="admin-nav-tab">Manage users</Link>
      </div>

      <h2 className="section-title">Pending project requests</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {requests.length === 0 ? (
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
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.email}</td>
                  <td>{request.organization}</td>
                  <td>{formatDate(request.createdAt)}</td>
                  <td className="description-cell">
                    <div className="truncated-text">{request.projectDescription}</div>
                  </td>
                  <td className="actions-cell">
                    <button className="primary-btn approve-btn" onClick={() => handleApprove(request.id)} disabled={processingRequestId === request.id}>
                      {processingRequestId === request.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button className="secondary-btn reject-btn" onClick={() => handleReject(request.id)} disabled={processingRequestId === request.id}>
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

export default ProjectRequests;
