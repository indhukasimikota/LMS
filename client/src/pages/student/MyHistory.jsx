import React, { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const MyHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getMy({ status: 'Returned', page, limit: 10 });
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(1); }, [fetchHistory]);

  return (
    <div className="page">
      <PageHeader title="My Borrowing History" subtitle={`${pagination.total} returned book(s)`} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      {loading ? (
        <LoadingSpinner text="Loading history..." />
      ) : transactions.length === 0 ? (
        <div className="empty-state"><p>📭 No borrowing history yet.</p></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Book</th><th>Issue Date</th><th>Due Date</th>
                  <th>Return Date</th><th>Overdue Days</th><th>Fine</th><th>Fine Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="fw-semibold">{t.bookId?.title}</div>
                      <small className="text-muted">by {t.bookId?.author}</small>
                    </td>
                    <td>{formatDate(t.issueDate)}</td>
                    <td>{formatDate(t.dueDate)}</td>
                    <td>{formatDate(t.returnDate)}</td>
                    <td className={t.overdueDays > 0 ? 'text-danger' : 'text-success'}>{t.overdueDays || 0}</td>
                    <td>{t.fineAmount > 0 ? <span className="text-danger">{formatCurrency(t.fineAmount)}</span> : '—'}</td>
                    <td>
                      {t.fineStatus !== 'None' ? <Badge status={t.fineStatus} /> : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => fetchHistory(p)} />
        </>
      )}
    </div>
  );
};

export default MyHistory;
