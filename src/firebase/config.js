import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6Pq7XF9NruXJPNGR0Ube4Z6KAnKwyi-w",
  authDomain: "ct-text-tool-d627a.firebaseapp.com",
  projectId: "ct-text-tool-d627a",
  storageBucket: "ct-text-tool-d627a.firebasestorage.app",
  messagingSenderId: "313142970260",
  appId: "1:313142970260:web:604170e1ce3eb883b53181"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
