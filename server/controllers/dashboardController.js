const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Helper: sync overdue statuses
const syncOverdueStatuses = async () => {
  const now = new Date();
  await Transaction.updateMany(
    { status: 'Issued', dueDate: { $lt: now } },
    { $set: { status: 'Overdue' } }
  );
};

// @desc    Get Admin dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    await syncOverdueStatuses();

    // FR2: Admin Dashboard metrics
    const [
      totalBooks,
      totalStudents,
      totalTransactions,
      issuedCount,
      overdueCount,
      fineAgg,
      availableBooksAgg,
    ] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: { $in: ['Issued', 'Overdue'] } }),
      Transaction.countDocuments({ status: 'Overdue' }),
      Transaction.aggregate([
        { $match: { fineStatus: 'Pending' } },
        { $group: { _id: null, total: { $sum: '$fineAmount' } } },
      ]),
      Book.aggregate([
        { $group: { _id: null, total: { $sum: '$availableCopies' } } },
      ]),
    ]);

    const totalFines = fineAgg.length > 0 ? fineAgg[0].total : 0;
    const availableBooks = availableBooksAgg.length > 0 ? availableBooksAgg[0].total : 0;

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .populate('userId', 'name studentId')
      .populate('bookId', 'title author')
      .sort({ createdAt: -1 })
      .limit(5);

    // Overdue books list
    const overdueTransactions = await Transaction.find({ status: 'Overdue' })
      .populate('userId', 'name studentId email')
      .populate('bookId', 'title author isbn')
      .sort({ dueDate: 1 })
      .limit(10);

    res.json({
      stats: {
        totalBooks,
        availableBooks,
        issuedBooks: issuedCount,
        totalStudents,
        overdueBooks: overdueCount,
        totalTransactions,
        totalFines,
      },
      recentTransactions,
      overdueTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Get Student dashboard data
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentDashboard = async (req, res) => {
  try {
    await syncOverdueStatuses();

    const userId = req.user._id;

    const [
      activeTransactions,
      overdueTransactions,
      totalBooksAvailable,
    ] = await Promise.all([
      Transaction.find({ userId, status: { $in: ['Issued', 'Overdue'] } })
        .populate('bookId', 'title author isbn coverImage category'),
      Transaction.find({ userId, status: 'Overdue' })
        .populate('bookId', 'title author isbn'),
      Book.countDocuments({ availableCopies: { $gt: 0 } }),
    ]);

    const fineAgg = await Transaction.aggregate([
      { $match: { userId, fineStatus: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$fineAmount' } } },
    ]);

    const currentFine = fineAgg.length > 0 ? fineAgg[0].total : 0;

    // Recent history (last 5 returned)
    const recentHistory = await Transaction.find({ userId, status: 'Returned' })
      .populate('bookId', 'title author isbn coverImage')
      .sort({ returnDate: -1 })
      .limit(5);

    res.json({
      student: req.user,
      stats: {
        totalBooksAvailable,
        issuedBooks: activeTransactions.length,
        overdueBooks: overdueTransactions.length,
        currentFine,
      },
      activeTransactions,
      overdueTransactions,
      recentHistory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = { getDashboardStats, getStudentDashboard };
