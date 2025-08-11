import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { truncateToWords } from '../ObjectsPage/utils/dataExtractors';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './TextsTable.css';
import ExportControls from './ExportControls';

/**
 * TextsTable component for displaying text records
 * Updated with configurable columns, bulk actions, and hierarchical view
 * Column options dynamically filtered based on project settings
 */
const TextsTable = ({
  texts = [],
  onDelete,
  onViewLinkedObjects,
  selectedTextIds = new Set(),
  setSelectedTextIds,
  projectArchived = false,
  onBulkEdit,
}) => {
  // Navigate hook
  const navigate = useNavigate();
  const { projectId } = useParams();

  // Create storage keys for preferences (project-specific)
  const columnStorageKey1 = `textsPage_column1_${projectId}`;
  const columnStorageKey2 = `textsPage_column2_${projectId}`;
  const viewModeStorageKey = `textsPage_viewMode_${projectId}`;

  // Project settings state
  const [projectSettings, setProjectSettings] = useState({
    hasHierarchicalText: false,
    tracksTextStatus: false,
    wantsTextTags: false
  });

  // State for customizable columns - initialize from localStorage or defaults
  const [column1, setColumn1] = useState('');
  const [column2, setColumn2] = useState('');

  // State for view modes - initialize from localStorage or default
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(viewModeStorageKey) || 'flat';
  });

  // State for bulk edit mode
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({});

  // State for inline bulk edit
  const [showBulkEditFields, setShowBulkEditFields] = useState(false);
  const [bulkColumn1Value, setBulkColumn1Value] = useState('');
  const [bulkColumn2Value, setBulkColumn2Value] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');

  // State for hierarchical view
  const [hierarchicalTexts, setHierarchicalTexts] = useState([]);

  // Project settings state (to match TextForm)
  const [projectAuthors, setProjectAuthors] = useState([]);
  const [projectLanguages, setProjectLanguages] = useState([]);
  const [projectTextStatuses, setProjectTextStatuses] = useState([]);
  const [projectTextTags, setProjectTextTags] = useState([]);
  const [availableParentTexts, setAvailableParentTexts] = useState([]);
  const [projectInfo, setProjectInfo] = useState({});

  // Filtered column options based on project settings
  const [columnOptions, setColumnOptions] = useState([]);

  // Load project settings when component mounts
  useEffect(() => {
    const fetchProjectSettings = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();

          // Update project settings
          setProjectSettings({
            hasHierarchicalText: projectData.hasHierarchicalText || false,
            tracksTextStatus: projectData.tracksTextStatus || false,
            wantsTextTags: projectData.wantsTextTags || false
          });

          // Store project info for export
          setProjectInfo({
            projectReferenceNumber: projectData.projectReferenceNumber || '',
            title: projectData.title || '',
            projectOrganiser: projectData.projectOrganiser || '',
          });

          // Set project authors
          setProjectAuthors(projectData.authors || []);

          // Set project languages
          setProjectLanguages(projectData.languages || []);

          // Set project text statuses
          setProjectTextStatuses(projectData.textStatuses || ['Draft', 'Approved']);

          // Set project text tags
          setProjectTextTags(projectData.textTags || []);
        }
      } catch (err) {
        console.error('Error loading project settings:', err);
      }
    };

    fetchProjectSettings();
  }, [projectId]);

  // Update column options when project settings change
  useEffect(() => {
    // Base column options that are always available
    const baseOptions = [
      { value: 'authors', label: 'Author(s)' },
      { value: 'date', label: 'Date' },
      { value: 'language', label: 'Language(s)' },
      { value: 'linkedObjects', label: 'Linked objects' },
      { value: 'note', label: 'Note' },
      { value: 'updatedAt', label: 'Last updated' },
    ];

    // Conditional column options based on project settings
    const conditionalOptions = [];

    if (projectSettings.hasHierarchicalText) {
      conditionalOptions.push({ value: 'parentText', label: 'Parent text' });
    }

    if (projectSettings.tracksTextStatus) {
      conditionalOptions.push({ value: 'status', label: 'Status' });
    }

    if (projectSettings.wantsTextTags) {
      conditionalOptions.push({ value: 'tag', label: 'Tag' });
    }

    // Combine and sort all options alphabetically by label
    const allOptions = [...baseOptions, ...conditionalOptions].sort((a, b) =>
      a.label.localeCompare(b.label)
    );

    setColumnOptions(allOptions);

    // Initialize columns after options are set
    // This ensures we don't select options that aren't available
    const initializeColumns = () => {
      // Get saved values from localStorage
      const savedColumn1 = localStorage.getItem(columnStorageKey1);
      const savedColumn2 = localStorage.getItem(columnStorageKey2);

      // Check if saved values are in available options
      const isColumn1Valid = savedColumn1 && allOptions.some(opt => opt.value === savedColumn1);
      const isColumn2Valid = savedColumn2 && allOptions.some(opt => opt.value === savedColumn2);

      // Set default values if saved values aren't valid
      // First column defaults to authors
      let defaultCol1 = 'authors';

      // Second column defaults to language
      let defaultCol2 = 'language';

      // Set column values
      setColumn1(isColumn1Valid ? savedColumn1 : defaultCol1);
      setColumn2(isColumn2Valid ? savedColumn2 : defaultCol2);
    };

    initializeColumns();
  }, [projectSettings, columnStorageKey1, columnStorageKey2]);

  // Save column preferences when they change
  useEffect(() => {
    if (column1) {
      localStorage.setItem(columnStorageKey1, column1);
    }
  }, [column1, columnStorageKey1]);

  useEffect(() => {
    if (column2) {
      localStorage.setItem(columnStorageKey2, column2);
    }
  }, [column2, columnStorageKey2]);

  // Save view mode when it changes
  useEffect(() => {
    localStorage.setItem(viewModeStorageKey, viewMode);
  }, [viewMode, viewModeStorageKey]);

  // Function to check if a column is editable in bulk edit mode
  const isColumnEditable = (columnType) => {
    // Last updated and Linked objects are not editable
    return !['updatedAt', 'linkedObjects'].includes(columnType);
  };

  // Get field options for dropdown fields
  const getFieldOptions = (columnType) => {
    switch (columnType) {
      case 'status':
        return projectTextStatuses.length > 0 ? projectTextStatuses : ['Draft', 'Approved'];
      case 'language':
        return projectLanguages.length > 0 ? projectLanguages : ['English'];
      case 'tag':
        return projectTextTags.length > 0 ? projectTextTags : [];
      case 'authors':
        return projectAuthors.length > 0 ? projectAuthors : [];
      case 'parentText':
        return availableParentTexts.map(text => text.textReferenceNumber);
      default:
        return [];
    }
  };

  // Should field be rendered as dropdown?
  const isDropdownField = (columnType) => {
    return ['status', 'language', 'tag', 'authors', 'parentText'].includes(columnType);
  };

  // Get placeholder text for bulk edit inputs
  const getBulkEditPlaceholder = (columnType) => {
    switch (columnType) {
      case 'authors':
        return 'Enter comma-separated authors';
      case 'language':
        return 'Enter comma-separated languages';
      case 'date':
        return 'YYYY-MM-DD';
      case 'note':
        return 'Enter note';
      case 'parentText':
        return 'Enter parent text reference';
      case 'tag':
        return 'Enter tag';
      case 'status':
        return 'Enter status';
      default:
        return 'Enter value';
    }
  };

  // Get the Firestore field name from column type
  const getFieldNameFromColumnType = (columnType) => {
    switch (columnType) {
      case 'status':
        return 'textStatus';
      case 'authors':
        return 'textAuthors';
      case 'language':
        return 'textLanguages';
      case 'date':
        return 'textDate';
      case 'note':
        return 'textNote';
      case 'parentText':
        return 'parentText';
      case 'tag':
        return 'textTag';
      default:
        return columnType;
    }
  };

  // Handle bulk edit field change
  const handleBulkEditChange = (textId, field, value) => {
    setBulkEditData(prev => ({
      ...prev,
      [textId]: {
        ...prev[textId],
        [field]: value
      }
    }));
  };

  // Initialize bulk edit data when entering bulk edit mode
  useEffect(() => {
    if (bulkEditMode) {
      const initialBulkData = {};
      selectedTextIds.forEach(id => {
        initialBulkData[id] = {};
      });
      setBulkEditData(initialBulkData);
    } else {
      setBulkEditData({});
    }
  }, [bulkEditMode, selectedTextIds]);

  // Load project settings when projectId changes
  useEffect(() => {
    const loadProjectSettings = async () => {
      if (!projectId) return;

      try {
        // Fetch project data from Firestore
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);

        if (projectDoc.exists()) {
          const projectData = projectDoc.data();

          // Store project info for export
          setProjectInfo({
            projectReferenceNumber: projectData.projectReferenceNumber || '',
            title: projectData.title || '',
            projectOrganiser: projectData.projectOrganiser || '',
          });

          // Set project authors
          setProjectAuthors(projectData.authors || []);

          // Set project languages
          setProjectLanguages(projectData.languages || []);

          // Set project text statuses
          setProjectTextStatuses(projectData.textStatuses || ['Draft', 'Final']);

          // Set project text tags
          setProjectTextTags(projectData.textTags || []);
        }
      } catch (err) {
        console.error('Error loading project settings:', err);
      }
    };

    loadProjectSettings();
  }, [projectId]);

  // Load available parent texts when projectId changes
  useEffect(() => {
    const loadParentTexts = async () => {
      if (!projectId) return;

      try {
        const textsRef = collection(db, 'texts');
        const q = query(textsRef, where('projectId', '==', projectId));
        const querySnapshot = await getDocs(q);

        const textsData = [];
        querySnapshot.forEach((doc) => {
          textsData.push({
            id: doc.id,
            textReferenceNumber: doc.data().textReferenceNumber,
            text: doc.data().text
          });
        });

        setAvailableParentTexts(textsData);
      } catch (err) {
        console.error('Error loading parent texts:', err);
      }
    };

    loadParentTexts();
  }, [projectId]);

  // Create hierarchical structure when texts change or view mode changes
  useEffect(() => {
    if (viewMode === 'hierarchical') {
      organizeTextsHierarchically();
    }

    // Apply custom styles for table layout
    let customStyles = document.getElementById('text-table-custom-styles');
    if (!customStyles) {
      customStyles = document.createElement('style');
      customStyles.id = 'text-table-custom-styles';
      customStyles.textContent = `
        /* Column width distribution */
        .open-column {
          width: 70px !important;
          text-align: center;
        }
        
        .reference-column {
          width: 120px !important; /* Fixed width for reference column in normal view */
        }
        
        .text-column {
          /* Takes remaining space */
          width: auto !important;
        }
        
        .flex-column {
          width: auto !important; /* Dynamic width based on content */
          max-width: max-content !important;
        }
        
        .select-column {
          width: 70px !important;
          text-align: center;
        }
        
        .texts-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
          table-layout: auto; /* Change from fixed to auto */
        }
        
        .dynamic-width-column {
          max-width: max-content !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .text-content-cell {
          width: 100% !important;
        }
      `;
      document.head.appendChild(customStyles);
    }

    return () => {
      // Clean up custom styles when component unmounts
      if (customStyles) {
        document.head.removeChild(customStyles);
      }
    };
  }, [texts, viewMode]);

  // Function to organize texts in a hierarchical structure
  const organizeTextsHierarchically = () => {    
    // Create a map of text reference numbers to text objects
    const textMap = {};
    texts.forEach(text => {
      textMap[text.textReferenceNumber] = {
        ...text,
        children: [],
        level: 0
      };
    });

    // Create parent-child relationships
    const rootTexts = [];

    // First pass: establish parent-child relationships
    texts.forEach(text => {
      if (text.parentText && textMap[text.parentText]) {
        // This text has a parent
        textMap[text.parentText].children.push(textMap[text.textReferenceNumber]);
      } else {
        // This is a root-level text
        rootTexts.push(textMap[text.textReferenceNumber]);
      }
    });

    // Second pass: assign levels (for indentation)
    const assignLevels = (nodes, level) => {
      nodes.forEach(node => {
        node.level = level;
        if (node.children.length > 0) {
          assignLevels(node.children, level + 1);
        }
      });
    };

    assignLevels(rootTexts, 0);

    // Sort root texts by reference number
    rootTexts.sort((a, b) => {
      return a.textReferenceNumber.localeCompare(b.textReferenceNumber);
    });

    // Sort children by reference number
    const sortChildren = (nodes) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          node.children.sort((a, b) => {
            return a.textReferenceNumber.localeCompare(b.textReferenceNumber);
          });
          sortChildren(node.children);
        }
      });
    };

    sortChildren(rootTexts);

    // Flatten the hierarchy for rendering, limiting depth to 3 levels
    const flattenHierarchy = (nodes, result = [], maxLevel = 3) => {
      nodes.forEach(node => {
        result.push(node);
        if (node.children.length > 0 && node.level < maxLevel) {
          flattenHierarchy(node.children, result, maxLevel);
        }
      });
      return result;
    };

    const flattenedHierarchy = flattenHierarchy(rootTexts);
    setHierarchicalTexts(flattenedHierarchy);
  };

  // Function to get display value for column
  const getColumnValue = (text, columnType) => {
    switch (columnType) {
      case 'status':
        return text.textStatus || 'draft';
      case 'authors':
        return text.textAuthors && text.textAuthors.length > 0
          ? text.textAuthors.join(', ')
          : '-';
      case 'language':
        return text.textLanguages && text.textLanguages.length > 0
          ? text.textLanguages.join(', ')
          : 'English';
      case 'date':
        return text.textDate || '-';
      case 'note':
        return text.textNote
          ? truncateToWords(text.textNote, 5) + (text.textNote.split(' ').length > 5 ? '...' : '')
          : '-';
      case 'parentText':
        return text.parentText || '-';
      case 'tag':
        return text.textTag || '-';
      case 'updatedAt':
        return formatDate(text.updatedAt);
      case 'linkedObjects':
        return text.linkedObjects ? text.linkedObjects.length : 0;
      default:
        return '-';
    }
  };

  // Render editable field for bulk edit mode
  const renderEditableField = (text, columnType) => {
    if (!isColumnEditable(columnType)) {
      return getColumnValue(text, columnType);
    }

    const fieldName = getFieldNameFromColumnType(columnType);
    const value = bulkEditData[text.id]?.[fieldName] !== undefined
      ? bulkEditData[text.id][fieldName]
      : (text[fieldName] || '');

    if (isDropdownField(columnType)) {
      const options = getFieldOptions(columnType);

      // Special handling for language
      if (columnType === 'language') {
        return (
          <select
            value={Array.isArray(value) ? value[0] || '' : value}
            onChange={(e) => {
              handleBulkEditChange(text.id, fieldName, [e.target.value]);
            }}
            className="bulk-edit-input"
          >
            <option value="">Select {columnType}</option>
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      // Special handling for authors - multiple selection
      if (columnType === 'authors') {
        return (
          <select
            value={Array.isArray(value) ? value[0] || '' : value}
            onChange={(e) => {
              // Maintain array format for authors
              const newValue = e.target.value ? [e.target.value] : [];
              handleBulkEditChange(text.id, fieldName, newValue);
            }}
            className="bulk-edit-input"
          >
            <option value="">Select author</option>
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      // Parent text dropdown
      if (columnType === 'parentText') {
        return (
          <select
            value={value || ''}
            onChange={(e) => handleBulkEditChange(text.id, fieldName, e.target.value)}
            className="bulk-edit-input"
          >
            <option value="">No parent text</option>
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      }

      // Default dropdown rendering for status and tag
      return (
        <select
          value={value || ''}
          onChange={(e) => handleBulkEditChange(text.id, fieldName, e.target.value)}
          className="bulk-edit-input"
        >
          <option value="">Select {columnType}</option>
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // For other field types
    switch (columnType) {
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleBulkEditChange(text.id, fieldName, e.target.value)}
            className="bulk-edit-input"
          />
        );
      case 'authors':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => handleBulkEditChange(
              text.id,
              fieldName,
              e.target.value.split(',').map(a => a.trim())
            )}
            className="bulk-edit-input"
            placeholder="Comma-separated authors"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleBulkEditChange(text.id, fieldName, e.target.value)}
            className="bulk-edit-input"
            placeholder={getBulkEditPlaceholder(columnType)}
          />
        );
    }
  };

  // Handle column change
  const handleColumn1Change = (e) => {
    setColumn1(e.target.value);

    // Announce column change to screen readers
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) {
      liveRegion.textContent = `First column changed to ${e.target.options[e.target.selectedIndex].text}`;
    }
  };

  const handleColumn2Change = (e) => {
    setColumn2(e.target.value);

    // Announce column change to screen readers
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) {
      liveRegion.textContent = `Second column changed to ${e.target.options[e.target.selectedIndex].text}`;
    }
  };

  // Handle row selection
  const handleRowSelect = (textId) => {
    setSelectedTextIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(textId)) {
        newSelected.delete(textId);
      } else {
        newSelected.add(textId);
      }
      return newSelected;
    });
  };

  // Handle select all rows
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = texts.map(text => text.id);
      setSelectedTextIds(new Set(allIds));
    } else {
      setSelectedTextIds(new Set());
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';

    // Handle Firestore timestamps
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString();
    }

    // Handle ISO strings or other date formats
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? timestamp : date.toLocaleDateString();
    }

    return '-';
  };

  // Handle bulk action selection
  const handleBulkAction = (action) => {
    if (selectedTextIds.size === 0) {
      // Set an inline confirmation message
      setConfirmMessage('Please select at least one text to perform a bulk action.');

      // Clear message after 3 seconds
      setTimeout(() => setConfirmMessage(''), 3000);

      // Announce to screen readers
      const liveRegion = document.getElementById('a11y-live-region');
      if (liveRegion) {
        liveRegion.textContent = 'Please select at least one text to perform a bulk action.';
      }
      return;
    }

    if (action === 'edit') {
      setBulkEditMode(true);

      // Initialize bulk edit data for all selected texts
      const initialBulkData = {};
      selectedTextIds.forEach(id => {
        initialBulkData[id] = {};
      });
      setBulkEditData(initialBulkData);
    } else if (action === 'delete') {
      // Set an inline confirmation message
      setConfirmMessage(`Are you sure you want to delete ${selectedTextIds.size} selected text(s)? `);
    } else if (action === 'bulkEdit') {
      setShowBulkEditFields(true);
    }
  };

  // Save bulk edits after inline editing
  const saveBulkEdits = () => {
    if (Object.keys(bulkEditData).length === 0) {
      setConfirmMessage('No changes were made.');
      setTimeout(() => setConfirmMessage(''), 3000);
      setBulkEditMode(false);
      return;
    }

    // Call the bulk edit function with the data
    onBulkEdit(bulkEditData);

    // Reset bulk edit mode
    setBulkEditMode(false);
    setBulkEditData({});

    // Announce success to screen readers
    const liveRegion = document.getElementById('a11y-live-region');
    if (liveRegion) {
      liveRegion.textContent = `Changes saved for ${Object.keys(bulkEditData).length} text(s).`;
    }
  };

  // Cancel inline bulk edit
  const cancelBulkEdits = () => {
    setBulkEditMode(false);
    setBulkEditData({});
    setShowBulkEditFields(false);
    setBulkColumn1Value('');
    setBulkColumn2Value('');
    setConfirmMessage('');
  };

  // Handle confirming deletion
  const handleConfirmDelete = () => {
    // Call delete function for each selected text
    const selectedIdsArray = Array.from(selectedTextIds);
    onDelete(selectedIdsArray);
    setConfirmMessage('');
  };

  // Handle canceling deletion
  const handleCancelDelete = () => {
    setConfirmMessage('');
  };

  // Apply bulk edits to selected texts
  const applyBulkEdits = () => {
    // Check if there are values to apply
    if (!bulkColumn1Value && !bulkColumn2Value) {
      setConfirmMessage('Please enter at least one value to apply.');
      setTimeout(() => setConfirmMessage(''), 3000);
      return;
    }

    // Set confirmation message
    setConfirmMessage(
      `Apply these changes to ${selectedTextIds.size} selected text(s)? `
    );
  };

  // Confirm applying bulk edits
  const handleConfirmBulkEdits = () => {
    // Create a new bulk edit data object
    const newBulkData = {};

    // Get the field names based on the column types
    const field1 = getFieldNameFromColumnType(column1);
    const field2 = getFieldNameFromColumnType(column2);

    // Apply values to all selected texts
    selectedTextIds.forEach(id => {
      newBulkData[id] = {};

      if (bulkColumn1Value && isColumnEditable(column1)) {
        if (field1 === 'textAuthors') {
          // For authors, always use array format
          newBulkData[id][field1] = [bulkColumn1Value];
        } else if (field1 === 'textLanguages') {
          // For languages, always use array format
          newBulkData[id][field1] = [bulkColumn1Value];
        } else {
          newBulkData[id][field1] = bulkColumn1Value;
        }
      }

      if (bulkColumn2Value && isColumnEditable(column2)) {
        if (field2 === 'textAuthors') {
          // For authors, always use array format
          newBulkData[id][field2] = [bulkColumn2Value];
        } else if (field2 === 'textLanguages') {
          // For languages, always use array format
          newBulkData[id][field2] = [bulkColumn2Value];
        } else {
          newBulkData[id][field2] = bulkColumn2Value;
        }
      }
    });

    // Call the bulk edit function with the data
    onBulkEdit(newBulkData);

    // Reset bulk edit UI
    setShowBulkEditFields(false);
    setBulkColumn1Value('');
    setBulkColumn2Value('');
    setConfirmMessage('');
  };

  // Toggle view mode between flat and hierarchical
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Only show hierarchical view button if project settings allow hierarchical text
  const showHierarchicalViewToggle = projectSettings.hasHierarchicalText &&
    texts.some(text => text.parentText);

  // Handle clicking "Open" button to edit text - Navigate to Objects page in edit mode
  const handleOpenText = (textId) => {
    navigate(`/projects/${projectId}/objects?editTextId=${textId}`);
  };

  return (
    <div className="texts-table-container">
      <div className="table-controls">
        <div className="table-controls-row">
          <div className="columns-config">
            <span className="column-config-label">Choose column field:</span>

            <div className="column-selector">
              <select
                id="column1"
                value={column1}
                onChange={handleColumn1Change}
                className="column-select"
              >
                {columnOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="column-selector">
              <select
                id="column2"
                value={column2}
                onChange={handleColumn2Change}
                className="column-select"
              >
                {columnOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bulk-actions">
            <span className="bulk-actions-label">Actions with selected texts:</span>

            {bulkEditMode ? (
              <>
                <button
                  onClick={saveBulkEdits}
                  className="bulk-btn save-btn"
                  disabled={projectArchived}
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelBulkEdits}
                  className="bulk-btn cancel-btn"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleBulkAction('edit')}
                  className="bulk-btn"
                  disabled={selectedTextIds.size === 0 || projectArchived}
                >
                  Edit in table
                </button>
                <button
                  onClick={() => handleBulkAction('bulkEdit')}
                  className="bulk-btn"
                  disabled={selectedTextIds.size === 0 || projectArchived}
                >
                  Bulk Edit
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bulk-btn"
                  disabled={selectedTextIds.size === 0 || projectArchived}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Export controls */}
        <ExportControls
          texts={texts}
          selectedTextIds={selectedTextIds}
          projectInfo={projectInfo}
          projectSettings={projectSettings}
        />

        {/* Bulk edit fields */}
        {showBulkEditFields && (
          <div className="bulk-edit-fields">
            <div className="bulk-edit-row">
              <div className="bulk-edit-cell"></div>
              <div className="bulk-edit-cell"></div>
              <div className="bulk-edit-cell">
                {isColumnEditable(column1) ? (
                  <div className="bulk-edit-field">
                    <label className="bulk-edit-label">
                      Bulk edit {columnOptions.find(opt => opt.value === column1)?.label || 'field'}:
                    </label>
                    {isDropdownField(column1) ? (
                      <select
                        value={bulkColumn1Value}
                        onChange={(e) => setBulkColumn1Value(e.target.value)}
                        className="bulk-edit-input"
                      >
                        <option value="">Select {column1}</option>
                        {getFieldOptions(column1).map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={column1 === 'date' ? 'date' : 'text'}
                        value={bulkColumn1Value}
                        onChange={(e) => setBulkColumn1Value(e.target.value)}
                        placeholder={getBulkEditPlaceholder(column1)}
                        className="bulk-edit-input"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bulk-edit-not-editable">Not editable</div>
                )}
              </div>
              <div className="bulk-edit-cell">
                {isColumnEditable(column2) ? (
                  <div className="bulk-edit-field">
                    <label className="bulk-edit-label">
                      Bulk edit {columnOptions.find(opt => opt.value === column2)?.label || 'field'}:
                    </label>
                    {isDropdownField(column2) ? (
                      <select
                        value={bulkColumn2Value}
                        onChange={(e) => setBulkColumn2Value(e.target.value)}
                        className="bulk-edit-input"
                      >
                        <option value="">Select {column2}</option>
                        {getFieldOptions(column2).map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={column2 === 'date' ? 'date' : 'text'}
                        value={bulkColumn2Value}
                        onChange={(e) => setBulkColumn2Value(e.target.value)}
                        placeholder={getBulkEditPlaceholder(column2)}
                        className="bulk-edit-input"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bulk-edit-not-editable">Not editable</div>
                )}
              </div>
              <div className="bulk-edit-cell bulk-edit-actions">
                <button
                  className="bulk-edit-apply"
                  onClick={applyBulkEdits}
                >
                  Apply
                </button>
                <button
                  className="bulk-edit-cancel"
                  onClick={cancelBulkEdits}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation message */}
        {confirmMessage && (
          <div className="inline-confirmation">
            <span>{confirmMessage}</span>
            {confirmMessage.includes('?') && (
              <>
                <button
                  className="confirm-yes"
                  onClick={confirmMessage.includes('delete') ? handleConfirmDelete : handleConfirmBulkEdits}
                >
                  Yes
                </button>
                <button
                  className="confirm-no"
                  onClick={handleCancelDelete}
                >
                  No
                </button>
              </>
            )}
          </div>
        )}

        <div className="view-controls">
          {/* Only show hierarchical view toggle if project has hierarchical text enabled */}
          {showHierarchicalViewToggle && (
            <div className="view-mode-toggle">
              <button
                className={`view-mode-btn ${viewMode === 'flat' ? 'active' : ''}`}
                onClick={() => toggleViewMode('flat')}
                aria-label="View texts as flat list"
              >
                Flat view
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'hierarchical' ? 'active' : ''}`}
                onClick={() => toggleViewMode('hierarchical')}
                aria-label="View texts grouped by parent"
              >
                Hierarchical view
              </button>
            </div>
          )}
          <div className="texts-count">
            {texts.length} text{texts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="texts-table-wrapper">
        <table className={`texts-table ${viewMode === 'hierarchical' ? 'hierarchical-view' : ''}`}>
          <thead>
            <tr>
              <th className="open-column"></th>
              <th className="reference-column">Text reference</th>
              <th className="text-column">Text</th>
              <th className="flex-column">{columnOptions.find(opt => opt.value === column1)?.label || 'Parent text'}</th>
              <th className="flex-column">{columnOptions.find(opt => opt.value === column2)?.label || 'Author(s)'}</th>
              <th className="select-column">
                <span>Select</span>
                <input
                  type="checkbox"
                  checked={selectedTextIds.size === texts.length && texts.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all texts"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {texts.length > 0 ? (
              (viewMode === 'hierarchical' && projectSettings.hasHierarchicalText ? hierarchicalTexts : texts).map((text) => (
                <tr
                  key={text.id}
                  className={`${selectedTextIds.has(text.id) ? 'selected-row' : ''} ${viewMode === 'hierarchical' && text.level > 0 ? `indent-level-${text.level}` : ''}`}
                >
                  <td className="open-cell">
                    <button
                      className="table-action-btn open-btn"
                      onClick={() => handleOpenText(text.id)}
                      disabled={projectArchived}
                      aria-disabled={projectArchived}
                      aria-label={`Open text ${text.textReferenceNumber}`}
                    >
                      Open
                    </button>
                  </td>
                  <td className="text-ref">
                    {viewMode === 'hierarchical' && text.level > 0 && (
                      <span className="hierarchy-indent" style={{ marginLeft: `${text.level * 15}px` }}></span>
                    )}
                    {text.textReferenceNumber}
                  </td>
                  <td className="text-content-cell">
                    <div className="text-content">
                      <div
                        className="text-preview"
                        dangerouslySetInnerHTML={{ __html: truncateToWords(text.text, 10) }}
                      />
                    </div>
                  </td>
                  <td className="dynamic-width-column">
                    {bulkEditMode && selectedTextIds.has(text.id) && isColumnEditable(column1) ? (
                      renderEditableField(text, column1)
                    ) : column1 === 'linkedObjects' ? (
                      text.linkedObjects && text.linkedObjects.length ? (
                        <button
                          className="linked-objects-btn"
                          onClick={() => onViewLinkedObjects(text.id)}
                          aria-label={`View ${text.linkedObjects.length} linked object${text.linkedObjects.length !== 1 ? 's' : ''}`}
                        >
                          {text.linkedObjects.length}
                        </button>
                      ) : (
                        <span>0</span>
                      )
                    ) : (
                      getColumnValue(text, column1)
                    )}
                  </td>
                  <td className="dynamic-width-column">
                    {bulkEditMode && selectedTextIds.has(text.id) && isColumnEditable(column2) ? (
                      renderEditableField(text, column2)
                    ) : column2 === 'linkedObjects' ? (
                      text.linkedObjects && text.linkedObjects.length ? (
                        <button
                          className="linked-objects-btn"
                          onClick={() => onViewLinkedObjects(text.id)}
                          aria-label={`View ${text.linkedObjects.length} linked object${text.linkedObjects.length !== 1 ? 's' : ''}`}
                        >
                          {text.linkedObjects.length}
                        </button>
                      ) : (
                        <span>0</span>
                      )
                    ) : (
                      getColumnValue(text, column2)
                    )}
                  </td>
                  <td className="select-cell">
                    <input
                      type="checkbox"
                      checked={selectedTextIds.has(text.id)}
                      onChange={() => handleRowSelect(text.id)}
                      aria-label={`Select text ${text.textReferenceNumber}`}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-table-row">
                <td colSpan="6">
                  <div className="empty-table-message">
                    <p>No texts available.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TextsTable;
