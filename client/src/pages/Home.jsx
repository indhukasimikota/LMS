import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="home-page">
      <header className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">📚 Library Management System</h1>
          <p className="hero-subtitle">
            A modern digital library — manage books, students, borrowing and fines in one place.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin' : '/student'}
                className="btn btn-primary btn-lg"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg">Sign In</Link>
                <Link to="/register" className="btn btn-outline btn-lg">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="home-features">
        <div className="features-grid">
          {[
            { icon: '📖', title: 'Book Management', desc: 'Add, edit, search and manage the entire book catalogue.' },
            { icon: '🎓', title: 'Student Records', desc: 'Manage student profiles, issued books and fine history.' },
            { icon: '🔄', title: 'Issue & Return', desc: 'Seamlessly issue books to students and process returns.' },
            { icon: '📅', title: 'Due Date Tracking', desc: 'Track On Time, Due Soon, Overdue and Returned statuses.' },
            { icon: '💰', title: 'Fine Management', desc: 'Automatic fine calculation at ₹5/day for overdue books.' },
            { icon: '📊', title: 'Dashboard Stats', desc: 'Live statistics for total books, students, fines and more.' },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
