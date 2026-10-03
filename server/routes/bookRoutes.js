const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// GET /api/books/categories  (must be before /:id)
router.get('/categories', protect, getCategories);

// GET  /api/books  — any authenticated user
router.get('/', protect, getBooks);

// GET  /api/books/:id  — any authenticated user
router.get('/:id', protect, getBookById);

// POST /api/books  — Admin only
router.post('/', protect, requireAdmin, createBook);

// PUT  /api/books/:id  — Admin only
router.put('/:id', protect, requireAdmin, updateBook);

// DELETE /api/books/:id  — Admin only
router.delete('/:id', protect, requireAdmin, deleteBook);

module.exports = router;
