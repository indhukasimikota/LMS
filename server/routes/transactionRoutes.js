const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getTransactions,
  getTransactionById,
  getMyTransactions,
  markFinePaid,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// POST /api/transactions/issue  — Admin only (SRS FR6)
router.post('/issue', protect, requireAdmin, issueBook);

// POST /api/transactions/return  — Admin only (SRS FR7)
router.post('/return', protect, requireAdmin, returnBook);

// GET  /api/transactions/my  — Student: own transactions (SRS FR12)
router.get('/my', protect, getMyTransactions);

// GET  /api/transactions  — Admin only (SRS FR10)
router.get('/', protect, requireAdmin, getTransactions);

// GET  /api/transactions/:id  — Admin or owner student
router.get('/:id', protect, getTransactionById);

// PUT  /api/transactions/:id/pay-fine  — Admin only (SRS FR9)
router.put('/:id/pay-fine', protect, requireAdmin, markFinePaid);

module.exports = router;
