import React, { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const Fines = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filterFineStatus, setFilterFineStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [payTarget, setPayTarget] = useState(null);
  const [totalPending, setTotalPending] = useState(0);

  const fetchFines = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, fineStatus: filterFineStatus || undefined };
      const res = await transactionsAPI.getAll(params);
      const all = (res.data.transactions || []).filter((t) => t.fineStatus !== 'None');
      setTransactions(all);
      setPagination(res.data.pagination);

      // Total pending fine amount
      if (filterFineStatus === 'Pending' || !filterFineStatus) {
        const total = all
          .filter((t) => t.fineStatus === 'Pending')
          .reduce((sum, t) => sum + (t.fineAmount || 0), 0);
        setTotalPending(total);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fines.');
    } finally {
      setLoading(false);
    }
  }, [filterFineStatus]);

  useEffect(() => { fetchFines(1); }, [fetchFines]);

  const handleMarkPaid = async () => {
    try {
      await transactionsAPI.markFinePaid(payTarget._id);
      setSuccess(`Fine of ${formatCurrency(payTarget.fineAmount)} marked as Paid.`);
      setPayTarget(null);
      fetchFines(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark fine as paid.');
      setPayTarget(null);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Fine Management"
        subtitle="View and manage overdue book fines"
      />

      <Alert message={success} type="success" onClose={() => setSuccess('')} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      {filterFineStatus === 'Pending' && totalPending > 0 && (
        <div className="fine-summary-banner">
          💰 Total Pending Fines: <strong>{formatCurrency(totalPending)}</strong>
        </div>
      )}

      <div className="filter-bar">
        <select className="form-select" value={filterFineStatus} onChange={(e) => setFilterFineStatus(e.target.value)}>
          <option value="">All Fines</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading fines..." />
      ) : transactions.length === 0 ? (
        <div className="empty-state"><p>🎉 No fines found.</p></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th><th>Book</th><th>Due Date</th>
                  <th>Return Date</th><th>Overdue Days</th>
                  <th>Fine (₹5/day)</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="fw-semibold">{t.userId?.name || '—'}</div>
                      <small className="text-muted">{t.userId?.studentId}</small>
                    </td>
                    <td>{t.bookId?.title || '—'}</td>
                    <td>{formatDate(t.dueDate)}</td>
                    <td>{t.returnDate ? formatDate(t.returnDate) : '—'}</td>
                    <td className="text-danger">{t.overdueDays}</td>
                    <td className="fw-semibold text-danger">{formatCurrency(t.fineAmount)}</td>
                    <td><Badge status={t.fineStatus} /></td>
                    <td>
                      {t.fineStatus === 'Pending' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => setPayTarget(t)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => fetchFines(p)} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!payTarget}
        title="Mark Fine as Paid"
        message={`Mark fine of ${formatCurrency(payTarget?.fineAmount)} for "${payTarget?.userId?.name}" as paid?`}
        confirmLabel="Mark Paid"
        onConfirm={handleMarkPaid}
        onCancel={() => setPayTarget(null)}
      />
    </div>
  );
};

export default Fines;
