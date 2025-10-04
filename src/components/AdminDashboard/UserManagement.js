import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { getAuth } from "firebase/auth";
import "./AdminDashboard.css";
import { useAuth } from "../../context/AuthContext";
import AdminNavLinks from "./AdminNavLinks";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserOrg, setNewUserOrg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [processingPasswordReset, setProcessingPasswordReset] = useState(null);
  const [editingUserRoles, setEditingUserRoles] = useState(null);
  const [userRoles, setUserRoles] = useState({});
  const [confirmRoleChange, setConfirmRoleChange] = useState(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedRole, setSelectedRole] = useState("author");
  const [showDuplicateUserError, setShowDuplicateUserError] = useState(false);
  const [ownershipConflict, setOwnershipConflict] = useState(null);
  const { sendResetPasswordEmail } = useAuth();
  const auth = getAuth();

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  useEffect(() => {
    const filterUsers = () => {
      if (!searchQuery.trim()) {
        setFilteredUsers(users);
        return;
      }

      const query = searchQuery.toLowerCase().trim();
      const filtered = users.filter((user) => {
        return (
          (user.name && user.name.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.organization &&
            user.organization.toLowerCase().includes(query)) ||
          (user.role && user.role.toLowerCase().includes(query))
        );
      });

      setFilteredUsers(filtered);
    };

    filterUsers();
  }, [searchQuery, users]);

  const fetchProjects = async () => {
    try {
      const projectsRef = collection(db, "projects");
      const snapshot = await getDocs(projectsRef);
      const projectsData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          title: doc.data().title || "Untitled project",
          owner: doc.data().owner,
          status: doc.data().status || "active",
        }))
        .filter((project) => project.status === "active") // Only show active projects
        .sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "projectUsers");
      const snapshot = await getDocs(usersRef);

      // Create a map to deduplicate users by email
      const uniqueUsers = {};

      snapshot.docs.forEach((docSnap) => {
        const userData = docSnap.data();
        const docKey = docSnap.id;

        if (!uniqueUsers[docKey]) {
          const projectRoles = userData.projectRoles || {};
          const projectCount = Object.keys(projectRoles).length;

          uniqueUsers[docKey] = {
            id: docKey,
            email: docKey,
            ...userData,
            projectCount,
            projectRoles,
          };
        }
      });

      // Convert the map to an array
      const usersData = Object.values(uniqueUsers);
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (userEmail) => {
    try {
      await sendResetPasswordEmail(userEmail);

      setSuccess(
        `An email has been sent to ${userEmail} so they can reset their password.`
      );
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError(`Error sending password reset email: ${err.message}`);
    } finally {
      setProcessingPasswordReset(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    // This will delete the projectUser but not the user from Firebase, this still needs to
    // be done on the firebase app. In the future the Admin SDK would be needed to do this.
    try {
      const userRef = doc(db, "projectUsers", userId);
      await deleteDoc(userRef);
      setSuccess("User deleted successfully");

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setConfirmDelete(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      if (!newUserEmail) {
        setError("Email is required");
        return;
      }

      // Check if email already exists
      const existingUser = users.find(
        (user) => user.email?.toLowerCase() === newUserEmail?.toLowerCase()
      );
      if (existingUser) {
        setError("A user with this email already exists");
        setShowDuplicateUserError(true);
        return;
      }

      const emailDocId = newUserEmail.toLowerCase();
      const projectUserRef = doc(db, "projectUsers", emailDocId);

      await setDoc(projectUserRef, {
        name: newUserName || "No name provided",
        organization: newUserOrg || "No organization provided",
        createdAt: serverTimestamp(),
        status: "approved",
        addedByUserUID: auth.currentUser.uid,
        projectRoles: {},
      });

      setSuccess(`${emailDocId} has been added!`);
      setTimeout(() => setSuccess(""), 5000);

      clearUserForm();
      fetchUsers();
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Failed to add user.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const clearUserForm = () => {
    setNewUserEmail("");
    setNewUserName("");
    setNewUserOrg("");
    setError("");
    setShowDuplicateUserError(false);
  };

  const handleEditRoles = (user) => {
    setEditingUserRoles(user);
    setUserRoles({ ...user.projectRoles });
    setShowAddRole(false);
    setSelectedProject("");
    setSelectedRole("author");
  };

  const handleRoleChange = (projectId, newRole) => {
    setUserRoles((prev) => ({
      ...prev,
      [projectId]: newRole,
    }));
  };

  const handleRemoveFromProject = (projectId) => {
    setUserRoles((prev) => {
      const updated = { ...prev };
      delete updated[projectId];
      return updated;
    });
  };

  const handleOwnershipTransfer = async (makeNewOwner) => {
    const { projectId, currentOwnerEmail, newOwnerEmail } = ownershipConflict;

    if (makeNewOwner) {
      // Transfer ownership: demote current owner to author, promote new user to owner

      // Find current owner's user document
      const currentOwnerUser = users.find((u) => u.email === currentOwnerEmail);
      if (currentOwnerUser) {
        // Update current owner's roles to author
        const currentOwnerRoles = { ...currentOwnerUser.projectRoles };
        currentOwnerRoles[projectId] = "author";

        const currentOwnerRef = doc(db, "projectUsers", currentOwnerUser.id);
        await updateDoc(currentOwnerRef, {
          projectRoles: currentOwnerRoles,
        });

        // Update local users state for current owner
        setUsers((prev) =>
          prev.map((user) => {
            if (user.id === currentOwnerUser.id) {
              return {
                ...user,
                projectRoles: currentOwnerRoles,
              };
            }
            return user;
          })
        );
      }

      // Update project document to change owner
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        owner: newOwnerEmail,
      });

      // Update local projects state
      setProjects((prev) =>
        prev.map((project) => {
          if (project.id === projectId) {
            return {
              ...project,
              owner: newOwnerEmail,
            };
          }
          return project;
        })
      );

      // Add the new role (owner)
      setUserRoles((prev) => ({
        ...prev,
        [projectId]: "owner",
      }));

      setSuccess(
        "Ownership transferred successfully. The previous owner has been made an author."
      );
    } else {
      // Don't transfer ownership, make new user an author instead
      setUserRoles((prev) => ({
        ...prev,
        [projectId]: "author",
      }));
    }

    // Clear the form and conflict
    setSelectedProject("");
    setSelectedRole("author");
    setShowAddRole(false);
    setOwnershipConflict(null);
    setError("");
  };

  const confirmRoleChangeAction = (
    action,
    projectId,
    projectTitle,
    oldRole,
    newRole = null
  ) => {
    setConfirmRoleChange({
      action,
      projectId,
      projectTitle,
      oldRole,
      newRole,
      userId: editingUserRoles.id,
      userName: editingUserRoles.name || editingUserRoles.email,
      userEmail: editingUserRoles.email,
    });
  };

  const executeRoleChange = async () => {
    try {
      const {
        action,
        projectTitle,
        oldRole,
        newRole,
        userId,
        userName,
        userEmail,
      } = confirmRoleChange;

      // Update Firestore
      const userRef = doc(db, "projectUsers", userId);
      await updateDoc(userRef, {
        projectRoles: userRoles,
      });

      // Generate appropriate email
      let emailSubject, emailBody;

      if (action === "remove") {
        emailSubject = encodeURIComponent(
          "Your access to a CT Text Tool project has been removed"
        );
        emailBody = encodeURIComponent(
          `Hello ${userName},\n\n` +
            `Your access to the CT Text Tool project "${projectTitle}" has been removed by an administrator.\n\n` +
            `You will no longer be able to view or edit content for this project.\n\n` +
            `If you think this change has been made in error, please contact us by replying to this email.\n\n` +
            `Thank you,\n` +
            `Collections Trust Team`
        );
      } else {
        emailSubject = encodeURIComponent(
          "Your role has been updated in the CT Text Tool"
        );
        emailBody = encodeURIComponent(
          `Hello ${userName},\n\n` +
            `Your role on the CT Text Tool project "${projectTitle}" has been changed from ${oldRole} to ${newRole} by an administrator.\n\n` +
            `${
              newRole === "owner"
                ? "As a project owner, you now have full access to manage project settings, invite authors, and control all aspects of this project."
                : "As an author, you can view objects and create/edit texts for this project."
            }\n\n` +
            `You can access the CT Text Tool at: ${window.location.origin}\n\n` +
            `If you think this change has been made in error, please contact us by replying to this email.\n\n` +
            `Thank you,\n` +
            `Collections Trust Team`
        );
      }

      const mailtoLink = `mailto:${userEmail}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, "_blank");

      // Update local state after form submitted
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === editingUserRoles.id) {
            return {
              ...user,
              projectRoles: userRoles,
              projectCount: Object.keys(userRoles).length,
            };
          }
          return user;
        })
      );

      setSuccess(
        "Role updated successfully. A draft email has been opened in your email client."
      );
      setConfirmRoleChange(null);
      setEditingUserRoles(null);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Error updating roles:", err);
      setError("Failed to update roles.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const saveRoleChanges = async () => {
    try {
      const userRef = doc(db, "projectUsers", editingUserRoles.id);
      const originalRoles = editingUserRoles.projectRoles || {};
      const roles = { ...originalRoles, [selectedProject]: selectedRole };

      await updateDoc(userRef, { projectRoles: roles });

      // Send emails for new role assignments
      const project = projects.find((p) => p.id === selectedProject);
      const projectTitle = project ? project.title : "Unknown project";

      // Check if this is a new user (no previous project assignments)
      const isFirstProjectAssignment = Object.keys(originalRoles).length === 0;

      let emailSubject;
      let emailBody;

      if (isFirstProjectAssignment) {
        emailSubject = encodeURIComponent(
          `Welcome to the CT Text Tool - "${projectTitle}"`
        );
        emailBody = encodeURIComponent(
          `Hello ${editingUserRoles.name || editingUserRoles.email},\n\n` +
            `You have been invited to join the CT Text Tool project "${projectTitle}" as ${
              selectedRole === "owner" ? "a project owner" : "an author"
            }.\n\n` +
            `${
              selectedRole === "owner"
                ? "As a project owner, you have full access to manage project settings, invite authors, and control all aspects of this project."
                : "As an author, you can view objects and create/edit texts for this project."
            }\n\n` +
            `Visit ${window.location.origin}/signup to create your account. \n\n` +
            `Thank you,\n` +
            `Collections Trust Team`
        );
      } else {
        emailSubject = encodeURIComponent(
          `You have been added to a new CT Text Tool project`
        );
        emailBody = encodeURIComponent(
          `Hello ${editingUserRoles.name || editingUserRoles.email},\n\n` +
            `You have been added to the CT Text Tool project "${projectTitle}" as ${
              selectedRole === "owner" ? "a project owner" : "an author"
            }.\n\n` +
            `${
              selectedRole === "owner"
                ? "As a project owner, you have full access to manage project settings, invite authors, and control all aspects of this project."
                : "As an author, you can view objects and create/edit texts for this project."
            }\n\n` +
            `You can access this project using your existing CT Text Tool login at: ${window.location.origin}.\n\n` +
            `If you think this change has been made in error, please contact us by replying to this email.\n\n` +
            `Thank you,\n` +
            `Collections Trust Team`
        );
      }

      const mailtoLink = `mailto:${editingUserRoles.email}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, "_blank");

      // Update local state after form submitted
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id === editingUserRoles.id) {
            return {
              ...user,
              projectRoles: roles,
              projectCount: Object.keys(roles).length,
            };
          }
          return user;
        })
      );

      setSuccess(
        "Roles updated successfully. A draft email has been opened in your email client."
      );
      setEditingUserRoles(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating roles:", err);
      setError("Failed to update roles.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const getProjectTitle = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.title : "Unknown project";
  };

  const getAvailableProjects = () => {
    return projects.filter((project) => !userRoles[project.id]);
  };

  return (
    <div className="admin-section user-management">
      <AdminNavLinks />
      <div className="header-row">
        <h2 className="section-title">Manage users</h2>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleAddUser} className="add-user-form">
        <div className="user-form-row">
          <h2 className="user-form-label">Add new user</h2>
          <div className="user-form__input-row">
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
            <button type="submit" className="primary-btn reset-btn">
              Add new user
            </button>
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
          <button className="clear-btn" onClick={() => setSearchQuery("")}>
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
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "No name provided"}</td>
                  <td>{user.organization || "No organization provided"}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.projectCount} project
                    {user.projectCount !== 1 ? "s" : ""}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEditRoles(user)}
                      className="secondary-btn reset-btn"
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handlePasswordReset(user.email)}
                      className="secondary-btn reset-btn"
                      disabled={processingPasswordReset === user.id}
                    >
                      {processingPasswordReset === user.id
                        ? "Sending email..."
                        : "Reset"}
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
          <div className="roles-modal-wide">
            <h3>
              Edit roles for {editingUserRoles.name || editingUserRoles.email}
            </h3>
            <div className="roles-table-container">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>Project</th>
                    <th style={{ width: "25%" }}>Current role</th>
                    <th style={{ width: "25%" }}>Actions</th>
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
                            const oldRole =
                              editingUserRoles.projectRoles[projectId];
                            if (newRole !== oldRole) {
                              confirmRoleChangeAction(
                                "change",
                                projectId,
                                getProjectTitle(projectId),
                                oldRole,
                                newRole
                              );
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
                            confirmRoleChangeAction(
                              "remove",
                              projectId,
                              getProjectTitle(projectId),
                              role
                            );
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
                      <td
                        colSpan="3"
                        style={{ textAlign: "center", color: "#666" }}
                      >
                        No project assignments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add role section */}
            <div className="add-role-section">
              {!showAddRole && (
                <button
                  className="secondary-btn reset-btn"
                  onClick={() => setShowAddRole(!showAddRole)}
                >
                  Add role
                </button>
              )}

              {showAddRole && (
                <div className="add-role-form">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="role-select"
                  >
                    <option value="">Select project</option>
                    {getAvailableProjects().map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="role-select"
                  >
                    <option value="author">Author</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
              )}
            </div>

            <div className="dialog-buttons">
              <button
                className="secondary-btn reset-btn"
                onClick={() => {
                  setEditingUserRoles(null);
                  setUserRoles({});
                  setShowAddRole(false);
                }}
              >
                Cancel
              </button>
              <button
                className="primary-btn reset-btn"
                onClick={saveRoleChanges}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role change confirmation dialog */}
      {confirmRoleChange && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Confirm role change</h3>
            <p>
              {confirmRoleChange.action === "remove"
                ? `Are you sure you want to remove ${confirmRoleChange.userName} from "${confirmRoleChange.projectTitle}"?`
                : `Are you sure you want to change ${confirmRoleChange.userName}'s role on "${confirmRoleChange.projectTitle}" from ${confirmRoleChange.oldRole} to ${confirmRoleChange.newRole}?`}
            </p>
            <p>An email will be sent to notify them of this change.</p>
            <div className="dialog-buttons">
              <button
                className="secondary-btn"
                onClick={() => {
                  setConfirmRoleChange(null);
                  // Reset the role back to original
                  if (confirmRoleChange.action === "change") {
                    setUserRoles((prev) => ({
                      ...prev,
                      [confirmRoleChange.projectId]: confirmRoleChange.oldRole,
                    }));
                  } else {
                    // Restore removed project
                    setUserRoles((prev) => ({
                      ...prev,
                      [confirmRoleChange.projectId]: confirmRoleChange.oldRole,
                    }));
                  }
                }}
              >
                Cancel
              </button>
              <button className="primary-btn" onClick={executeRoleChange}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ownership conflict dialog */}
      {ownershipConflict && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Ownership Conflict</h3>
            <p>
              The project "{ownershipConflict.projectTitle}" already has an
              owner: {ownershipConflict.currentOwnerName} (
              {ownershipConflict.currentOwnerEmail}).
            </p>
            <p>
              You are trying to make {ownershipConflict.newOwnerName} (
              {ownershipConflict.newOwnerEmail}) the owner.
            </p>
            <p>
              <strong>There can only be one owner per project.</strong>
            </p>
            <p>What would you like to do?</p>
            <div className="dialog-buttons">
              <button
                className="secondary-btn"
                onClick={() => handleOwnershipTransfer(false)}
              >
                Make {ownershipConflict.newOwnerName.split(" ")[0]} an Author
                instead
              </button>
              <button
                className="primary-btn"
                onClick={() => handleOwnershipTransfer(true)}
              >
                Transfer ownership to{" "}
                {ownershipConflict.newOwnerName.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Delete User</h3>
            <p>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="dialog-buttons">
              <button
                className="secondary-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteUser(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
