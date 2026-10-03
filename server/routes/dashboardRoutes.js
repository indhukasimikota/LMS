const express = require('express');
const router = express.Router();
const { getDashboardStats, getStudentDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requireAdmin, requireStudent } = require('../middleware/role');

// GET /api/dashboard/stats  — Admin dashboard (SRS FR2)
router.get('/stats', protect, requireAdmin, getDashboardStats);

// GET /api/dashboard/student  — Student dashboard (SRS FR12)
router.get('/student', protect, requireStudent, getStudentDashboard);

module.exports = router;
