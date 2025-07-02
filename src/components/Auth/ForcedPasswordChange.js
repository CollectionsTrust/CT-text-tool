import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordChange from './PasswordChange';
import MainHeader from '../navigation/MainHeader';

const ForcedPasswordChange = () => {
  const { currentUser, passwordChangeRequired, userRole } = useAuth();

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If password change is not required, redirect to the appropriate dashboard
  if (!passwordChangeRequired) {
    if (userRole === 'admin') {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  // Handle successful password change
  const handlePasswordChangeComplete = () => {
    // Redirect based on user role
    if (userRole === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <>
      <MainHeader hideLinks={true} />
      <div className="container">
        <PasswordChange 
          forced={true} 
          onComplete={handlePasswordChangeComplete} 
        />
      </div>
    </>
  );
};

export default ForcedPasswordChange;
