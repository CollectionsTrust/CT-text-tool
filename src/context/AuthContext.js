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
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid'; // You may need to install this package

// Helper function to create and sign a simple token
// In a production environment, consider using Firebase Auth custom tokens or a proper JWT library
const createToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    // Set expiration to 24 hours from now
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };
  
  // In a real app, sign this with a secret key
  // For now we'll use a simple encoding as a placeholder
  return btoa(JSON.stringify(payload));
};

// Helper function to verify a token
const verifyToken = (token) => {
  try {
    const payload = JSON.parse(atob(token));
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

const SESSION_TOKEN_KEY = 'ct_session_token';
const SESSION_ID_KEY = 'ct_session_id';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [lastVerification, setLastVerification] = useState(0);

  // Create a new session in Firestore
  const createSession = async (user) => {
    try {
      const sessionId = uuidv4();
      const sessionRef = doc(db, 'sessions', sessionId);
      
      // Create expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Create session in Firestore
      await setDoc(sessionRef, {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
        lastActive: serverTimestamp()
      });
      
      // Create and store token
      const token = createToken(user);
      sessionStorage.setItem(SESSION_TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      
      return { sessionId, token };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };
  
  // Validate the session with Firestore
  const validateSession = async (forceCheck = false) => {
    const now = Date.now();
    const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
    
    // Skip validation if checked recently (unless forced)
    if (!forceCheck && now - lastVerification < 5 * 60 * 1000) { // 5 minutes
      return true;
    }
    
    if (!sessionId || !token) {
      return false;
    }
    
    try {
      // Verify token locally first
      const payload = verifyToken(token);
      if (!payload) {
        return false;
      }
      
      // Then verify with Firestore
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        return false;
      }
      
      const sessionData = sessionSnap.data();
      
      // Check expiration
      const expiresAt = sessionData.expiresAt.toDate();
      if (expiresAt < new Date()) {
        return false;
      }
      
      // Session is valid, update lastVerification time
      setLastVerification(now);
      
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
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
        projects: userData.projects || []
      };

      // Create a session in Firestore
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
        // Remove session from Firestore
        const sessionRef = doc(db, 'sessions', sessionId);
        await deleteDoc(sessionRef);
      }
      
      // Clear session storage
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      
      // Update local state
      setCurrentUser(null);
      setUserRole(null);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local session even if Firestore operation fails
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_ID_KEY);
      setCurrentUser(null);
      setUserRole(null);
      return true;
    }
  };

  // Check session validity and restore user state
  const checkAndRestoreSession = async () => {
    try {
      const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
      const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      
      if (!sessionId || !token) {
        setSessionChecked(true);
        setLoading(false);
        return;
      }
      
      // Verify token locally first
      const payload = verifyToken(token);
      if (!payload) {
        await logout();
        setSessionChecked(true);
        setLoading(false);
        return;
      }
      
      // Validate with Firestore
      const isValid = await validateSession(true);
      
      if (!isValid) {
        await logout();
        setSessionChecked(true);
        setLoading(false);
        return;
      }
      
      // Session is valid, fetch user details
      const userRef = doc(db, 'projectUsers', payload.id);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await logout();
        setSessionChecked(true);
        setLoading(false);
        return;
      }
      
      const userData = userSnap.data();
      
      const user = {
        id: userSnap.id,
        email: userData.email,
        name: userData.name || userData.email,
        role: userData.role || 'author',
        projects: userData.projects || []
      };
      
      setCurrentUser(user);
      setUserRole(user.role);
      setLastVerification(Date.now());
      
    } catch (error) {
      console.error('Error restoring session:', error);
      await logout();
    } finally {
      setSessionChecked(true);
      setLoading(false);
    }
  };

  // Initialize auth state when component mounts
  useEffect(() => {
    checkAndRestoreSession();
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    logout,
    loading,
    validateSession
  };

  return (
    <AuthContext.Provider value={value}>
      {sessionChecked && children}
    </AuthContext.Provider>
  );
};
