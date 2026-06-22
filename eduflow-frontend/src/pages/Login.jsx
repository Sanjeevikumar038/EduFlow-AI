import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
        showFeedback("Access Denied: Please use the Student/Faculty portal.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      showFeedback("Login Successful! Redirecting...", false);
      setTimeout(() => {
        navigate("/admin");
      }, 1000);
    } catch (error) {
      showFeedback(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Custom Error Banner */}
      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.15)",
          border: "1px solid var(--error)",
          color: "var(--error)",
          borderRadius: "10px",
          padding: "0.75rem 1rem",
          fontSize: "0.9rem",
          fontWeight: "500",
          textAlign: "center",
          animation: "fadeIn 0.3s ease"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Custom Success Banner */}
      {success && (
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid var(--success)",
          color: "var(--success)",
          borderRadius: "10px",
          padding: "0.75rem 1rem",
          fontSize: "0.9rem",
          fontWeight: "500",
          textAlign: "center",
          animation: "fadeIn 0.3s ease"
        }}>
          ✅ {success}
        </div>
      )}

      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Login to your EduFlow account</p>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username / Email</label>
          <input
            className="input-field"
            type="text"
            placeholder="Enter username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="auth-footer" style={{ borderTop: "1px solid var(--card-border)", paddingTop: "1rem", marginTop: "0.5rem" }}>
        <p style={{ marginBottom: "0.5rem" }}>Are you a student or faculty?</p>
        <Link className="auth-btn" to="/portal" style={{ textDecoration: "none", boxShadow: "none", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--card-border)", color: "var(--text-main)" }}>
          Access Student / Faculty Portal
        </Link>
      </div>
    </div>
  );
}

export default Login;
