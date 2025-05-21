// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// Create context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Define sessionStorage keys
const USER_EMAIL_KEY = 'userEmail';
const USER_ROLE_KEY = 'userRole';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

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

      const userData = querySnapshot.docs[0].data();
      console.log("User data found:", userData);

      // Verify password
      if (password !== 'default') {
        console.error("Invalid password");
        throw new Error('Invalid password. Use the default password.');
      }

      // Create user object
      const user = {
        id: querySnapshot.docs[0].id,
        email: email,
        name: userData.name || email,
        role: userData.role || 'author',
        projects: userData.projectRoles || {}
      };

      // Store in sessionStorage ONLY
      sessionStorage.setItem(USER_EMAIL_KEY, email);
      sessionStorage.setItem(USER_ROLE_KEY, user.role);
      
      // Update context state synchronously before returning
      setCurrentUser(user);
      setUserRole(user.role);
      
      console.log("Login successful, auth state updated");
      
      return { user, role: user.role };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function - clear session
  const logout = () => {
    console.log("Logging out");
    
    // Clear sessionStorage
    sessionStorage.removeItem(USER_EMAIL_KEY);
    sessionStorage.removeItem(USER_ROLE_KEY);
    
    // Reset context state
    setCurrentUser(null);
    setUserRole(null);
    
    return Promise.resolve();
  };

  // Reset password function (placeholder)
  const resetPassword = async (email) => {
    return Promise.resolve();
  };

  // Restore session from sessionStorage on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check sessionStorage for existing session
        const email = sessionStorage.getItem(USER_EMAIL_KEY);
        const role = sessionStorage.getItem(USER_ROLE_KEY);
        
        console.log("Checking for existing session:", { email, role });

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
          
          // Store in context
          setCurrentUser(user);
          setUserRole(user.role);
        } else {
          console.warn("User not found in Firestore, clearing session");
          sessionStorage.removeItem(USER_EMAIL_KEY);
          sessionStorage.removeItem(USER_ROLE_KEY);
        }
      } catch (err) {
        console.error('Error restoring session:', err);
        sessionStorage.removeItem(USER_EMAIL_KEY);
        sessionStorage.removeItem(USER_ROLE_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
