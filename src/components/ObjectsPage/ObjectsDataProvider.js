import { createContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { searchRecords } from './utils/search';
import { saveRecordsToStorage, getRecordsFromStorage } from './utils/localStorage';
import { useProject } from '../../hooks/useProject'

export const ObjectsDataContext = createContext();

export const ObjectsDataProvider = ({ children }) => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);

  const [allRecords, setAllRecords] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0 });
  const [error, setError] = useState('');

  const [showCollection, setShowCollection] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  
  // Add a counter to force re-renders when needed
  const [updateCounter, setUpdateCounter] = useState(0);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleClearSearch = () => setSearchQuery('');

  const handleRecordSelection = (record) => {
    const objectUid = record["@admin"]?.uid;
    if (!objectUid) return;
    
    // Create new Set instead of modifying existing one
    const currentSelection = new Set(selectedRecords);
    
    if (currentSelection.has(objectUid)) {
      currentSelection.delete(objectUid);
    } else {
      currentSelection.add(objectUid);
    }
    
    // Set the new Set and force update
    setSelectedRecords(currentSelection);
    setUpdateCounter(prev => prev + 1);
  };

  const handleHeaderCheckboxChange = () => {
    // For the current page of records, toggle their selection state
    const visibleRecords = showSelectedOnly 
      ? allRecords.filter(record => selectedRecords.has(record["@admin"]?.uid))
      : filteredData;
    
    // Check if all visible records are selected
    const allSelected = visibleRecords.every(record => 
      selectedRecords.has(record["@admin"]?.uid)
    );
    
    const newSelection = new Set(selectedRecords);
    
    if (allSelected) {
      // Deselect all visible records
      visibleRecords.forEach(record => {
        const uid = record["@admin"]?.uid;
        if (uid) newSelection.delete(uid);
      });
    } else {
      // Select all visible records
      visibleRecords.forEach(record => {
        const uid = record["@admin"]?.uid;
        if (uid) newSelection.add(uid);
      });
    }
    
    setSelectedRecords(newSelection);
    setUpdateCounter(prev => prev + 1);
  };

  // Add event listener for clear selection
  useEffect(() => {
    const handleClearSelection = () => {
      setSelectedRecords(new Set());
      setUpdateCounter(prev => prev + 1);
    };

    document.addEventListener('clearSelection', handleClearSelection);
    return () => {
      document.removeEventListener('clearSelection', handleClearSelection);
    };
  }, []);

  const extractEssentialFields = (record) => {
    const essentialRecord = {
      "@admin": {
        uid: record["@admin"]?.uid || null,
        data_source: {
          organisation: record["@admin"]?.data_source?.organisation || null
        }
      },
      "@document": {
        units: []
      }
    };

    const neededFields = [
      "spectrum/object_number",
      "spectrum/title",
      "spectrum/object_name",
      "spectrum/brief_description"
    ];

    if (record["@document"]?.units) {
      essentialRecord["@document"].units = record["@document"].units
        .filter(unit => neededFields.includes(unit.type))
        .map(unit => ({
          type: unit.type,
          value: unit.value,
          label: unit.label
        }));
    }

    return essentialRecord;
  };

  const processRecordsWithDelay = async (records, processFn, batchSize = 100, delayMs = 5) => {
    const result = [];
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const processed = batch.map(processFn);
      result.push(...processed);
      setLoadingProgress(prev => ({ loaded: prev.loaded + processed.length }));
      if (i + batchSize < records.length) {
        await new Promise(res => setTimeout(res, delayMs));
      }
    }
    return result;
  };

  const fetchAllMdsRecords = async (resumeToken) => {
    const apiUrl = `https://mds-data-1.ciim.k-int.com/api/v1/extract?resume=${resumeToken}`;
    const fullData = [];
    let truncated = false;
    let currentUrl = apiUrl;

    const MAX_RECORDS = 50000;
    const FETCH_BATCH_SIZE = 1000;

    try {
      while (fullData.length < MAX_RECORDS) {
        const response = await fetch(currentUrl);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();

        const nextBatch = json.data.slice(0, FETCH_BATCH_SIZE);
        const processed = await processRecordsWithDelay(nextBatch, extractEssentialFields);
        fullData.push(...processed);

        if (json.has_next && json.next_url && fullData.length < MAX_RECORDS) {
          currentUrl = json.next_url;
        } else {
          if (json.has_next) truncated = true;
          break;
        }
      }

      return { records: fullData, truncated };
    } catch (err) {
      console.error('MDS fetch error:', err);
      throw err;
    }
  };

  useEffect(() => {    
    const loadData = async () => {      
      setLoading(true);
      setError('');
      setLoadingProgress({ loaded: 0 });

      try {
        const token = localStorage.getItem(`mdsApiToken_${projectId}`)
                
        // If there is no token in the localStorage then wait until the project is
        // loaded so we can get the token from there
        if (!token && !project) {
          return;
        } 

        // @TODO when auth is set up, we can change this message for authors to say
        // that the project owner needs to complete the project setup.
        if (!token && !project.mdsApiToken) {
          setError('Missing MDS API token. Please complete project setup.');
          return;
        }

        if (!token) {
          // Set the token in storage so next page load doesn't need to wait for useProject response
          localStorage.setItem(`mdsApiToken_${projectId}`, project.mdsApiToken);
        }

        const { success, data } = getRecordsFromStorage(token, projectId);

        if (success && Array.isArray(data)) {
          setAllRecords(data);
          return;
        }
        
        const { records, truncated } = await fetchAllMdsRecords(token || project.mdsApiToken);

        setAllRecords(records);
        saveRecordsToStorage(records, { token: token || project.mdsApiToken, timestamp: Date.now() }, projectId);

        if (truncated) {
          setError('Showing first 50,000 records only.');
        }
      } catch (err) {
        setError('Failed to fetch records: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, project]);

  useEffect(() => {
    let result = searchRecords(allRecords, searchQuery);

    if (showSelectedOnly && selectedRecords.size > 0) {
      result = result.filter(record => 
        selectedRecords.has(record["@admin"]?.uid)
      );
    }

    setFilteredData(result);
  }, [allRecords, searchQuery, showSelectedOnly, selectedRecords, updateCounter]);

  const value = {
    filteredData,
    searchQuery,
    handleSearchChange,
    handleClearSearch,
    showCollection,
    showTitle,
    showSelectedOnly,
    setShowCollection,
    setShowTitle,
    setShowSelectedOnly,
    selectedRecords,
    setSelectedRecords,
    handleRecordSelection,
    handleHeaderCheckboxChange,
    loading,
    loadingProgress,
    error
  };

  return (
    <ObjectsDataContext.Provider value={value}>
      {children}
    </ObjectsDataContext.Provider>
  );
};
