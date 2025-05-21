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
      // Call login function from AuthContext
      const result = await login(email, password);
      console.log("Login successful:", result);
      
      // Check if password change is required
      if (result.passwordChangeRequired) {
        navigate('/change-password-required');
        return;
      }
      
      // IMPORTANT: Use a slight delay to ensure context state has updated
      // before navigation occurs
      setTimeout(() => {
        if (result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard'); // For owners and authors
        }
        setLoading(false);
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      setLoading(false);
    }
  };

  const useDefaultCredentials = () => {
    setEmail('admin@example.com');
    setPassword('default');
