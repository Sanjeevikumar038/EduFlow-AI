import { useState } from "react";
import { register } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !department) {
      showFeedback("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await register({
        name,
        email,
        password,
        department
      });
      const { token, role: userRole, name: userName, registerNumber, department: userDept } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("name", userName);
      localStorage.setItem("email", email);
      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
      }
      if (registerNumber) {
        localStorage.setItem("registerNumber", registerNumber);
      }
      if (userDept) {
        localStorage.setItem("department", userDept);
      }

      showFeedback("Registration Successful! Redirecting...", false);

      setTimeout(() => {
        if (userRole === "STUDENT") navigate("/student");
        else if (userRole === "FACULTY") navigate("/faculty");
        else if (userRole === "ADMIN") navigate("/admin");
        else navigate("/");
      }, 1000);
    } catch (error) {
      showFeedback(error.response?.data?.message || "Registration Failed. Try again.");
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
        <h1>Create Account</h1>
        <p>Get started with EduFlow Student Portal</p>
      </div>

      <form className="auth-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            className="input-field"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            className="input-field"
            type="email"
            placeholder="Enter your email"
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <select
            className="input-field"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            style={{ appearance: "auto" }}
          >
            <option value="" disabled>-- Select Department --</option>
            <option value="Civil">Civil</option>
            <option value="CSE">CSE</option>
            <option value="CSE (AI & ML/Cyber Security)">CSE (AI & ML/Cyber Security)</option>
            <option value="EEE">EEE</option>
            <option value="ECE">ECE</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Mechatronics">Mechatronics</option>
            <option value="IT">IT</option>
            <option value="AI & Data Science">AI & Data Science</option>
            <option value="CSBS">CS & Business Systems</option>
            <option value="M.Tech CSE">mtech cse 5 years</option>
          </select>
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{" "}
        <Link className="auth-link" to="/login">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default Register;
