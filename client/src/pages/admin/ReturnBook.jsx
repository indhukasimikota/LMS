import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const ReturnBook = () => {
  const [activeTransactions, setActiveTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState(null); // transactionId being returned
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [lastReturn, setLastReturn] = useState(null);

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll({ status: 'Issued', limit: 100 });
      const res2 = await transactionsAPI.getAll({ status: 'Overdue', limit: 100 });
      const all = [...(res.data.transactions || []), ...(res2.data.transactions || [])];
      setActiveTransactions(all);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load active transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActive(); }, []);

  const handleReturn = async (transactionId) => {
    setReturning(transactionId);
    setSuccess(''); setError('');
    try {
      const res = await transactionsAPI.return({ transactionId });
      const { transaction, fine } = res.data;
      setLastReturn({ transaction, fine });
      const msg = fine.overdueDays > 0
        ? `Book returned. Overdue: ${fine.overdueDays} days. Fine: ${formatCurrency(fine.fineAmount)}`
        : 'Book returned successfully. No fine.';
      setSuccess(msg);
      fetchActive();
    } catch (err) {
      setError(err.response?.data?.message || 'Return failed.');
    } finally {
      setReturning(null);
    }
  };

  const filtered = search
    ? activeTransactions.filter((t) => {
        const s = search.toLowerCase();
        return (
          t.userId?.name?.toLowerCase().includes(s) ||
          t.userId?.studentId?.toLowerCase().includes(s) ||
          t.bookId?.title?.toLowerCase().includes(s)
        );
      })
    : activeTransactions;

  return (
    <div className="page">
      <PageHeader title="Return Book" subtitle="Process book returns and calculate fines" />

      <Alert message={success} type="success" onClose={() => setSuccess('')} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      {lastReturn && (
        <div className="return-receipt card mb-4">
          <div className="card-header"><h3>📋 Return Receipt</h3></div>
          <div className="card-body receipt-grid">
            <div><span className="info-label">Book</span><p>{lastReturn.transaction.bookId?.title}</p></div>
            <div><span className="info-label">Student</span><p>{lastReturn.transaction.userId?.name}</p></div>
            <div><span className="info-label">Return Date</span><p>{formatDate(lastReturn.transaction.returnDate)}</p></div>
            <div><span className="info-label">Overdue Days</span><p className={lastReturn.fine.overdueDays > 0 ? 'text-danger' : 'text-success'}>{lastReturn.fine.overdueDays}</p></div>
            <div><span className="info-label">Fine Amount</span><p className={lastReturn.fine.fineAmount > 0 ? 'text-danger fw-semibold' : 'text-success'}>{formatCurrency(lastReturn.fine.fineAmount)}</p></div>
            <div><span className="info-label">Fine Status</span><p><Badge status={lastReturn.transaction.fineStatus === 'None' ? 'Returned' : lastReturn.transaction.fineStatus} /></p></div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <input
          className="form-input"
          placeholder="Filter by student name, ID or book title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading active issues..." />
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>🎉 No active issues found.</p></div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th><th>Book</th><th>Issue Date</th>
                <th>Due Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className={t.status === 'Overdue' ? 'row-overdue' : ''}>
                  <td>
                    <div className="fw-semibold">{t.userId?.name}</div>
                    <small className="text-muted">{t.userId?.studentId}</small>
                  </td>
                  <td>
                    <div>{t.bookId?.title}</div>
                    <small className="text-muted">by {t.bookId?.author}</small>
                  </td>
                  <td>{formatDate(t.issueDate)}</td>
                  <td className={t.status === 'Overdue' ? 'text-danger' : ''}>{formatDate(t.dueDate)}</td>
                  <td><Badge status={t.status} /></td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleReturn(t._id)}
                      disabled={returning === t._id}
                    >
                      {returning === t._id ? 'Processing...' : '↩️ Return'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReturnBook;
