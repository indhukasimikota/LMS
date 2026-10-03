import React, { useState, useEffect, useCallback } from 'react';
import { booksAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Badge from '../../components/Badge';

const EMPTY_FORM = {
  title: '', author: '', isbn: '', category: '', publisher: '',
  publicationYear: '', totalCopies: '', availableCopies: '',
  shelfNumber: '', description: '', coverImage: '',
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterAvailable) params.available = filterAvailable;
      const res = await booksAPI.getAll(params);
      setBooks(res.data.books);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load books.');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterAvailable]);

  useEffect(() => { fetchBooks(1); }, [fetchBooks]);

  useEffect(() => {
    booksAPI.getCategories().then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title, author: book.author, isbn: book.isbn,
      category: book.category, publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      totalCopies: book.totalCopies, availableCopies: book.availableCopies,
      shelfNumber: book.shelfNumber || '', description: book.description || '',
      coverImage: book.coverImage || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.isbn || !form.category || !form.totalCopies) {
      setFormError('Title, Author, ISBN, Category and Total Copies are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingBook) {
        await booksAPI.update(editingBook._id, form);
        setSuccess('Book updated successfully.');
      } else {
        await booksAPI.create(form);
        setSuccess('Book added successfully.');
      }
      setModalOpen(false);
      fetchBooks(pagination.page);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await booksAPI.delete(deleteTarget._id);
      setSuccess(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchBooks(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Book Management"
        subtitle="Add, edit, search and manage the book catalogue"
        action={<button className="btn btn-primary" onClick={openAddModal}>+ Add Book</button>}
      />

      <Alert message={success} type="success" onClose={() => setSuccess('')} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      {/* FR4: Search and Filters */}
      <div className="filter-bar">
        <SearchBar onSearch={setSearch} placeholder="Search by title, author, ISBN, category..." />
        <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={filterAvailable} onChange={(e) => setFilterAvailable(e.target.value)}>
          <option value="">All Availability</option>
          <option value="true">Available</option>
          <option value="false">Not Available</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading books..." />
      ) : books.length === 0 ? (
        <div className="empty-state">
          <p>📭 No books found.</p>
          <button className="btn btn-primary" onClick={openAddModal}>Add First Book</button>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th><th>Author</th><th>ISBN</th><th>Category</th>
                  <th>Available</th><th>Total</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="book-title-cell">
                        {b.coverImage
                          ? <img src={b.coverImage} alt={b.title} className="book-thumb" onError={(e) => e.target.style.display='none'} />
                          : <span className="book-thumb-placeholder">📖</span>
                        }
                        <div>
                          <div className="fw-semibold">{b.title}</div>
                          {b.shelfNumber && <small className="text-muted">Shelf: {b.shelfNumber}</small>}
                        </div>
                      </div>
                    </td>
                    <td>{b.author}</td>
                    <td><code>{b.isbn}</code></td>
                    <td>{b.category}</td>
                    <td className={b.availableCopies === 0 ? 'text-danger' : 'text-success'}>{b.availableCopies}</td>
                    <td>{b.totalCopies}</td>
                    <td><Badge status={b.availableCopies > 0 ? 'Available' : 'Not Available'} /></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openEditModal(b)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteTarget(b)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => fetchBooks(p)} />
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingBook ? 'Edit Book' : 'Add New Book'} size="lg">
        <Alert message={formError} type="error" onClose={() => setFormError('')} />
        <form onSubmit={handleSave} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input name="title" className="form-input" value={form.title} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Author *</label>
              <input name="author" className="form-input" value={form.author} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ISBN *</label>
              <input name="isbn" className="form-input" value={form.isbn} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input name="category" className="form-input" value={form.category} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Publisher</label>
              <input name="publisher" className="form-input" value={form.publisher} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Publication Year</label>
              <input name="publicationYear" type="number" className="form-input" value={form.publicationYear} onChange={handleFormChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Copies *</label>
              <input name="totalCopies" type="number" min="1" className="form-input" value={form.totalCopies} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Available Copies *</label>
              <input name="availableCopies" type="number" min="0" className="form-input" value={form.availableCopies} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Shelf Number</label>
              <input name="shelfNumber" className="form-input" value={form.shelfNumber} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Cover Image URL</label>
              <input name="coverImage" className="form-input" value={form.coverImage} onChange={handleFormChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" rows="3" value={form.description} onChange={handleFormChange} />
          </div>
          <div className="modal-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Book"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default Books;
