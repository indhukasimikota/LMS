const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  updateStudent,
  deactivateStudent,
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// All student management routes are Admin-only (SRS FR5)

// GET  /api/students
router.get('/', protect, requireAdmin, getStudents);

// GET  /api/students/:id
router.get('/:id', protect, requireAdmin, getStudentById);

// PUT  /api/students/:id
router.put('/:id', protect, requireAdmin, updateStudent);

// DELETE /api/students/:id  — deactivates account
router.delete('/:id', protect, requireAdmin, deactivateStudent);

module.exports = router;
