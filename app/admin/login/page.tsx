'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { login } from '@/lib/auth';
import { FaUserShield, FaLock, FaSignInAlt, FaHome, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    if (!username || username.trim().length === 0) {
      toast.error('Username is required');
      return false;
    }
    if (username.trim().length < 3) {
      toast.error('Username must be at least 3 characters');
      return false;
    }
    if (!password || password.length === 0) {
      toast.error('Password is required');
      return false;
    }
    if (password.length < 3) {
      toast.error('Password must be at least 3 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        toast.success('Login successful!');
        router.push('/admin/dashboard');
      } else {
        const errorMsg = result.error || 'Invalid credentials';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container container-home">
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">
            <FaUserShield size={48} />
          </div>
          <h1>Admin Login</h1>
          <p className="login-subtitle">Access the admin dashboard</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="username">
                <FaUserShield className="label-icon" /> Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FaLock className="label-icon" /> Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-large btn-block"
            >
              {loading ? (
                <>Logging in...</>
              ) : (
                <>
                  <FaSignInAlt /> Login
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <a href="/" className="back-link">
              <FaHome /> Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

