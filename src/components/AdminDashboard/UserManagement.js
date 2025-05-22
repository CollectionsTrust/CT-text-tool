import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { generateTempPassword, hashPassword } from '../../utils/passwordUtils';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');
  const [newUserRole, setNewUserRole] = useState('author');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [processingPasswordReset, setProcessingPasswordReset] = useState(null);
  const [editingUserRoles, setEditingUserRoles] = useState(null);
  const [userRoles, setUserRoles] = useState({});
  const [confirmRoleChange, setConfirmRoleChange] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const fetchProjects = async () => {
    try {
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled Project',
        owner: doc.data().owner
      }));
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'projectUsers');
      const snapshot = await getDocs(usersRef);
      
      // Create a map to deduplicate users by email
      const uniqueUsers = {};
      
      snapshot.docs.forEach(doc => {
        const userData = doc.data();
        // Use email as the unique identifier
        if (!uniqueUsers[userData.email]) {
          const projectRoles = userData.projectRoles || {};
          const projectCount = Object.keys(projectRoles).length;
          
          uniqueUsers[userData.email] = {
            id: doc.id,
            ...userData,
            projectCount: projectCount,
            projectRoles: projectRoles
          };
        }
      });
      
      // Convert the map to an array
      const usersData = Object.values(uniqueUsers);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(user => {
      return (
        (user.name && user.name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.organization && user.organization.toLowerCase().includes(query)) ||
        (user.role && user.role.toLowerCase().includes(query))
      );
    });
    
    setFilteredUsers(filtered);
  };

  const handlePasswordReset = async (userId) => {
    try {
      setProcessingPasswordReset(userId);
      setError('');
      setSuccess('');

      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate a new temporary password
      const tempPassword = generateTempPassword();
      const hashedPassword = await hashPassword(tempPassword);

      // Update the user's password in Firestore
      const userRef = doc(db, 'projectUsers', userId);
      await updateDoc(userRef, {
        passwordHash: hashedPassword,
        passwordSettings: {
          isTemporary: true,
          lastChanged: null,
          createdAt: new Date().toISOString()
        },
        // Remove old password field if it exists
        password: null
      });

      // Generate mailto link with pre-populated content
      const emailSubject = encodeURIComponent('Your CT Text Tool password has been reset');
      const emailBody = encodeURIComponent(
        `Hello ${user.name || user.email},\n\n` +
        `Your password for the CT Text Tool has been reset by an administrator.\n\n` +
        `Your new temporary password is: ${tempPassword}\n\n` +
        `Important: You will be required to change this password when you next log in.\n\n` +
        `If you have any questions, please contact us.\n\n` +
        `Thank you,\n` +
        `Collections Trust Team`
      );
      
      const mailtoLink = `mailto:${user.email}?subject=${emailSubject}&body=${emailBody}`;
      
      // Open the mailto link in a new window/tab
      window.open(mailtoLink, '_blank');

      setSuccess(`Password reset for ${user.name || user.email}. A draft email has been opened in your email client.`);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(`Failed to reset password: ${err.message}`);
    } finally {
      setProcessingPasswordReset(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const userRef = doc(db, 'projectUsers', userId);
      await deleteDoc(userRef);
      setSuccess('User deleted successfully');

      setUsers(prev => prev.filter(user => user.id !== userId));
      setConfirmDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      if (!newUserEmail) {
        setError('Email is required');
        return;
      }

      // Check if email already exists
      const existingUser = users.find(user => user.email.toLowerCase() === newUserEmail.toLowerCase());
      if (existingUser) {
        setError('A user with this email already exists');
        return;
      }

      await addDoc(collection(db, 'projectUsers'), {
        email: newUserEmail,
        name: newUserName || 'No name provided',
        organization: newUserOrg || 'No organization provided',
        role: newUserRole,
        createdAt: new Date(),
        projectRoles: {} // Initialize with empty project roles
      });

      setSuccess('New user added successfully');
      setNewUserEmail('');
      setNewUserName('');
      setNewUserOrg('');
      setNewUserRole('author');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding user:', err);
      setError('Failed to add user.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEditRoles = (user) => {
    setEditingUserRoles(user);
    setUserRoles({ ...user.projectRoles });
  };

  const handleRoleChange = (projectId, newRole) => {
    setUserRoles(prev => ({
      ...prev,
      [projectId]: newRole
    }));
  };

  const handleRemoveFromProject = (projectId) => {
    setUserRoles(prev => {
      const updated = { ...prev };
      delete updated[projectId];
      return updated;
    });
  };

  const confirmRoleChangeAction = (action, projectId, projectTitle, oldRole, newRole = null) => {
    setConfirmRoleChange({
      action,
      projectId,
      projectTitle,
      oldRole,
      newRole,
      userId: editingUserRoles.id,
      userName: editingUserRoles.name || editingUserRoles.email,
      userEmail: editingUserRoles.email
    });
  };

  const executeRoleChange = async () => {
    try {
      const { action, projectId, projectTitle, oldRole, newRole, userId, userName, userEmail } = confirmRoleChange;
      
      // Update Firestore
      const userRef = doc(db, 'projectUsers', userId);
      await updateDoc(userRef, {
        projectRoles: userRoles
      });

      // Generate appropriate email
      let emailSubject, emailBody;
      
      if (action === 'remove') {
        emailSubject = encodeURIComponent('Your access to a CT Text Tool project has been removed');
        emailBody = encodeURIComponent(
          `Hello ${userName},\n\n` +
          `Your access to the project "${projectTitle}" has been removed by an administrator.\n\n` +
          `You will no longer be able to view or edit content for this project.\n\n` +
          `If you think this change has been made in error, please contact us by replying to this email.\n\n` +
          `Thank you,\n` +
          `Collections Trust Team`
        );
      } else {
        emailSubject = encodeURIComponent('Your role has been updated in the CT Text Tool');
        emailBody = encodeURIComponent(
          `Hello ${userName},\n\n` +
          `Your role on the project "${projectTitle}" has been changed from ${oldRole} to ${newRole} by an administrator.\n\n` +
          `${newRole === 'owner' ? 'As an Owner, you now have full access to manage project settings, invite authors, and control all aspects of this project.' : 'As an Author, you can view objects and create/edit texts for this project.'}\n\n` +
          `If you think this change has been made in error, please contact us by replying to this email.\n\n` +
          `Thank you,\n` +
          `Collections Trust Team`
        );
      }
      
      const mailtoLink = `mailto:${userEmail}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');

      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            projectRoles: userRoles,
            projectCount: Object.keys(userRoles).length
          };
        }
        return user;
      }));

      setSuccess(`Role updated successfully. A draft email has been opened in your email client.`);
      setConfirmRoleChange(null);
      setEditingUserRoles(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating roles:', err);
      setError('Failed to update roles.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const saveRoleChanges = async () => {
    try {
      const userRef = doc(db, 'projectUsers', editingUserRoles.id);
      await updateDoc(userRef, {
        projectRoles: userRoles
      });

      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === editingUserRoles.id) {
          return {
            ...user,
            projectRoles: userRoles,
            projectCount: Object.keys(userRoles).length
          };
        }
        return user;
      }));

      setSuccess('Roles updated successfully');
      setEditingUserRoles(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating roles:', err);
      setError('Failed to update roles.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getProjectTitle = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Unknown Project';
  };

  return (
    <div className="admin-section user-management">
      <div className="admin-nav-tabs">
        <Link to="/admin#requests" className="admin-nav-tab">Requests</Link>
        <Link to="/admin#projects" className="admin-nav-tab">Manage projects</Link>
        <Link to="/admin#users" className="admin-nav-tab active">Manage users</Link>
      </div>

      <h2 className="section-title">Manage users</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleAddUser} className="add-user-form">
        <div className="user-form-row">
          <input
            type="text"
            placeholder="Name"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            className="user-form-input"
          />
          <input
            type="text"
            placeholder="Organization"
            value={newUserOrg}
            onChange={(e) => setNewUserOrg(e.target.value)}
            className="user-form-input"
          />
          <input
            type="email"
            placeholder="User email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="user-form-input"
            required
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value)}
            className="user-form-select"
          >
            <option value="author">Author</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="primary-btn">Add user</button>
        </div>
      </form>

      <div className="search-bar-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery('')}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="loading">Loading users...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>Email</th>
                <th>Projects</th>
                <th>Roles</th>
                <th>Password</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name || 'No name provided'}</td>
                  <td>{user.organization || 'No organization provided'}</td>
                  <td>{user.email}</td>
                  <td>{user.projectCount} project{user.projectCount !== 1 ? 's' : ''}</td>
                  <td>
                    <button
                      onClick={() => handleEditRoles(user)}
                      className="secondary-btn"
                    >
                      Edit roles
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handlePasswordReset(user.id)}
                      className="secondary-btn reset-btn"
                      disabled={processingPasswordReset === user.id}
                    >
                      {processingPasswordReset === user.id ? 'Resetting...' : 'Reset'}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => setConfirmDelete(user.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role editing modal */}
      {editingUserRoles && (
        <div className="confirm-dialog-backdrop">
          <div className="roles-modal">
            <h3>Edit Roles for {editingUserRoles.name || editingUserRoles.email}</h3>
            <div className="roles-table-container">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Current Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(userRoles).map(([projectId, role]) => (
                    <tr key={projectId}>
                      <td>{getProjectTitle(projectId)}</td>
                      <td>
                        <select
                          value={role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            const oldRole = editingUserRoles.projectRoles[projectId];
                            if (newRole !== oldRole) {
                              confirmRoleChangeAction('change', projectId, getProjectTitle(projectId), oldRole, newRole);
                            }
                            handleRoleChange(projectId, newRole);
                          }}
                          className="role-select"
                        >
                          <option value="author">Author</option>
                          <option value="owner">Owner</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            confirmRoleChangeAction('remove', projectId, getProjectTitle(projectId), role);
                            handleRemoveFromProject(projectId);
                          }}
                          className="delete-btn"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(userRoles).length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: '#666' }}>
                        No project assignments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="dialog-buttons">
              <button 
                className="secondary-btn" 
                onClick={() => {
                  setEditingUserRoles(null);
                  setUserRoles({});
                }}
              >
                Cancel
              </button>
              <button 
                className="primary-btn" 
                onClick={saveRoleChanges}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role change confirmation dialog */}
      {confirmRoleChange && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Confirm Role Change</h3>
            <p>
              {confirmRoleChange.action === 'remove' 
                ? `Are you sure you want to remove ${confirmRoleChange.userName} from "${confirmRoleChange.projectTitle}"?`
                : `Are you sure you want to change ${confirmRoleChange.userName}'s role on "${confirmRoleChange.projectTitle}" from ${confirmRoleChange.oldRole} to ${confirmRoleChange.newRole}?`
              }
            </p>
            <p>An email will be sent to notify them of this change.</p>
            <div className="dialog-buttons">
              <button 
                className="secondary-btn" 
                onClick={() => {
                  setConfirmRoleChange(null);
                  // Reset the role back to original
                  if (confirmRoleChange.action === 'change') {
                    setUserRoles(prev => ({
                      ...prev,
                      [confirmRoleChange.projectId]: confirmRoleChange.oldRole
                    }));
                  } else {
                    // Restore removed project
                    setUserRoles(prev => ({
                      ...prev,
                      [confirmRoleChange.projectId]: confirmRoleChange.oldRole
                    }));
                  }
                }}
              >
                Cancel
              </button>
              <button 
                className="primary-btn" 
                onClick={executeRoleChange}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="dialog-buttons">
              <button className="secondary-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="delete-btn" onClick={() => handleDeleteUser(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
