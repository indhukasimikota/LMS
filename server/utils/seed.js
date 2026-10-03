require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User        = require('../models/User');
const Book        = require('../models/Book');
const Transaction = require('../models/Transaction');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Seeding database...');

  // Clear existing data
  await Transaction.deleteMany({});
  await Book.deleteMany({});
  await User.deleteMany({});
  console.log('✅ Cleared existing data');

  // ── Admin ──────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Library Admin',
    email: 'admin@library.com',
    password: 'admin123',
    role: 'admin',
    phone: '9000000001',
  });
  console.log('✅ Admin created: admin@library.com / admin123');

  // ── Students ───────────────────────────────────────────────────
  const studentData = [
    { name: 'Alice Johnson',  email: 'alice@student.com',   studentId: 'STU001', phone: '9001111111' },
    { name: 'Bob Smith',      email: 'bob@student.com',     studentId: 'STU002', phone: '9001111112' },
    { name: 'Carol Williams', email: 'carol@student.com',   studentId: 'STU003', phone: '9001111113' },
    { name: 'David Brown',    email: 'david@student.com',   studentId: 'STU004', phone: '9001111114' },
    { name: 'Eva Martinez',   email: 'student@library.com', studentId: 'STU005', phone: '9001111115' },
  ];

  const students = await User.create(
    studentData.map((s) => ({ ...s, password: 'student123', role: 'student' }))
  );
  console.log('✅ 5 Students created — password: student123');
  console.log('   Demo student: student@library.com / student123');

  // ── Books ──────────────────────────────────────────────────────
  const booksData = [
    { title: 'The Great Gatsby',         author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Fiction',       publisher: 'Scribner',       publicationYear: 1925, totalCopies: 5, availableCopies: 4, shelfNumber: 'A-01', description: 'A story of the fabulously wealthy Jay Gatsby and his love for Daisy Buchanan.' },
    { title: 'To Kill a Mockingbird',    author: 'Harper Lee',          isbn: '978-0061935466', category: 'Fiction',       publisher: 'HarperCollins',  publicationYear: 1960, totalCopies: 4, availableCopies: 3, shelfNumber: 'A-02', description: 'The story of racial injustice and the loss of innocence in the American South.' },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', publisher: 'MIT Press',    publicationYear: 2009, totalCopies: 3, availableCopies: 2, shelfNumber: 'C-01', description: 'A comprehensive textbook on algorithms and data structures.' },
    { title: 'Clean Code',               author: 'Robert C. Martin',    isbn: '978-0132350884', category: 'Computer Science', publisher: 'Prentice Hall', publicationYear: 2008, totalCopies: 4, availableCopies: 4, shelfNumber: 'C-02', description: 'A handbook of agile software craftsmanship.' },
    { title: 'The Alchemist',            author: 'Paulo Coelho',        isbn: '978-0062315007', category: 'Fiction',       publisher: 'HarperOne',     publicationYear: 1988, totalCopies: 6, availableCopies: 5, shelfNumber: 'A-03', description: 'A philosophical novel about a young shepherd on a journey.' },
    { title: 'Sapiens',                  author: 'Yuval Noah Harari',   isbn: '978-0062316097', category: 'History',       publisher: 'Harper',         publicationYear: 2011, totalCopies: 3, availableCopies: 3, shelfNumber: 'H-01', description: 'A brief history of humankind from the Stone Age to the modern era.' },
    { title: 'Atomic Habits',            author: 'James Clear',         isbn: '978-0735211292', category: 'Self-Help',     publisher: 'Avery',          publicationYear: 2018, totalCopies: 5, availableCopies: 4, shelfNumber: 'S-01', description: 'An easy and proven way to build good habits and break bad ones.' },
    { title: 'Design Patterns',          author: 'Gang of Four',        isbn: '978-0201633610', category: 'Computer Science', publisher: 'Addison-Wesley', publicationYear: 1994, totalCopies: 3, availableCopies: 3, shelfNumber: 'C-03', description: 'Elements of reusable object-oriented software.' },
    { title: 'A Brief History of Time',  author: 'Stephen Hawking',     isbn: '978-0553380163', category: 'Science',       publisher: 'Bantam',         publicationYear: 1988, totalCopies: 4, availableCopies: 4, shelfNumber: 'SC-01', description: 'An exploration of the universe, black holes and the nature of time.' },
    { title: 'The Psychology of Money',  author: 'Morgan Housel',       isbn: '978-0857197689', category: 'Finance',       publisher: 'Harriman House', publicationYear: 2020, totalCopies: 4, availableCopies: 3, shelfNumber: 'F-01', description: 'Timeless lessons on wealth, greed, and happiness.' },
  ];

  const books = await Book.create(booksData);
  console.log('✅ 10 Books created');

  // ── Sample Transactions ────────────────────────────────────────
  const now = new Date();

  // Alice — issued The Great Gatsby (on time)
  const t1Due = new Date(now); t1Due.setDate(t1Due.getDate() + 7);
  await Transaction.create({
    userId: students[0]._id, bookId: books[0]._id,
    issueDate: new Date(now.getTime() - 3 * 86400000),
    dueDate: t1Due, status: 'Issued',
  });
  books[0].availableCopies -= 1;
  await books[0].save();

  // Bob — issued Clean Code, overdue
  const t2Due = new Date(now); t2Due.setDate(t2Due.getDate() - 5);
  const t2 = await Transaction.create({
    userId: students[1]._id, bookId: books[3]._id,
    issueDate: new Date(now.getTime() - 20 * 86400000),
    dueDate: t2Due, status: 'Overdue',
    overdueDays: 5, fineAmount: 25, fineStatus: 'Pending',
  });
  books[3].availableCopies -= 1;
  await books[3].save();

  // Carol — returned The Alchemist
  await Transaction.create({
    userId: students[2]._id, bookId: books[4]._id,
    issueDate: new Date(now.getTime() - 30 * 86400000),
    dueDate:   new Date(now.getTime() - 16 * 86400000),
    returnDate: new Date(now.getTime() - 14 * 86400000),
    status: 'Returned', overdueDays: 2, fineAmount: 10, fineStatus: 'Paid',
  });

  // Eva (demo student) — issued Atomic Habits
  const t4Due = new Date(now); t4Due.setDate(t4Due.getDate() + 10);
  await Transaction.create({
    userId: students[4]._id, bookId: books[6]._id,
    issueDate: new Date(now.getTime() - 4 * 86400000),
    dueDate: t4Due, status: 'Issued',
  });
  books[6].availableCopies -= 1;
  await books[6].save();

  console.log('✅ Sample transactions created');

  console.log('\n═══════════════════════════════════════');
  console.log('  🎉 Database seeded successfully!');
  console.log('═══════════════════════════════════════');
  console.log('  Admin:   admin@library.com   / admin123');
  console.log('  Student: student@library.com / student123');
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
};

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
