import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Home       from './pages/Home';
import Login      from './pages/auth/Login';
import Register   from './pages/auth/Register';
import NotFound   from './pages/NotFound';

// Shared
import Profile    from './pages/shared/Profile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Books          from './pages/admin/Books';
import Students       from './pages/admin/Students';
import IssueBook      from './pages/admin/IssueBook';
import ReturnBook     from './pages/admin/ReturnBook';
import Transactions   from './pages/admin/Transactions';
import Fines          from './pages/admin/Fines';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import BrowseBooks      from './pages/student/BrowseBooks';
import BookDetails      from './pages/student/BookDetails';
import MyIssuedBooks    from './pages/student/MyIssuedBooks';
import MyHistory        from './pages/student/MyHistory';
import MyFines          from './pages/student/MyFines';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* ── Public ─────────────────────────────────────── */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Admin routes ───────────────────────────────── */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin"                element={<AdminDashboard />} />
            <Route path="/admin/books"          element={<Books />} />
            <Route path="/admin/students"       element={<Students />} />
            <Route path="/admin/issue"          element={<IssueBook />} />
            <Route path="/admin/return"         element={<ReturnBook />} />
            <Route path="/admin/transactions"   element={<Transactions />} />
            <Route path="/admin/fines"          element={<Fines />} />
            <Route path="/admin/profile"        element={<Profile />} />
          </Route>
        </Route>

        {/* ── Student routes ─────────────────────────────── */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student"              element={<StudentDashboard />} />
            <Route path="/student/books"        element={<BrowseBooks />} />
            <Route path="/student/books/:id"    element={<BookDetails />} />
            <Route path="/student/issued"       element={<MyIssuedBooks />} />
            <Route path="/student/history"      element={<MyHistory />} />
            <Route path="/student/fines"        element={<MyFines />} />
            <Route path="/student/profile"      element={<Profile />} />
          </Route>
        </Route>

        {/* ── Catch-all ──────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
