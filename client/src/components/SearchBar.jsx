import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search...', value: externalValue }) => {
  const [value, setValue] = useState(externalValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    // Live search — debounce-like: trigger on clear
    if (e.target.value === '') onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        aria-label={placeholder}
      />
      <button type="submit" className="btn btn-primary search-btn" aria-label="Search">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;
