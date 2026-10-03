import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { booksAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    booksAPI.getById(id)
      .then((r) => setBook(r.data.book))
      .catch((err) => setError(err.response?.data?.message || 'Book not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (error) return (
    <div className="page">
      <Alert message={error} type="error" />
      <Link to="/student/books" className="btn btn-outline mt-3">← Back to Books</Link>
    </div>
  );

  return (
    <div className="page">
      <Link to="/student/books" className="btn btn-outline mb-4">← Back to Books</Link>

      <div className="book-detail-card card">
        <div className="book-detail-layout">
          <div className="book-detail-cover">
            {book.coverImage
              ? <img src={book.coverImage} alt={book.title} onError={(e) => e.target.style.display='none'} />
              : <div className="book-cover-lg-placeholder">📖</div>}
          </div>

          <div className="book-detail-info">
            <h1 className="book-detail-title">{book.title}</h1>
            <p className="book-detail-author">by <strong>{book.author}</strong></p>
            <div className="book-detail-meta">
              <div className="meta-item"><span className="meta-label">ISBN</span><code>{book.isbn}</code></div>
              <div className="meta-item"><span className="meta-label">Category</span>{book.category}</div>
              {book.publisher && <div className="meta-item"><span className="meta-label">Publisher</span>{book.publisher}</div>}
              {book.publicationYear && <div className="meta-item"><span className="meta-label">Year</span>{book.publicationYear}</div>}
              {book.shelfNumber && <div className="meta-item"><span className="meta-label">Shelf</span>{book.shelfNumber}</div>}
            </div>

            <div className="book-availability">
              <Badge status={book.availableCopies > 0 ? 'Available' : 'Not Available'} />
              <span className="ml-3">
                <strong>{book.availableCopies}</strong> of <strong>{book.totalCopies}</strong> copies available
              </span>
            </div>

            {book.description && (
              <div className="book-description">
                <h4>Description</h4>
                <p>{book.description}</p>
              </div>
            )}

            {book.availableCopies === 0 && (
              <div className="alert alert-warning mt-3">
                All copies are currently issued. Please check back later.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
