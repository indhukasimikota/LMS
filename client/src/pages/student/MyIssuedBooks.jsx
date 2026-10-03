import React, { useEffect, useState } from 'react';
import { transactionsAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import { formatDate, getDueDateStatus, getStatusClass } from '../../utils/helpers';

const MyIssuedBooks = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // FIX: Use Promise.all so both calls run in parallel.
    // Loading state is cleared only after BOTH resolve or either rejects.
    // Errors from either call are caught and displayed.
    const fetchAll = async () => {
      try {
        const [issuedRes, overdueRes] = await Promise.all([
          transactionsAPI.getMy({ status: 'Issued',  limit: 50 }),
          transactionsAPI.getMy({ status: 'Overdue', limit: 50 }),
        ]);
        const issued  = issuedRes.data.transactions  || [];
        const overdue = overdueRes.data.transactions || [];
        // Sort combined list: overdue first, then by due date ascending
        const combined = [...issued, ...overdue].sort((a, b) => {
          if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
          if (a.status !== 'Overdue' && b.status === 'Overdue') return 1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        setTransactions(combined);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load issued books.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page">
      <PageHeader title="My Issued Books" subtitle={`${transactions.length} active issue(s)`} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>📭 You have no books currently issued.</p>
        </div>
      ) : (
        <div className="issued-books-list">
          {transactions.map((t) => {
            const dueStat = getDueDateStatus(t.dueDate, t.status);
            return (
              <div key={t._id} className={`issued-book-card card ${t.status === 'Overdue' ? 'card-overdue' : ''}`}>
                <div className="issued-book-cover">
                  {t.bookId?.coverImage
                    ? <img src={t.bookId.coverImage} alt="" onError={(e) => e.target.style.display='none'} />
                    : <span className="cover-placeholder">📖</span>}
                </div>
                <div className="issued-book-info">
                  <h3>{t.bookId?.title}</h3>
                  <p className="text-muted">by {t.bookId?.author}</p>
                  <p><span className="info-label">ISBN:</span> <code>{t.bookId?.isbn}</code></p>
                  <p><span className="info-label">Category:</span> {t.bookId?.category}</p>
                </div>
                <div className="issued-book-dates">
                  <div><span className="info-label">Issue Date</span><p>{formatDate(t.issueDate)}</p></div>
                  <div><span className="info-label">Due Date</span>
                    <p className={t.status === 'Overdue' ? 'text-danger fw-semibold' : ''}>{formatDate(t.dueDate)}</p>
                  </div>
                  <span className={getStatusClass(dueStat)}>{dueStat}</span>
                  {t.status === 'Overdue' && (
                    <p className="text-danger mt-2">
                      ⚠️ Overdue! Fine accruing at ₹5/day. Contact the library.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyIssuedBooks;
