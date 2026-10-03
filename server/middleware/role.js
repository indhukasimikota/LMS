// RBAC — Role-Based Access Control middleware
// SRS Section 10: Role-based authorization

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Admin role required.' });
};

const requireStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Student role required.' });
};

const requireAdminOrStudent = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'student')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied.' });
};

module.exports = { requireAdmin, requireStudent, requireAdminOrStudent };
