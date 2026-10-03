const Book = require('../models/Book');

// @desc    Get all books with search and filter
// @route   GET /api/books
// @access  Private
const getBooks = async (req, res) => {
  try {
    const { search, category, author, available, page = 1, limit = 20 } = req.query;

    const query = {};

    // FR4: Search by title, author, ISBN, category
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters: category, author, availability
    if (category) query.category = { $regex: category, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (available === 'true') query.availableCopies = { $gt: 0 };
    if (available === 'false') query.availableCopies = 0;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      books,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Private
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    res.json({ book });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  try {
    const {
      title, author, isbn, category, publisher,
      publicationYear, totalCopies, availableCopies,
      shelfNumber, description, coverImage,
    } = req.body;

    // FR3: ISBN must be unique
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'A book with this ISBN already exists.' });
    }

    // FR3: availableCopies must not exceed totalCopies
    const avail = availableCopies !== undefined ? parseInt(availableCopies) : parseInt(totalCopies);
    if (avail > parseInt(totalCopies)) {
      return res.status(400).json({ message: 'Available copies cannot exceed total copies.' });
    }
    if (avail < 0) {
      return res.status(400).json({ message: 'Available copies cannot be negative.' });
    }

    const book = await Book.create({
      title, author, isbn, category, publisher,
      publicationYear, totalCopies: parseInt(totalCopies),
      availableCopies: avail,
      shelfNumber, description, coverImage,
    });

    res.status(201).json({ message: 'Book added successfully.', book });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });

    const {
      title, author, isbn, category, publisher,
      publicationYear, totalCopies, availableCopies,
      shelfNumber, description, coverImage,
    } = req.body;

    // If ISBN is being changed, check uniqueness
    if (isbn && isbn !== book.isbn) {
      const existing = await Book.findOne({ isbn });
      if (existing) return res.status(400).json({ message: 'ISBN already in use.' });
    }

    const newTotal = totalCopies !== undefined ? parseInt(totalCopies) : book.totalCopies;
    const newAvail = availableCopies !== undefined ? parseInt(availableCopies) : book.availableCopies;

    if (newAvail > newTotal) {
      return res.status(400).json({ message: 'Available copies cannot exceed total copies.' });
    }
    if (newAvail < 0) {
      return res.status(400).json({ message: 'Available copies cannot be negative.' });
    }

    Object.assign(book, {
      title: title || book.title,
      author: author || book.author,
      isbn: isbn || book.isbn,
      category: category || book.category,
      publisher: publisher !== undefined ? publisher : book.publisher,
      publicationYear: publicationYear !== undefined ? publicationYear : book.publicationYear,
      totalCopies: newTotal,
      availableCopies: newAvail,
      shelfNumber: shelfNumber !== undefined ? shelfNumber : book.shelfNumber,
      description: description !== undefined ? description : book.description,
      coverImage: coverImage !== undefined ? coverImage : book.coverImage,
    });

    await book.save();
    res.json({ message: 'Book updated successfully.', book });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });

    // FIX: Guard against deleting a book that has active (Issued/Overdue) transactions.
    // Deleting such a book would leave dangling bookId references in transactions.
    const Transaction = require('../models/Transaction');
    const activeCount = await Transaction.countDocuments({
      bookId: book._id,
      status: { $in: ['Issued', 'Overdue'] },
    });
    if (activeCount > 0) {
      return res.status(400).json({
        message: `Cannot delete this book — it is currently issued to ${activeCount} student(s). Return all copies before deleting.`,
      });
    }

    await book.deleteOne();
    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Get distinct book categories
// @route   GET /api/books/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook, getCategories };
