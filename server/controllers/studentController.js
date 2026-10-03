const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get all students with search
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Attach active issued books count and current fine to each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const activeTransactions = await Transaction.find({
          userId: student._id,
          status: { $in: ['Issued', 'Overdue'] },
        }).countDocuments();

        const fineAgg = await Transaction.aggregate([
          {
            $match: {
              userId: student._id,
              fineStatus: 'Pending',
            },
          },
          { $group: { _id: null, total: { $sum: '$fineAmount' } } },
        ]);

        return {
          ...student.toJSON(),
          activeIssuedBooks: activeTransactions,
          currentFine: fineAgg.length > 0 ? fineAgg[0].total : 0,
        };
      })
    );

    res.json({
      students: studentsWithDetails,
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

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private/Admin
const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const activeTransactions = await Transaction.find({
      userId: student._id,
      status: { $in: ['Issued', 'Overdue'] },
    }).populate('bookId', 'title author isbn');

    const fineAgg = await Transaction.aggregate([
      { $match: { userId: student._id, fineStatus: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$fineAmount' } } },
    ]);

    res.json({
      student: {
        ...student.toJSON(),
        issuedBooks: activeTransactions,
        currentFine: fineAgg.length > 0 ? fineAgg[0].total : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Update student details (Admin)
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const { name, phone, studentId, isActive } = req.body;

    if (studentId && studentId !== student.studentId) {
      const exists = await User.findOne({ studentId });
      if (exists) return res.status(400).json({ message: 'Student ID already in use.' });
      student.studentId = studentId;
    }

    if (name) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (isActive !== undefined) student.isActive = isActive;

    await student.save();
    res.json({ message: 'Student updated successfully.', student });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

// @desc    Deactivate student account
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deactivateStudent = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    student.isActive = false;
    await student.save();

    res.json({ message: 'Student account deactivated.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error.' });
  }
};

module.exports = { getStudents, getStudentById, updateStudent, deactivateStudent };
