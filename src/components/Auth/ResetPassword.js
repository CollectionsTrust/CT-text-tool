import { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return setError('Please enter your email address');
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);

      // Check if user exists in Firestore
      const projectUsersRef = collection(db, 'projectUsers');
      const q = query(projectUsersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('No account found with this email address.');
      }

      // For this simple implementation, we'll just "reset" to the default password
      // A real implementation would generate a reset token and send an email
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'projectUsers', userDoc.id), {
        password: 'default' // Reset to default password
      });
      
      setMessage(
        'Your password has been reset to the default value. Please login with "default" as your password.'
      );
      setEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-form-container">
        <h2>Reset Password</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-input"
              required
            />
          </div>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset password'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Remember your password? <Link to="/login">Log in</Link>
          </p>
          <p>
            Don't have an account? <Link to="/">Request project access</Link>
          </p>
          <p>
            <Link to="/">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
