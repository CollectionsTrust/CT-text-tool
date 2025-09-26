import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import AddNewProjectAsOwner from "../ProjectSetup/AddNewProjectAsOwner";

const ITEMS_PER_PAGE = 25;

const ProjectsList = ({
  projects,
  setProjects,
  error,
  successMessage,
  setSuccessMessage,
}) => {
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmArchive, setConfirmArchive] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { userRoles } = useAuth();
  const navigate = useNavigate();

  const handleRefreshProjects = (newDocID, newDoc) => {
    console.log("Refreshing projects list with new document:", newDoc);

    setProjects((prev) => [
      ...prev,
      { ...newDoc, id: newDocID, userRole: "owner" },
    ]);
  };

  useEffect(() => {
    // Only perform search if we have projects
    if (!projects || projects.length === 0) {
      setFilteredProjects([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();

    // If search query is empty, just filter by archived status
    if (!query) {
      // NOTE: We're hiding archived projects by default regardless of showArchived state
      // This line was modified to hide archived projects
      const visible = projects.filter((p) => p.status !== "archived");
      setFilteredProjects(visible);
      setCurrentPage(1);
      return;
    }

    // Parse search terms, supporting AND/OR operators
    const terms = query.split(/\s+(AND|OR)?\s*/i).filter(Boolean);

    const filterFn = (project) => {
      // We'll separate text fields to enable more precise searching

      // Title and description (primary search fields)
      const primaryText = [
        String(project.title || ""),
        String(project.description || ""),
      ]
        .join(" ")
        .toLowerCase();

      // Secondary fields (only searched if needed)
      const secondaryText = [String(project.reference || "")]
        .join(" ")
        .toLowerCase();

      // Implementation of simple search logic with AND/OR operators
      let match = true;
      let lastOp = "AND";

      for (let term of terms) {
        // Check if term is an operator
        if (term.toUpperCase() === "AND" || term.toUpperCase() === "OR") {
          lastOp = term.toUpperCase();
        } else {
          // First check primary fields (title and description)
          let contains = primaryText.includes(term);

          // If not found in primary fields and term length > 3, check secondary fields
          if (!contains && term.length > 3) {
            contains = secondaryText.includes(term);
          }

          // Apply logic based on operator
          if (lastOp === "AND") match = match && contains;
          else if (lastOp === "OR") match = match || contains;
        }
      }

      return match;
    };

    // Filter projects by archive status and search terms
    // NOTE: Modified to always hide archived projects regardless of showArchived value
    const visible = projects
      .filter((p) => p.status !== "archived")
      .filter(filterFn);

    setFilteredProjects(visible);
    setCurrentPage(1);
  }, [searchQuery, projects]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginated = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const truncateWords = (text, wordLimit) => {
    const words = text?.split(" ") || [];
    return (
      words.slice(0, wordLimit).join(" ") +
      (words.length > wordLimit ? "..." : "")
    );
  };

  const navigateToProject = (project) => {
    const isAuthor = userRoles.projectRoles[project.id] === "author";

    if (project.setupComplete || isAuthor) {
      navigate(`/projects/${project.id}/objects`);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  // Keep these functions for future use
  const archiveProject = async (id) => {
    try {
      await updateDoc(doc(db, "projects", id), { status: "archived" });
      setSuccessMessage("Project archived successfully.");
      const updatedProjects = projects.map((p) => {
        if (p.id === id) return { ...p, status: "archived" };
        return p;
      });
      setProjects(updatedProjects);
      setConfirmArchive(null);
    } catch (error) {
      console.error("Error archiving project:", error);
    }
  };

  const deleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      setSuccessMessage("Project deleted successfully.");
      const updatedProjects = projects.filter((p) => p.id !== id);
      setProjects(updatedProjects);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (projects.length === 0) {
    return (
      <div className="no-content-message">You don't have any projects yet.</div>
    );
  }

  return (
    <div className="user-section projects-list">
      <div className="header-row">
        <h2 className="section-title">Your projects</h2>
      </div>
      <AddNewProjectAsOwner
        setSuccessMessage={setSuccessMessage}
        handleRefreshProjects={handleRefreshProjects}
      />
      <div className="search-bar-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search projects (supports AND/OR)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery("")}>
            Clear
          </button>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Owner</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((project) => (
              <tr key={project.id}>
                <td>
                  <div className="project-title-text">
                    <strong>{project.title || "Untitled"}</strong>
                  </div>
                  <div className="project-description">
                    {truncateWords(project.description, 15)}
                  </div>
                </td>
                <td>{project.owner || "Unassigned"}</td>
                <td>
                  <div>
                    Status:{" "}
                    <span
                      className={`status-badge status-${
                        project.status || "active"
                      }`}
                    >
                      {project.status || "active"}
                    </span>
                  </div>
                  <div>Your role: {project.userRole}</div>
                  <div>Created: {formatDate(project.createdAt)}</div>
                  <div>Authors: {project.authorCount || 0}</div>
                </td>
                <td className="actions-cell">
                  <button
                    className="primary-btn"
                    onClick={() => navigateToProject(project)}
                  >
                    Open
                  </button>
                  {project.userRole === "owner" && (
                    <button
                      className="delete-btn"
                      onClick={() => setConfirmDelete(project.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={i + 1 === currentPage ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {/* Keeping confirmation dialogs in code for future use */}
      {confirmArchive && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Archive Project</h3>
            <p>Are you sure you want to archive this project?</p>
            <div className="dialog-buttons">
              <button
                className="secondary-btn"
                onClick={() => setConfirmArchive(null)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={() => archiveProject(confirmArchive)}
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Delete Project</h3>
            <p>This will permanently delete the project. Are you sure?</p>
            <div className="dialog-buttons">
              <button
                className="secondary-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={() => deleteProject(confirmDelete)}
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

export default ProjectsList;
