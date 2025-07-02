const PaginationControls = ({ 
  filteredData, 
  recordsPerPage, 
  currentPage, 
  onPageChange, 
  onRecordsPerPageChange 
}) => {
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 4;
      }
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="pagination-controls">
      <div className="records-per-page">
        <label htmlFor="records-per-page-select">Show:</label>
        <select 
          id="records-per-page-select"
          value={recordsPerPage} 
          onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>per page</span>
      </div>
      
      <div className="page-info">
        Showing {filteredData.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0} to {Math.min(currentPage * recordsPerPage, filteredData.length)} of {filteredData.length} records
      </div>
      
      <div className="pagination-buttons">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          « First
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          ‹ Prev
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="page-ellipsis">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`page-number ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          )
        )}

        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next ›
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
          Last »
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
