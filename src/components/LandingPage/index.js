import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProjectRequestForm from './ProjectRequestForm';
import './LandingPage.css';
import ctHeaderLogo from '../../assets/images/cttt-logo.png';
import ctLogo from '../../assets/images/ct-logo.png';
import mdsLogo from '../../assets/images/mds-logo.png';
import aceLogo from '../../assets/images/ace-logo.png';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');

  const { login, sendResetPasswordEmail } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    const result = await login(email, password);

    if (result.success) {
      if (result.userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setLoginError(result.error); 
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      setForgotPasswordError('');
      setForgotPasswordMessage('');
      setForgotPasswordLoading(true);

      if (!forgotPasswordEmail) {
        setForgotPasswordError('Please enter your email address');
        return;
      }

      await sendResetPasswordEmail(forgotPasswordEmail)

      setForgotPasswordMessage('Password reset request submitted. You will receive and email to reset your password.');
      setForgotPasswordEmail('');

      // Auto-close the form after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordMessage('');
      }, 3000);
    } catch (err) {
      setForgotPasswordError('Failed to submit request. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="landing-container">
      <div className="landing-split-layout">
        <div className="landing-left-panel">
          <div className="landing-content-wrapper">
            <div className="landing-logo-area">
              <div className="landing-ct-logo">
                <img src={ctHeaderLogo} alt="Collections Trust Logo" className="header-logo" />
              </div>
              <h1 className="landing-title">Text Tool (beta)</h1>
            </div>
            <div className="landing-description">
              <p>Turn your museum's one-off project text into reusable content</p>
              <p className="landing-lorem-text">
                Museums use collections all the time for exhibitions, research and many other collaborative projects. But the resulting knowledge is often lost or forgotten almost as soon as the project ends. Spectrum recommends adding 'knowledge gained and content created while using objects ... to catalogue records', but that has been easier said than done. Until now.
              </p>
              <p className="landing-lorem-text">
                The CT Text Tool is a free online service for museums that have object records in the <a href="https://museumdata.uk/">Museum Data Service (MDS)</a> and want to futureproof additional content about those objects, putting Spectrum's <em><a href="https://collectionstrust.org.uk/spectrum/procedures/use-of-collections-spectrum-5-0/">Use of collections</a></em> guidance into practice. As part of our ACE-funded role supporting dynamic collections, Collections Trust has created this tool for our own <em>Rethinking cataloguing</em> work and to show what's possible. Check out the <Link to="/user-guide">user guide</Link> to learn more.
              </p>
            </div>
            <div className="landing-features">
              <h3>How it works</h3>
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon" />
                  <div>
                    <h4>Request access</h4>
                    <p>Use the form on this page to describe your proposed project and request access. Our team will review your request and get back to you shortly.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon" />
                  <div>
                    <h4>Set up a project</h4>
                    <p>Provide a few setup details, invite your team, and get the MDS object records you want as if by magic.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon" />
                  <div>
                    <h4>Write your content</h4>
                    <p>Create your project texts and - here's the clever bit - link them to relevant object records as Spectrum recommends.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon" />
                  <div>
                    <h4>Export and share the results</h4>
                    <p>Download draft texts for proofreading and - when the project is finished - export, archive and share the results with MDS and - potentially - your own system.</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="landing-lorem-text">
              Developing a collections-based project and want to discuss how this tool might make the knowledge-wrangling easier? Or need help using the tool? Contact Collections Use Officer, <a href="mailto:katie@collectionstrust.org.uk">Katie Brown</a>. To find out how MDS data sharing works, see the <a target="_blank" rel="noopener noreferrer" href="https://museumdata.uk/sharing-data/how-sharing-data-works/">Museum Data Service website</a> or contact Museum Data Manager, <a href="mailto:supporte@museumdata.uk">Arran Rees</a>.
            </p>
          </div>
          <div className="landing-content-wrapper">
            <div className="landing-logos">
              <div className="logo-item ct-logo-item">
                <img src={ctLogo} alt="Collections Trust Logo" className="partner-logo" />
              </div>
              <div className="logo-item mds-logo-item">
                <img src={mdsLogo} alt="Museum Data Service Logo" className="partner-logo" />
              </div>
              <div className="logo-item ace-logo-item">
                <img src={aceLogo} alt="Arts Council England Logo" className="ace-logo" />
              </div>
            </div>
            <div className="landing-legal-text">
              <p>&copy; {new Date().getFullYear()} Collections Trust. All rights reserved.</p>
            </div>
          </div>
        </div>

        <div className="landing-right-panel">
          <div className="landing-content-wrapper">
            <div className="landing-form-container">
              <h2>Login</h2>
              {loginError && <div className="error-message">{loginError}</div>}

              {!showForgotPassword ? (
                <form onSubmit={handleLogin} className="landing-form">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input"
                      aria-label="Email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-container">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                        aria-label="Password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log in'}
                  </button>

                  <div className="forgot-password-link">
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgotten password?
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="landing-form">
                  <h3>Reset password</h3>
                  <p className="form-description">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>

                  {forgotPasswordError && <div className="error-message">{forgotPasswordError}</div>}
                  {forgotPasswordMessage && <div className="success-message">{forgotPasswordMessage}</div>}

                  <div className="form-group">
                    <label htmlFor="forgot-email">Email address</label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                      className="form-input"
                      aria-label="Email address for password reset"
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={forgotPasswordLoading}>
                    {forgotPasswordLoading ? 'Submitting...' : 'Submit request'}
                  </button>

                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordError('');
                      setForgotPasswordMessage('');
                    }}
                  >
                    Back to login
                  </button>
                </form>
              )}
            </div>

            <div className="landing-form-container">
              <h2>Request project access</h2>
              <ProjectRequestForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
