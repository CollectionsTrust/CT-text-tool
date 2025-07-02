import { useContext } from 'react';
import { ObjectsDataContext } from './ObjectsDataProvider';
import './DisplayOptions.css';

const DisplayOptions = ({
  showCollection,
  showTitle,
  setShowCollection,
  setShowTitle,
  selectedRecords,
  filteredData,
  handleHeaderCheckboxChange,
  isEditMode
}) => {
  const { showSelectedOnly, setShowSelectedOnly } = useContext(ObjectsDataContext);
  const selectedCount = selectedRecords.size;

  // Handle clearing selection
  const handleClearSelection = () => {
    const event = new CustomEvent('clearSelection');
    document.dispatchEvent(event);
  };

  // Toggle button handler - either select all or clear all
  const handleToggleSelection = () => {
    if (selectedCount > 0) {
      // If records are selected, clear them
      handleClearSelection();
    } else {
      // If no records are selected, select all
      handleHeaderCheckboxChange();
    }
  };

  return (
    <div className="display-options-container">
      <div className="display-options-controls">
        <div className="display-toggle">
          <label>
            <input
              type="checkbox"
              checked={showCollection}
              onChange={() => setShowCollection(!showCollection)}
            />
            Show collection
          </label>

          <label>
            <input
              type="checkbox"
              checked={showTitle}
              onChange={() => setShowTitle(!showTitle)}
            />
            Show title
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={showSelectedOnly}
              onChange={() => setShowSelectedOnly(!showSelectedOnly)}
            />
            Show selected only
          </label>
        </div>

        <div className="selection-controls">
          <button 
            className="select-all-btn"
            onClick={handleToggleSelection}
          >
            {selectedCount > 0 ? 'Clear' : 'Select all'}
          </button>
        </div>
      </div>

      <div className="selected-records-count">
        {selectedCount > 0 && (
          <span>{selectedCount} record{selectedCount > 1 ? 's' : ''} selected</span>
        )}
      </div>
    </div>
  );
};

export default DisplayOptions;

