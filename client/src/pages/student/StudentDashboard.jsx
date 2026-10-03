import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency, getDueDateStatus, getStatusClass } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardAPI.getStudentDashboard()
      .then((r) => setData(r.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;

  const s = data?.stats || {};

  return (
    <div className="page">
      <PageHeader
        title={`Welcome, ${user?.name}! 👋`}
        subtitle="Your library activity at a glance"
      />

      <Alert message={error} type="error" onClose={() => setError('')} />

      <div className="stats-grid">
        <StatCard icon="📚" label="Books Available"  value={s.totalBooksAvailable} color="blue" />
        <StatCard icon="📖" label="My Issued Books"  value={s.issuedBooks}         color="green" />
        <StatCard icon="⚠️" label="Overdue Books"   value={s.overdueBooks}        color="red" />
        <StatCard icon="💰" label="Current Fine"    value={formatCurrency(s.currentFine)} color="yellow" />
      </div>

      <div className="dashboard-grid">
        {/* Currently Issued */}
        <div className="card">
          <div className="card-header">
            <h3>📖 Currently Issued Books</h3>
            <Link to="/student/issued" className="card-link">View all →</Link>
          </div>
          <div className="card-body">
            {data?.activeTransactions?.length === 0 ? (
              <p className="empty-text">No books currently issued.</p>
            ) : (
              <div className="book-list">
                {data.activeTransactions.map((t) => {
                  const dueStat = getDueDateStatus(t.dueDate, t.status);
                  return (
                    <div key={t._id} className="book-list-item">
                      <div className="book-list-cover">
                        {t.bookId?.coverImage
                          ? <img src={t.bookId.coverImage} alt="" onError={(e) => e.target.style.display='none'} />
                          : <span>📖</span>}
                      </div>
                      <div className="book-list-info">
                        <p className="fw-semibold">{t.bookId?.title}</p>
                        <p className="text-muted">{t.bookId?.author}</p>
                        <p>Due: <span className={t.status === 'Overdue' ? 'text-danger' : ''}>{formatDate(t.dueDate)}</span></p>
                      </div>
                      <span className={getStatusClass(dueStat)}>{dueStat}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="card">
          <div className="card-header">
            <h3>🕒 Recent History</h3>
            <Link to="/student/history" className="card-link">View all →</Link>
          </div>
          <div className="card-body">
            {data?.recentHistory?.length === 0 ? (
              <p className="empty-text">No borrowing history yet.</p>
            ) : (
              <table className="table table-sm">
                <thead>
                  <tr><th>Book</th><th>Returned</th><th>Fine</th></tr>
                </thead>
                <tbody>
                  {data.recentHistory.map((t) => (
                    <tr key={t._id}>
                      <td>{t.bookId?.title}</td>
                      <td>{formatDate(t.returnDate)}</td>
                      <td>{t.fineAmount > 0 ? <span className="text-danger">{formatCurrency(t.fineAmount)}</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header"><h3>Quick Actions</h3></div>
        <div className="card-body quick-actions">
          <Link to="/student/books" className="quick-action-btn">📚 Browse Books</Link>
          <Link to="/student/issued" className="quick-action-btn">📖 My Issued Books</Link>
          <Link to="/student/fines" className="quick-action-btn">💰 My Fines</Link>
          <Link to="/student/history" className="quick-action-btn">🕒 My History</Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
