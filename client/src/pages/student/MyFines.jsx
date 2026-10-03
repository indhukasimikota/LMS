import React, { useEffect, useState } from 'react';
import { transactionsAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const MyFines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    transactionsAPI.getMy({ limit: 100 })
      .then((r) => {
        const withFines = (r.data.transactions || []).filter((t) => t.fineStatus !== 'None');
        setFines(withFines);
        const pending = withFines
          .filter((t) => t.fineStatus === 'Pending')
          .reduce((sum, t) => sum + (t.fineAmount || 0), 0);
        setTotalPending(pending);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load fines.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page">
      <PageHeader title="My Fines" subtitle="View your overdue fines" />
      <Alert message={error} type="error" onClose={() => setError('')} />

      {totalPending > 0 && (
        <div className="fine-summary-banner">
          💰 Total Pending Fine: <strong>{formatCurrency(totalPending)}</strong> — Please contact the library to pay.
        </div>
      )}

      {fines.length === 0 ? (
        <div className="empty-state"><p>🎉 You have no fines!</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Book</th><th>Due Date</th><th>Return Date</th>
                <th>Overdue Days</th><th>Fine (₹5/day)</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div className="fw-semibold">{t.bookId?.title}</div>
                    <small className="text-muted">by {t.bookId?.author}</small>
                  </td>
                  <td>{formatDate(t.dueDate)}</td>
                  <td>{t.returnDate ? formatDate(t.returnDate) : <span className="text-danger">Not returned</span>}</td>
                  <td className="text-danger">{t.overdueDays}</td>
                  <td className="fw-semibold text-danger">{formatCurrency(t.fineAmount)}</td>
                  <td><Badge status={t.fineStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyFines;
