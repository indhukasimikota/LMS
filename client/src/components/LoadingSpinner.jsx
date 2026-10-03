import React from 'react';

const LoadingSpinner = ({ fullPage = false, size = 'md', text = 'Loading...' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : 'spinner-md';

  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        <div className={`spinner ${sizeClass}`} aria-label="Loading" role="status" />
        <p className="spinner-text">{text}</p>
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className={`spinner ${sizeClass}`} aria-label="Loading" role="status" />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
