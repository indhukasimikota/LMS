import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import Alert from '../../components/Alert';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setSuccess(''); setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      await refreshUser();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <PageHeader title="My Profile" subtitle="View and update your account details" />

      <div className="profile-grid">
        {/* Info card */}
        <div className="card">
          <div className="card-header"><h3>Account Information</h3></div>
          <div className="card-body profile-info">
            <div className="profile-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
            <table className="info-table">
              <tbody>
                <tr><td className="info-label">Name</td><td>{user?.name}</td></tr>
                <tr><td className="info-label">Email</td><td>{user?.email}</td></tr>
                {user?.studentId && <tr><td className="info-label">Student ID</td><td>{user.studentId}</td></tr>}
                <tr><td className="info-label">Phone</td><td>{user?.phone || '—'}</td></tr>
                <tr><td className="info-label">Role</td><td><span className={`role-badge ${user?.role}`}>{user?.role}</span></td></tr>
                <tr><td className="info-label">Registered</td><td>{formatDate(user?.createdAt)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit card */}
        <div className="card">
          <div className="card-header"><h3>Edit Profile</h3></div>
          <div className="card-body">
            <Alert message={success} type="success" onClose={() => setSuccess('')} />
            <Alert message={error} type="error" onClose={() => setError('')} />

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-input" value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input name="phone" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" text="Saving..." /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
