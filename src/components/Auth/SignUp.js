import { useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";

const SignUp = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const emailDocId = email.toLowerCase();
      const userDocRef = doc(db, "projectUsers", emailDocId);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;

      console.log('userData: ', userData);
      

      if (!userData || userData.status !== 'approved') {
        throw new Error("You are not approved to register. Please request access.");
      }

      await createUserWithEmailAndPassword(auth, email, password);

      // Use to flush out the state so the user reloaded in the authContext
      window.location.href = "/dashboard"; // @todo use navigate again instead?
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
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-input"
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
              Must be at least 8 characters and include uppercase and lowercase letters
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