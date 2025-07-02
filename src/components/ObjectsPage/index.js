import { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

import { ObjectsDataContext, ObjectsDataProvider } from './ObjectsDataProvider';
import SearchBar from './SearchBar';
import DisplayOptions from './DisplayOptions';
import RecordsTable from './RecordsTable';
import RecordModal from './RecordModal';
import PaginationControls from './PaginationControls';
import SplitLayout from '../shared/AccessibleLayout/SplitLayout';
import TextForm from '../shared/TextForm/index';
import './ObjectsPage.css';

const ObjectsPageContent = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();

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
    selectedRecords,
    setSelectedRecords,
    handleRecordSelection,
    handleHeaderCheckboxChange,
    loading,
    loadingProgress,
    error
  } = useContext(ObjectsDataContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [layoutMode, setLayoutMode] = useState('split');
  const [activeView, setActiveView] = useState('text');

  const [ setCurrentTextData] = useState(null);
  const [textEditId, setTextEditId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [projectConfig, setProjectConfig] = useState({});

  useEffect(() => {
    const fetchProjectConfig = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();
          setProjectConfig({
            hasHierarchicalText: projectData.hasHierarchicalText || false,
            tracksTextStatus: projectData.tracksTextStatus || false,
            wantsTextTags: projectData.wantsTextTags || false,
            textStatuses: projectData.textStatuses || ['Draft', 'Approved'],
            textTags: projectData.textTags || [],
            authors: projectData.authors || [],
            languages: projectData.languages || ['English'],
            textNumberPrefix: projectData.textNumberPrefix || 'TXT',
            projectReferenceNumber: projectData.projectReferenceNumber || ""
          });
        }
      } catch (error) {
        console.error('Error fetching project config:', error);
      }
    };

    fetchProjectConfig();
  }, [projectId]);

  useEffect(() => {
    const editTextId = searchParams.get('editTextId');

    if (editTextId) {
      setTextEditId(editTextId);
      setIsEditMode(true);

      const fetchTextData = async () => {
        try {
          const textRef = doc(db, 'texts', editTextId);
          const textSnap = await getDoc(textRef);

          if (textSnap.exists()) {
            const textData = textSnap.data();
            setCurrentTextData(textData);

            if (textData.linkedObjects && textData.linkedObjects.length > 0) {
              if (filteredData.length > 0) {
                const linkedObjectUids = new Set(textData.linkedObjects);
                setSelectedRecords(linkedObjectUids);
                setShowSelectedOnly(true);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching text data:', error);
        }
      };

      fetchTextData();
    }
  }, [searchParams, filteredData, setSelectedRecords, setShowSelectedOnly]);

  const handleCancelEdit = () => setIsEditMode(false);

  const handleViewRecord = useCallback((record) => {
    setSelectedRecord(record);
  }, []);

  const handleCloseModal = () => setSelectedRecord(null);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const renderObjectsTablePanel = () => (
    <>
      <DisplayOptions
        showCollection={showCollection}
        showTitle={showTitle}
        setShowCollection={setShowCollection}
        setShowTitle={setShowTitle}
        selectedRecords={selectedRecords}
        filteredData={filteredData}
        handleHeaderCheckboxChange={handleHeaderCheckboxChange}
        isEditMode={isEditMode}
      />

      {loading ? (
        <p className="status-message">
          Loading records... {loadingProgress?.loaded?.toLocaleString()}
        </p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <RecordsTable
            filteredData={paginatedData}
            showCollection={showCollection}
            showTitle={showTitle}
            selectedRecords={selectedRecords}
            handleHeaderCheckboxChange={handleHeaderCheckboxChange}
            handleRecordSelection={handleRecordSelection}
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

  const renderTextFormPanel = () => (
    <div className="text-form-panel">
      <TextForm
        projectId={projectId}
        projectReferenceNumber={projectConfig.projectReferenceNumber || ""}
        textId={textEditId}
        // onSave={handleSaveText}
        onCancel={handleCancelEdit}
        projectConfig={projectConfig}
        linkedObjects={Array.from(selectedRecords)}
        // onTextChange={handleTextFormChange}
      />
    </div>
  );

  const renderLayoutControls = () => (
    <div className="layout-controls">
      {/* Split layout button */}
      <button
        type="button"
        className={`layout-btn ${layoutMode === 'split' ? 'active' : ''}`}
        onClick={() => setLayoutMode('split')}
        title="Split view"
        aria-label="Split view"
      >
        <div className="layout-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </button>

      {/* Horizontal layout button */}
      <button
        type="button"
        className={`layout-btn ${layoutMode === 'horizontal' ? 'active' : ''}`}
        onClick={() => setLayoutMode('horizontal')}
        title="Horizontal view"
        aria-label="Horizontal view"
      >
        <div className="layout-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </button>

      {/* Focus layout button */}
      <button
        type="button"
        className={`layout-btn ${layoutMode === 'focus' ? 'active' : ''}`}
        onClick={() => setLayoutMode('focus')}
        title="Focus view"
        aria-label="Focus view"
      >
        <div className="layout-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      </button>

      {/* Only show focus options when in focus mode */}
      {layoutMode === 'focus' && (
        <div className="focus-options">
          <button
            type="button"
            className={`focus-option-btn ${activeView === 'objects' ? 'active' : ''}`}
            onClick={() => setActiveView('objects')}
          >
            Objects
          </button>
          <button
            type="button"
            className={`focus-option-btn ${activeView === 'text' ? 'active' : ''}`}
            onClick={() => setActiveView('text')}
          >
            Text
          </button>
        </div>
      )}
    </div>
  );

  const renderLayout = () => {
    switch (layoutMode) {
      case 'split':
        return (
          <SplitLayout
            leftPanel={renderObjectsTablePanel()}
            rightPanel={renderTextFormPanel()}
            leftPanelLabel="Objects"
            rightPanelLabel="Text form"
            initialSplit={60}
            minLeftWidth={40}
            maxLeftWidth={80}
          />
        );
      case 'horizontal':
        return (
          <div className="horizontal-layout">
            <div className="top-panel">{renderTextFormPanel()}</div>
            <div className="bottom-panel">{renderObjectsTablePanel()}</div>
          </div>
        );
      case 'focus':
        return (
          <div className="focus-layout">
            {activeView === 'objects' ? renderObjectsTablePanel() : renderTextFormPanel()}
          </div>
        );
      default:
        return renderObjectsTablePanel();
    }
  };

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

      {renderLayout()}

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

const ObjectsPage = () => (
  <ObjectsDataProvider>
    <ObjectsPageContent />
  </ObjectsDataProvider>
);

export default ObjectsPage;
