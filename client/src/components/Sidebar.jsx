import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin',              label: '📊 Dashboard',      end: true },
  { to: '/admin/books',        label: '📚 Books' },
  { to: '/admin/students',     label: '🎓 Students' },
  { to: '/admin/issue',        label: '➕ Issue Book' },
  { to: '/admin/return',       label: '↩️ Return Book' },
  { to: '/admin/transactions', label: '🔄 Transactions' },
  { to: '/admin/fines',        label: '💰 Fines' },
  { to: '/admin/profile',      label: '👤 Profile' },
];

const studentLinks = [
  { to: '/student',              label: '🏠 Dashboard',      end: true },
  { to: '/student/books',        label: '📚 Browse Books' },
  { to: '/student/issued',       label: '📖 My Issued Books' },
  { to: '/student/history',      label: '🕒 My History' },
  { to: '/student/fines',        label: '💰 My Fines' },
  { to: '/student/profile',      label: '👤 Profile' },
];

const Sidebar = ({ isOpen }) => {
  const { isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <nav className="sidebar-nav" aria-label="Main navigation">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
