// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Define session storage keys - keep these the same as in the original implementation
const USER_EMAIL_KEY = 'userEmail';
const USER_ROLE_KEY = 'userRole';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

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
        console.error("User not found in projectUsers:", email);
        throw new Error('User not found. Please request access.');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("Found user data in projectUsers:", userData);

      // Verify password (simple check for now)
      if (password !== 'default') {
        console.error("Invalid password for user:", email);
        throw new Error('Invalid password. Use the default password.');
      }

      // Create user object with the EXACT structure expected by components
      const user = {
        id: userDoc.id,
        email,
        name: userData.name || email,
        role: userData.role || 'author',
        projects: userData.projectRoles || {}
      };

      // Store user info in sessionStorage with the same keys used in localStorage
      sessionStorage.setItem(USER_EMAIL_KEY, email);
      sessionStorage.setItem(USER_ROLE_KEY, user.role);
      
      // Update local state
      setCurrentUser(user);
      setUserRole(user.role);
      
      console.log("Login successful. User:", user.email, "Role:", user.role);
      return { user, role: user.role };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function - clear session
  const logout = () => {
    console.log("Logging out user:", currentUser?.email);
    
    // Clear sessionStorage
    sessionStorage.removeItem(USER_EMAIL_KEY);
    sessionStorage.removeItem(USER_ROLE_KEY);
    
    // Reset local state
    setCurrentUser(null);
    setUserRole(null);
    
    return Promise.resolve();
  };

  // Reset password function (simplified)
  const resetPassword = async (email) => {
    console.log("Reset password for:", email);
    // For now, just log the request - implementation depends on your requirements
    return Promise.resolve();
  };

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Check sessionStorage for existing session
        const email = sessionStorage.getItem(USER_EMAIL_KEY);
        const role = sessionStorage.getItem(USER_ROLE_KEY);
        
        console.log("Restoring session from storage:", { email, role });
        
        if (!email || !role) {
          console.log("No session found in storage");
          setLoading(false);
          return;
        }

        // Verify user exists in projectUsers collection
        const projectUsersRef = collection(db, 'projectUsers');
        const q = query(projectUsersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error("Stored user not found in projectUsers collection:", email);
          sessionStorage.removeItem(USER_EMAIL_KEY);
          sessionStorage.removeItem(USER_ROLE_KEY);
          setLoading(false);
          return;
        }

        // Restore user object with correct structure
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const user = {
          id: userDoc.id,
          email,
          name: userData.name || email,
          role: userData.role || role, // Prefer stored role if available
          projects: userData.projectRoles || {}
        };

        console.log("Session restored successfully for user:", user.email);
        setCurrentUser(user);
        setUserRole(user.role);
      } catch (err) {
        console.error('Error restoring session:', err);
        // Clear invalid session
        sessionStorage.removeItem(USER_EMAIL_KEY);
        sessionStorage.removeItem(USER_ROLE_KEY);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Authentication context value
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
