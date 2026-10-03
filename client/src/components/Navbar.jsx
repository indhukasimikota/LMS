import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <Link to={isAdmin ? '/admin' : '/student'} className="navbar-brand">
          📚 LibraryMS
        </Link>
      </div>

      <div className="navbar-right">
        <span className="navbar-user">
          <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <span className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`role-badge ${user?.role}`}>{user?.role}</span>
          </span>
        </span>
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
