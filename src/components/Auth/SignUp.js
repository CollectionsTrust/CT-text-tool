import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

const SignUp = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailDisabled, setIsEmailDisabled] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const hasTriedSignInRef = useRef(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const { setPasswordForEmailLinkUser } = useAuth();

  useEffect(() => {
    const url = window.location.href;

    if (hasTriedSignInRef.current) {
      return;
    }

    if (isSignInWithEmailLink(auth, url)) {
      hasTriedSignInRef.current = true; // Prevent second run

      // User opened the link on a different device. To prevent session fixation
      // attacks, ask the user to provide the associated email again.
      // This is the Firebase suggested approach
      const email = window.localStorage.getItem("emailForSignIn") || window.prompt("Please provide your email for confirmation");

      setEmail(email);
      setIsEmailDisabled(true);

      signInWithEmailLink(auth, email, url)
        .then((result) => {
          // console.log('User signed in:', result.user);
          setUserId(result.user.uid);
          window.localStorage.removeItem("emailForSignIn");
        })
        .catch((error) => {
          console.error("Sign in error:", error);
          setError("Error signing in: " + error.message);
        });
    } else {
      setError("Invalid or expired sign-in link.");
    }
  }, [email]);

  const changeDocId = async (oldId) => {
    const oldDocRef = doc(db, "projectUsers", oldId);
    const newDocRef = doc(db, "projectUsers", userId);

    const docSnapshot = await getDoc(oldDocRef);

    if (!docSnapshot.exists()) return;

    // Copy data to new doc
    await setDoc(newDocRef, docSnapshot.data());

    // Delete old doc
    await deleteDoc(oldDocRef);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const projectUsersRef = collection(db, "projectUsers");
      const q = query(projectUsersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error(
          "You are not approved to register. Please request access."
        );
      }

      const doc = querySnapshot.docs[0];
      const projectUserId = doc.id;

      await setPasswordForEmailLinkUser(password);
      await changeDocId(projectUserId);

      // Use to flush out the state so the user reloaded in the authContext
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-form-container">
        <form onSubmit={handleRegister} className="auth-form">
          <h2>Complete signup</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="password-input-container">
              <input
                type="text"
                id="email"
                value={email}
                required
                className="text-input"
                disabled={isEmailDisabled}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-input"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <small className="form-help-text">
              Must be at least 8 characters and include uppercase and lowercase
              letters
            </small>
          </div>
          <button
            type="submit"
            className="submit-btn password-change-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
