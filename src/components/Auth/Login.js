// src/components/Auth/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Login attempt for:", email);
      // Let AuthContext handle all storage - NO localStorage calls here
      const result = await login(email, password);
      console.log("Login result:", result);

      // Navigate based on user role
      if (result && result.role) {
        if (result.role === 'admin') {
          console.log("Navigating to admin dashboard");
          navigate('/admin');
        } else {
          console.log("Navigating to user dashboard");
          navigate('/dashboard'); // owners and authors
        }
      } else {
        console.error("Login succeeded but no role returned");
        setError("Login succeeded but user role could not be determined");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const useDefaultCredentials = () => {
    setEmail('admin@example.com');
    setPassword('default');
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}

        <label htmlFor="login-email">Email</label>
        <input
          type="email"
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {process.env.NODE_ENV === 'development' && (
          <button type="button" className="dev-btn" onClick={useDefaultCredentials}>
            Use Default Credentials
          </button>
        )}

        <p className="login-note">Use your email and the default password ("default").</p>
      </form>
    </div>
  );
};

export default Login;
