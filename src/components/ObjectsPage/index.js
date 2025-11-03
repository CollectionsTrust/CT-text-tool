import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPropertyValue } from "./utils/dataExtractors";
import {
  collection,
  doc,
  serverTimestamp,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useForm, FormProvider } from "react-hook-form";
import useProjectAuthors from "../../hooks/useProjectAuthors";
import { useObjectsList } from "../../hooks/useObjectsList";
import SearchBar from "./SearchBar";
import DisplayOptions from "./DisplayOptions";
import RecordsTable from "./RecordsTable";
import RecordModal from "./RecordModal";
import PaginationControls from "./PaginationControls";
import SplitLayout from "../common/AccessibleLayout/SplitLayout";
import TextForm from "../common/TextForm/index";
import "./ObjectsPage.css";
import { useText } from "../../hooks/useText";
import { useTexts } from "../../hooks/useTexts";
import usePageTitle from "../../hooks/usePageTitle";

const ObjectsPage = () => {
  const { projectId } = useParams();
  const { authors } = useProjectAuthors(projectId);
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [layoutMode, setLayoutMode] = useState("split");
  const [activeView, setActiveView] = useState("text");
  const [projectConfig, setProjectConfig] = useState();
  const editTextId = searchParams.get("editTextId");
  const { text } = useText(editTextId);
  const { texts } = useTexts(projectId);
  usePageTitle(text ? `Edit text` : "Create text");

  const methods = useForm({
    defaultValues: {
      text: "",
      parentText: "",
      textTag: "",
      textAuthors: [],
      textLanguages: [],
      textStatus: "",
      textNote: "",
      linkedObjects: [],
      projectId: "",
      textReferenceNumber: "",
      projectReferenceNumber: "",
    },
  });

  const clearLinkedObjects = () => {
    methods.setValue("linkedObjects", []);
  };

  const selectAllObjects = () => {
    const linkedObjectsData = filteredData.map((record) =>
      JSON.stringify({
        uid: record["@admin"].uid,
        objectNumber: getPropertyValue(record, "spectrum/object_number") || "-",
      })
    );

    methods.setValue("linkedObjects", linkedObjectsData);
  };

  // Reset the form when `text` and projectConfig is loaded
  useEffect(() => {
    if (!texts || !authors) {
      return;
    }

    let textReferenceNumber = "";

    if (text?.textReferenceNumber) {
      textReferenceNumber = text?.textReferenceNumber;
    } else if (texts.length === 0) {
      textReferenceNumber = "TXT00001";
    } else {
      const sortedTexts = texts.sort((textA, textB) => {
        const numA = parseInt(textA.textReferenceNumber.replace("TXT", ""));
        const numB = parseInt(textB.textReferenceNumber.replace("TXT", ""));
        return numA - numB;
      });
      const highestTextReferenceNumber =
        sortedTexts[sortedTexts.length - 1].textReferenceNumber;
      const highestNumber = parseInt(
        highestTextReferenceNumber.replace("TXT", "")
      );
      const nextNumber = highestNumber + 1;
      const nextTextReferenceNumber =
        "TXT" +
        nextNumber
          .toString()
          .padStart(highestTextReferenceNumber.length - 3, "0");

      textReferenceNumber = nextTextReferenceNumber;
    }

    methods.reset({
      text: text?.text,
      textTag: text?.textTag || "",
      textAuthors: text?.textAuthors || [],
      textLanguages: text?.textLanguages || [],
      textStatus: text?.textStatus || "",
      textNote: text?.textNote || "",
      parentText: text?.parentText || "",
      linkedObjects:
        text?.linkedObjects.map((obj) =>
          JSON.stringify(obj, ["uid", "objectNumber"])
        ) || [],
      projectId: projectId,
      textReferenceNumber: textReferenceNumber,
      projectReferenceNumber: projectConfig?.projectReferenceNumber || "",
    });
  }, [text, projectConfig]);

  const {
    filteredData,
    handleSearchChange,
    handleClearSearch,
    searchQuery,
    showCollection,
    showTitle,
    setShowCollection,
    setShowTitle,
    setShowSelectedOnly,
    showSelectedOnly,
    handleHeaderCheckboxChange,
    loading,
    loadingProgress,
    error,
  } = useObjectsList(methods.watch("linkedObjects"));

  const submitForm = async (data) => {
    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
      textDate: text?.textDate || new Date().toISOString().substring(0, 10),
      linkedObjects: data.linkedObjects.map((v) => JSON.parse(v)),
    };

    setSaveError(null);

    try {
      if (editTextId) {
        await updateDoc(doc(db, "texts", editTextId), payload);

        setSaveMessage("Text updated successfully!");
      } else {
        payload.createdAt = serverTimestamp();

        await addDoc(collection(db, "texts"), payload);

        setSaveMessage("Text saved successfully!");
        methods.reset();
      }
    } catch (error) {
      setSaveError(error.message || "An error occurred while saving.");
    }
  };

  useEffect(() => {
    const fetchProjectConfig = async () => {
      try {
        // Get project info
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();

          setProjectConfig({
            hasHierarchicalText: projectData.hasHierarchicalText || false,
            tracksTextStatus: projectData.tracksTextStatus || false,
            wantsTextTags: projectData.wantsTextTags || false,
            textStatuses: projectData.textStatuses || ["Draft", "Approved"],
            textTags: projectData.textTags || [],
            authors: authors?.map((author) => author.name) || [],
            languages: projectData.languages || ["English"],
            textNumberPrefix: projectData.textNumberPrefix || "TXT",
            projectReferenceNumber: projectData.projectReferenceNumber || "",
          });
        }
      } catch (error) {
        console.error("Error fetching project config:", error);
      }
    };

    fetchProjectConfig();
  }, [projectId, authors]);

  const handleViewRecord = useCallback((record) => {
    setSelectedRecord(record);
  }, []);

  const handleCloseModal = () => setSelectedRecord(null);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const renderLayoutControls = () => (
    <div className="layout-controls">
      {/* Split layout button */}
      <button
        type="button"
        className={`layout-btn ${layoutMode === "split" ? "active" : ""}`}
        onClick={() => setLayoutMode("split")}
        title="Split view"
        aria-label="Split view"
      >
        <div className="layout-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="4"
              width="20"
              height="16"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="12"
              y1="4"
              x2="12"
              y2="20"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </button>

      {/* Horizontal layout button */}
      <button
        type="button"
        className={`layout-btn ${layoutMode === "horizontal" ? "active" : ""}`}
        onClick={() => setLayoutMode("horizontal")}
        title="Horizontal view"
        aria-label="Horizontal view"
      >
        <div className="layout-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="4"
              width="20"
              height="16"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </button>

      {/* Focus layout button */}
      <button
        type="button"
        className={`layout-btn ${layoutMode === "focus" ? "active" : ""}`}
        onClick={() => setLayoutMode("focus")}
        title="Focus view"
        aria-label="Focus view"
      >
        <div className="layout-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="4"
              width="20"
              height="16"
              rx="1"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      </button>

      {/* Only show focus options when in focus mode */}
      {layoutMode === "focus" && (
        <div className="focus-options">
          <button
            type="button"
            className={`focus-option-btn ${
              activeView === "objects" ? "active" : ""
            }`}
            onClick={() => setActiveView("objects")}
          >
            Objects
          </button>
          <button
            type="button"
            className={`focus-option-btn ${
              activeView === "text" ? "active" : ""
            }`}
            onClick={() => setActiveView("text")}
          >
            Text
          </button>
        </div>
      )}
    </div>
  );

  const ObjectsTablePanel = () => (
    <>
      <DisplayOptions
        showCollection={showCollection}
        showTitle={showTitle}
        setShowCollection={setShowCollection}
        setShowTitle={setShowTitle}
        selectAllObjects={selectAllObjects}
        setShowSelectedOnly={setShowSelectedOnly}
        showSelectedOnly={showSelectedOnly}
        clearLinkedObjects={clearLinkedObjects}
      />

      {error && <p className="error-message">{error}</p>}

      {!error && loading && (
        <p className="status-message">
          Loading records... {loadingProgress?.loaded?.toLocaleString()}
        </p>
      )}

      {!error && !loading && paginatedData.length > 0 && (
        <>
          <RecordsTable
            filteredData={paginatedData}
            showCollection={showCollection}
            showTitle={showTitle}
            handleHeaderCheckboxChange={handleHeaderCheckboxChange}
            handleViewRecord={handleViewRecord}
          />

          <PaginationControls
            filteredData={filteredData}
            recordsPerPage={recordsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRecordsPerPageChange={setRecordsPerPage}
          />
        </>
      )}
    </>
  );

  return (
    <div className="objects-page-container">
      <div className="objects-page-header">
        <div className="search-display-container">
          <SearchBar
            searchQuery={searchQuery}
            handleSearchChange={handleSearchChange}
            handleClearSearch={handleClearSearch}
          />
          <div className="display-mode-container">
            <span className="display-mode-label">Display mode:</span>
            {renderLayoutControls()}
          </div>
        </div>
      </div>

      <FormProvider {...methods}>
        {layoutMode === "split" && (
          <SplitLayout
            leftPanel={<ObjectsTablePanel />}
            leftPanelLabel="Objects"
            rightPanelLabel="Text form"
            initialSplit={60}
            minLeftWidth={40}
            maxLeftWidth={80}
          >
            <div className="text-form-panel">
              <TextForm
                submitForm={submitForm}
                text={text}
                projectConfig={projectConfig}
                saveError={saveError}
                saveMessage={saveMessage}
              />
            </div>
          </SplitLayout>
        )}
        {layoutMode === "horizontal" && (
          <div className="horizontal-layout">
            <div className="top-panel">
              <div className="text-form-panel">
                <TextForm
                  submitForm={submitForm}
                  text={text}
                  projectConfig={projectConfig}
                  saveError={saveError}
                  saveMessage={saveMessage}
                />
              </div>
            </div>
            <div className="bottom-panel">
              <ObjectsTablePanel />
            </div>
          </div>
        )}
        {layoutMode === "focus" && (
          <div className="focus-layout">
            {activeView === "objects" ? (
              <ObjectsTablePanel />
            ) : (
              <div className="text-form-panel">
                <TextForm
                  submitForm={submitForm}
                  text={text}
                  projectConfig={projectConfig}
                  saveError={saveError}
                  saveMessage={saveMessage}
                />
              </div>
            )}
          </div>
        )}
      </FormProvider>

      {selectedRecord && (
        <RecordModal
          selectedRecord={selectedRecord}
          handleCloseModal={handleCloseModal}
          handleViewRecord={handleViewRecord}
        />
      )}
    </div>
  );
};

export default ObjectsPage;
