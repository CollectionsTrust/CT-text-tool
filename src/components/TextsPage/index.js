import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import TextsTable from './TextsTable';
import './TextsPage.css';

/**
 * Main TextsPage component
 * Displays a table of texts with filtering and actions
 */
const TextsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State for texts data
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search/filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTexts, setFilteredTexts] = useState([]);

  // State for table selections
  const [selectedTextIds, setSelectedTextIds] = useState(new Set());

  // State for project status
  const [projectArchived, setProjectArchived] = useState(false);

  // Check if project exists and if it's archived
  useEffect(() => {
    const checkProjectStatus = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          setProjectArchived(projectData.archived || false);

          // Announce project status to screen readers if archived
          if (projectData.archived) {
            const liveRegion = document.getElementById('a11y-live-region');
            if (liveRegion) {
              liveRegion.textContent = 'This project is archived. Texts cannot be modified.';
            }
          }
        } else {
          // Project doesn't exist
          setError('Project not found.');
        }
      } catch (err) {
        console.error('Error checking project status:', err);
        setError('Failed to check project status.');
      }
    };

    checkProjectStatus();
  }, [projectId]);

  // Load texts from Firestore on mount
  useEffect(() => {
    const loadTexts = async () => {
      setLoading(true);
      try {
        // Query texts for this project
        const textsRef = collection(db, 'texts');
        const q = query(
          textsRef,
          where('projectId', '==', projectId)
        );

        const querySnapshot = await getDocs(q);

        const textsData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Include document ID with the data
          textsData.push({ id: doc.id, ...data });
        });

        // Sort by updatedAt if available (client-side sorting)
        const sortedTexts = textsData.sort((a, b) => {
          if (!a.updatedAt) return 1;
          if (!b.updatedAt) return -1;

          const aTime = a.updatedAt.toDate ? a.updatedAt.toDate().getTime() : new Date(a.updatedAt).getTime();
          const bTime = b.updatedAt.toDate ? b.updatedAt.toDate().getTime() : new Date(b.updatedAt).getTime();

          return bTime - aTime; // Descending order (newest first)
        });

        setTexts(sortedTexts);
        setFilteredTexts(sortedTexts);
      } catch (err) {
        console.error('Error loading texts:', err);
        setError('Failed to load texts. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadTexts();
  }, [projectId]);

  // Filter texts when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTexts(texts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = texts.filter(text =>
      text.textReferenceNumber?.toLowerCase().includes(query) ||
      text.text?.toLowerCase().includes(query) ||
      (text.textAuthors && text.textAuthors.some(author => author.toLowerCase().includes(query)))
    );

    setFilteredTexts(filtered);
  }, [searchQuery, texts]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle redirection to Objects page for linked objects
  const handleViewLinkedObjects = (textId) => {
    const text = texts.find(t => t.id === textId);
    if (text && text.linkedObjects && text.linkedObjects.length > 0) {
      // Navigate to Objects page with query params to filter and show the linked objects
      navigate(`/projects/${projectId}/objects?editTextId=${textId}`);
    } else {
      // If no linked objects, just show a message
      setError("No linked objects found for this text.");

      // Announce to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = 'No linked objects found for this text.';
      }
    }
  };

  // Handle editing a text - redirect to objects page for editing
  const handleEditText = (textIds) => {
    if (projectArchived) {
      setError("This project is archived. Texts cannot be modified.");

      // Announce to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = 'This project is archived. Texts cannot be modified.';
      }
      return;
    }

    // If it's an array with multiple texts, just edit the first one
    // This is for the table row edit button which only edits one text
    if (Array.isArray(textIds) && textIds.length > 0) {
      // Redirect to objects page with edit parameter for first selected text
      navigate(`/projects/${projectId}/objects?editTextId=${textIds[0]}`);
    }
    // If it's a single ID (string), edit that one
    else if (typeof textIds === 'string') {
      navigate(`/projects/${projectId}/objects?editTextId=${textIds}`);
    }
  };

  // Handle bulk deletion of texts
  const handleBulkDelete = async (textIds) => {
    try {
      setLoading(true);

      // Check project status again before deletion
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists() && projectSnap.data().archived) {
        throw new Error("Cannot delete texts in an archived project.");
      }

      const batch = writeBatch(db);

      // Add each text to the batch for deletion
      textIds.forEach(id => {
        const textRef = doc(db, 'texts', id);
        batch.delete(textRef);
      });

      // Commit the batch
      await batch.commit();

      // Update local state
      const updatedTexts = texts.filter(text => !textIds.includes(text.id));
      setTexts(updatedTexts);
      setFilteredTexts(updatedTexts.filter(text =>
        searchQuery ?
          text.textReferenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          text.text?.toLowerCase().includes(searchQuery.toLowerCase()) :
          true
      ));

      // Clear selection
      setSelectedTextIds(new Set());

      // Announce deletion to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = `${textIds.length} text(s) deleted successfully.`;
      }
    } catch (err) {
      console.error('Error deleting texts:', err);
      setError(`Failed to delete texts: ${err.message}`);

      // Announce error to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = `Error: ${err.message}`;
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle saving bulk edits
  const handleBulkEdit = async (bulkEditData) => {
    try {
      setLoading(true);

      // Check project status again before saving
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists() && projectSnap.data().archived) {
        throw new Error("Cannot modify texts in an archived project.");
      }

      const batch = writeBatch(db);
      const textIdsToUpdate = Object.keys(bulkEditData);

      // Create batch updates
      for (const textId of textIdsToUpdate) {
        const changes = bulkEditData[textId];
        if (Object.keys(changes).length > 0) {
          const textRef = doc(db, 'texts', textId);
          batch.update(textRef, {
            ...changes,
            updatedAt: serverTimestamp()
          });
        }
      }

      // Commit the batch
      await batch.commit();

      // Update local state
      const updatedTexts = texts.map(text => {
        if (textIdsToUpdate.includes(text.id)) {
          return {
            ...text,
            ...bulkEditData[text.id],
            updatedAt: new Date() // Client-side timestamp for immediate UI update
          };
        }
        return text;
      });

      setTexts(updatedTexts);
      setFilteredTexts(updatedTexts.filter(text =>
        searchQuery ?
          text.textReferenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          text.text?.toLowerCase().includes(searchQuery.toLowerCase()) :
          true
      ));

      // Announce update to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = `${textIdsToUpdate.length} text(s) updated successfully.`;
      }
    } catch (err) {
      console.error('Error updating texts:', err);
      setError(`Failed to update texts: ${err.message}`);

      // Announce error to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = `Error: ${err.message}`;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Live region for accessibility announcements */}
      <div
        id="a11y-live-region"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
      </div>
      <div className="texts-content">
        <div className="texts-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search texts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
              aria-label="Search texts"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="clear-search-btn"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {projectArchived && (
          <div className="archived-project-banner" role="alert">
            <p>This project is archived. Texts cannot be modified or deleted.</p>
          </div>
        )}

        <TextsTable
          texts={filteredTexts}
          onDelete={handleBulkDelete}
          onBulkEdit={handleBulkEdit}
          onViewLinkedObjects={handleViewLinkedObjects}
          selectedTextIds={selectedTextIds}
          setSelectedTextIds={setSelectedTextIds}
          projectArchived={projectArchived}
        />

        {loading && (
          <div className="loading-indicator" aria-live="polite" role="status">
            <div className="spinner" aria-hidden="true"></div>
            <p>Loading texts...</p>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredTexts.length === 0 && (
          <div className="no-texts-message">
            {searchQuery ? (
              <p>No texts found matching your search criteria.</p>
            ) : (
              <p>No texts have been created yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextsPage;
