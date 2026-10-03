import React, { useState, useEffect } from 'react';
import { transactionsAPI, studentsAPI, booksAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toInputDate } from '../../utils/helpers';

const today = () => new Date().toISOString().split('T')[0];
const defaultDue = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14); // 2 weeks default
  return d.toISOString().split('T')[0];
};

const IssueBook = () => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ userId: '', bookId: '', issueDate: today(), dueDate: defaultDue() });
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [issued, setIssued] = useState(null); // last issued transaction

  // Load students on search
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await studentsAPI.getAll({ search: studentSearch, limit: 20 });
        setStudents(res.data.students.filter((s) => s.isActive));
      } catch { setStudents([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [studentSearch]);

  // Load available books on search
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await booksAPI.getAll({ search: bookSearch, available: 'true', limit: 20 });
        setBooks(res.data.books);
      } catch { setBooks([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [bookSearch]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.bookId) { setError('Please select a student and a book.'); return; }
    if (!form.issueDate || !form.dueDate) { setError('Issue date and due date are required.'); return; }
    if (new Date(form.dueDate) <= new Date(form.issueDate)) { setError('Due date must be after issue date.'); return; }

    setLoading(true);
    try {
      const res = await transactionsAPI.issue(form);
      setIssued(res.data.transaction);
      setSuccess(`Book "${res.data.transaction.bookId?.title}" issued to ${res.data.transaction.userId?.name} successfully.`);
      setForm({ userId: '', bookId: '', issueDate: today(), dueDate: defaultDue() });
      setStudentSearch(''); setBookSearch('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book.');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find((s) => s._id === form.userId);
  const selectedBook = books.find((b) => b._id === form.bookId);

  return (
    <div className="page">
      <PageHeader title="Issue Book" subtitle="Issue a book to a student (max 3 active books per student)" />

      <Alert message={success} type="success" onClose={() => setSuccess('')} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      <div className="issue-grid">
        <div className="card">
          <div className="card-header"><h3>Issue Book Form</h3></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Student select */}
              <div className="form-group">
                <label className="form-label">Search & Select Student *</label>
                <input
                  className="form-input"
                  placeholder="Type student name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                {students.length > 0 && (
                  <select
                    name="userId"
                    className="form-select mt-1"
                    value={form.userId}
                    onChange={handleChange}
                    size={Math.min(students.length, 5)}
                  >
                    <option value="">— Select Student —</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} {s.studentId ? `(${s.studentId})` : ''} — {s.activeIssuedBooks ?? 0}/3 books
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Book select */}
              <div className="form-group">
                <label className="form-label">Search & Select Book *</label>
                <input
                  className="form-input"
                  placeholder="Type book title or author..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
                {books.length > 0 && (
                  <select
                    name="bookId"
                    className="form-select mt-1"
                    value={form.bookId}
                    onChange={handleChange}
                    size={Math.min(books.length, 5)}
                  >
                    <option value="">— Select Book —</option>
                    {books.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title} by {b.author} — {b.availableCopies} available
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input type="date" name="issueDate" className="form-input" value={form.issueDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input type="date" name="dueDate" className="form-input" value={form.dueDate} onChange={handleChange} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" text="Issuing..." /> : '➕ Issue Book'}
              </button>
            </form>
          </div>
        </div>

        {/* Preview panel */}
        <div className="card">
          <div className="card-header"><h3>Selection Preview</h3></div>
          <div className="card-body">
            {selectedStudent ? (
              <div className="preview-section">
                <h4>👤 Student</h4>
                <p className="fw-semibold">{selectedStudent.name}</p>
                <p className="text-muted">{selectedStudent.email}</p>
                <p>Active books: <strong>{selectedStudent.activeIssuedBooks ?? 0}/3</strong></p>
              </div>
            ) : <p className="text-muted">No student selected.</p>}

            <div className="preview-divider" />

            {selectedBook ? (
              <div className="preview-section">
                <h4>📚 Book</h4>
                <p className="fw-semibold">{selectedBook.title}</p>
                <p className="text-muted">by {selectedBook.author}</p>
                <p>Available: <strong className="text-success">{selectedBook.availableCopies}</strong></p>
                <p>ISBN: <code>{selectedBook.isbn}</code></p>
              </div>
            ) : <p className="text-muted">No book selected.</p>}

            {issued && (
              <div className="issue-receipt">
                <h4>✅ Last Issued</h4>
                <p><strong>Book:</strong> {issued.bookId?.title}</p>
                <p><strong>Student:</strong> {issued.userId?.name}</p>
                <p><strong>Due:</strong> {new Date(issued.dueDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueBook;
