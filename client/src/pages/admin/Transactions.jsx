import React, { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFineStatus, setFilterFineStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sortBy, sortOrder };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterFineStatus) params.fineStatus = filterFineStatus;
      const res = await transactionsAPI.getAll(params);
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterFineStatus, sortBy, sortOrder]);

  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  return (
    <div className="page">
      <PageHeader
        title="Transaction History"
        subtitle={`Total: ${pagination.total} transactions`}
      />

      <Alert message={error} type="error" onClose={() => setError('')} />

      {/* FR10: Search, filter, sort */}
      <div className="filter-bar">
        <SearchBar onSearch={setSearch} placeholder="Search student name, ID or book title..." />
        <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Issued">Issued</option>
          <option value="Overdue">Overdue</option>
          <option value="Returned">Returned</option>
        </select>
        <select className="form-select" value={filterFineStatus} onChange={(e) => setFilterFineStatus(e.target.value)}>
          <option value="">All Fines</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="None">None</option>
        </select>
        <select className="form-select" value={`${sortBy}-${sortOrder}`} onChange={(e) => {
          const [b, o] = e.target.value.split('-');
          setSortBy(b); setSortOrder(o);
        }}>
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="dueDate-asc">Due Date ↑</option>
          <option value="dueDate-desc">Due Date ↓</option>
          <option value="fineAmount-desc">Fine ↓</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading transactions..." />
      ) : transactions.length === 0 ? (
        <div className="empty-state"><p>📭 No transactions found.</p></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Book</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Overdue Days</th>
                  <th>Fine</th>
                  <th>Fine Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t._id} className={t.status === 'Overdue' ? 'row-overdue' : ''}>
                    <td className="text-muted">{(pagination.page - 1) * 15 + i + 1}</td>
                    <td>
                      <div className="fw-semibold">{t.userId?.name || '—'}</div>
                      <small className="text-muted">{t.userId?.studentId}</small>
                    </td>
                    <td>
                      <div>{t.bookId?.title || '—'}</div>
                      <small className="text-muted">{t.bookId?.isbn}</small>
                    </td>
                    <td>{formatDate(t.issueDate)}</td>
                    <td className={t.status === 'Overdue' ? 'text-danger' : ''}>{formatDate(t.dueDate)}</td>
                    <td>{t.returnDate ? formatDate(t.returnDate) : '—'}</td>
                    <td><Badge status={t.status} /></td>
                    <td className={t.overdueDays > 0 ? 'text-danger' : ''}>{t.overdueDays || 0}</td>
                    <td className={t.fineAmount > 0 ? 'text-danger' : ''}>{formatCurrency(t.fineAmount)}</td>
                    <td>
                      {t.fineStatus !== 'None'
                        ? <Badge status={t.fineStatus} />
                        : <span className="text-muted">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => fetchTransactions(p)} />
        </>
      )}
    </div>
  );
};

export default Transactions;
