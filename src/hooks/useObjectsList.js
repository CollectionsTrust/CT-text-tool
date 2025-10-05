import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { searchRecords } from "../components/ObjectsPage/utils/search";
import {
  saveRecordsToStorage,
  getRecordsFromStorage,
} from "../components/ObjectsPage/utils/localStorage";
import { useProject } from "./useProject";
import { getAuth } from "firebase/auth";

export const useObjectsList = (linkedObjects) => {
  const { projectId } = useParams();
  const { project } = useProject(projectId);
  const [allRecords, setAllRecords] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0 });
  const [error, setError] = useState("");
  const [showCollection, setShowCollection] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const auth = getAuth();

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleClearSearch = () => setSearchQuery("");

  const extractEssentialFields = (record) => {
    const essentialRecord = {
      "@admin": {
        uid: record["@admin"]?.uid || null,
        data_source: {
          organisation: record["@admin"]?.data_source?.organisation || null,
        },
      },
      "@document": {
        units: [],
      },
    };

    const neededFields = [
      "spectrum/object_number",
      "spectrum/title",
      "spectrum/object_name",
      "spectrum/brief_description",
    ];

    if (record["@document"]?.units) {
      essentialRecord["@document"].units = record["@document"].units
        .filter((unit) => neededFields.includes(unit.type))
        .map((unit) => ({
          type: unit.type,
          value: unit.value,
          label: unit.label,
        }));
    }

    return essentialRecord;
  };

  const processRecordsWithDelay = async (
    records,
    processFn,
    batchSize = 100,
    delayMs = 5
  ) => {
    const result = [];
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const processed = batch.map(processFn);
      result.push(...processed);
      setLoadingProgress((prev) => ({
        loaded: prev.loaded + processed.length,
      }));
      if (i + batchSize < records.length) {
        await new Promise((res) => setTimeout(res, delayMs));
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
        const processed = await processRecordsWithDelay(
          nextBatch,
          extractEssentialFields
        );
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
      console.error("MDS fetch error:", err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      setLoadingProgress({ loaded: 0 });

      try {
        const token = localStorage.getItem(`mdsApiToken_${projectId}`);

        // If there is no token in the localStorage then wait until the project is
        // loaded so we can get the token from there
        if (!token && !project) {
          return;
        }

        const isAuthorOnProject = project?.authors.some(
          (author) => author.id === auth.currentUser.email
        );

        if (!token && !project.mdsApiToken) {
          if (isAuthorOnProject) {
            setError(
              "Missing MDS API token. This needs to be added by the project owner."
            );
          } else {
            setError("Missing MDS API token. Please complete project setup.");
          }
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

        const { records, truncated } = await fetchAllMdsRecords(
          token || project.mdsApiToken
        );

        setAllRecords(records);
        saveRecordsToStorage(
          records,
          { token: token || project.mdsApiToken, timestamp: Date.now() },
          projectId
        );

        if (truncated) {
          setError("Showing first 50,000 records only.");
        }
      } catch (err) {
        setError("Failed to fetch records. Check that the MDS token is valid.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, project]);

  useEffect(() => {
    let result = searchRecords(allRecords, searchQuery);

    if (showSelectedOnly) {
      result = result.filter((record) =>
        linkedObjects.includes(record["@admin"]?.uid)
      );
    }

    setFilteredData(result);
  }, [allRecords, searchQuery, showSelectedOnly, linkedObjects]);

  return {
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
    loading,
    loadingProgress,
    error,
  };
};
