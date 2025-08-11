import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.css';

const AuthorManagement = () => {
  const [authors, setAuthors] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editAuthorProjects, setEditAuthorProjects] = useState([]);
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editAuthorOrg, setEditAuthorOrg] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [showDuplicateUserError, setShowDuplicateUserError] = useState(false);
  const { user, userRoles } = useAuth();

  // Fetch authors and owner's projects on component mount
  useEffect(() => {
    fetchOwnedProjects();
    fetchAuthors();
  }, []);

  // Filter authors when search query changes
  useEffect(() => {
    filterAuthors();
  }, [searchQuery, authors]);

  // Auto-select the only project if there's just one
  useEffect(() => {
    if (userProjects.length === 1) {
      setSelectedProjects([userProjects[0].id]);
    }
  }, [userProjects]);

  const fetchOwnedProjects = async () => {
    if (!user) return;

    try {
      const ownedProjectIds = Object.keys(userRoles?.projectRoles)
        .filter(key => userRoles?.projectRoles[key] === 'owner');

      const ownedProjects = await Promise.all(
        ownedProjectIds.map(async (projectId) => {
          const projectDocRef = doc(db, 'projects', projectId);
          const projectSnap = await getDoc(projectDocRef);
          const docData = projectSnap.data()

          if (projectSnap.exists()) {
            return {
              id: projectId,
              title: docData.title || 'Untitled Project',
              ...docData
            }
          }

          return null
        })
          .sort((a, b) => a.title.localeCompare(b.title)) // Sort alphabetically
      );

      setUserProjects(ownedProjects);
    } catch (err) {
      console.error('Error fetching owned projects:', err);
      setError('Failed to load your projects.');
    }
  };

  const fetchAuthors = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const ownedProjectIds = Object.keys(userRoles?.projectRoles)
        .filter(key => userRoles?.projectRoles[key] === 'owner');

      if (ownedProjectIds.length === 0) {
        setAuthors([]);
        setLoading(false);
        return;
      }

      // Get all users
      const usersRef = collection(db, 'projectUsers');
      const usersSnapshot = await getDocs(usersRef);

      // Find users who are authors of the current user's projects
      const authorsData = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // The ids of the projects the user is an author on and is owned by this user
        const authorProjectIds = Object.keys(userData.projectRoles)
          .filter(key => userData.projectRoles[key] === 'author')
          .filter(key => ownedProjectIds.includes(key))

        const projectPromises = authorProjectIds.map(id =>
          getDoc(doc(db, "projects", id))
        );

        const snapshots = await Promise.all(projectPromises);

        const authorProjects = snapshots
          .filter(doc => doc.exists())
          .map(doc => ({ id: doc.id, title: doc.data().title || 'Untitled Project', ...doc.data() }));

        // If user is an author on at least one of owner's projects, add them to the list
        if (authorProjectIds.length > 0) {
          authorsData.push({
            id: userDoc.id,
            email: userData.email,
            name: userData.name || '',
            organization: userData.organization || '',
            authorProjects: authorProjects,
            projectCount: authorProjects.length
          });
        }

      }

      setAuthors(authorsData);
      setFilteredAuthors(authorsData);
    } catch (err) {
      console.error('Error fetching authors:', err);
      setError('Failed to load authors.');
    } finally {
      setLoading(false);
    }
  };

  const filterAuthors = () => {
    if (!searchQuery.trim()) {
      setFilteredAuthors(authors);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = authors.filter(author => {
      return (
        (author.name && author.name.toLowerCase().includes(query)) ||
        (author.email && author.email.toLowerCase().includes(query)) ||
        (author.organization && author.organization.toLowerCase().includes(query)) ||
        (author.authorProjects && author.authorProjects.some(project =>
          project.title.toLowerCase().includes(query)
        ))
      );
    });

    setFilteredAuthors(filtered);
  };

  const handleDeleteAuthor = async (authorId) => {
    try {
      const author = authors.find(a => a.id === authorId);

      if (!author) {
        setError("Author not found");
        return;
      }

      // Get the author's current data
      const authorRef = doc(db, 'projectUsers', authorId);
      const authorDoc = await getDoc(authorRef);

      if (!authorDoc.exists()) {
        setError("Author document not found in Firestore");
        return;
      }

      const authorData = authorDoc.data();
      const projectRoles = authorData.projectRoles || {};

      // Get all projects owned by current user
      const ownedProjectIds = userProjects.map(p => p.id);

      // Remove these projects from the user's projectRoles
      for (const projectId of ownedProjectIds) {
        projectRoles[projectId] = null
      }

      // Update the user document. This doesn't remove user from the app entirely just their
      // permissions as an author on the project.
      await updateDoc(authorRef, { projectRoles });
      setSuccess(`Author removed from your projects`);

      // Update local state
      setAuthors(prev => prev.filter(a => a.id !== authorId));
      setFilteredAuthors(prev => prev.filter(a => a.id !== authorId));
      setConfirmDelete(null);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error deleting author:', err);
      setError('Failed to delete author.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleProjectSelection = (projectId) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const toggleEditProjectSelection = (projectId) => {
    setEditAuthorProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };

  const handleStartEdit = (author) => {
    setEditingAuthor(author.id);
    setEditAuthorName(author.name || '');
    setEditAuthorOrg(author.organization || '');
    setEditAuthorProjects(author.authorProjects.map(p => p.id));
  };

  const handleSaveEdit = async (authorId) => {
    try {
      const author = authors.find(a => a.id === authorId);
      if (!author) {
        setError("Author not found");
        return;
      }

      // Get the author's current data
      const authorRef = doc(db, 'projectUsers', authorId);
      const authorDoc = await getDoc(authorRef);

      if (!authorDoc.exists()) {
        setError("Author document not found in Firestore");
        return;
      }

      const authorData = authorDoc.data();
      const projectRoles = authorData.projectRoles || {};

      // Create updated projectRoles object
      const updatedProjectRoles = { ...projectRoles };

      // Get all projects owned by current user
      const ownedProjectIds = userProjects.map(p => p.id);

      // First, remove all owned projects from roles
      for (const projectId of ownedProjectIds) {
        delete updatedProjectRoles[projectId];
      }

      // Then add the selected projects back as 'author'
      for (const projectId of editAuthorProjects) {
        updatedProjectRoles[projectId] = 'author';
      }

      // Update the user document
      await updateDoc(authorRef, {
        name: editAuthorName,
        organization: editAuthorOrg,
        projectRoles: updatedProjectRoles
      });

      // Generate mailto link for project changes
      const originalProjects = author.authorProjects.map(p => p.id).sort();
      const newProjects = editAuthorProjects.sort();
      const hasChanges = JSON.stringify(originalProjects) !== JSON.stringify(newProjects);

      if (hasChanges) {
        const addedProjects = editAuthorProjects.filter(id => !originalProjects.includes(id));
        const removedProjects = originalProjects.filter(id => !editAuthorProjects.includes(id));

        let changeDescription = '';
        if (addedProjects.length > 0) {
          const addedProjectNames = addedProjects.map(id => {
            const project = userProjects.find(p => p.id === id);
            return project ? project.title : 'Unknown project';
          });
          changeDescription += `Added to: ${addedProjectNames.join(', ')}`;
        }

        if (removedProjects.length > 0) {
          const removedProjectNames = removedProjects.map(id => {
            const project = author.authorProjects.find(p => p.id === id);
            return project ? project.title : 'Unknown project';
          });
          if (changeDescription) changeDescription += '\n';
          changeDescription += `Removed from: ${removedProjectNames.join(', ')}`;
        }

        const emailSubject = encodeURIComponent('Your project access has been updated in the CT Text Tool');
        const emailBody = encodeURIComponent(
          `Hello ${editAuthorName || author.email},\n\n` +
          `Your project access in the CT Text Tool has been updated:\n\n` +
          `${changeDescription}\n\n` +
          `You can access the CT Text Tool at: https://texts.collectionstrust.org.uk\n\n` +
          `If you think this change has been made in error, please contact us by replying to this email.\n\n` +
          `Best regards,\n` +
          `${user?.name || user?.email || 'Project Owner'}`
        );

        const mailtoLink = `mailto:${author.email}?subject=${emailSubject}&body=${emailBody}`;
        window.open(mailtoLink, '_blank');
      }

      // Update local state
      const updatedAuthorProjects = [];
      for (const projectId of editAuthorProjects) {
        const project = userProjects.find(p => p.id === projectId);
        if (project) {
          updatedAuthorProjects.push({
            id: projectId,
            title: project.title
          });
        }
      }

      setAuthors(prev => prev.map(a => {
        if (a.id === authorId) {
          return {
            ...a,
            name: editAuthorName,
            organization: editAuthorOrg,
            authorProjects: updatedAuthorProjects,
            projectCount: updatedAuthorProjects.length
          };
        }
        return a;
      }));

      setFilteredAuthors(prev => prev.map(a => {
        if (a.id === authorId) {
          return {
            ...a,
            name: editAuthorName,
            organization: editAuthorOrg,
            authorProjects: updatedAuthorProjects,
            projectCount: updatedAuthorProjects.length
          };
        }
        return a;
      }));

      const emailMessage = hasChanges ? ' A draft email has been opened in your email client.' : '';
      setSuccess(`Author updated successfully.${emailMessage}`);
      setEditingAuthor(null);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error updating author:', err);
      setError('Failed to update author.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();
    try {
      if (!newUserEmail) {
        setError('Email is required');
        return;
      }

      if (selectedProjects.length === 0) {
        setError('Please select at least one project');
        return;
      }

      // Check if user already exists
      const usersRef = collection(db, 'projectUsers');
      const existingUserQuery = query(usersRef, where('email', '==', newUserEmail));
      const existingUserSnapshot = await getDocs(existingUserQuery);

      if (!existingUserSnapshot.empty) {
        // User exists, update their projectRoles
        const existingUser = existingUserSnapshot.docs[0];
        const existingUserData = existingUser.data();

        // Get current project roles
        const currentProjectRoles = existingUserData.projectRoles || {};

        // Add new projects with 'author' role
        const updatedProjectRoles = { ...currentProjectRoles };
        let newProjectsAdded = false;
        const addedProjectNames = [];

        for (const projectId of selectedProjects) {
          if (!updatedProjectRoles[projectId]) {
            updatedProjectRoles[projectId] = 'author';
            newProjectsAdded = true;
            const project = userProjects.find(p => p.id === projectId);
            if (project) {
              addedProjectNames.push(project.title);
            }
          }
        }

        if (newProjectsAdded) {
          await updateDoc(doc(db, 'projectUsers', existingUser.id), {
            projectRoles: updatedProjectRoles,
            // Only update name and org if they're empty
            name: existingUserData.name || newUserName || 'No name provided',
            organization: existingUserData.organization || newUserOrg || 'No organization provided'
          });

          // Generate mailto link for existing user
          const emailSubject = encodeURIComponent('You have been added to new CT Text Tool projects');
          const emailBody = encodeURIComponent(
            `Hello ${existingUserData.name || newUserName || existingUserData.email},\n\n` +
            `You have been added to the following CT Text Tool project${addedProjectNames.length > 1 ? 's' : ''} as an author:\n\n` +
            `${addedProjectNames.join('\n')}\n\n` +
            `As an author, you can view objects and create/edit texts for ${addedProjectNames.length > 1 ? 'these projects' : 'this project'}.\n\n` +
            `You can access the CT Text Tool using your existing login at: https://texts.collectionstrust.org.uk\n\n` +
            `If you think this change has been made in error, please contact us by replying to this email.\n\n` +
            `Best regards,\n` +
            `${user?.name || user?.email || 'Project Owner'}`
          );

          const mailtoLink = `mailto:${newUserEmail}?subject=${emailSubject}&body=${emailBody}`;
          window.open(mailtoLink, '_blank');

          setSuccess(`Existing user ${existingUserData.name || newUserEmail} updated with new projects. A draft email has been opened in your email client.`);
        } else {
          setSuccess(`User ${existingUserData.name || newUserEmail} already has these projects assigned`);
        }
      } else {
        // Create new user
        // Initialize projectRoles object with selected projects as 'author'
        const projectRoles = {};
        const selectedProjectNames = [];
        for (const projectId of selectedProjects) {
          projectRoles[projectId] = 'author';
          const project = userProjects.find(p => p.id === projectId);
          if (project) {
            selectedProjectNames.push(project.title);
          }
        }

        await setDoc(doc(db, 'projectUsers', newUserEmail.toLowerCase()), {
          name: newUserName || 'No name provided',
          organization: newUserOrg || 'No organization provided',
          createdAt: serverTimestamp(),
          projectRoles: projectRoles,
          status: 'approved',
          addedByUserUID: user.uid // Added so we can list users add but not assigned
        });

        // Generate mailto link for new user
        const emailSubject = encodeURIComponent(`Welcome to the CT Text Tool${selectedProjectNames.length === 1 ? ` - "${selectedProjectNames[0]}"` : ''}`);
        const emailBody = encodeURIComponent(
          `Hello ${newUserName || newUserEmail},\n\n` +
          `You have been invited to join the CT Text Tool project${selectedProjectNames.length > 1 ? 's' : ''} as an author:\n\n` +
          `${selectedProjectNames.join('\n')}\n\n` +
          `As an author, you can view objects and create/edit texts for ${selectedProjectNames.length > 1 ? 'these projects' : 'this project'}.\n\n` +
          `Visit ${window.location.origin}/signup to create your account. \n\n` +
          `If you have any questions, please contact us by replying to this email.\n\n` +
          `Best regards,\n` +
          `${user?.name || user?.email || 'Project Owner'}`
        );

        const mailtoLink = `mailto:${newUserEmail}?subject=${emailSubject}&body=${emailBody}`;
        window.open(mailtoLink, '_blank');

        setSuccess('New author added successfully. A draft email has been opened in your email client.');
      }

      // Reset form
      clearUserForm();

      // Refresh author list
      fetchAuthors();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error adding author:', err);
      setError('Failed to add author.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const clearUserForm = () => {
    setNewUserEmail('');
    setNewUserName('');
    setNewUserOrg('');
    setSelectedProjects([]);
    setShowDropdown(false);
    setError('');
    setShowDuplicateUserError(false);
  };

  const getSelectedProjectsText = () => {
    if (selectedProjects.length === 0) return 'Select project';

    return selectedProjects.map(projectId => {
      const project = userProjects.find(p => p.id === projectId);
      return project ? project.title : '';
    }).join(', ');
  };

  const getEditSelectedProjectsText = () => {
    if (editAuthorProjects.length === 0) return 'Select project';

    return editAuthorProjects.map(projectId => {
      const project = userProjects.find(p => p.id === projectId);
      return project ? project.title : '';
    }).join(', ');
  };

  if (loading) {
    return <div className="loading">Loading authors...</div>;
  }

  return (
    <div className="user-section author-management">
      <h2 className="section-title">Manage authors</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleAddAuthor} className="add-user-form">
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
            placeholder="Email address"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="user-form-input"
            required
          />

          {/* Custom dropdown */}
          <div className="custom-select-container" style={{ position: 'relative' }}>
            <div
              className="custom-select-input"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: 'white',
                minWidth: '200px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{getSelectedProjectsText()}</span>
              <span style={{ marginLeft: '8px' }}>▼</span>
            </div>

            {showDropdown && (
              <div
                className="custom-select-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {userProjects.map(project => (
                  <div
                    key={project.id}
                    className="custom-select-option"
                    onClick={() => toggleProjectSelection(project.id)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: selectedProjects.includes(project.id) ? '#f0f0f0' : 'white',
                      color: selectedProjects.includes(project.id) ? '#4a4d85' : 'inherit',
                      fontWeight: selectedProjects.includes(project.id) ? 'bold' : 'normal'
                    }}
                  >
                    {project.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="primary-btn">Add author</button>
          {showDuplicateUserError && (
            <button
              type="button"
              className="secondary-btn reset-btn"
              onClick={clearUserForm}
            >
              Clear
            </button>
          )}
        </div>
        <div className="form-help-text">
          Click multiple projects to select more than one
        </div>

        {/* Display selected projects as pills */}
        {selectedProjects.length > 0 && (
          <div className="selected-items-container">
            <div className="pill-container">
              {selectedProjects.map(projectId => {
                const project = userProjects.find(p => p.id === projectId);
                return (
                  <div key={projectId} className="pill">
                    {project ? project.title : 'Unknown project'}
                    <button type="button" onClick={() => toggleProjectSelection(projectId)}>×</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </form>

      <div className="search-bar-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search authors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery('')}>
            Clear
          </button>
        )}
      </div>

      {filteredAuthors.length === 0 ? (
        <div className="no-content-message">
          {authors.length === 0
            ? "You haven't added any authors yet"
            : "No authors match your search"
          }
        </div>
      ) : (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Organization</th>
                <th>Email</th>
                <th>Projects</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuthors.map(author => (
                <tr key={author.id}>
                  <td>
                    {editingAuthor === author.id ? (
                      <input
                        type="text"
                        value={editAuthorName}
                        onChange={(e) => setEditAuthorName(e.target.value)}
                        className="user-form-input"
                      />
                    ) : (
                      author.name || 'No name provided'
                    )}
                  </td>
                  <td>
                    {editingAuthor === author.id ? (
                      <input
                        type="text"
                        value={editAuthorOrg}
                        onChange={(e) => setEditAuthorOrg(e.target.value)}
                        className="user-form-input"
                      />
                    ) : (
                      author.organization || 'No organization provided'
                    )}
                  </td>
                  <td>{author.email}</td>
                  <td>
                    {editingAuthor === author.id ? (
                      <div className="custom-select-container" style={{ position: 'relative' }}>
                        <div
                          className="custom-select-input"
                          onClick={() => setShowEditDropdown(!showEditDropdown)}
                          style={{
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: 'white',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{getEditSelectedProjectsText()}</span>
                          <span style={{ marginLeft: '8px' }}>▼</span>
                        </div>

                        {showEditDropdown && (
                          <div
                            className="custom-select-dropdown"
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              zIndex: 10,
                              backgroundColor: 'white',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              marginTop: '4px',
                              maxHeight: '200px',
                              overflowY: 'auto',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          >
                            {userProjects.map(project => (
                              <div
                                key={project.id}
                                className="custom-select-option"
                                onClick={() => toggleEditProjectSelection(project.id)}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  backgroundColor: editAuthorProjects.includes(project.id) ? '#f0f0f0' : 'white',
                                  color: editAuthorProjects.includes(project.id) ? '#4a4d85' : 'inherit',
                                  fontWeight: editAuthorProjects.includes(project.id) ? 'bold' : 'normal'
                                }}
                              >
                                {project.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      `${author.projectCount} project${author.projectCount !== 1 ? 's' : ''}`
                    )}

                    {/* Display selected projects as pills when editing */}
                    {editingAuthor === author.id && editAuthorProjects.length > 0 && (
                      <div className="selected-items-container">
                        <div className="pill-container">
                          {editAuthorProjects.map(projectId => {
                            const project = userProjects.find(p => p.id === projectId);
                            return (
                              <div key={projectId} className="pill">
                                {project ? project.title : 'Unknown project'}
                                <button type="button" onClick={() => toggleEditProjectSelection(projectId)}>×</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingAuthor === author.id ? (
                      <button
                        onClick={() => handleSaveEdit(author.id)}
                        className="secondary-btn reset-btn"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(author)}
                        className="secondary-btn reset-btn"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setConfirmDelete(author.id)}
                      className="delete-btn"
                      disabled={editingAuthor === author.id}
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
            <h3>Delete Author</h3>
            <p>Are you sure you want to remove this author? This action cannot be undone.</p>
            <div className="dialog-buttons">
              <button className="secondary-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="delete-btn" onClick={() => handleDeleteAuthor(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorManagement;
