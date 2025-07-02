import { useState } from 'react';
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

        <p className="login-note">If you've forgotten your password, contact an administrator.</p>
      </form>
    </div>
  );
};

export default Login;
