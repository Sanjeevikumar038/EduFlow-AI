import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import loginIllustration from "../assets/login-illustration.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const navigate = useNavigate();

  const showFeedback = (msg, isError = true) => {
    if (isError) {
      setError(msg);
      setSuccess("");
    } else {
      setSuccess(msg);
      setError("");
    }
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showFeedback("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await login({ email, password });
      const { token, role, name } = response.data;

      if (role !== "ADMIN") {
        showFeedback("Access Denied. Only administrators can log in from this page.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);
      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
      }

      showFeedback("Login Successful! Redirecting...", false);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 400);
    } catch (error) {
      showFeedback(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-page-wrapper">
      <div className="erp-login-card">
        {/* Left Panel (Showcase Image Side) */}
        <div className="erp-left-image-panel">
          <img src={loginIllustration} alt="EduFlow Campus Showcase" className="erp-showcase-img" />
        </div>

        {/* Right Panel (Form Side) */}
        <div className="erp-right-form-panel">
          <div className="erp-logo-section">
            <div className="erp-logo-row">
              <div className="erp-logo-box">E</div>
              <div className="erp-logo-text">EduFlow</div>
            </div>
            <div className="erp-logo-sub">AI-POWERED ACADEMIC ERP</div>
          </div>

          <div className="erp-form-content">
            <div className="erp-heading-section">
              <h2>Administrator Login</h2>
              <p>The key to happiness is to sign in.</p>
            </div>

            {/* Toast Notification */}
            {error && (
              <div className="erp-toast">
                <span>❌</span> {error}
              </div>
            )}

            {success && (
              <div className="erp-toast success">
                <span>✅</span> {success}
              </div>
            )}

            <form className="erp-form" onSubmit={handleLogin}>
              <div className="erp-form-fields">
                <div className="erp-input-group">
                  <label htmlFor="email-input">Email / Username</label>
                  <div className="erp-input-wrapper">
                    <span className="input-icon-left">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </span>
                    <input
                      id="email-input"
                      className="erp-input-field"
                      type="text"
                      placeholder="Enter admin email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      tabIndex="1"
                    />
                  </div>
                </div>

                <div className="erp-input-group">
                  <label htmlFor="password-input">Password</label>
                  <div className="erp-input-wrapper">
                    <span className="input-icon-left">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                    <input
                      id="password-input"
                      className="erp-input-field"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      tabIndex="2"
                    />
                    <button
                      type="button"
                      className="input-icon-right"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ border: "none", cursor: "pointer", background: "none" }}
                      tabIndex="3"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="erp-extra-row">
                <label className="erp-checkbox-label" tabIndex="4">
                  <input type="checkbox" /> Remember me
                </label>
                <button
                  type="button"
                  className="erp-link"
                  onClick={() => setShowForgotModal(true)}
                  tabIndex="5"
                >
                  Forgot Password?
                </button>
              </div>

              <button className="erp-login-btn" type="submit" disabled={loading} tabIndex="6">
                {loading ? (
                  <>
                    <div className="erp-spinner"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  "Next"
                )}
              </button>
            </form>

            <div className="erp-footer-notice">
              <button
                type="button"
                className="erp-link"
                style={{ fontWeight: "600" }}
                onClick={() => setShowHelpModal(true)}
              >
                System Compatibility Check?
              </button>
            </div>
          </div>

          <div className="erp-footer">
            © 2026 EduFlow · Version 1.0
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="erp-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <h3>Forgot Password</h3>
              <button className="erp-modal-close" onClick={() => setShowForgotModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="erp-modal-body">
              <p>For security reasons, passwords can only be reset by your department administrator.</p>
              <p>Please contact your department administrator or the college IT support.</p>
            </div>
            <div className="erp-modal-footer">
              Email: <a href="mailto:sanjeevikumarwk@gmail.com" className="erp-link" style={{ fontWeight: "600" }}>sanjeevikumarwk@gmail.com</a>
            </div>
          </div>
        </div>
      )}

      {/* Need Help Modal */}
      {showHelpModal && (
        <div className="erp-modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <h3>Need Help?</h3>
              <button className="erp-modal-close" onClick={() => setShowHelpModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="erp-modal-body">
              <p>Contact your administrator if you experience:</p>
              <ul className="erp-modal-list">
                <li>Login issues</li>
                <li>Account locked</li>
                <li>Password reset</li>
                <li>Attendance discrepancies</li>
                <li>Technical issues</li>
              </ul>
            </div>
            <div className="erp-modal-footer">
              Email: <a href="mailto:sanjeevikumarwk@gmail.com" className="erp-link" style={{ fontWeight: "600" }}>sanjeevikumarwk@gmail.com</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
