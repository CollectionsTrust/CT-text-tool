import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import './AdminDashboard.css';

const ITEMS_PER_PAGE = 25;

const ProjectsList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmArchive, setConfirmArchive] = useState(null);
  const [confirmActivate, setConfirmActivate] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        setError('');
        let projectsData = [];

        const projectsRef = collection(db, 'projects');
        const querySnapshot = await getDocs(projectsRef);

        const projectPromises = querySnapshot.docs.map(async (projectDoc) => {
          const projectData = projectDoc.data();
          const projectId = projectDoc.id;

          let ownerData = { name: 'Unknown', organization: 'Unknown' };
          if (projectData.owner) {
            const projectUsersRef = collection(db, 'projectUsers');
            const q = query(projectUsersRef, where('email', '==', projectData.owner));
            const ownerSnapshot = await getDocs(q);
            if (!ownerSnapshot.empty) {
              ownerData = ownerSnapshot.docs[0].data();
            }
          }

          return {
            id: projectId,
            ...projectData,
            ownerName: ownerData.name,
            ownerOrganization: ownerData.organization,
            authorCount: projectData.authors?.length || 0
          };
        });

        projectsData = await Promise.all(projectPromises);
        projectsData.sort((a, b) => {
          const statusCompare = (a.status === 'archived') - (b.status === 'archived');
          if (statusCompare !== 0) return statusCompare;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setProjects(projectsData);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects.');
      }
    };

    fetchProjects();
  }, [user]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const terms = query.split(/\s+(AND|OR)?\s*/i).filter(Boolean);

    const filterFn = (project) => {
      const text = [
        project.title,
        project.description,
        project.owner,
        project.ownerName,
        project.ownerOrganization
      ].join(' ').toLowerCase();

      let match = true;
      let lastOp = 'AND';

      for (let term of terms) {
        if (term.toUpperCase() === 'AND' || term.toUpperCase() === 'OR') {
          lastOp = term.toUpperCase();
        } else {
          const contains = text.includes(term);
          if (lastOp === 'AND') match = match && contains;
          else if (lastOp === 'OR') match = match || contains;
        }
      }

      return match;
    };

    const visible = projects
      .filter(p => showArchived || p.status !== 'archived')
      .filter(filterFn);

    setFilteredProjects(visible);
    setCurrentPage(1);
  }, [searchQuery, projects, showArchived]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginated = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const truncateWords = (text, wordLimit) => {
    const words = text?.split(' ') || [];
    return words.slice(0, wordLimit).join(' ') + (words.length > wordLimit ? '...' : '');
  };

  const navigateToProject = (id) => navigate(`/projects/${id}`);

  const archiveProject = async (id) => {
    await updateDoc(doc(db, 'projects', id), { status: 'archived' });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' } : p));
    setSuccessMessage('Project archived.');
    setConfirmArchive(null);
  };

  const activateProject = async (id) => {
    await updateDoc(doc(db, 'projects', id), { status: 'active' });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
    setSuccessMessage('Project activated.');
    setConfirmActivate(null);
  };

  const deleteProject = async (id) => {
    await deleteDoc(doc(db, 'projects', id));
    setProjects(prev => prev.filter(p => p.id !== id));
    setSuccessMessage('Project deleted.');
    setConfirmDelete(null);
  };

  return (
    <div className="admin-section projects-list">
      <div className="admin-nav-tabs">
        <Link to="/admin#requests" className="admin-nav-tab">Requests</Link>
        <Link to="/admin#projects" className="admin-nav-tab active">Manage projects</Link>
        <Link to="/admin#users" className="admin-nav-tab">Manage users</Link>
      </div>

      <div className="header-row">
        <h2 className="section-title">Manage projects</h2>
        <button className="secondary-btn toggle-archived-btn" onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? 'Hide archived projects' : 'Show archived projects'}
        </button>
      </div>

      <div className="search-bar-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search projects (supports AND/OR)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery('')}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Owner</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(project => (
              <tr key={project.id}>
                <td>
                  <div className="project-title-text"><strong>{project.title || 'Untitled'}</strong></div>
                  <div className="project-description">
                    {truncateWords(project.description, 15)}
                  </div>
                </td>
                <td>{project.owner || 'Unassigned'}</td>
                <td>
                  <div>Status: <span className={`status-badge status-${project.status}`}>{project.status}</span></div>
                  <div>Created: {formatDate(project.createdAt)}</div>
                  <div>Authors: {project.authorCount}</div>
                </td>
                <td className="actions-cell">
                  <button className="primary-btn" onClick={() => navigateToProject(project.id)}>View</button>
                  {project.status === 'archived' ? (
                    <button className="secondary-btn" onClick={() => setConfirmActivate(project.id)}>Activate</button>
                  ) : (
                    <button className="secondary-btn" onClick={() => setConfirmArchive(project.id)}>Archive</button>
                  )}
                  <button className="delete-btn" onClick={() => setConfirmDelete(project.id)}>Delete</button>
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
              className={i + 1 === currentPage ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Confirmation dialogs */}
      {confirmArchive && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Archive Project</h3>
            <p>Are you sure you want to archive this project?</p>
            <div className="dialog-buttons">
              <button className="secondary-btn" onClick={() => setConfirmArchive(null)}>Cancel</button>
              <button className="primary-btn" onClick={() => archiveProject(confirmArchive)}>Archive</button>
            </div>
          </div>
        </div>
      )}
      {confirmActivate && (
        <div className="confirm-dialog-backdrop">
          <div className="confirm-dialog">
            <h3>Activate Project</h3>
            <p>Are you sure you want to activate this project?</p>
            <div className="dialog-buttons">
              <button className="secondary-btn" onClick={() => setConfirmActivate(null)}>Cancel</button>
              <button className="primary-btn" onClick={() => activateProject(confirmActivate)}>Activate</button>
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
              <button className="secondary-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="delete-btn" onClick={() => deleteProject(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
