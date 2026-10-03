const mongoose = require('mongoose');

// SRS Section 6.3 - Transaction Collection
const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    // Status: Issued, Overdue, Returned
    status: {
      type: String,
      enum: ['Issued', 'Overdue', 'Returned'],
      default: 'Issued',
    },
    overdueDays: {
      type: Number,
      default: 0,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    // Fine status: Pending or Paid
    fineStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'None'],
      default: 'None',
    },
    finePerDay: {
      type: Number,
      default: 5, // Rs. 5 per day as per SRS example
    },
  },
  {
    timestamps: true,
  }
);

// Virtual: dueDateStatus (On Time / Due Soon / Overdue / Returned)
transactionSchema.virtual('dueDateStatus').get(function () {
  if (this.status === 'Returned') return 'Returned';
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= 3) return 'Due Soon';
  return 'On Time';
});

transactionSchema.set('toJSON', { virtuals: true });
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transaction', transactionSchema);
