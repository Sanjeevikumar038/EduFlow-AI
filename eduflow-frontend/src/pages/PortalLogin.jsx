import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

function PortalLogin() {
  const [activeTab, setActiveTab] = useState("STUDENT"); // STUDENT or FACULTY
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await login({ email, password });
      const { token, role, name } = response.data;

      if (role !== activeTab) {
        alert(`Invalid credentials for ${activeTab.toLowerCase()} portal.`);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      alert("Login Successful");

      if (role === "STUDENT") navigate("/student");
      else if (role === "FACULTY") navigate("/faculty");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Access your EduFlow account</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: "0.5rem", background: "var(--input-bg)", padding: "4px", borderRadius: "10px", border: "1px solid var(--input-border)" }}>
        <button
          type="button"
          onClick={() => { setActiveTab("STUDENT"); setEmail(""); setPassword(""); }}
          style={{
            flex: 1,
            padding: "0.6rem",
            border: "none",
            borderRadius: "8px",
            background: activeTab === "STUDENT" ? "var(--primary)" : "transparent",
            color: "#fff",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Student
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("FACULTY"); setEmail(""); setPassword(""); }}
          style={{
            flex: 1,
            padding: "0.6rem",
            border: "none",
            borderRadius: "8px",
            background: activeTab === "FACULTY" ? "var(--primary)" : "transparent",
            color: "#fff",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          Faculty
        </button>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username / Email</label>
          <input
            className="input-field"
            type="text"
            placeholder={`Enter your username or email`}
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : `Login as ${activeTab === "STUDENT" ? "Student" : "Faculty"}`}
        </button>
      </form>

      <div className="auth-footer" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {activeTab === "STUDENT" && (
          <div>
            New Student?{" "}
            <Link className="auth-link" to="/register">
              Sign up here
            </Link>
          </div>
        )}
        <div>
          <Link className="auth-link" to="/login" style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            ← Access Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PortalLogin;
