import React from 'react';
import './ObjectsPage.css';

const SearchBar = ({ searchQuery, handleSearchChange, handleClearSearch }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search records (AND, OR, NOT, -term, or phrases)"
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-input wide"
      />
      {searchQuery && (
        <button 
          onClick={handleClearSearch}
          className="clear-search-btn"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchBar;
