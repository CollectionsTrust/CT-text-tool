import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  deleteDoc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import TextsTable from './TextsTable';
import TextForm from '../shared/TextForm';
import './TextsPage.css';

/**
 * Main TextsPage component
 * Displays a table of texts with filtering and actions
 * Uses Firestore for data persistence
 */
const TextsPage = () => {
  const { projectId } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for texts data
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search/filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTexts, setFilteredTexts] = useState([]);
  
  // State for table selections
  const [selectedTextIds, setSelectedTextIds] = useState(new Set());
  
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [textToEdit, setTextToEdit] = useState(null);
  
  // State for layout management
  const [layoutMode, setLayoutMode] = useState('default'); // 'default', 'edit'
  
  // State for project status
  const [projectArchived, setProjectArchived] = useState(false);
  
  // Check if redirected from object page after editing
  useEffect(() => {
    // Extract query parameters
    const urlParams = new URLSearchParams(location.search);
    const fromObjects = urlParams.get('from') === 'objects';
    const editSuccess = urlParams.get('edited') === 'true';
    
    if (fromObjects && editSuccess) {
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = 'Text saved successfully.';
      }
      
      // Clear query parameters
      navigate(`/projects/${projectId}/texts`, { replace: true });
    }
  }, [location, navigate, projectId]);
  
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
        console.log("Loading texts for project:", projectId);
        
        // Query texts for this project
        const textsRef = collection(db, 'texts');
        const q = query(
          textsRef, 
          where('projectId', '==', projectId)
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Query returned documents:", querySnapshot.size);
        
        const textsData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Document ID:", doc.id, "Data:", data);
          // Include document ID with the data
          textsData.push({ id: doc.id, ...data });
        });
        
        console.log("Processed texts data:", textsData);
        
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
  
  // Load text to edit when edit mode is enabled
  useEffect(() => {
    if (editMode && selectedTextIds.size === 1) {
      const textId = Array.from(selectedTextIds)[0];
      const textData = texts.find(t => t.id === textId);
      if (textData) {
        setTextToEdit(textData);
        setLayoutMode('edit');
      }
    } else {
      setTextToEdit(null);
    }
  }, [editMode, selectedTextIds, texts]);
  
  // Improved logout that respects user role
  const handleLogout = () => {
    // Redirect based on user role
    if (userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Handle creating a new text
  const handleCreateText = () => {
    if (projectArchived) {
      setError("This project is archived. You cannot create new texts.");
      
      // Announce to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = 'This project is archived. You cannot create new texts.';
      }
      return;
    }
    
    setEditMode(false);
    setSelectedTextIds(new Set());
    setTextToEdit(null);
    setLayoutMode('edit');
  };
  
  // Handle redirection to Objects page for linked objects
  const handleViewLinkedObjects = (textId) => {
    const text = texts.find(t => t.id === textId);
    if (text && text.linkedObjects && text.linkedObjects.length > 0) {
      // Navigate to Objects page with query params to filter and show the linked objects
      navigate(`/projects/${projectId}/objects?editTextId=${textId}&filterSelection=true`);
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
      navigate(`/projects/${projectId}/objects?editTextId=${textIds[0]}&returnTo=texts`);
    } 
    // If it's a single ID (string), edit that one
    else if (typeof textIds === 'string') {
      navigate(`/projects/${projectId}/objects?editTextId=${textIds}&returnTo=texts`);
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
  
  // Determine if we should show admin navigation
  const showAdminNav = userRole === 'admin';
  
  // Handle saving a text (new or edit) to Firestore
  const handleSaveText = async (textData) => {
    try {
      // Check project status again before saving
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists() && projectSnap.data().archived) {
        throw new Error("Cannot modify texts in an archived project.");
      }
      
      let savedText;
      
      if (textData.id) {
        // Update existing text
        const textRef = doc(db, 'texts', textData.id);
        const updateData = {
          ...textData,
          updatedAt: serverTimestamp()
        };
        
        // Remove id from the data object to prevent it from being written to Firestore
        delete updateData.id;
        
        await updateDoc(textRef, updateData);
        savedText = { id: textData.id, ...textData };
      } else {
        // Add new text
        const newTextData = {
          ...textData,
          projectId, // Ensure projectId is set
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Remove id from the data object if it's null
        if (newTextData.id === null) {
          delete newTextData.id;
        }
        
        const textRef = await addDoc(collection(db, 'texts'), newTextData);
        savedText = { id: textRef.id, ...textData };
      }
      
      // Update local state
      setTexts(prevTexts => {
        const existingIndex = prevTexts.findIndex(t => t.id === savedText.id);
        if (existingIndex >= 0) {
          // Update existing text
          const updatedTexts = [...prevTexts];
          updatedTexts[existingIndex] = savedText;
          return updatedTexts;
        } else {
          // Add new text
          return [savedText, ...prevTexts];
        }
      });
      
      // Exit edit mode
      if (layoutMode === 'edit') {
        setLayoutMode('default');
      }
      
      return savedText;
    } catch (err) {
      console.error('Error saving text:', err);
      throw new Error(err.message || 'Failed to save text. Please try again.');
    }
  };
  
  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditMode(false);
    setTextToEdit(null);
    setLayoutMode('default');
  };
  
  // Render appropriate content based on layout mode
  const renderContent = () => {
    switch (layoutMode) {
      case 'edit':
        return (
          <div className="edit-layout">
            <div className="panel-header">
              <h2>{editMode ? 'Edit text' : 'Create new text'}</h2>
              <button 
                className="close-edit-btn"
                onClick={handleCancelEdit}
                aria-label="Cancel editing"
              >
                ×
              </button>
            </div>
            
            <TextForm
              projectId={projectId}
              initialFormData={textToEdit}
              onSave={handleSaveText}
              onCancel={handleCancelEdit}
              context="texts"
            />
          </div>
        );
        
      default: // 'default' layout
        return (
          <>
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
              onEdit={handleEditText}
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
          </>
        );
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
        {/* Main content area */}
        {renderContent()}
      </div>
    </div>
  );
};

export default TextsPage;
