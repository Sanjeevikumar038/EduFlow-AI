import { useState, useEffect } from "react";
import {
  createFaculty,
  getFaculty,
  deleteFaculty,
  createStudent,
  getStudents,
  deleteStudent
} from "../services/authService";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Admin";
  const token = localStorage.getItem("token");

  // Tab State
  const [activeTab, setActiveTab] = useState("faculty"); // 'faculty' or 'students'

  // List States
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  
  // Form States - Faculty
  const [facultyName, setFacultyName] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("");

  // Form States - Student
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

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const [facRes, studRes] = await Promise.all([
        getFaculty(token),
        getStudents(token)
      ]);
      setFaculty(facRes.data);
      setStudents(studRes.data);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setFetchLoading(false);
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handlers - Faculty
  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!facultyName || !facultyEmail || !facultyPassword) {
      showFeedback("Please fill in all fields", "error");
      return;
    }
    setLoading(true);
    try {
      await createFaculty(
        {
          name: facultyName,
          email: facultyEmail,
          password: facultyPassword
        },
        token
      );
      showFeedback("Faculty account created successfully!");
      setFacultyName("");
      setFacultyEmail("");
      setFacultyPassword("");
      fetchData();
    } catch (error) {
      showFeedback(error.response?.data || "Failed to create faculty account.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (deletingId !== id) {
      setDeletingId(id);
      return;
    }
    try {
      await deleteFaculty(id, token);
      showFeedback("Faculty account deleted successfully!");
      fetchData();
    } catch (error) {
      showFeedback(error.response?.data || "Failed to delete faculty account.", "error");
    }
  };

  // Handlers - Student
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
      fetchData();
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
      fetchData();
    } catch (error) {
      showFeedback(error.response?.data || "Failed to delete student account.", "error");
    }
  };

  // Filter lists
  const filteredFaculty = faculty.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1>Admin Control Panel</h1>
          <p>Logged in as: {name} (ADMIN)</p>
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
          onClick={() => { setActiveTab("faculty"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "faculty" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "faculty" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          👤 Faculty Management
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
          🎓 Student Management
        </button>
      </div>

      <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap" }}>
        
        {/* Left Pane: Add Form */}
        <div className="dashboard-card" style={{ flex: "1 1 350px", background: "rgba(30, 41, 59, 0.4)" }}>
          {activeTab === "faculty" ? (
            <>
              <h3 style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                👤 Add New Faculty Profile
              </h3>
              <form className="auth-form" onSubmit={handleCreateFaculty}>
                <div className="form-group">
                  <label>Faculty Name</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Enter full name"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>College Email</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="faculty@college.edu"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Temporary Password</label>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="Enter initial password"
                    value={facultyPassword}
                    onChange={(e) => setFacultyPassword(e.target.value)}
                    required
                  />
                </div>

                <button className="auth-btn" type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)" }}>
                  {loading ? "Creating..." : "Create Faculty Account"}
                </button>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Right Pane: Directory List */}
        <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ margin: 0 }}>
                {activeTab === "faculty" ? "👤 Faculty Directory" : "🎓 Student Directory"}
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  ({activeTab === "faculty" ? filteredFaculty.length : filteredStudents.length} entries)
                </span>
              </h3>
              <input
                className="input-field"
                type="text"
                placeholder={`Search ${activeTab === "faculty" ? "faculty" : "students"} by name or email...`}
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
                      {activeTab === "students" && <th style={{ padding: "0.75rem 1rem" }}>Reg No.</th>}
                      <th style={{ padding: "0.75rem 1rem" }}>Name</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Email</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "faculty" ? (
                      filteredFaculty.length > 0 ? (
                        filteredFaculty.map((f) => (
                          <tr key={f.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>{f.name}</td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{f.email}</td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                              <button
                                onClick={() => handleDeleteFaculty(f.id)}
                                style={{
                                  background: deletingId === f.id ? "var(--error)" : "transparent",
                                  border: "1px solid var(--error)",
                                  color: deletingId === f.id ? "#fff" : "var(--error)",
                                  borderRadius: "6px",
                                  padding: "0.3rem 0.75rem",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                  fontWeight: deletingId === f.id ? "600" : "400",
                                  transition: "all 0.2s ease"
                                }}
                              >
                                {deletingId === f.id ? "Confirm Delete?" : "Delete"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No faculty members found.
                          </td>
                        </tr>
                      )
                    ) : (
                      filteredStudents.length > 0 ? (
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
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
