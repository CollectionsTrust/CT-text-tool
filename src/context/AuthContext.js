import { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, signOut, updatePassword, signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential, onAuthStateChanged } from "firebase/auth";

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [userRole, setUserRole] = useState();
    const [loading, setLoading] = useState(true);

    const auth = getAuth();

    const getUserRoleFromFirestore = async (user) => {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            return docSnap.data().role;
        }

        console.warn("No user document found for UID");
        return null
    }

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const role = await getUserRoleFromFirestore(user)

            if (role) {
                setUser(user);
                setUserRole(role);

                console.log('logged in: ', user.email, ' ', role);

                return {
                    success: true,
                    user,
                    role
                };
            }

            return {
                success: false,
                error: "User record not found."
            };
        } catch (err) {
            console.error("Login error:", err);

            let errorMessage = '';

            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                errorMessage = "Incorrect email or password.";
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed login attempts. Please wait and try again.";
            } else {
                errorMessage = "Failed to sign in. Please try again.";
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
        } catch (err) {
            console.error("Error changing password:", err);
            throw err; // rethrow or handle in your form logic
        }
    };

    const logout = () => {
        signOut(auth)
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setUserRole(null);
                setLoading(false);
                return;
            }

            getUserRoleFromFirestore(firebaseUser)
                .then((role) => {
                    if (role) {
                        setUser(firebaseUser);
                        setUserRole(role);
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
        <AuthContext.Provider value={{
            user,
            userRole,
            login,
            logout,
            changePassword,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
