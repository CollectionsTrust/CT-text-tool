import { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  signOut,
  updatePassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [userRoles, setUserRoles] = useState();
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  const getUserRolesFromFirestore = async (user) => {
    // A user can be a whole site 'admin' or have multiple roles for different projects
    const projectUserDocRef = doc(db, "projectUsers", user.email);
    const projectUserDocSnap = await getDoc(projectUserDocRef);
    const usersDocRef = doc(db, "userRoles", user.uid);
    const usersDocSnap = await getDoc(usersDocRef);

    let appRole = null;

    if (usersDocSnap.exists()) {
      // admin user
      appRole = usersDocSnap.data().role;
    } else if (projectUserDocSnap.exists()) {
      appRole = "nonAdminUser";
    }

    if (!usersDocSnap.exists() && !projectUserDocSnap.exists()) {
      return null;
    }

    return {
      appRole,
      projectRoles: projectUserDocSnap.data()?.projectRoles || {},
    };
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);

        return {
          success: false,
          error: "auth/email-not-verified",
          user: userCredential.user,
        };
      }

      const user = userCredential.user;
      const roles = await getUserRolesFromFirestore(user);

      if (roles) {
        setUser(user);
        setUserRoles(roles);

        return {
          success: true,
          user,
          roles,
        };
      }

      return {
        success: false,
        error: "User record not found.",
      };
    } catch (err) {
      console.error("Login error:", err);

      let errorMessage = "";

      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        errorMessage = "Incorrect email or password.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed login attempts. Please wait and try again.";
      } else {
        errorMessage = "Failed to sign in. Please try again.";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const setPasswordForEmailLinkUser = async (newPassword) => {
    const user = auth.currentUser;

    if (!user) throw new Error("No user is currently signed in.");
    return updatePassword(user, newPassword);
  };

  const changePassword = async (currentPassword, newPassword) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (err) {
      console.error("Error changing password:", err);
      throw err; // rethrow or handle in your form logic
    }
  };

  const sendResetPasswordEmail = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  };

  const logout = () => {
    signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserRoles(null);
        setLoading(false);
        return;
      }

      getUserRolesFromFirestore(firebaseUser)
        .then((roles) => {
          if (roles) {
            setUser(firebaseUser);
            setUserRoles(roles);
          } else {
            console.warn("No user document found for UID:", firebaseUser.uid);
          }
        })
        .catch((error) => {
          console.error("Error getting user role:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRoles,
        login,
        logout,
        changePassword,
        setPasswordForEmailLinkUser,
        sendResetPasswordEmail,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
