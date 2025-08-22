import { getOrganisation, getPropertyValue, getArrayPropertyValues } from './utils/dataExtractors';

const RecordModal = ({ selectedRecord, handleCloseModal, handleViewRecord }) => {
  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Record Details</h3>
          <div className="modal-actions">
            <a 
              href={`https://museumdata.uk/object-search/object/?pid=${selectedRecord["@admin"]?.uid}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                handleViewRecord(selectedRecord["@admin"]?.uid);
              }}
              className="external-link-btn"
            >
              Open in new tab
            </a>
            <button onClick={handleCloseModal} className="close-btn">×</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="record-key-fields">
            <table>
              <tbody>
                <tr>
                  <th>Collection:</th>
                  <td>{getOrganisation(selectedRecord)}</td>
                </tr>
                <tr>
                  <th>Object Number:</th>
                  <td>{getPropertyValue(selectedRecord, "spectrum/object_number") || "-"}</td>
                </tr>
                <tr>
                  <th>Title:</th>
                  <td>{getPropertyValue(selectedRecord, "spectrum/title") || "-"}</td>
                </tr>
                <tr>
                  <th>Object Name:</th>
                  <td>
                    {getArrayPropertyValues(selectedRecord, "spectrum/object_name").join("; ") || "-"}
                  </td>
                </tr>
                <tr>
                  <th>Brief Description:</th>
                  <td>{getPropertyValue(selectedRecord, "spectrum/brief_description") || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="record-all-fields">
            <h4>All Fields</h4>
            <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordModal;
