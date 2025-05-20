// src/components/ObjectsPage/ObjectsDataProvider.js

import React, { createContext, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { searchRecords } from './utils/search';
import { saveRecordsToStorage, getRecordsFromStorage } from './utils/localStorage';

export const ObjectsDataContext = createContext();

export const ObjectsDataProvider = ({ children }) => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();

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

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleClearSearch = () => setSearchQuery('');

  const handleRecordSelection = (record) => {
    const objectUid = record["@admin"]?.uid;
    if (!objectUid) return;
    
    const updated = new Set(selectedRecords);
    updated.has(objectUid) ? updated.delete(objectUid) : updated.add(objectUid);
    setSelectedRecords(updated);
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
    
    if (allSelected) {
      // Deselect all visible records
      const updated = new Set(selectedRecords);
      visibleRecords.forEach(record => {
        const uid = record["@admin"]?.uid;
        if (uid) updated.delete(uid);
      });
      setSelectedRecords(updated);
    } else {
      // Select all visible records
      const updated = new Set(selectedRecords);
      visibleRecords.forEach(record => {
        const uid = record["@admin"]?.uid;
        if (uid) updated.add(uid);
      });
      setSelectedRecords(updated);
    }
  };

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
        console.log(`Fetching from: ${currentUrl}`);
        const response = await fetch(currentUrl);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const json = await response.json();

        console.log(`Received batch: ${json.data.length} records`);
        const nextBatch = json.data.slice(0, FETCH_BATCH_SIZE);
        const processed = await processRecordsWithDelay(nextBatch, extractEssentialFields);
        fullData.push(...processed);

        console.log(`Loaded so far: ${fullData.length}`);

        if (json.has_next && json.next_url && fullData.length < MAX_RECORDS) {
          currentUrl = json.next_url;
        } else {
          if (json.has_next && !json.next_url) {
            console.warn("has_next is true but no next_url provided!");
          }
          if (json.has_next) truncated = true;
          break;
        }
      }

      console.log(`Final record count: ${fullData.length}`);
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
        const token = localStorage.getItem(`mdsApiToken_${projectId}`);
        if (!token) {
          setError('Missing MDS API token. Please complete project setup.');
          setLoading(false);
          return;
        }

        const { success, data, tokenMeta } = getRecordsFromStorage(token, projectId);
        if (success && Array.isArray(data)) {
          setAllRecords(data);
          setLoading(false);
          return;
        }

        await new Promise(res => setTimeout(res, 100)); // allow UI to show loading

        const { records, truncated } = await fetchAllMdsRecords(token);
        setAllRecords(records);

        setTimeout(() => {
          saveRecordsToStorage(records, { token, timestamp: Date.now() }, projectId);
        }, 100);

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
  }, [projectId]);

  useEffect(() => {
    let result = searchRecords(allRecords, searchQuery);

    if (showSelectedOnly && selectedRecords.size > 0) {
      result = result.filter(record => 
        selectedRecords.has(record["@admin"]?.uid)
      );
    }

    setFilteredData(result);
  }, [allRecords, searchQuery, showSelectedOnly, selectedRecords]);

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
