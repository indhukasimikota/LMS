import React, { useState, useEffect, useCallback } from 'react';
import { studentsAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate, formatCurrency } from '../../utils/helpers';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', studentId: '' });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await studentsAPI.getAll(params);
      setStudents(res.data.students);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchStudents(1); }, [fetchStudents]);

  const openEdit = (s) => {
    setEditStudent(s);
    setEditForm({ name: s.name, phone: s.phone || '', studentId: s.studentId || '' });
    setEditError('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) { setEditError('Name is required.'); return; }
    setSaving(true);
    try {
      await studentsAPI.update(editStudent._id, editForm);
      setSuccess('Student updated.');
      setEditStudent(null);
      fetchStudents(pagination.page);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await studentsAPI.deactivate(deactivateTarget._id);
      setSuccess(`${deactivateTarget.name}'s account deactivated.`);
      setDeactivateTarget(null);
      fetchStudents(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Deactivation failed.');
      setDeactivateTarget(null);
    }
  };

  const openView = async (s) => {
    try {
      const res = await studentsAPI.getById(s._id);
      setViewStudent(res.data.student);
    } catch {
      setViewStudent(s);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Student Management" subtitle="View, edit and manage student accounts" />

      <Alert message={success} type="success" onClose={() => setSuccess('')} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      <div className="filter-bar">
        <SearchBar onSearch={setSearch} placeholder="Search by name, email, student ID..." />
      </div>

      {loading ? (
        <LoadingSpinner text="Loading students..." />
      ) : students.length === 0 ? (
        <div className="empty-state"><p>📭 No students found.</p></div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th><th>Student ID</th><th>Email</th><th>Phone</th>
                  <th>Active Books</th><th>Fine</th><th>Status</th><th>Registered</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id} className={!s.isActive ? 'row-inactive' : ''}>
                    <td className="fw-semibold">{s.name}</td>
                    <td><code>{s.studentId || '—'}</code></td>
                    <td>{s.email}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.activeIssuedBooks ?? 0}</td>
                    <td className={s.currentFine > 0 ? 'text-danger' : ''}>{formatCurrency(s.currentFine)}</td>
                    <td>
                      <span className={`badge ${s.isActive ? 'badge-available' : 'badge-overdue'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openView(s)}>View</button>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(s)}>Edit</button>
                        {s.isActive && (
                          <button className="btn btn-sm btn-danger" onClick={() => setDeactivateTarget(s)}>Deactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => fetchStudents(p)} />
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewStudent} onClose={() => setViewStudent(null)} title="Student Details">
        {viewStudent && (
          <div className="student-detail">
            <div className="profile-avatar-lg">{viewStudent.name?.charAt(0).toUpperCase()}</div>
            <table className="info-table">
              <tbody>
                <tr><td className="info-label">Name</td><td>{viewStudent.name}</td></tr>
                <tr><td className="info-label">Email</td><td>{viewStudent.email}</td></tr>
                <tr><td className="info-label">Student ID</td><td>{viewStudent.studentId || '—'}</td></tr>
                <tr><td className="info-label">Phone</td><td>{viewStudent.phone || '—'}</td></tr>
                <tr><td className="info-label">Status</td><td>{viewStudent.isActive ? 'Active' : 'Inactive'}</td></tr>
                <tr><td className="info-label">Registered</td><td>{formatDate(viewStudent.createdAt)}</td></tr>
                <tr><td className="info-label">Current Fine</td><td className="text-danger">{formatCurrency(viewStudent.currentFine)}</td></tr>
              </tbody>
            </table>
            {viewStudent.issuedBooks?.length > 0 && (
              <div className="mt-3">
                <h4>Currently Issued Books</h4>
                <ul className="issued-list">
                  {viewStudent.issuedBooks.map((t) => (
                    <li key={t._id}>{t.bookId?.title} <span className="badge badge-issued">Issued</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student">
        <Alert message={editError} type="error" onClose={() => setEditError('')} />
        <form onSubmit={handleEditSave}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <input className="form-input" value={editForm.studentId} onChange={(e) => setEditForm(p => ({ ...p, studentId: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setEditStudent(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        title="Deactivate Student"
        message={`Deactivate account for "${deactivateTarget?.name}"? They will not be able to log in.`}
        confirmLabel="Deactivate"
        danger
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
};

export default Students;
