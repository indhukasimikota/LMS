const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');

const FINE_PER_DAY = 5; // Rs. 5 per day (SRS FR9 example)
const MAX_BORROW_LIMIT = 3; // SRS Section 11

// Helper: calculate overdue days and fine
const calculateFine = (dueDate, returnDate) => {
  const due = new Date(dueDate);
  const ret = new Date(returnDate);
  const diffMs = ret - due;
  const overdueDays = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
  const fineAmount = overdueDays * FINE_PER_DAY;
  return { overdueDays, fineAmount };
};

// Helper: update transaction statuses (mark overdue)
const syncOverdueStatuses = async () => {
  const now = new Date();
  await Transaction.updateMany(
    { status: 'Issued', dueDate: { $lt: now } },
    { $set: { status: 'Overdue' } }
  );
};

// @desc    Issue a book to a student
// @route   POST /api/transactions/issue
// @access  Private/Admin
const issueBook = async (req, res) => {
  try {
    const { userId, bookId, issueDate, dueDate } = req.body;

    if (!userId || !bookId || !issueDate || !dueDate) {
      return res.status(400).json({ message: 'userId, bookId, issueDate and dueDate are required.' });
    }

    // FR6: Verify student exists
    const student = await User.findOne({ _id: userId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    if (!student.isActive) return res.status(400).json({ message: 'Student account is deactivated.' });

    // FR6: Verify book exists and is available
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found.' });
    if (book.availableCopies < 1) {
      return res.status(400).json({ message: 'No available copies of this book.' });
    }

    // FR6: Validate due date is after issue date
    if (new Date(dueDate) <= new Date(issueDate)) {
      return res.status(400).json({ message: 'Due date must be after issue date.' });
    }

    // Section 11: Check borrowing limit (max 3 active books)
    const activeCount = await Transaction.countDocuments({
      userId,
      status: { $in: ['Issued', 'Overdue'] },
    });
    if (activeCount >= MAX_BORROW_LIMIT) {
      return res.status(400).json({
        message: `Borrowing limit reached. A student can have at most ${MAX_BORROW_LIMIT} active books.`,
      });
    }

    // Section 11: Check duplicate active borrowing
    const duplicate = await Transaction.findOne({
      userId,
      bookId,
      status: { $in: ['Issued', 'Overdue'] },
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Student already has an active issue of this book.' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      bookId,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      status: 'Issued',
      finePerDay: FINE_PER_DAY,
    });

    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();

    const populated = await Transaction.findById(transaction._id)
      .populate('userId', 'name email studentId')
      .populate('bookId', 'title author isbn');

    res.status(201).json({ message: 'Book issued successfully.', transaction: populated });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Return a book
// @route   POST /api/transactions/return
// @access  Private/Admin
const returnBook = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'transactionId is required.' });
    }

    const transaction = await Transaction.findById(transactionId)
      .populate('userId', 'name email studentId')
      .populate('bookId', 'title author isbn');

    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

    // FR7: Prevent duplicate returns
    if (transaction.status === 'Returned') {
      return res.status(400).json({ message: 'This book has already been returned.' });
    }

    const returnDate = new Date();
    const { overdueDays, fineAmount } = calculateFine(transaction.dueDate, returnDate);

    // FR7: Update transaction
    transaction.returnDate = returnDate;
    transaction.status = 'Returned';
    transaction.overdueDays = overdueDays;
    transaction.fineAmount = fineAmount;
    transaction.fineStatus = fineAmount > 0 ? 'Pending' : 'None';
    await transaction.save();

    // FR7: Increase available copies
    const book = await Book.findById(transaction.bookId._id || transaction.bookId);
    if (book) {
      book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
      await book.save();
    }

    res.json({
      message: 'Book returned successfully.',
      transaction,
      fine: { overdueDays, fineAmount, fineStatus: transaction.fineStatus },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Get all transactions with search, filter, sort, pagination
// @route   GET /api/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
  try {
    await syncOverdueStatuses();

    const {
      search, status, fineStatus,
      page = 1, limit = 20,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    // Build DB-level query (status / fineStatus filters)
    const query = {};
    if (status) query.status = status;
    if (fineStatus) query.fineStatus = fineStatus;

    // FIX: When search is provided, resolve matching userIds and bookIds first
    // so that pagination total reflects the actual filtered count.
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const [matchingUsers, matchingBooks] = await Promise.all([
        User.find({
          role: 'student',
          $or: [{ name: searchRegex }, { studentId: searchRegex }, { email: searchRegex }],
        }).select('_id'),
        require('../models/Book').find({
          $or: [{ title: searchRegex }, { isbn: searchRegex }],
        }).select('_id'),
      ]);

      const userIds = matchingUsers.map((u) => u._id);
      const bookIds = matchingBooks.map((b) => b._id);

      query.$or = [
        { userId: { $in: userIds } },
        { bookId: { $in: bookIds } },
      ];
    }

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortDir };
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // total now reflects filtered count accurately
    const [total, results] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query)
        .populate('userId', 'name email studentId')
        .populate('bookId', 'title author isbn')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
    ]);

    res.json({
      transactions: results,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('userId', 'name email studentId phone')
      .populate('bookId', 'title author isbn category');

    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

    // Students can only view their own transactions
    if (req.user.role === 'student' && transaction.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Get transactions for logged-in student
// @route   GET /api/transactions/my
// @access  Private/Student
const getMyTransactions = async (req, res) => {
  try {
    await syncOverdueStatuses();

    const { status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .populate('bookId', 'title author isbn category coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      transactions,
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

// @desc    Mark fine as Paid
// @route   PUT /api/transactions/:id/pay-fine
// @access  Private/Admin
const markFinePaid = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });

    if (transaction.fineStatus !== 'Pending') {
      return res.status(400).json({ message: 'Fine is not in Pending status.' });
    }

    transaction.fineStatus = 'Paid';
    await transaction.save();

    res.json({ message: 'Fine marked as Paid.', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = { issueBook, returnBook, getTransactions, getTransactionById, getMyTransactions, markFinePaid };
