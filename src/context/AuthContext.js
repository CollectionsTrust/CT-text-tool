// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { hashPassword, verifyPassword, isTemporaryPassword } from '../utils/passwordUtils';

// Create context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Define sessionStorage keys
const USER_EMAIL_KEY = 'userEmail';
const USER_ROLE_KEY = 'userRole';
const PASSWORD_CHANGE_REQUIRED_KEY = 'passwordChangeRequired';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);

  // Login function - authenticate user and store session
  const login = async (email, password) => {
    try {
      console.log("Login attempt for:", email);
      
      // Find user in projectUsers collection
      const projectUsersRef = collection(db, 'projectUsers');
      const q = query(projectUsersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("User not found in projectUsers");
        throw new Error('User not found. Please request access.');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("User data found:", userData);

      // Legacy support for default password
      if (userData.password === 'default') {
        if (password !== 'default') {
          console.error("Invalid password");
          throw new Error('Invalid password. Please try again.');
        }
        
        // Legacy user - first login with default password will trigger password change
        setPasswordChangeRequired(true);
        sessionStorage.setItem(PASSWORD_CHANGE_REQUIRED_KEY, 'true');
      } 
      // Handle hashed password verification
      else if (userData.passwordHash) {
        // Verify the password against the stored hash
        const isValid = await verifyPassword(password, userData.passwordHash);
        if (!isValid) {
          console.error("Invalid password");
          throw new Error('Invalid password. Please try again.');
        }
        
        // Check if this is a temporary password that needs to be changed
        if (isTemporaryPassword(userData.passwordSettings)) {
          setPasswordChangeRequired(true);
          sessionStorage.setItem(PASSWORD_CHANGE_REQUIRED_KEY, 'true');
        } else {
          setPasswordChangeRequired(false);
          sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
        }
      }
      // No valid password mechanism found
      else {
        console.error("User has no valid password mechanism");
        throw new Error('Account setup incomplete. Please contact an administrator.');
      }

      // Create user object
      const user = {
        id: userDoc.id,
        email: email,
        name: userData.name || email,
        role: userData.role || 'author',
        projects: userData.projectRoles || {}
      };

      // Store in sessionStorage
      sessionStorage.setItem(USER_EMAIL_KEY, email);
      sessionStorage.setItem(USER_ROLE_KEY, user.role);
      
      // Update context state synchronously before returning
      setCurrentUser(user);
      setUserRole(user.role);
      
      console.log("Login successful, auth state updated");
      
      return { 
        user, 
        role: user.role, 
        passwordChangeRequired: passwordChangeRequired 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to change your password');
      }

      // Get the current user document
      const projectUsersRef = collection(db, 'projectUsers');
      const q = query(projectUsersRef, where('email', '==', currentUser.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Verify current password
      let isCurrentPasswordValid = false;
      
      // Handle legacy default password
      if (userData.password === 'default') {
        isCurrentPasswordValid = currentPassword === 'default';
      } 
      // Handle hashed password
      else if (userData.passwordHash) {
        isCurrentPasswordValid = await verifyPassword(currentPassword, userData.passwordHash);
      }

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash the new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update the user document with the new password hash
      const userRef = doc(db, 'projectUsers', userDoc.id);
      await updateDoc(userRef, {
        passwordHash: newPasswordHash,
        passwordSettings: {
          isTemporary: false,
          lastChanged: new Date().toISOString()
        },
        // Remove the old password field if it exists
        password: null
      });

      // Update session state
      setPasswordChangeRequired(false);
      sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  // Logout function - clear session
  const logout = () => {
    console.log("Logging out");
    
    // Clear sessionStorage
    sessionStorage.removeItem(USER_EMAIL_KEY);
    sessionStorage.removeItem(USER_ROLE_KEY);
    sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
    
    // Reset context state
    setCurrentUser(null);
    setUserRole(null);
    setPasswordChangeRequired(false);
    
    return Promise.resolve();
  };

  // Reset password function (for admins)
  const resetPassword = async (userEmail) => {
    // This would be used by admins to reset a user's password
    // Implement in the admin dashboard
    return Promise.resolve();
  };

  // Restore session from sessionStorage on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check sessionStorage for existing session
        const email = sessionStorage.getItem(USER_EMAIL_KEY);
        const role = sessionStorage.getItem(USER_ROLE_KEY);
        const pwChangeRequired = sessionStorage.getItem(PASSWORD_CHANGE_REQUIRED_KEY) === 'true';
        
        console.log("Checking for existing session:", { email, role, pwChangeRequired });

        if (!email || !role) {
          console.log("No saved session found");
          setLoading(false);
          return;
        }

        // Verify user exists in Firestore
        const projectUsersRef = collection(db, 'projectUsers');
        const q = query(projectUsersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          
          // Create user object
          const user = {
            id: querySnapshot.docs[0].id,
            email,
            name: userData.name || email,
            role: userData.role || role,
            projects: userData.projectRoles || {}
          };
          
          console.log("Session restored for user:", user.email);
          
          // Restore the password change required state
          setPasswordChangeRequired(pwChangeRequired);
          
          // Store in context
          setCurrentUser(user);
          setUserRole(user.role);
        } else {
          console.warn("User not found in Firestore, clearing session");
          sessionStorage.removeItem(USER_EMAIL_KEY);
          sessionStorage.removeItem(USER_ROLE_KEY);
          sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        sessionStorage.removeItem(USER_EMAIL_KEY);
        sessionStorage.removeItem(USER_ROLE_KEY);
        sessionStorage.removeItem(PASSWORD_CHANGE_REQUIRED_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const value = {
    currentUser,
    userRole,
    passwordChangeRequired,
    login,
    logout,
    changePassword,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
