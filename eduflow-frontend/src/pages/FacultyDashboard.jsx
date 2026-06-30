import { useState, useEffect } from "react";
import { getStudents, createStudent, deleteStudent } from "../services/authService";
import { startSession, endSession, getActiveSession, getSessionRecords, getAllSessions, getSessionReport, getFacultyAnalytics, exportSessionCsv, exportSessionPdfData, getLowAttendanceStudents } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";
import AnalyticsCard from "../components/AnalyticsCard";
import { getDepartmentTimetable, getCurrentClassStatus, getSuggestedSubject } from "../services/timetableService";
import SimulationControl from "../components/SimulationControl";
import { getDepartmentLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from "../services/leaveService";
import CareerDashboardFaculty from "../components/career/CareerDashboardFaculty";


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

  // Faculty Department Analytics States
  const [facultyAnalytics, setFacultyAnalytics] = useState(null);
  const [facultyAnalyticsLoading, setFacultyAnalyticsLoading] = useState(true);

  // Timetable States
  const [timetableData, setTimetableData] = useState([]);
  const [currentClassStatus, setCurrentClassStatus] = useState(null);
  const [simParams, setSimParams] = useState(null);
  const [timetableLoading, setTimetableLoading] = useState(false);

  // Low Attendance States
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
  const [lowAttendanceLoading, setLowAttendanceLoading] = useState(false);
  const [showLowAttendance, setShowLowAttendance] = useState(false);

  // Leave Request States
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveFilter, setLeaveFilter] = useState("PENDING");
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  const fetchFacultyAnalyticsData = async () => {
    if (!token) return;
    setFacultyAnalyticsLoading(true);
    try {
      const res = await getFacultyAnalytics(token);
      setFacultyAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching faculty analytics:", err);
    } finally {
      setFacultyAnalyticsLoading(false);
    }
  };

  const fetchTimetableAndStatus = async () => {
    if (!token) return;
    setTimetableLoading(true);
    try {
      const dept = localStorage.getItem("department") || "M.Tech CSE";
      const timetableRes = await getDepartmentTimetable(dept, token);
      setTimetableData(timetableRes.data || []);
      const statusRes = await getCurrentClassStatus(simParams, token);
      setCurrentClassStatus(statusRes.data);
    } catch (err) {
      console.error("Error fetching faculty timetable / status:", err);
    } finally {
      setTimetableLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "schedule" || activeTab === "overview") {
      fetchTimetableAndStatus();
    }
  }, [activeTab, simParams, token]);

  // QR Selection prefill hook
  useEffect(() => {
    if (activeTab === "qr-session" && !activeSession && token) {
      getSuggestedSubject(simParams, token).then(res => {
        if (res.data?.suggestedSubject) {
          const sub = res.data.suggestedSubject;
          const standardSubjects = [
            "Software Engineering", "Artificial Intelligence", 
            "Database Management Systems", "Computer Networks", 
            "Cybersecurity", "Cloud Computing", "Operating Systems",
            "Data Communication & Networks", "Parallel and Cloud Computing",
            "Artificial Intelligence Expert Systems", "Agentic AI",
            "Cloud Computing Lab", "AI & Agentic AI Lab"
          ];
          const mapAbbr = {
            "OS": "Operating Systems",
            "DCN": "Data Communication & Networks",
            "PCD": "Parallel and Cloud Computing",
            "AIES": "Artificial Intelligence Expert Systems",
            "AGAI": "Agentic AI",
            "DBMS": "Database Management Systems",
            "SE": "Software Engineering",
            "CC LAB": "Cloud Computing Lab",
            "AI LAB": "AI & Agentic AI Lab"
          };
          const mappedName = mapAbbr[sub] || sub;
          
          if (standardSubjects.includes(mappedName)) {
            setSessionSubject(mappedName);
          } else {
            setSessionSubject("Custom");
            setCustomSubject(mappedName);
          }
        }
      }).catch(err => console.log(err));
    }
  }, [activeTab, activeSession, token, simParams]);

  // Fetch low attendance students
  const fetchLowAttendanceStudents = async () => {
    if (!token) return;
    setLowAttendanceLoading(true);
    try {
      const res = await getLowAttendanceStudents(token);
      setLowAttendanceStudents(res.data || []);
    } catch (err) {
      console.error("Error fetching low attendance:", err);
    } finally {
      setLowAttendanceLoading(false);
    }
  };

  // Fetch leave requests
  const fetchLeaveRequests = async (filter) => {
    const f = filter !== undefined ? filter : leaveFilter;
    if (!token) return;
    setLeaveLoading(true);
    try {
      const res = await getDepartmentLeaveRequests(token, f === "ALL" ? "" : f);
      setLeaveRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leave") fetchLeaveRequests();
    if (activeTab === "analytics") fetchLowAttendanceStudents();
  }, [activeTab, token]);

  // Handle CSV export
  const handleExportCsv = async (session) => {
    setExportingId(session.id);
    try {
      const res = await exportSessionCsv(session.id, token);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${session.subject.replace(/\s+/g, "_")}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      showFeedback("CSV exported successfully!");
    } catch (err) {
      showFeedback("Failed to export CSV.", "error");
    } finally {
      setExportingId(null);
    }
  };

  // Handle PDF print
  const handlePrintPdf = async (session) => {
    setExportingId(session.id + "-pdf");
    try {
      const res = await exportSessionPdfData(session.id, token);
      const d = res.data;
      const presentCount = d.records?.filter(r => r.status === "PRESENT").length || 0;
      const absent = d.records?.filter(r => r.status === "ABSENT").length || 0;
      const excused = d.records?.filter(r => r.status === "EXCUSED").length || 0;
      const rows = d.records?.map((r, i) => `
        <tr>
          <td>${i + 1}</td><td>${r.registerNumber}</td><td>${r.studentName}</td>
          <td>${r.department}</td>
          <td class="${r.status === 'PRESENT' ? 'present' : r.status === 'EXCUSED' ? 'excused' : 'absent'}">${r.status}</td>
          <td>${r.scanTime || "--"}</td>
        </tr>`).join("") || "";

      const html = `<!DOCTYPE html><html><head><title>Attendance Report</title><style>
        * { margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',sans-serif; }
        body { padding:30px;background:#fff;color:#111; }
        .header { text-align:center;border-bottom:2px solid #6366f1;padding-bottom:16px;margin-bottom:24px; }
        .header h1 { font-size:1.6rem;color:#6366f1; } .header p { color:#555;font-size:0.9rem;margin-top:4px; }
        .meta { display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px; }
        .meta-card { background:#f8f9ff;border:1px solid #e0e7ff;border-radius:8px;padding:12px 16px; }
        .meta-card .label { font-size:0.7rem;color:#6366f1;text-transform:uppercase;font-weight:600; }
        .meta-card .value { font-size:1.1rem;font-weight:700;margin-top:4px; }
        table { width:100%;border-collapse:collapse;font-size:0.88rem; }
        th { background:#6366f1;color:#fff;padding:10px 12px;text-align:left; }
        td { padding:8px 12px;border-bottom:1px solid #eee; }
        tr:nth-child(even) td { background:#f9f9ff; }
        .present{color:#10b981;font-weight:700;} .absent{color:#ef4444;font-weight:700;} .excused{color:#f59e0b;font-weight:700;}
        @media print { body { padding:20px; } }
      </style></head><body>
        <div class="header"><h1>EduFlow — Attendance Report</h1><p>Generated on ${new Date().toLocaleString()}</p></div>
        <div class="meta">
          <div class="meta-card"><div class="label">Subject</div><div class="value">${d.subject}</div></div>
          <div class="meta-card"><div class="label">Faculty</div><div class="value">${d.faculty}</div></div>
          <div class="meta-card"><div class="label">Department</div><div class="value">${d.department || "N/A"}</div></div>
          <div class="meta-card"><div class="label">Date</div><div class="value">${d.date}</div></div>
          <div class="meta-card"><div class="label">Present</div><div class="value" style="color:#10b981">${presentCount} / ${d.totalStudents}</div></div>
          <div class="meta-card"><div class="label">Absent / Excused</div><div class="value">${absent} / <span style="color:#f59e0b">${excused}</span></div></div>
        </div>
        <table><thead><tr><th>#</th><th>Reg No.</th><th>Name</th><th>Department</th><th>Status</th><th>Scan Time</th></tr></thead>
          <tbody>${rows}</tbody></table>
      </body></html>`;

      const w = window.open("", "_blank", "width=900,height=700");
      w.document.write(html);
      w.document.close();
      setTimeout(() => { w.focus(); w.print(); }, 500);
    } catch (err) {
      showFeedback("Failed to generate PDF.", "error");
    } finally {
      setExportingId(null);
    }
  };

  const handleApproveLeave = async (id) => {
    try {
      await approveLeaveRequest(id, token);
      showFeedback("Leave request approved! EXCUSED records created.");
      fetchLeaveRequests();
    } catch (err) {
      showFeedback(err.response?.data || "Failed to approve leave.", "error");
    }
  };

  const handleRejectLeave = async (id) => {
    try {
      await rejectLeaveRequest(id, token, rejectReason);
      showFeedback("Leave request rejected.");
      setRejectingId(null);
      setRejectReason("");
      fetchLeaveRequests();
    } catch (err) {
      showFeedback(err.response?.data || "Failed to reject leave.", "error");
    }
  };

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
    fetchFacultyAnalyticsData();
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

  const renderFacultyGridCell = (day, period) => {
    const entry = timetableData.find(e => e.dayOfWeek === day && e.period === period);
    const isMyClass = entry && entry.faculty && entry.faculty.id === Number(localStorage.getItem("userId"));
    
    const isActiveCell = currentClassStatus && 
      currentClassStatus.status === "CLASS" && 
      currentClassStatus.periodNumber === period && 
      (simParams?.simulatedDay 
        ? simParams.simulatedDay === day 
        : new Date().toLocaleDateString("en-US", { weekday: "long" }) === day);

    if (isMyClass) {
      return (
        <td key={period} className={`grid-class-cell active-faculty-class-cell ${isActiveCell ? "active-cell" : ""}`}>
          <div className="cell-subject">{entry.subject}</div>
          <div className="cell-dept">{entry.department}</div>
        </td>
      );
    } else if (entry && entry.subject && entry.subject.trim() !== "") {
      return (
        <td key={period} className="grid-class-cell other-faculty-class-cell">
          <div className="cell-subject-muted">{entry.subject}</div>
          <div className="cell-faculty-muted">{entry.faculty?.name || "Unassigned"}</div>
        </td>
      );
    } else {
      return (
        <td key={period} className="free-cell">
          <div className="cell-subject-muted">-</div>
        </td>
      );
    }
  };

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
        <button
          onClick={() => { setActiveTab("schedule"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "schedule" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "schedule" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📅 My Schedule
        </button>
        <button
          onClick={() => { setActiveTab("leave"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "leave" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "leave" ? "none" : "1px solid var(--card-border)",
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
          📋 Leave Requests
          {leaveRequests.filter(r => r.status === "PENDING").length > 0 && (
            <span style={{
              background: "var(--warning)", color: "#000", borderRadius: "50%",
              width: "18px", height: "18px", fontSize: "0.7rem", fontWeight: "700",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{leaveRequests.filter(r => r.status === "PENDING").length}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("career"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "career" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "career" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          ⭐ Career
        </button>
      </div>

      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", width: "100%" }}>
          {/* Live Proximity Check-in session card (if active) */}
          {activeSession && (
            <div className="live-monitor-card" style={{
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.75) 0%, rgba(17, 24, 39, 0.85) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              animation: "fadeIn 0.5s ease",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* background design element */}
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

          {/* Reusable Analytics Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", width: "100%" }}>
            <AnalyticsCard
              title="Department Students"
              score={facultyAnalytics?.totalStudents ?? 0}
              status={facultyAnalytics?.department ?? "N/A"}
              icon="🎓"
              subText="Registered Active Students"
              maxScore={100} // absolute count
            />
            <AnalyticsCard
              title="Present Today"
              score={facultyAnalytics?.presentToday ?? 0}
              status="Active"
              icon="✓"
              subText="Unique Students Checked In"
              maxScore={facultyAnalytics?.totalStudents || 1}
            />
            <AnalyticsCard
              title="Absent Today"
              score={facultyAnalytics?.absentToday ?? 0}
              status={facultyAnalytics?.absentToday > 0 ? "Warning" : "Clean"}
              icon="✗"
              subText="Not Checked In Today"
              maxScore={facultyAnalytics?.totalStudents || 1}
            />
            <AnalyticsCard
              title="Avg Attendance"
              score={facultyAnalytics?.averageAttendance ?? 0}
              status="Dept Avg"
              icon="📈"
              subText="Cumulative Avg Rate"
              maxScore={100}
            />
          </div>

          {/* Student Rankings section */}
          <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
            
            {/* Top 5 Performers */}
            <div style={{ flex: "1 1 450px" }}>
              <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--success)", fontSize: "1.25rem", fontFamily: "var(--font-heading)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
                  🏆 Top 5 Performing Students
                </h3>
                {facultyAnalyticsLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading top performers...</div>
                ) : facultyAnalytics?.topStudents && facultyAnalytics.topStudents.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                          <th style={{ padding: "0.5rem" }}>Rank</th>
                          <th style={{ padding: "0.5rem" }}>Reg No.</th>
                          <th style={{ padding: "0.5rem" }}>Name</th>
                          <th style={{ padding: "0.5rem", textAlign: "right" }}>Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyAnalytics.topStudents.map((s, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                            <td style={{ padding: "0.75rem 0.5rem", fontWeight: "700", color: idx === 0 ? "#ffd700" : idx === 1 ? "#c0c0c0" : idx === 2 ? "#cd7f32" : "var(--text-muted)" }}>
                              #{idx + 1}
                            </td>
                            <td style={{ padding: "0.75rem 0.5rem", color: "var(--primary)", fontWeight: "600" }}>{s.registerNumber}</td>
                            <td style={{ padding: "0.75rem 0.5rem", fontWeight: "500" }}>{s.name}</td>
                            <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "var(--success)", fontWeight: "700" }}>
                              {s.attendancePercentage.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontStyle: "italic" }}>No records found.</div>
                )}
              </div>
            </div>

            {/* Students At Risk (Bottom 5) */}
            <div style={{ flex: "1 1 450px" }}>
              <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--error)", fontSize: "1.25rem", fontFamily: "var(--font-heading)", fontWeight: "600", display: "flex", alignItems: "center", gap: "0.5rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
                  ⚠️ Students At Risk (Lowest Attendance)
                </h3>
                {facultyAnalyticsLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading students at risk...</div>
                ) : facultyAnalytics?.bottomStudents && facultyAnalytics.bottomStudents.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                          <th style={{ padding: "0.5rem" }}>Rank</th>
                          <th style={{ padding: "0.5rem" }}>Reg No.</th>
                          <th style={{ padding: "0.5rem" }}>Name</th>
                          <th style={{ padding: "0.5rem", textAlign: "right" }}>Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyAnalytics.bottomStudents.map((s, idx) => {
                          const pct = s.attendancePercentage;
                          const color = pct < 75 ? "var(--error)" : pct <= 85 ? "var(--warning)" : "var(--success)";
                          return (
                            <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                              <td style={{ padding: "0.75rem 0.5rem", fontWeight: "700", color: "var(--text-muted)" }}>
                                #{facultyAnalytics.bottomStudents.length - idx}
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem", color: "var(--primary)", fontWeight: "600" }}>{s.registerNumber}</td>
                              <td style={{ padding: "0.75rem 0.5rem", fontWeight: "500" }}>{s.name}</td>
                              <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: color, fontWeight: "700" }}>
                                {pct.toFixed(1)}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontStyle: "italic" }}>No records found.</div>
                )}
              </div>
            </div>

          </div>

          {/* Rest of the original navigation cards */}
          <div className="dashboard-grid" style={{ marginTop: "1rem" }}>
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
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Data Communication & Networks">Data Communication & Networks</option>
                    <option value="Parallel and Cloud Computing">Parallel and Cloud Computing</option>
                    <option value="Artificial Intelligence Expert Systems">Artificial Intelligence Expert Systems</option>
                    <option value="Agentic AI">Agentic AI</option>
                    <option value="Cloud Computing Lab">Cloud Computing Lab</option>
                    <option value="AI & Agentic AI Lab">AI & Agentic AI Lab</option>
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

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleExportCsv(selectedSession)}
                    disabled={exportingId === selectedSession.id}
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--success)", borderRadius: "8px", padding: "0.5rem 1rem", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {exportingId === selectedSession.id ? "Exporting..." : "⬇ Export CSV"}
                  </button>
                  <button
                    onClick={() => handlePrintPdf(selectedSession)}
                    disabled={exportingId === selectedSession.id + "-pdf"}
                    style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "var(--primary)", borderRadius: "8px", padding: "0.5rem 1rem", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {exportingId === selectedSession.id + "-pdf" ? "Generating..." : "🖨 Print PDF"}
                  </button>

                  <div style={{ background: "rgba(31, 41, 55, 0.6)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "0.75rem 1.5rem", textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>Attendance Rate</span>
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", fontWeight: "700", color: "var(--primary)" }}>
                      {reportRecords.length > 0 ? Math.round((reportRecords.filter(r => r.status === "PRESENT").length / reportRecords.length) * 100) : 0}%
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>
                      ({reportRecords.filter(r => r.status === "PRESENT").length} / {reportRecords.length} Present)
                    </span>
                  </div>
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
            <>
              {/* Low Attendance Students Panel */}
              <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", padding: "2.5rem", borderRadius: "20px" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  ⚠️ Low Attendance Students (<span style={{ fontSize: "1rem" }}>Below 75%</span>)
                </h3>
                {lowAttendanceLoading ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    Loading low attendance records...
                  </div>
                ) : lowAttendanceStudents && lowAttendanceStudents.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                    {lowAttendanceStudents.map((student, idx) => (
                      <div key={idx} style={{
                        background: "rgba(31, 41, 55, 0.4)",
                        border: `1px solid ${student.overallAttendance < 60 ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                        borderRadius: "12px", padding: "1.25rem",
                        display: "flex", flexDirection: "column", gap: "0.5rem"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: "700", fontSize: "1.05rem" }}>{student.studentName}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{student.registerNumber} • {student.department}</div>
                          </div>
                          <div style={{
                            background: student.overallAttendance < 60 ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: student.overallAttendance < 60 ? "var(--error)" : "var(--warning)",
                            padding: "0.3rem 0.6rem", borderRadius: "6px", fontWeight: "700", fontSize: "0.9rem"
                          }}>
                            {(student.overallAttendance || 0).toFixed(1)}%
                          </div>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-main)", marginTop: "0.5rem" }}>
                          <span style={{ fontWeight: "600", color: "var(--text-muted)" }}>Lowest Subjects:</span>
                          <ul style={{ margin: "0.25rem 0 0 1.2rem", padding: 0 }}>
                            {student.subjectBreakdown?.slice(0, 2).map((sb, i) => (
                              <li key={i}>{sb.subject} ({(sb.attendancePercentage || 0).toFixed(1)}%)</li>
                            ))}
                            {student.subjectBreakdown?.length > 2 && <li>...</li>}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sessions.length === 0 && !activeSession ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
                    <p style={{ fontWeight: 600 }}>No attendance data available yet.</p>
                    <p style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>This report will be generated after attendance sessions are conducted.</p>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
                    All students are maintaining good attendance (above 75%).
                  </div>
                )}
              </div>

              {/* Sessions Summary & List */}
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
            </>
          )}
        </div>
      )}

      {/* ─── LEAVE REQUESTS TAB ─────────────────────────────────────────── */}
      {activeTab === "leave" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.3)", borderRadius: "20px", padding: "2.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: "700" }}>
                📋 Department Leave Requests
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
                  <button key={f} onClick={() => { setLeaveFilter(f); fetchLeaveRequests(f); }}
                    style={{
                      background: leaveFilter === f ? "linear-gradient(135deg, var(--primary), var(--secondary))" : "rgba(31,41,55,0.5)",
                      border: leaveFilter === f ? "none" : "1px solid var(--card-border)",
                      color: "#fff", borderRadius: "6px", padding: "0.4rem 0.9rem",
                      fontWeight: "600", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s"
                    }}>{f}</button>
                ))}
              </div>
            </div>

            {leaveLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading leave requests...</div>
            ) : leaveRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
                No {leaveFilter !== "ALL" ? leaveFilter.toLowerCase() : ""} leave requests found.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {leaveRequests.map(lr => (
                  <div key={lr.id} style={{
                    background: lr.status === "APPROVED" ? "rgba(16,185,129,0.06)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                    border: `1px solid ${lr.status === "APPROVED" ? "rgba(16,185,129,0.2)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.25)"}`,
                    borderRadius: "14px", padding: "1.5rem", animation: "fadeIn 0.3s ease"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <span style={{
                            background: lr.status === "APPROVED" ? "rgba(16,185,129,0.15)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                            color: lr.status === "APPROVED" ? "var(--success)" : lr.status === "REJECTED" ? "var(--error)" : "var(--warning)",
                            border: `1px solid ${lr.status === "APPROVED" ? "rgba(16,185,129,0.3)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                            borderRadius: "6px", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: "700"
                          }}>{lr.status}</span>
                          <span style={{ background: "rgba(99,102,241,0.1)", color: "var(--primary)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "6px", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: "600" }}>
                            {lr.type}
                          </span>
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "1rem" }}>{lr.studentName || `Student #${lr.studentId}`}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.2rem" }}>
                          Reg: {lr.registerNumber || "N/A"} • {lr.department}
                        </div>
                        <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          📅 {lr.fromDate} → {lr.toDate}
                        </div>
                        {lr.reason && <div style={{ marginTop: "0.5rem", color: "var(--text-main)", fontSize: "0.85rem", fontStyle: "italic" }}>"{lr.reason}"</div>}
                        {lr.rejectionReason && <div style={{ marginTop: "0.35rem", color: "var(--error)", fontSize: "0.8rem" }}>Rejection reason: {lr.rejectionReason}</div>}
                        <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                          Submitted: {lr.createdAt ? new Date(lr.createdAt).toLocaleString() : ""}
                        </div>
                      </div>

                      {lr.status === "PENDING" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "200px" }}>
                          {rejectingId === lr.id ? (
                            <>
                              <input type="text" className="input-field" placeholder="Rejection reason (optional)"
                                value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                style={{ fontSize: "0.82rem", padding: "0.5rem 0.75rem" }} />
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button onClick={() => handleRejectLeave(lr.id)}
                                  style={{ flex: 1, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--error)", borderRadius: "6px", padding: "0.45rem", fontWeight: "600", fontSize: "0.82rem", cursor: "pointer" }}>
                                  Confirm Reject
                                </button>
                                <button onClick={() => { setRejectingId(null); setRejectReason(""); }}
                                  style={{ background: "transparent", border: "1px solid var(--card-border)", color: "var(--text-muted)", borderRadius: "6px", padding: "0.45rem 0.75rem", cursor: "pointer", fontSize: "0.82rem" }}>
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleApproveLeave(lr.id)}
                                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--success)", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>
                                ✓ Approve
                              </button>
                              <button onClick={() => setRejectingId(lr.id)}
                                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--error)", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}>
                                ✗ Reject
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {activeTab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
          <SimulationControl onChange={(params) => setSimParams(params)} />

          {/* Current Class Live Alert for Faculty */}
          {currentClassStatus && (
            <div className="faculty-tracker-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              <div className="dashboard-card status-tracker-card" style={{
                background: "rgba(30, 41, 59, 0.25)",
                border: "1px solid var(--card-border)",
                borderRadius: "20px",
                padding: "1.5rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span className="tracker-badge" style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    background: currentClassStatus.status === "CLASS" ? "rgba(99, 102, 241, 0.15)" : "rgba(148, 163, 184, 0.1)",
                    color: currentClassStatus.status === "CLASS" ? "var(--primary)" : "var(--text-muted)",
                    border: `1px solid ${currentClassStatus.status === "CLASS" ? "rgba(99, 102, 241, 0.3)" : "rgba(148, 163, 184, 0.2)"}`
                  }}>
                    {currentClassStatus.status === "CLASS" ? "Department active class" : currentClassStatus.status}
                  </span>
                  {currentClassStatus.status === "CLASS" && currentClassStatus.periodNumber && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Period {currentClassStatus.periodNumber}</span>
                  )}
                </div>

                {currentClassStatus.status === "CLASS" && currentClassStatus.currentClass ? (
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.4rem", color: "#fff" }}>
                      {currentClassStatus.currentClass.subject}
                    </h3>
                    <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>
                      Department: <span style={{ color: "#fff" }}>{currentClassStatus.currentClass.department}</span> | Instructor: <span style={{ color: "#fff" }}>{currentClassStatus.currentClass.faculty?.name || "Unassigned"}</span>
                    </p>

                    {currentClassStatus.currentClass.faculty?.id === Number(localStorage.getItem("userId")) ? (
                      <div style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        borderRadius: "10px",
                        padding: "1rem",
                        marginTop: "1rem"
                      }}>
                        <p style={{ color: "var(--success)", fontSize: "0.85rem", fontWeight: "600", margin: "0 0 0.75rem 0" }}>
                          🚨 You are scheduled to teach this class right now!
                        </p>
                        {!activeSession ? (
                          <button
                            onClick={() => {
                              const sub = currentClassStatus.currentClass.subject;
                              const standardSubjects = [
                                "Software Engineering", "Artificial Intelligence", 
                                "Database Management Systems", "Computer Networks", 
                                "Cybersecurity", "Cloud Computing", "Operating Systems",
                                "Data Communication & Networks", "Parallel and Cloud Computing",
                                "Artificial Intelligence Expert Systems", "Agentic AI",
                                "Cloud Computing Lab", "AI & Agentic AI Lab"
                              ];
                              const mapAbbr = {
                                "OS": "Operating Systems",
                                "DCN": "Data Communication & Networks",
                                "PCD": "Parallel and Cloud Computing",
                                "AIES": "Artificial Intelligence Expert Systems",
                                "AGAI": "Agentic AI",
                                "DBMS": "Database Management Systems",
                                "SE": "Software Engineering",
                                "CC LAB": "Cloud Computing Lab",
                                "AI LAB": "AI & Agentic AI Lab"
                              };
                              const mappedName = mapAbbr[sub] || sub;
                              if (standardSubjects.includes(mappedName)) {
                                setSessionSubject(mappedName);
                              } else {
                                setSessionSubject("Custom");
                                setCustomSubject(mappedName);
                              }
                              setActiveTab("qr-session");
                            }}
                            className="auth-btn"
                            style={{
                              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                              padding: "0.6rem 1rem",
                              fontSize: "0.85rem",
                              margin: 0,
                              width: "auto"
                            }}
                          >
                            🚀 Launch Attendance QR Screen
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "var(--success)", fontWeight: "500" }}>
                            ✓ Attendance QR session is currently active for this class.
                          </span>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", margin: 0 }}>
                        This class is taught by {currentClassStatus.currentClass.faculty?.name || "another professor"}.
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                      {currentClassStatus.status === "LUNCH" || currentClassStatus.status === "BREAK" ? "☕" : "🏖️"}
                    </div>
                    <h4 style={{ color: "#fff", margin: "0 0 0.25rem 0" }}>
                      {currentClassStatus.status === "LUNCH" ? "Lunch Break" :
                       currentClassStatus.status === "BREAK" ? "Short Break" :
                       currentClassStatus.status === "WEEKEND" ? "Weekend" :
                       currentClassStatus.status === "BEFORE_COLLEGE" ? "Before College Hours" :
                       currentClassStatus.status === "ENDED" ? "Classes Ended" : "Free Hour"}
                    </h4>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.85rem" }}>
                      No active department lecture scheduled at this hour.
                    </p>
                  </div>
                )}
              </div>

              {/* Teaching schedule overview today */}
              <div className="dashboard-card next-class-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "1.5rem" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: "700" }}>
                  Your next lecture today
                </span>
                {(() => {
                  if (!currentClassStatus?.todayTimeline) return null;
                  const myUserId = Number(localStorage.getItem("userId"));
                  const currentPeriod = currentClassStatus.periodNumber || 0;
                  
                  const day = simParams?.simulatedDay || new Date().toLocaleDateString("en-US", { weekday: "long" });
                  const myUpcoming = timetableData.filter(
                    e => e.dayOfWeek === day && e.period > currentPeriod && e.faculty?.id === myUserId
                  ).sort((a, b) => a.period - b.period);

                  if (myUpcoming.length > 0) {
                    const nextLect = myUpcoming[0];
                    return (
                      <div style={{ marginTop: "1rem" }}>
                        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", color: "#fff" }}>
                          {nextLect.subject}
                        </h3>
                        <p style={{ color: "var(--text-muted)", margin: "0 0 1rem 0", fontSize: "0.85rem" }}>
                          Period {nextLect.period} | Department: <span style={{ color: "#fff" }}>{nextLect.department}</span>
                        </p>
                        <span style={{ background: "rgba(99, 102, 241, 0.1)", borderRadius: "6px", padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "var(--primary)", fontWeight: "600" }}>
                          Scheduled
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💤</div>
                      <h4 style={{ color: "#fff", margin: "0 0 0.25rem 0" }}>No More Lectures Today</h4>
                      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.85rem" }}>
                        You have no upcoming classes to teach today.
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Weekly Department Schedule Grid */}
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.2rem", fontWeight: "600" }}>
                📅 Weekly Department Schedule ({localStorage.getItem("department") || "M.Tech CSE"})
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600", border: "1px solid rgba(99, 102, 241, 0.3)", padding: "0.3rem 0.6rem", borderRadius: "6px", background: "rgba(99, 102, 241, 0.05)" }}>
                🔵 Highlighted: Your Lectures
              </span>
            </div>
            
            <div style={{ overflowX: "auto" }}>
              <table className="timetable-grid-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>P1<span className="time-sub">8:45-9:40</span></th>
                    <th>P2<span className="time-sub">9:40-10:35</span></th>
                    <th className="break-hdr">Break<span className="time-sub">10:35-10:50</span></th>
                    <th>P3<span className="time-sub">10:50-11:45</span></th>
                    <th>P4<span className="time-sub">11:45-12:40</span></th>
                    <th className="break-hdr">Lunch<span className="time-sub">12:40-1:40</span></th>
                    <th>P5<span className="time-sub">1:40-2:35</span></th>
                    <th>P6<span className="time-sub">2:35-3:30</span></th>
                    <th>P7<span className="time-sub">3:30-4:25</span></th>
                    <th>P8<span className="time-sub">4:25-5:20</span></th>
                  </tr>
                </thead>
                <tbody>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                    const isToday = currentClassStatus?.status !== "WEEKEND" && currentClassStatus?.todayTimeline && currentClassStatus?.todayTimeline.length > 0 && 
                      (simParams?.simulatedDay ? simParams.simulatedDay === day : new Date().toLocaleDateString("en-US", { weekday: "long" }) === day);
                    
                    return (
                      <tr key={day} className={isToday ? "today-row" : ""}>
                        <td className="day-name-cell">{day}</td>
                        {[1, 2].map(p => renderFacultyGridCell(day, p))}
                        <td className="grid-break-cell">Short Break</td>
                        {[3, 4].map(p => renderFacultyGridCell(day, p))}
                        <td className="grid-break-cell">Lunch Break</td>
                        {[5, 6, 7, 8].map(p => renderFacultyGridCell(day, p))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <style>{`
            .timetable-grid-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 0.85rem;
              text-align: center;
              border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .timetable-grid-table th {
              background: rgba(31, 41, 55, 0.6);
              color: #f1f5f9;
              font-weight: 600;
              padding: 12px 8px;
              border: 1px solid rgba(255, 255, 255, 0.08);
              min-width: 100px;
              font-size: 0.8rem;
            }
            .timetable-grid-table td {
              border: 1px solid rgba(255, 255, 255, 0.06);
              padding: 12px 8px;
              height: 60px;
              vertical-align: middle;
            }
            .time-sub {
              display: block;
              font-size: 0.65rem;
              color: #94a3b8;
              font-weight: normal;
              margin-top: 4px;
            }
            .day-name-cell {
              font-weight: 700;
              color: #f1f5f9;
              background: rgba(30, 41, 59, 0.4);
              min-width: 90px;
            }
            .grid-break-cell {
              background: rgba(31, 41, 55, 0.25);
              color: #64748b;
              font-size: 0.75rem;
              font-style: italic;
              max-width: 35px;
              writing-mode: vertical-rl;
              text-orientation: mixed;
              letter-spacing: 2px;
              font-weight: 600;
              border-left: 1px dashed rgba(255, 255, 255, 0.1);
              border-right: 1px dashed rgba(255, 255, 255, 0.1);
            }
            .break-hdr {
              background: rgba(31, 41, 55, 0.35) !important;
              min-width: 40px !important;
              letter-spacing: 1px;
            }
            .grid-class-cell {
              background: rgba(30, 41, 59, 0.1);
              transition: all 0.2s;
            }
            .active-faculty-class-cell {
              background: rgba(99, 102, 241, 0.15) !important;
              border: 1.5px solid rgba(99, 102, 241, 0.4) !important;
            }
            .active-faculty-class-cell .cell-subject {
              font-weight: 700;
              color: #a5b4fc;
            }
            .other-faculty-class-cell {
              opacity: 0.75;
            }
            .cell-subject-muted {
              font-size: 0.8rem;
              color: #64748b;
            }
            .cell-faculty-muted {
              font-size: 0.65rem;
              color: #475569;
              margin-top: 2px;
            }
            .free-cell {
              color: #475569;
              background: rgba(15, 23, 42, 0.1);
            }
            .cell-subject {
              font-weight: 600;
              color: #fff;
              font-size: 0.9rem;
            }
            .cell-dept {
              font-size: 0.7rem;
              color: #94a3b8;
              margin-top: 4px;
            }
            .active-cell {
              background: rgba(99, 102, 241, 0.25) !important;
              border: 2px solid var(--primary) !important;
              animation: activePulse 2s infinite alternate;
            }
            @keyframes activePulse {
              0% { box-shadow: inset 0 0 10px rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.8) !important; }
              100% { box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.35); border-color: rgba(99, 102, 241, 1) !important; }
            }
            .today-row {
              background: rgba(99, 102, 241, 0.02);
            }
            .today-row .day-name-cell {
              border-left: 4px solid var(--primary) !important;
            }
          `}</style>
        </div>
      )}

      {activeTab === "career" && (
        <CareerDashboardFaculty />
      )}
    </div>
  );
}

export default FacultyDashboard;
