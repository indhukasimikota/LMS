import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardAPI.getAdminStats();
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner fullPage text="Loading dashboard..." />;

  const s = data?.stats || {};

  return (
    <div className="page">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Library overview and statistics"
        action={<Link to="/admin/issue" className="btn btn-primary">+ Issue Book</Link>}
      />

      <Alert message={error} type="error" onClose={() => setError('')} />

      {/* FR2: Stats grid */}
      <div className="stats-grid">
        <StatCard icon="📚" label="Total Books"       value={s.totalBooks}       color="blue" />
        <StatCard icon="✅" label="Available Books"  value={s.availableBooks}   color="green" />
        <StatCard icon="📤" label="Issued Books"     value={s.issuedBooks}      color="orange" />
        <StatCard icon="🎓" label="Total Students"   value={s.totalStudents}    color="purple" />
        <StatCard icon="⚠️" label="Overdue Books"   value={s.overdueBooks}     color="red" />
        <StatCard icon="🔄" label="Total Transactions" value={s.totalTransactions} color="teal" />
        <StatCard icon="💰" label="Pending Fines"   value={formatCurrency(s.totalFines)} color="yellow" />
      </div>

      <div className="dashboard-grid">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <Link to="/admin/transactions" className="card-link">View all →</Link>
          </div>
          <div className="card-body">
            {data?.recentTransactions?.length === 0 ? (
              <p className="empty-text">No transactions yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th><th>Book</th><th>Issue Date</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentTransactions?.map((t) => (
                    <tr key={t._id}>
                      <td>{t.userId?.name || '—'}</td>
                      <td>{t.bookId?.title || '—'}</td>
                      <td>{formatDate(t.issueDate)}</td>
                      <td><Badge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Overdue Books */}
        <div className="card">
          <div className="card-header">
            <h3>⚠️ Overdue Books</h3>
            <Link to="/admin/transactions?status=Overdue" className="card-link">View all →</Link>
          </div>
          <div className="card-body">
            {data?.overdueTransactions?.length === 0 ? (
              <p className="empty-text success-text">🎉 No overdue books!</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Student</th><th>Book</th><th>Due Date</th><th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.overdueTransactions?.map((t) => (
                    <tr key={t._id} className="row-overdue">
                      <td>
                        <div>{t.userId?.name}</div>
                        <small className="text-muted">{t.userId?.studentId}</small>
                      </td>
                      <td>{t.bookId?.title}</td>
                      <td className="text-danger">{formatDate(t.dueDate)}</td>
                      <td>{formatCurrency(t.fineAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-4">
        <div className="card-header"><h3>Quick Actions</h3></div>
        <div className="card-body quick-actions">
          <Link to="/admin/books" className="quick-action-btn">📚 Manage Books</Link>
          <Link to="/admin/students" className="quick-action-btn">🎓 Manage Students</Link>
          <Link to="/admin/issue" className="quick-action-btn">➕ Issue Book</Link>
          <Link to="/admin/return" className="quick-action-btn">↩️ Return Book</Link>
          <Link to="/admin/fines" className="quick-action-btn">💰 View Fines</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
