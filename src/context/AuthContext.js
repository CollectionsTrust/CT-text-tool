// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

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
        projects: userData.projects || [] // ✅ Include assigned projects
      };

      setCurrentUser(user);
      setUserRole(user.role);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', user.role);

      return { user, role: user.role };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    setUserRole(null);
    return Promise.resolve();
  };

  useEffect(() => {
    const restoreSession = async () => {
      const storedEmail = localStorage.getItem('userEmail');
      const storedRole = localStorage.getItem('userRole');

      if (!storedEmail || !storedRole) {
        setLoading(false);
        return;
      }

      try {
        const projectUsersRef = collection(db, 'projectUsers');
        const q = query(projectUsersRef, where('email', '==', storedEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const user = {
            id: querySnapshot.docs[0].id,
            email: storedEmail,
            name: userData.name || storedEmail,
            role: userData.role || 'author',
            projects: userData.projects || [] // ✅ Include assigned projects
          };

          setCurrentUser(user);
          setUserRole(user.role);
          localStorage.setItem('userRole', user.role);
        } else {
          console.warn('Stored user not found in Firestore');
          logout();
        }
      } catch (err) {
        console.error('Error restoring user from Firestore:', err);
        logout();
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
