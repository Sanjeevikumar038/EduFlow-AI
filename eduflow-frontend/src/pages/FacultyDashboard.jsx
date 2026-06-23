import { useState, useEffect } from "react";
import { getStudents, createStudent, deleteStudent } from "../services/authService";
import { startSession, endSession, getActiveSession, getSessionRecords, getAllSessions, getSessionReport } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";

function FacultyDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Faculty";
  const token = localStorage.getItem("token");

  // Tab State
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'qr-session', or 'students'

  // Student directory states
  const [students, setStudents] = useState([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  // Attendance Session States
  const [activeSession, setActiveSession] = useState(null);
  const [sessionSubject, setSessionSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [sessionDuration, setSessionDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [checkedInStudents, setCheckedInStudents] = useState([]);

  // Analytics States
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [reportRecords, setReportRecords] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

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

  // Helper to parse local datetime safely from Java's LocalDateTime response format
  const parseLocalDateTime = (str) => {
    if (!str) return 0;
    const normalized = str.replace(" ", "T");
    const parts = normalized.split(/[T.:-]/);
    if (parts.length < 5) return new Date(normalized).getTime();
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);
    const second = parts[5] ? parseInt(parts[5], 10) : 0;
    return new Date(year, month, day, hour, minute, second).getTime();
  };


  // Fetch active session
  const fetchActiveSession = async () => {
    if (!token) return;
    try {
      const res = await getActiveSession(token);
      if (res.data) {
        setActiveSession(res.data);
        const expiry = parseLocalDateTime(res.data.expiryTime);
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(diff);
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      console.error("Error fetching active session:", error);
    }
  };

  const fetchTotalStudents = async () => {
    if (!token) return;
    try {
      const res = await getStudents(token);
      setTotalStudentsCount(res.data?.length || 0);
    } catch (error) {
      console.error("Error fetching total students:", error);
    }
  };

  // Fetch student data
  const fetchStudents = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const res = await getStudents(token);
      setStudents(res.data);
      setTotalStudentsCount(res.data?.length || 0);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setFetchLoading(false);
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchActiveSession();
    fetchTotalStudents();
  }, [token]);

  // Handle live countdown update
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const expiry = parseLocalDateTime(activeSession.expiryTime);
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        setActiveSession(null);
        showFeedback("Attendance session has expired.", "error");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Periodically poll active session to get the latest cycled QR code OTP
  useEffect(() => {
    if (!activeSession) return;

    const otpInterval = setInterval(() => {
      fetchActiveSession();
    }, 10000); // refresh every 10 seconds

    return () => clearInterval(otpInterval);
  }, [activeSession]);

  const fetchSessionRecords = async () => {
    if (!token || !activeSession) return;
    try {
      const res = await getSessionRecords(activeSession.id, token);
      setCheckedInStudents(res.data || []);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    }
  };

  // Live update checked in student records
  useEffect(() => {
    if (!activeSession) {
      setCheckedInStudents([]);
      return;
    }

    fetchSessionRecords();

    const recordsInterval = setInterval(() => {
      fetchSessionRecords();
    }, 5000); // pull records every 5 seconds

    return () => clearInterval(recordsInterval);
  }, [activeSession]);

  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents();
    }
  }, [activeTab, token]);

  const fetchSessions = async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await getAllSessions(token);
      setSessions(res.data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      showFeedback("Failed to fetch sessions.", "error");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleViewReport = async (session) => {
    setSelectedSession(session);
    setReportLoading(true);
    try {
      const res = await getSessionReport(session.id, token);
      setReportRecords(res.data || []);
    } catch (error) {
      console.error("Error fetching session report:", error);
      showFeedback("Failed to load attendance report.", "error");
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchSessions();
      setSelectedSession(null);
      setReportRecords([]);
    }
  }, [activeTab]);

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

  const handleStartSession = async (e) => {
    e.preventDefault();
    const finalSubject = sessionSubject === "Custom" ? customSubject : sessionSubject;
    if (!finalSubject) {
      showFeedback("Please select or enter a subject.", "error");
      return;
    }
    setSessionLoading(true);
    try {
      const res = await startSession(
        {
          subject: finalSubject,
          durationMinutes: parseInt(sessionDuration, 10)
        },
        token
      );
      setActiveSession(res.data);
      showFeedback("Attendance session started successfully!");
    } catch (error) {
      showFeedback(error.response?.data || "Failed to start attendance session.", "error");
    } finally {
      setSessionLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    setSessionLoading(true);
    try {
      await endSession(activeSession.id, token);
      setActiveSession(null);
      setTimeLeft(0);
      showFeedback("Attendance session ended successfully!");
    } catch (error) {
      showFeedback(error.response?.data || "Failed to end attendance session.", "error");
    } finally {
      setSessionLoading(false);
    }
  };

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
          <p>Welcome back, Professor {name}! {localStorage.getItem("department") ? `(${localStorage.getItem("department")})` : ""}</p>
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
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem", flexWrap: "wrap" }}>
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
          onClick={() => { setActiveTab("qr-session"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "qr-session" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "qr-session" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          ⚡ QR Session
          {activeSession && (
            <span style={{
              width: "8px",
              height: "8px",
              backgroundColor: "var(--success)",
              borderRadius: "50%",
              display: "inline-block",
              boxShadow: "0 0 8px var(--success)"
            }} />
          )}
        </button>
        <button
          onClick={() => { setActiveTab("analytics"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "analytics" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "analytics" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📊 Attendance Analytics
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

      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {activeSession && (
            <div className="live-monitor-card" style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(17, 24, 39, 0.85) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "20px",
              padding: "2rem",
              marginBottom: "2rem",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              animation: "fadeIn 0.5s ease",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
                pointerEvents: "none"
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span className="status-dot" style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "var(--success)",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "pulse 1.5s infinite"
                    }} />
                    <span style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>
                      Live Attendance Monitoring
                    </span>
                  </div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: "700", margin: "0 0 0.25rem 0", color: "#fff" }}>
                    {activeSession.subject}
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 1rem 0" }}>
                    Conducted by Professor {activeSession.facultyName || "Unknown"}
                  </p>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
                    <div style={{
                      background: "rgba(99, 102, 241, 0.1)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "12px",
                      padding: "0.75rem 1.5rem"
                    }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Present</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--primary)" }}>
                        {checkedInStudents.length}
                      </div>
                    </div>
                    <div style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      padding: "0.75rem 1.5rem"
                    }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600" }}>Time Left</div>
                      <div style={{ fontSize: "1.8rem", fontWeight: "700", color: timeLeft < 60 ? "var(--error)" : "#fff" }}>
                        {formatTimeLeft(timeLeft)}
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "12px",
                      padding: "0.75rem 1.5rem",
                      minWidth: "220px",
                      flexGrow: 1
                    }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "0.4rem" }}>
                        Attendance Progress
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ flexGrow: 1, height: "8px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{
                            width: `${totalStudentsCount > 0 ? Math.round((checkedInStudents.length / totalStudentsCount) * 100) : 0}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
                            borderRadius: "4px",
                            transition: "width 0.5s ease"
                          }} />
                        </div>
                        <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--primary)" }}>
                          {totalStudentsCount > 0 ? Math.round((checkedInStudents.length / totalStudentsCount) * 100) : 0}%
                        </span>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        ({checkedInStudents.length} of {totalStudentsCount} students)
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ minWidth: "260px", flex: "1 0 260px" }}>
                  <h4 style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "1px", margin: "0 0 0.75rem 0" }}>
                    Recently Checked In
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {checkedInStudents.length > 0 ? (
                      [...checkedInStudents]
                        .sort((a, b) => b.id - a.id)
                        .slice(0, 4)
                        .map((student) => (
                          <div key={student.id} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.4rem 0.8rem",
                            background: "rgba(16, 185, 129, 0.05)",
                            border: "1px solid rgba(16, 185, 129, 0.15)",
                            borderRadius: "8px",
                            animation: "fadeIn 0.3s ease"
                          }}>
                            <span style={{ color: "var(--success)", fontWeight: "bold" }}>✓</span>
                            <span style={{ fontWeight: "500", fontSize: "0.9rem" }}>{student.studentName}</span>
                            <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {student.time ? student.time.substring(0, 5) : ""}
                            </span>
                          </div>
                        ))
                    ) : (
                      <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", padding: "0.5rem" }}>
                        📡 Awaiting scans...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setActiveTab("qr-session")}
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.6rem 1.2rem",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                    transition: "all 0.3s ease"
                  }}
                >
                  🔍 View QR Scanner Screen
                </button>
              </div>
            </div>
          )}

          <div className="dashboard-grid">
            <div className="dashboard-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("qr-session")}>
              <h3>⚡ Generate QR Session</h3>
              <p>Instantly generate attendance sessions and dynamically cycle secure QR verification codes for students.</p>
            </div>

            <div className="dashboard-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("analytics")}>
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
        </div>
      )}

      {activeTab === "qr-session" && (
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", width: "100%" }}>
          {activeSession ? (
            <>
              {/* Left Column: QR and Timer */}
              <div className="dashboard-card" style={{
                flex: "1 1 350px",
                maxWidth: "450px",
                background: "rgba(30, 41, 59, 0.4)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                boxShadow: "0 8px 32px 0 rgba(99, 102, 241, 0.15)",
                textAlign: "center",
                padding: "2.5rem",
                borderRadius: "20px",
                animation: "fadeIn 0.5s ease"
              }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span className="status-dot" style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "var(--success)",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "pulse 1.5s infinite"
                  }}></span>
                  <span style={{ color: "var(--success)", fontWeight: "600", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>
                    Active Session
                  </span>
                </div>

                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                  {activeSession.subject}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>
                  Session ID: {activeSession.id}
                </p>

                {/* QR Code Container */}
                <div style={{
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "16px",
                  display: "inline-block",
                  marginBottom: "2rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  border: "2px solid rgba(255, 255, 255, 0.1)"
                }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=eduflow:session:${activeSession.id}:${activeSession.currentOtp || ""}`}
                    alt="Session QR Code"
                    style={{ display: "block" }}
                  />
                </div>

                {/* Timer Container */}
                <div style={{
                  background: "rgba(31, 41, 55, 0.6)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  padding: "1rem 2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "0 auto 2rem auto",
                  width: "100%",
                  maxWidth: "280px"
                }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>
                    Time Remaining
                  </span>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "2.2rem",
                    fontWeight: "700",
                    color: timeLeft < 60 ? "var(--error)" : "var(--primary)",
                    textShadow: timeLeft < 60 ? "0 0 15px rgba(239, 68, 68, 0.3)" : "0 0 15px rgba(99, 102, 241, 0.3)"
                  }}>
                    {formatTimeLeft(timeLeft)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  {localStorage.getItem("role") === "ADMIN" || activeSession.facultyId === Number(localStorage.getItem("userId")) ? (
                    <button
                      onClick={handleEndSession}
                      disabled={sessionLoading}
                      className="logout-btn"
                      style={{
                        width: "100%",
                        maxWidth: "280px",
                        padding: "0.85rem",
                        fontSize: "0.95rem",
                        backgroundColor: "transparent",
                        border: "1px solid var(--error)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {sessionLoading ? "Ending Session..." : "🛑 End Session"}
                    </button>
                  ) : (
                    <div style={{
                      width: "100%",
                      maxWidth: "280px",
                      padding: "0.85rem",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      textAlign: "center",
                      border: "1px dashed var(--card-border)",
                      borderRadius: "10px"
                    }}>
                      🔒 Only the session creator can end this session.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Live Check-in feed */}
              <div className="dashboard-card" style={{
                flex: "2 1 500px",
                maxWidth: "650px",
                background: "rgba(30, 41, 59, 0.2)",
                border: "1px solid var(--card-border)",
                borderRadius: "20px",
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
                animation: "fadeIn 0.5s ease"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    📋 Live Check-In Feed
                    <span style={{
                      fontSize: "0.85rem",
                      padding: "0.2rem 0.6rem",
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "var(--success)",
                      borderRadius: "12px",
                      fontWeight: "600"
                    }}>
                      {checkedInStudents.length} Present
                    </span>
                  </h3>
                </div>

                <div style={{ overflowY: "auto", maxHeight: "400px", flexGrow: 1, paddingRight: "0.5rem" }}>
                  {checkedInStudents.length > 0 ? (
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                          <th style={{ padding: "0.5rem" }}>Reg No.</th>
                          <th style={{ padding: "0.5rem" }}>Name</th>
                          <th style={{ padding: "0.5rem" }}>Time</th>
                          <th style={{ padding: "0.5rem", textAlign: "right" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkedInStudents.map((student) => (
                          <tr key={student.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <td style={{ padding: "0.75rem 0.5rem", color: "var(--primary)", fontWeight: "600" }}>
                              {student.registerNumber}
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem", fontWeight: "500" }}>
                              {student.studentName}
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>
                              {student.time ? student.time.substring(0, 5) : "N/A"}
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                              <span style={{
                                background: "rgba(16, 185, 129, 0.15)",
                                color: "var(--success)",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: "600"
                              }}>
                                PRESENT
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "0.75rem", animation: "pulse 2s infinite" }}>📡</div>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>Awaiting check-ins...</p>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Students can scan the QR code to submit their proximity check-in.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Start Session Form */
            <div className="dashboard-card" style={{
              flex: "1 1 450px",
              maxWidth: "500px",
              background: "rgba(30, 41, 59, 0.4)",
              borderRadius: "20px",
              padding: "2.5rem",
              animation: "fadeIn 0.5s ease"
            }}>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                fontWeight: "700",
                marginBottom: "0.5rem",
                background: "linear-gradient(135deg, #fff 40%, var(--text-muted) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                ⚡ Start Attendance Session
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                Select a subject and specify the active duration to display the QR verification code.
              </p>

              <form onSubmit={handleStartSession} className="auth-form">
                <div className="form-group">
                  <label>Subject Name</label>
                  <select
                    className="input-field"
                    value={sessionSubject}
                    onChange={(e) => setSessionSubject(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select Class Subject --</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Database Management Systems">Database Management Systems</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Custom">-- Custom Subject --</option>
                  </select>
                </div>

                {sessionSubject === "Custom" && (
                  <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
                    <label>Enter Custom Subject</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Full Stack Web Dev"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Session Expiry (Minutes)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="1"
                    max="60"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sessionLoading}
                  className="auth-btn"
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    marginTop: "1.5rem"
                  }}
                >
                  {sessionLoading ? "Initializing..." : "🚀 Start Attendance Session"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
          {selectedSession ? (
            /* Selected Session Detail Report */
            <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.4)", padding: "2.5rem", borderRadius: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--card-border)",
                      color: "var(--text-muted)",
                      borderRadius: "6px",
                      padding: "0.4rem 0.8rem",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      marginBottom: "1rem",
                      transition: "all 0.2s"
                    }}
                  >
                    ← Back to Sessions
                  </button>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: "700", margin: 0 }}>
                    {selectedSession.subject}
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    Session ID: {selectedSession.id} | Conducted on: {new Date(selectedSession.startTime).toLocaleDateString()}
                  </p>
                </div>

                <div style={{
                  background: "rgba(31, 41, 55, 0.6)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  padding: "0.75rem 1.5rem",
                  textAlign: "right"
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                    Attendance Rate
                  </span>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "var(--primary)"
                  }}>
                    {reportRecords.length > 0 
                      ? Math.round((reportRecords.filter(r => r.status === "PRESENT").length / reportRecords.length) * 100)
                      : 0}%
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                    ({reportRecords.filter(r => r.status === "PRESENT").length} / {reportRecords.length} Present)
                  </span>
                </div>
              </div>

              {reportLoading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  Generating attendance roll-call logs...
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.75rem 1rem" }}>Reg No.</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Student Name</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Time Checked In</th>
                        <th style={{ padding: "0.75rem 1rem" }}>GPS Location</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportRecords.length > 0 ? (
                        reportRecords.map((r, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: "600" }}>
                              {r.registerNumber}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>{r.studentName}</td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                              {r.time ? r.time.substring(0, 5) : "--"}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                              {r.latitude ? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}` : "--"}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                              <span style={{
                                background: r.status === "PRESENT" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: r.status === "PRESENT" ? "var(--success)" : "var(--error)",
                                padding: "0.25rem 0.6rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                border: `1px solid ${r.status === "PRESENT" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
                              }}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No student directory records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Sessions Summary & List */
            <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", padding: "2.5rem", borderRadius: "20px" }}>
              <h3 style={{ margin: "0 0 1.5rem 0" }}>📊 Past Attendance Sessions</h3>

              {analyticsLoading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  Retrieving session history logs...
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.75rem 1rem" }}>Session ID</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Subject</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Conducted By</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Start Time</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Expiry Time</th>
                        <th style={{ padding: "0.75rem 1rem" }}>State</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length > 0 ? (
                        sessions.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "var(--primary)" }}>{s.id}</td>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>{s.subject}</td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-main)", fontWeight: "500" }}>{s.facultyName || "Unknown"}</td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                              {new Date(s.startTime).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                              {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                              {new Date(s.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <span style={{
                                color: s.active ? "var(--success)" : "var(--text-muted)",
                                fontWeight: "600",
                                fontSize: "0.8rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem"
                              }}>
                                {s.active ? (
                                  <>
                                    <span className="status-dot" style={{
                                      width: "6px",
                                      height: "6px",
                                      backgroundColor: "var(--success)",
                                      borderRadius: "50%",
                                      display: "inline-block",
                                      animation: "pulse 1.5s infinite"
                                    }}></span>
                                    ACTIVE
                                  </>
                                ) : "COMPLETED"}
                              </span>
                            </td>
                            <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                              <button
                                onClick={() => handleViewReport(s)}
                                style={{
                                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                                  border: "none",
                                  color: "#fff",
                                  borderRadius: "6px",
                                  padding: "0.4rem 0.9rem",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                  fontWeight: "600",
                                  transition: "all 0.2s"
                                }}
                              >
                                View Report
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                            No attendance sessions conducted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "students" && (
        <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
          
          {/* Directory List (View Only for Faculty) */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", height: "100%", display: "flex", flexDirection: "column", width: "100%" }}>
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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((s) => (
                          <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: "600" }}>{s.registerNumber || "Pending"}</td>
                            <td style={{ padding: "0.75rem 1rem", fontWeight: "500" }}>{s.name}</td>
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{s.email}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
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
