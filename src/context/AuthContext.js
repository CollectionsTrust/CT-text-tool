// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Consistent keys used for sessionStorage
const USER_EMAIL_KEY = 'userEmail';
const USER_ROLE_KEY = 'userRole';
const SESSION_ID_KEY = 'sessionId';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create a session in Firestore and store in sessionStorage
  const createSession = async (user) => {
    try {
      // Generate a unique session ID
      const sessionId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      
      // Create session document in Firestore
      const sessionRef = doc(db, 'sessions', sessionId);
      
      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      await setDoc(sessionRef, {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        lastActive: serverTimestamp()
      });
      
      // Store essential data in sessionStorage
      sessionStorage.setItem(USER_EMAIL_KEY, user.email);
      sessionStorage.setItem(USER_ROLE_KEY, user.role);
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const projectUsersRef = collection(db, 'projectUsers');
      const q = query(projectUsersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found. Please request access.');
      }

      const userData = querySnapshot.docs[0].data();

      if (password !== 'default') {
        throw new Error('Invalid password. Use the default password.');
      }

      const user = {
        id: querySnapshot.docs[0].id,
        email,
        name: userData.name || email,
        role: userData.role || 'author',
        projects: userData.projectRoles || {} // Store project roles
      };

      // Create session in Firestore and sessionStorage
      await createSession(user);
      
      // Update local state
      setCurrentUser(user);
      setUserRole(user.role);

      return { user, role: user.role };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
      
      if (sessionId) {
        // Delete the session from Firestore
        const sessionRef = doc(db, 'sessions', sessionId);
        await deleteDoc(sessionRef);
      }
      
      // Clear sessionStorage
      sessionStorage.removeItem(USER_EMAIL_KEY);
      sessionStorage.removeItem(USER_ROLE_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      
      // Clear local state
      setCurrentUser(null);
      setUserRole(null);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear session data even if Firestore operation fails
      sessionStorage.removeItem(USER_EMAIL_KEY);
      sessionStorage.removeItem(USER_ROLE_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      setCurrentUser(null);
      setUserRole(null);
      return true;
    }
  };

  // Check if session is valid with Firestore
  const validateSession = async () => {
    const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    
    if (!sessionId) {
      return false;
    }
    
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        return false;
      }
      
      const sessionData = sessionSnap.data();
      
      // Check if session is expired
      if (sessionData.expiresAt < new Date()) {
        return false;
      }
      
      // Update lastActive timestamp
      await setDoc(sessionRef, { lastActive: serverTimestamp() }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  // Reset password (placeholder implementation)
  const resetPassword = async (email) => {
    // This is a placeholder - in a real implementation, this would
    // generate a reset token and send an email
    console.log(`Reset password requested for ${email}`);
    return true;
  };

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const email = sessionStorage.getItem(USER_EMAIL_KEY);
        const role = sessionStorage.getItem(USER_ROLE_KEY);
        const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
        
        if (!email || !role || !sessionId) {
          setLoading(false);
          return;
        }
        
        // Optional: Validate session with Firestore
        // const isValid = await validateSession();
        // if (!isValid) {
        //   await logout();
        //   setLoading(false);
        //   return;
        // }
        
        // Get user data from Firestore based on email
        const projectUsersRef = collection(db, 'projectUsers');
        const q = query(projectUsersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // User not found, clear session
          await logout();
          setLoading(false);
          return;
        }
        
        const userData = querySnapshot.docs[0].data();
        
        // Restore user state
        const user = {
          id: querySnapshot.docs[0].id,
          email,
          name: userData.name || email,
          role: userData.role || 'author',
          projects: userData.projectRoles || {}
        };
        
        setCurrentUser(user);
        setUserRole(user.role);
        
      } catch (error) {
        console.error('Error restoring session:', error);
        // Clear session on error
        await logout();
      } finally {
        setLoading(false);
      }
    };
    
    restoreSession();
  }, []);

  // Context value
  const value = {
    currentUser,
    userRole,
    login,
    logout,
    resetPassword,
    validateSession,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
