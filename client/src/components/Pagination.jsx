import React from 'react';

const Pagination = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= pages; i++) pageNumbers.push(i);

  return (
    <div className="pagination" aria-label="Pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ‹ Prev
      </button>

      {pageNumbers.map((num) => (
        <button
          key={num}
          className={`pagination-btn ${num === page ? 'pagination-active' : ''}`}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
      >
        Next ›
      </button>
    </div>
  );
};

export default Pagination;
