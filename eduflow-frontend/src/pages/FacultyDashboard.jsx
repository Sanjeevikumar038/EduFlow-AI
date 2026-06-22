import { useState, useEffect } from "react";
import { getStudents, createStudent, deleteStudent } from "../services/authService";
import { useNavigate } from "react-router-dom";

function FacultyDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Faculty";
  const token = localStorage.getItem("token");

  // Tab State
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' or 'students'

  // Student directory states
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  // Fetch student data
  const fetchStudents = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const res = await getStudents(token);
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setFetchLoading(false);
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents();
    }
  }, [activeTab, token]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !studentPassword) {
      showFeedback("Please fill in all fields", "error");
      return;
    }
    setLoading(true);
    try {
      await createStudent(
        {
          name: studentName,
          email: studentEmail,
          password: studentPassword
        },
        token
      );
      showFeedback("Student account created successfully!");
      setStudentName("");
      setStudentEmail("");
      setStudentPassword("");
      fetchStudents();
    } catch (error) {
      showFeedback(error.response?.data || "Failed to create student account.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    try {
      await deleteStudent(id, token);
      showFeedback("Student account deleted successfully!");
      fetchStudents();
    } catch (error) {
      showFeedback(error.response?.data || "Failed to delete student account.", "error");
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container" style={{ maxWidth: "1150px", width: "100%" }}>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Faculty Portal</h1>
          <p>Welcome back, Professor {name}!</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div
          style={{
            background: feedback.type === "error" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
            border: `1px solid ${feedback.type === "error" ? "var(--error)" : "var(--success)"}`,
            color: feedback.type === "error" ? "var(--error)" : "var(--success)",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontWeight: "500",
            animation: "fadeIn 0.3s ease"
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Navigation tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
        <button
          onClick={() => { setActiveTab("overview"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "overview" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "overview" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📊 Dashboard Overview
        </button>
        <button
          onClick={() => { setActiveTab("students"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "students" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "students" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          🎓 Manage Students
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>⚡ Generate QR Session</h3>
            <p>Instantly generate attendance sessions and dynamically cycle secure QR verification codes for students.</p>
          </div>

          <div className="dashboard-card">
            <h3>📊 Attendance Analytics</h3>
            <p>Monitor real-time participation statistics, track class records, and export reports for administrative reviews.</p>
          </div>

          <div className="dashboard-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("students")}>
            <h3>🎓 Student Management</h3>
            <p>Review student records, search profiles, allocate permanent register numbers, and delete student logs.</p>
          </div>

          <div className="dashboard-card">
            <h3>💬 Grading & Feedback</h3>
            <p>Evaluate coding assessments and review mock interview statistics generated by the AI agent.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap" }}>
          
          {/* Left Pane: Add Form */}
          <div className="dashboard-card" style={{ flex: "1 1 350px", background: "rgba(30, 41, 59, 0.4)" }}>
            <h3 style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              🎓 Add New Student Profile
            </h3>
            <form className="auth-form" onSubmit={handleCreateStudent}>
              <div className="form-group">
                <label>Student Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Enter full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="student@college.edu"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Enter password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                />
              </div>

              <button className="auth-btn" type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)" }}>
                {loading ? "Creating..." : "Create Student Account"}
              </button>
            </form>
          </div>

          {/* Right Pane: Directory List */}
          <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <h3 style={{ margin: 0 }}>
                  🎓 Student Directory
                  <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                    ({filteredStudents.length} entries)
                  </span>
                </h3>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Search students by name, email, or reg no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ maxWidth: "300px", height: "38px", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                />
              </div>

              {fetchLoading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  Loading database records...
                </div>
              ) : (
                <div style={{ overflowX: "auto", flexGrow: 1 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.75rem 1rem" }}>Reg No.</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Name</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Email</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: "600" }}>{s.registerNumber || "Pending"}</td>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>{s.name}</td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{s.email}</td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                              <button
                                onClick={() => handleDeleteStudent(s.id)}
                                style={{
                                  background: deletingId === s.id ? "var(--error)" : "transparent",
                                  border: "1px solid var(--error)",
                                  color: deletingId === s.id ? "#fff" : "var(--error)",
                                  borderRadius: "6px",
                                  padding: "0.3rem 0.75rem",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                  fontWeight: deletingId === s.id ? "600" : "400",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                {deletingId === s.id ? "Confirm Delete?" : "Delete"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
          </div>

        </div>
      )}
    </div>
  );
}

export default FacultyDashboard;
