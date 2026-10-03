import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const home = isAuthenticated ? (isAdmin ? '/admin' : '/student') : '/';

  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-message">The page you're looking for doesn't exist.</p>
        <Link to={home} className="btn btn-primary">
          ← Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
