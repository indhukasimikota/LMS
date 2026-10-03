import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // initial auth check

  // ── Bootstrap: load from localStorage on mount ───────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('lms_token');
    const storedUser = localStorage.getItem('lms_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
      }
    }
    setLoading(false);
  }, []);

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const res = await authAPI.register(formData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('lms_token', newToken);
    localStorage.setItem('lms_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    const res = await authAPI.login(formData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('lms_token', newToken);
    localStorage.setItem('lms_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setToken(null);
    setUser(null);
  }, []);

  // ── Refresh profile from server ───────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      const updatedUser = res.data.user;
      localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch {
      logout();
    }
  }, [logout]);

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isStudent,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
