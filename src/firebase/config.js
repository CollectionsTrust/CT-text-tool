import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD1zDSEXiMZ6Oo_ZfO27JWR9ZEBtIyK7Y4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ct-text-tool-d627a.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ct-text-tool-d627a",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ct-text-tool-d627a.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "313142970260",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:313142970260:web:604170e1ce3eb883b53181"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
