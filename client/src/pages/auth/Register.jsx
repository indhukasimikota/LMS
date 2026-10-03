import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      // FR1: After registration, redirect to student dashboard
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h1 className="auth-logo">📚 LibraryMS</h1>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register as a student to access the library.</p>
        </div>

        <Alert message={error} type="error" onClose={() => setError('')} />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name <span className="required">*</span></label>
              <input
                id="name" name="name" type="text"
                className="form-input" placeholder="John Doe"
                value={form.name} onChange={handleChange} required
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentId" className="form-label">Student ID</label>
              <input
                id="studentId" name="studentId" type="text"
                className="form-input" placeholder="e.g. STU001"
                value={form.studentId} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address <span className="required">*</span></label>
              <input
                id="email" name="email" type="email"
                className="form-input" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                autoComplete="email" required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                id="phone" name="phone" type="tel"
                className="form-input" placeholder="+91 9876543210"
                value={form.phone} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password <span className="required">*</span></label>
              <input
                id="password" name="password" type="password"
                className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange}
                autoComplete="new-password" required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="required">*</span></label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                className="form-input" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={handleChange}
                autoComplete="new-password" required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" text="Registering..." /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
