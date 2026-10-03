import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
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

  return (
    <div className="page">
      <PageHeader title="Browse Books" subtitle={`${pagination.total} books in library`} />
      <Alert message={error} type="error" onClose={() => setError('')} />

      <div className="filter-bar">
        <SearchBar onSearch={setSearch} placeholder="Search by title, author, ISBN, category..." />
        <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="form-select" value={filterAvailable} onChange={(e) => setFilterAvailable(e.target.value)}>
          <option value="">All</option>
          <option value="true">Available Only</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading books..." />
      ) : books.length === 0 ? (
        <div className="empty-state"><p>📭 No books found.</p></div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((b) => (
              <Link to={`/student/books/${b._id}`} key={b._id} className="book-card">
                <div className="book-card-cover">
                  {b.coverImage
                    ? <img src={b.coverImage} alt={b.title} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    : null}
                  <div className="book-card-cover-placeholder" style={{ display: b.coverImage ? 'none' : 'flex' }}>📖</div>
                </div>
                <div className="book-card-body">
                  <h4 className="book-card-title">{b.title}</h4>
                  <p className="book-card-author">{b.author}</p>
                  <p className="book-card-category">{b.category}</p>
                  <div className="book-card-footer">
                    <Badge status={b.availableCopies > 0 ? 'Available' : 'Not Available'} />
                    <span className="text-muted">{b.availableCopies}/{b.totalCopies}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={(p) => fetchBooks(p)} />
        </>
      )}
    </div>
  );
};

export default BrowseBooks;
