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
  const [userProjects, setUserProjects] = useState({});
  const [processingPasswordReset, setProcessingPasswordReset] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

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
          uniqueUsers[userData.email] = {
            id: doc.id,
            ...userData
          };
        }
      });
      
      // Convert the map to an array
      const usersData = Object.values(uniqueUsers);
      
      setUsers(usersData);
      
      // Fetch projects for each user
      const projectsRef = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsRef);
      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Create a mapping of user email to their projects
      const projectsByUser = {};
      for (const user of usersData) {
        const userProjects = projects.filter(project => project.owner === user.email);
        projectsByUser[user.email] = userProjects.map(p => p.title || 'Untitled Project').join('; ');
      }
      
      setUserProjects(projectsByUser);
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'projectUsers', userId);
      await updateDoc(userRef, { role: newRole });
      setSuccess('User role updated successfully');

      setUsers(prev =>
        prev.map(user => user.id === userId ? { ...user, role: newRole } : user)
      );

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role.');
      setTimeout(() => setError(''), 3000);
    }
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
        createdAt: new Date()
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
                <th>Role</th>
                <th>Projects</th>
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
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="author">Author</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{userProjects[user.email] || 'No projects'}</td>
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
