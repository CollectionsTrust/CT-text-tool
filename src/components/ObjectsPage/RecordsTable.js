import { getOrganisation, getPropertyValue, getArrayPropertyValues, truncateToWords } from './utils/dataExtractors';

const RecordsTable = ({
  filteredData,
  showCollection,
  showTitle,
  selectedRecords,
  handleRecordSelection
}) => {
  return (
    <div className="table-wrapper">
      <table className="records-table">
        <thead>
          <tr>
            {showCollection && <th>Collection</th>}
            <th>Object number</th>
            {showTitle && <th>Title</th>}
            <th>Object name</th>
            <th>Brief description</th>
            <th style={{ width: '140px' }}>Actions</th>{/* Set a fixed width to ensure room for buttons */}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((record, index) => {
            const objectNumber = getPropertyValue(record, "spectrum/object_number") || "-";
            const objectNames = getArrayPropertyValues(record, "spectrum/object_name");
            const objectName = objectNames.length > 0 ? objectNames.join("; ") : "-";
            const fullDescription = getPropertyValue(record, "spectrum/brief_description") || "-";
            const truncatedDescription = truncateToWords(fullDescription, 15);
            const title = getPropertyValue(record, "spectrum/title") || "-";
            const collection = getOrganisation(record);
            const uid = record["@admin"]?.uid;

            return (
              <tr key={index} className={selectedRecords.has(uid) ? "selected-row" : ""}>
                {showCollection && <td>{collection}</td>}
                <td>{objectNumber}</td>
                {showTitle && <td>{title}</td>}
                <td>{objectName}</td>
                <td>{truncatedDescription}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => {
                        const width = Math.floor(window.innerWidth * 0.33);
                        const height = Math.floor(window.innerHeight * 0.8);
                        const left = Math.floor((window.innerWidth - width) / 2);
                        const top = Math.floor((window.innerHeight - height) / 2);
                        const popup = window.open(
                          `https://museumdata.uk/objects/${uid}`,
                          '_blank',
                          `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars`
                        );
                        if (popup) popup.focus();
                      }}
                      className="view-link"
                    >
                      View
                    </button>
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(uid)}
                      onChange={() => handleRecordSelection(record)}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;
