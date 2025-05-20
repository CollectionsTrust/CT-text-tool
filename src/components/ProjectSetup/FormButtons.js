import React from 'react';

const FormButtons = ({ handleFetchRecords, isFetching, canEdit, buttonText = "Fetch MDS Records" }) => {
  return (
    <div className="form-buttons">
      {canEdit && (
        <button 
          onClick={handleFetchRecords} 
          className="process-btn"
          disabled={isFetching}
        >
          {isFetching ? 'Saving...' : buttonText}
        </button>
      )}
    </div>
  );
};

export default FormButtons;
