// src/components/Pagination.jsx

import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-controls">
      <button 
        onClick={handlePrevious} 
        disabled={currentPage === 1}
        className="btn-secondary"
      >
        ← Previous
      </button>
      
      <span className="page-indicator">
        Page {currentPage} of {totalPages}
      </span>

      <button 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
        className="btn-secondary"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;