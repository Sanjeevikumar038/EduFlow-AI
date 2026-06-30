import { useState, useEffect } from "react";
import { getActiveSession, markAttendance, getStudentAnalytics } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import AnalyticsCard from "../components/AnalyticsCard";
import { getStudentTimetable, getCurrentClassStatus } from "../services/timetableService";
import SimulationControl from "../components/SimulationControl";
import { submitLeaveRequest, getMyLeaveRequests } from "../services/leaveService";
import ResumeManagement from "../components/career/ResumeManagement";
import CodingDashboard from "../components/career/CodingDashboard";
import InterviewDashboard from "../components/career/InterviewDashboard";
import CareerDashboard from "../components/career/CareerDashboard";
import NotificationBell from "../components/career/NotificationBell";

function AttendanceTrendChart({ trendData }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)", fontStyle: "italic", background: "rgba(30, 41, 59, 0.2)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
        📊 No trend data available yet. Trends will appear as attendance is marked.
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  const pointsCount = trendData.length;
  const xSpan = width - paddingX * 2;
  const ySpan = height - paddingY * 2;

  const coordinates = trendData.map((d, i) => {
    const x = pointsCount > 1 
      ? paddingX + (i / (pointsCount - 1)) * xSpan 
      : width / 2;
    const y = height - paddingY - (d.percentage / 100) * ySpan;
    return { x, y, date: d.date, pct: d.percentage };
  });

  let linePath = "";
  if (coordinates.length > 0) {
    linePath = `M ${coordinates[0].x} ${coordinates[0].y}`;
    for (let i = 1; i < coordinates.length; i++) {
      linePath += ` L ${coordinates[i].x} ${coordinates[i].y}`;
    }
  }

  let fillPath = "";
  if (coordinates.length > 0) {
    fillPath = `${linePath} L ${coordinates[coordinates.length - 1].x} ${height - paddingY} L ${coordinates[0].x} ${height - paddingY} Z`;
  }

  return (
    <div style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)" }}>
      <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
        📈 Attendance Trend
      </h3>
      <div style={{ position: "relative", width: "100%", flexGrow: 1 }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
          <line x1={paddingX} y1={paddingY + ySpan / 2} x2={width - paddingX} y2={paddingY + ySpan / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.1)" />
          
          <text x={paddingX - 10} y={paddingY + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontWeight="500">100%</text>
          <text x={paddingX - 10} y={paddingY + ySpan / 2 + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontWeight="500">50%</text>
          <text x={paddingX - 10} y={height - paddingY + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontWeight="500">0%</text>

          {fillPath && <path d={fillPath} fill="url(#sparkline-grad)" />}
          
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {coordinates.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="var(--secondary)"
                stroke="#fff"
                strokeWidth="2"
                style={{ transition: "all 0.2s" }}
              />
              <title>{`${pt.date}: ${pt.pct.toFixed(1)}%`}</title>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: `${paddingX}px`, paddingRight: `${paddingX}px`, marginTop: "1rem" }}>
        {trendData.map((d, i) => {
          const showLabel = i === 0 || i === trendData.length - 1 || (trendData.length > 2 && i === Math.floor(trendData.length / 2));
          return (
            <span key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500", visibility: showLabel ? "visible" : "hidden" }}>
              {d.date.substring(5)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StudentDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Student";
  const registerNumber = localStorage.getItem("registerNumber") || "";
  const token = localStorage.getItem("token");

  // Tab State: 'overview', 'attendance', or 'timetable'
  const [activeTab, setActiveTab] = useState("overview");

  // Student Analytics States
  const [studentAnalytics, setStudentAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Timetable & Status States
  const [timetableData, setTimetableData] = useState([]);
  const [currentClassStatus, setCurrentClassStatus] = useState(null);
  const [simParams, setSimParams] = useState(null);
  const [timetableLoading, setTimetableLoading] = useState(false);

  // Leave Request States
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "OD", fromDate: "", toDate: "", reason: "" });
  const [leaveFormError, setLeaveFormError] = useState("");

  // Career Dashboard States
  const [careerData, setCareerData] = useState(null);

  const fetchStudentAnalytics = async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await getStudentAnalytics(token);
      setStudentAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching student analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchTimetableAndStatus = async () => {
    if (!token) return;
    setTimetableLoading(true);
    try {
      const timetableRes = await getStudentTimetable(token);
      setTimetableData(timetableRes.data);

      const statusRes = await getCurrentClassStatus(simParams, token);
      setCurrentClassStatus(statusRes.data);
    } catch (err) {
      console.error("Error fetching student timetable/status:", err);
    } finally {
      setTimetableLoading(false);
    }
  };

  const fetchCareerData = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/career/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCareerData(await res.json());
      }
    } catch (err) {
      console.error("Error fetching career data:", err);
    }
  };

  useEffect(() => {
    fetchStudentAnalytics();
    fetchCareerData();
  }, [token]);

  useEffect(() => {
    fetchTimetableAndStatus();
    // Auto-refresh the current status every 30 seconds if simulation mode is off
    if (!simParams && token) {
      const interval = setInterval(() => {
        getCurrentClassStatus(null, token)
          .then((res) => {
            setCurrentClassStatus(res.data);
          })
          .catch((err) => console.log(err));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token, simParams]);

  // Attendance States
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [sessionCheckLoading, setSessionCheckLoading] = useState(false);

  // Scanner States
  const [scannerActive, setScannerActive] = useState(false);
  const [qrInstance, setQrInstance] = useState(null);

  // Fetch my leave requests
  const fetchMyLeaveRequests = async () => {
    if (!token) return;
    setLeaveLoading(true);
    try {
      const res = await getMyLeaveRequests(token);
      setMyLeaveRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    } finally {
      setLeaveLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leave") fetchMyLeaveRequests();
  }, [activeTab, token]);

  const handleLeaveFormChange = (field, value) => {
    setLeaveForm(prev => ({ ...prev, [field]: value }));
    setLeaveFormError("");
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.fromDate || !leaveForm.toDate) {
      setLeaveFormError("From date and To date are required.");
      return;
    }
    if (leaveForm.fromDate > leaveForm.toDate) {
      setLeaveFormError("From date cannot be after To date.");
      return;
    }
    setLeaveSubmitting(true);
    try {
      await submitLeaveRequest({
        type: leaveForm.type,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason
      }, token);
      showFeedback("Leave request submitted successfully!");
      setLeaveForm({ type: "OD", fromDate: "", toDate: "", reason: "" });
      fetchMyLeaveRequests();
    } catch (err) {
      showFeedback(err.response?.data || "Failed to submit leave request.", "error");
    } finally {
      setLeaveSubmitting(false);
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

  // Check for active attendance session
  const checkActiveSession = async (silent = false) => {
    if (!token) return;
    if (!silent) setSessionCheckLoading(true);
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
        if (!silent) showFeedback("No active attendance session found.", "error");
      }
    } catch (error) {
      console.error("Error checking active session:", error);
      if (!silent) showFeedback("Failed to check active sessions.", "error");
    } finally {
      if (!silent) setSessionCheckLoading(false);
    }
  };

  // Get student GPS location coordinates strictly (No mock fallbacks allowed)
  const requestLocation = () => {
    if (!navigator.geolocation) {
      showFeedback("Geolocation is not supported by your browser.", "error");
      return;
    }
    setGpsLoading(true);
    setCoords(null); // Clear previous coordinates
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setGpsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setCoords(null);
          setGpsLoading(false);
          let errMsg = "GPS error. Please check permissions.";
          if (error.code === 1) {
            errMsg = "GPS permission denied. Please allow location access.";
          } else if (error.code === 2) {
            errMsg = "GPS position unavailable. Try outdoors or restart location service.";
          } else if (error.code === 3) {
            errMsg = "GPS request timed out. Please try again.";
          }
          showFeedback(errMsg, "error");
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
      );
    } catch (e) {
      console.error("Geolocation sync exception:", e);
      setGpsLoading(false);
      showFeedback("Failed to request GPS. Ensure connection is secure (HTTPS).", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      checkActiveSession(true);
      requestLocation();
    } else {
      // If we exit tab, stop camera scanner
      stopCameraScanner();
    }
  }, [activeTab]);

  // Live timer for active session
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const expiry = parseLocalDateTime(activeSession.expiryTime);
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        setActiveSession(null);
        stopCameraScanner();
        showFeedback("Attendance session has expired.", "error");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Handle scanned data processing
  const processScannedPayload = async (decodedText, scannerInstance) => {
    // 1. Instantly stop scanner to avoid duplicate requests
    if (scannerInstance && scannerInstance.isScanning) {
      await scannerInstance.stop().catch(err => console.error("Error stopping scanner:", err));
    }
    setScannerActive(false);
    setQrInstance(null);

    // 2. Decode payload format: eduflow:session:id:otp
    const parts = decodedText.trim().split(":");
    if (parts.length >= 4 && parts[0] === "eduflow" && parts[1] === "session") {
      const parsedSessionId = parseInt(parts[2], 10);
      if (parsedSessionId !== activeSession.id) {
        showFeedback("Scanned QR code is for a different class session!", "error");
        return;
      }
      
      const otp = parts[3];
      submitAttendance(otp);
    } else {
      showFeedback("Invalid QR code format. Please scan the official class QR code.", "error");
    }
  };

  const submitAttendance = async (otp) => {
    if (!coords) {
      showFeedback("GPS location access is required. Please authorize location permission first.", "error");
      requestLocation();
      return;
    }

    setMarkingLoading(true);
    try {
      const res = await markAttendance(
        {
          sessionId: activeSession.id,
          otp: otp,
          latitude: coords.latitude,
          longitude: coords.longitude
        },
        token
      );
      showFeedback(res.data || "Attendance marked successfully as PRESENT!", "success");
      // Go back to overview after success
      setTimeout(() => {
        setActiveTab("overview");
      }, 2000);
    } catch (error) {
      showFeedback(error.response?.data || "Failed to mark attendance.", "error");
    } finally {
      setMarkingLoading(false);
    }
  };

  // Start HTML5 camera scanner
  const startCameraScanner = () => {
    if (!activeSession) return;
    if (!coords) {
      showFeedback("Please authorize location access before scanning.", "error");
      requestLocation();
      return;
    }
    setScannerActive(true);

    // Wait a tick for the #reader container to be mounted in the DOM
    setTimeout(() => {
      const scanner = new Html5Qrcode("reader");
      setQrInstance(scanner);

      const config = { fps: 10, qrbox: { width: 230, height: 230 } };

      scanner.start(
        { facingMode: "environment" }, // Rear camera on mobile
        config,
        (decodedText) => {
          processScannedPayload(decodedText, scanner);
        },
        (errorMessage) => {
          // Ignore scanning search ticks to prevent spamming logs
        }
      ).catch((err) => {
        console.error("Camera scanner failed to initialize:", err);
        showFeedback("Camera access blocked. Please check permissions.", "error");
        setScannerActive(false);
        setQrInstance(null);
      });
    }, 100);
  };

  // Stop camera scanner
  const stopCameraScanner = () => {
    if (qrInstance && qrInstance.isScanning) {
      qrInstance.stop().then(() => {
        qrInstance.clear();
        setScannerActive(false);
        setQrInstance(null);
      }).catch((err) => {
        console.error("Failed to stop camera scanner:", err);
      });
    } else {
      setScannerActive(false);
    }
  };

  // Cleanup camera scanning on unmount
  useEffect(() => {
    return () => {
      if (qrInstance && qrInstance.isScanning) {
        qrInstance.stop().catch(err => console.log(err));
      }
    };
  }, [qrInstance]);

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const renderGridCell = (day, period) => {
    const entry = timetableData.find(e => e.dayOfWeek === day && e.period === period);
    const isActiveCell = currentClassStatus && 
      currentClassStatus.status === "CLASS" && 
      currentClassStatus.periodNumber === period && 
      (simParams?.simulatedDay 
        ? simParams.simulatedDay === day 
        : new Date().toLocaleDateString("en-US", { weekday: "long" }) === day);

    const hasClass = entry && entry.subject && entry.subject.trim() !== "";
    const subject = hasClass ? entry.subject : "Free Hour";
    const faculty = hasClass && entry.faculty ? entry.faculty.name : "";

    return (
      <td key={period} className={`grid-class-cell ${isActiveCell ? "active-cell" : ""} ${!hasClass ? "free-cell" : ""}`}>
        <div className="cell-subject">{subject}</div>
        {faculty && <div className="cell-faculty">{faculty}</div>}
      </td>
    );
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: "1100px", width: "100%" }}>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Student Portal</h1>
          <p>Welcome back, {name}! {registerNumber && `(Reg No: ${registerNumber})`} {localStorage.getItem("department") && `| Dept: ${localStorage.getItem("department")}`}</p>
        </div>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <NotificationBell />
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div
          style={{
            background: feedback.type === "error" ? "rgba(239, 68, 68, 0.2)" : feedback.type === "warning" ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)",
            border: `1px solid ${feedback.type === "error" ? "var(--error)" : feedback.type === "warning" ? "var(--warning)" : "var(--success)"}`,
            color: feedback.type === "error" ? "var(--error)" : feedback.type === "warning" ? "var(--warning)" : "var(--success)",
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

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("overview")}
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
          📊 Portal Overview
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          style={{
            background: activeTab === "attendance" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "attendance" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📅 Smart Attendance
        </button>
        <button
          onClick={() => setActiveTab("timetable")}
          style={{
            background: activeTab === "timetable" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "timetable" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📅 Timetable
        </button>
        <button
          onClick={() => setActiveTab("leave")}
          style={{
            background: activeTab === "leave" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "leave" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📋 Leave / OD
        </button>
        <button
          onClick={() => setActiveTab("resume")}
          style={{
            background: activeTab === "resume" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "resume" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📄 Resume
        </button>
        <button
          onClick={() => setActiveTab("coding")}
          style={{
            background: activeTab === "coding" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "coding" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          💻 Coding
        </button>
        <button
          onClick={() => setActiveTab("interview")}
          style={{
            background: activeTab === "interview" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "interview" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          🎤 Interview
        </button>
        <button
          onClick={() => setActiveTab("career")}
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
          {/* Reusable Analytics Score Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", width: "100%" }}>
            <AnalyticsCard
              title="Attendance"
              score={studentAnalytics?.overallAttendancePercentage ?? 0}
              status={studentAnalytics?.attendanceStatus ?? "Needs Improvement"}
              icon="📅"
              subText={`${studentAnalytics?.presentClasses ?? 0} of ${(studentAnalytics?.presentClasses ?? 0) + (studentAnalytics?.absentClasses ?? 0)} classes`}
              onClick={() => setActiveTab("attendance")}
            />
            <AnalyticsCard
              title="Resume Score"
              score={careerData ? (careerData.resumeScore * 4) : 0}
              status={careerData?.resumeScore >= 20 ? "Excellent" : careerData?.resumeScore >= 15 ? "Good" : "Needs Imp."}
              icon="📄"
              subText={careerData?.resumeScore >= 15 ? "Strong profile" : "Optimization advised"}
              onClick={() => setActiveTab("resume")}
            />
            <AnalyticsCard
              title="Interview Score"
              score={careerData ? (careerData.interviewScore * 4) : 0}
              status={careerData?.interviewScore >= 20 ? "Excellent" : careerData?.interviewScore >= 15 ? "Good" : "Needs Imp."}
              icon="💬"
              subText={`${careerData?.totalMockSessions ?? 0} mock sessions completed`}
              onClick={() => setActiveTab("interview")}
            />
            <AnalyticsCard
              title="Coding Score"
              score={careerData ? (careerData.codingScore * 4) : 0}
              status={careerData?.codingScore >= 20 ? "Excellent" : careerData?.codingScore >= 15 ? "Good" : "Needs Imp."}
              icon="💻"
              subText={`${careerData?.totalCodingSolved ?? 0} assessments solved`}
              onClick={() => setActiveTab("coding")}
            />
            <AnalyticsCard
              title="Career Readiness"
              score={careerData?.overallCareerScore ?? 0}
              status={careerData?.status ?? "Needs Imp."}
              icon="🏆"
              subText="Overall Readiness Score"
              onClick={() => setActiveTab("career")}
            />
          </div>

          {/* Low Attendance Alert Banner */}
          {studentAnalytics?.lowAttendanceWarning && (
            <div style={{
              background: studentAnalytics.alertLevel === "CRITICAL" ? "rgba(239, 68, 68, 0.12)" : "rgba(245, 158, 11, 0.12)",
              border: `1px solid ${studentAnalytics.alertLevel === "CRITICAL" ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
              borderRadius: "14px", padding: "1.25rem 1.5rem", animation: "fadeIn 0.4s ease",
              display: "flex", alignItems: "center", gap: "1rem"
            }}>
              <span style={{ fontSize: "1.8rem" }}>{studentAnalytics.alertLevel === "CRITICAL" ? "⛔" : "⚠️"}</span>
              <div>
                <div style={{ fontWeight: "700", fontSize: "1rem", color: studentAnalytics.alertLevel === "CRITICAL" ? "var(--error)" : "var(--warning)", marginBottom: "0.2rem" }}>
                  {studentAnalytics.alertLevel} Attendance Alert
                </div>
                <div style={{ color: "var(--text-main)", fontSize: "0.88rem" }}>{studentAnalytics.alertMessage}</div>
              </div>
            </div>
          )}

          {/* Detailed Attendance Section */}
          <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
            
            {/* Left Column: Subject-wise breakdown & stats */}
            <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem", height: "100%" }}>
                <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
                  📚 Subject-wise Attendance
                </h3>

                {analyticsLoading ? (
                  <div style={{ padding: "3rem 0", color: "var(--text-muted)", textAlign: "center" }}>
                    Loading analytics data...
                  </div>
                ) : studentAnalytics?.subjectWiseAttendance && studentAnalytics.subjectWiseAttendance.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {studentAnalytics.subjectWiseAttendance.map((sub, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: "600", alignItems: "center" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {sub.subject}
                            {sub.isLow && <span title="Low Attendance" style={{ fontSize: "1rem", lineHeight: 1 }}>⚠️</span>}
                          </span>
                          <span style={{ color: "var(--primary)" }}>{sub.attendancePercentage.toFixed(1)}%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ flexGrow: 1, height: "8px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{
                              width: `${sub.attendancePercentage}%`,
                              height: "100%",
                              background: sub.attendancePercentage >= 95 
                                ? "linear-gradient(90deg, #10b981 0%, #059669 100%)" 
                                : sub.attendancePercentage >= 85 
                                ? "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)" 
                                : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
                              borderRadius: "4px"
                            }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", minWidth: "55px", textAlign: "right" }}>
                            {sub.presentClasses} / {sub.presentClasses + sub.absentClasses}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "3rem 0", color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
                    No subject attendance logged yet.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Attendance Trend Graph */}
            <div style={{ flex: "1 1 450px" }}>
              {analyticsLoading ? (
                <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading trend data...
                </div>
              ) : (
                <AttendanceTrendChart trendData={studentAnalytics?.attendanceTrend} />
              )}
            </div>
            
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        /* Attendance Tab Layout */
        <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
          
          {/* Left Panel: Active Session Detail */}
          <div style={{ flex: "1 1 450px" }}>
            {activeSession ? (
              <div className="dashboard-card" style={{
                background: "rgba(30, 41, 59, 0.4)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "2.5rem"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <span className="status-dot" style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "var(--success)",
                      borderRadius: "50%",
                      display: "inline-block",
                      boxShadow: "0 0 8px var(--success)"
                    }}></span>
                    <span style={{ color: "var(--success)", fontWeight: "600", fontSize: "0.8rem", textTransform: "uppercase" }}>
                      Class Session Active
                    </span>
                  </div>

                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                    {activeSession.subject}
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                    Session ID: {activeSession.id}
                  </p>

                  {/* Timer Display */}
                  <div style={{
                    background: "rgba(31, 41, 55, 0.6)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "2rem",
                    maxWidth: "240px"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>
                      Time Remaining
                    </span>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: timeLeft < 60 ? "var(--error)" : "var(--primary)",
                      textShadow: timeLeft < 60 ? "0 0 10px rgba(239, 68, 68, 0.2)" : "0 0 10px rgba(99, 102, 241, 0.2)"
                    }}>
                      {formatTimeLeft(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* GPS Location Status */}
                <div style={{
                  background: "rgba(30, 41, 59, 0.3)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  marginTop: "1rem"
                }}>
                  <h4 style={{ margin: "0 0 0.75rem 0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
                    📍 GPS Verification
                  </h4>
                  {gpsLoading ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Locating coordinates...</p>
                  ) : coords ? (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <p style={{ marginBottom: "0.25rem" }}>Latitude: <span style={{ color: "#fff", fontWeight: "500" }}>{coords.latitude.toFixed(6)}</span></p>
                      <p style={{ marginBottom: "0.25rem" }}>Longitude: <span style={{ color: "#fff", fontWeight: "500" }}>{coords.longitude.toFixed(6)}</span></p>
                      <p style={{ margin: 0 }}>Accuracy: <span style={{ color: "var(--success)" }}>~{coords.accuracy.toFixed(1)}m</span></p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: "var(--error)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                        GPS authorization required to mark attendance.
                      </p>
                      <button
                        onClick={requestLocation}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--primary)",
                          color: "var(--primary)",
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontWeight: "600"
                        }}
                      >
                        Authorize GPS Location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="dashboard-card" style={{
                background: "rgba(30, 41, 59, 0.2)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "3rem 2rem"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 2s infinite" }}>📡</div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>No Active Sessions</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "300px", marginBottom: "2rem" }}>
                  Please wait for your faculty instructor to begin the attendance session.
                </p>
                <button
                  onClick={() => checkActiveSession(false)}
                  disabled={sessionCheckLoading}
                  className="auth-btn"
                  style={{
                    maxWidth: "200px",
                    padding: "0.75rem 1.25rem",
                    fontSize: "0.9rem",
                    margin: 0
                  }}
                >
                  {sessionCheckLoading ? "Checking..." : "🔄 Refresh Status"}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Camera Scanner */}
          <div className="dashboard-card" style={{
            flex: "1 1 450px",
            background: "rgba(30, 41, 59, 0.4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "2.5rem",
            textAlign: "center"
          }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Scan Class QR Code
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "2rem" }}>
                Scan the dynamic QR code displayed on the professor's screen using your mobile or webcam camera.
              </p>

              {activeSession ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
                  {scannerActive ? (
                    <div className="scanner-container">
                      <div className="scanner-laser"></div>
                      <div id="reader" style={{ width: "100%", height: "100%", objectFit: "cover" }}></div>
                    </div>
                  ) : (
                    <div style={{
                      width: "100%",
                      maxWidth: "350px",
                      aspectRatio: "1",
                      borderRadius: "16px",
                      border: "2px dashed var(--card-border)",
                      background: "rgba(31, 41, 55, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "1rem"
                    }}>
                      <div style={{ fontSize: "2.5rem" }}>📷</div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Camera inactive</span>
                    </div>
                  )}

                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                    {scannerActive ? (
                      <button
                        onClick={stopCameraScanner}
                        className="logout-btn"
                        style={{ width: "100%", maxWidth: "250px", padding: "0.85rem", borderRadius: "10px" }}
                      >
                        ⏹ Stop Camera
                      </button>
                    ) : (
                      <button
                        onClick={startCameraScanner}
                        disabled={markingLoading || !coords}
                        className="auth-btn"
                        style={{
                          background: coords 
                            ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                            : "rgba(255, 255, 255, 0.05)",
                          width: "100%",
                          maxWidth: "250px",
                          margin: 0,
                          cursor: coords ? "pointer" : "not-allowed",
                          border: coords ? "none" : "1px solid var(--card-border)",
                          color: coords ? "#fff" : "var(--text-muted)"
                        }}
                      >
                        🎥 Open Camera Scanner
                      </button>
                    )}

                    {!coords && (
                      <p style={{ color: "var(--error)", fontSize: "0.8rem", fontWeight: "500", marginTop: "0.25rem" }}>
                        ⚠️ You must authorize GPS location access to scan.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "3rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Awaiting active class session details...
                </div>
              )}
            </div>

            {activeSession && (
              <div style={{ textAlign: "center", padding: "1rem 0", color: "var(--text-muted)", fontSize: "0.8rem", borderTop: "1px solid var(--card-border)" }}>
                🛡️ Mock locations and bypass methods are strictly disabled.
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === "timetable" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
          <SimulationControl onChange={(params) => setSimParams(params)} />

          {/* Current Class Live Tracker */}
          {currentClassStatus && (
            <div className="current-class-tracker-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              <div className="dashboard-card status-tracker-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "1.5rem" }}>
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
                    {currentClassStatus.status === "CLASS" ? "Class In Progress" : currentClassStatus.status}
                  </span>
                  {currentClassStatus.status === "CLASS" && currentClassStatus.periodNumber && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Period {currentClassStatus.periodNumber}</span>
                  )}
                </div>

                {currentClassStatus.status === "CLASS" && currentClassStatus.currentClass ? (
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", color: "#fff" }}>
                      {currentClassStatus.currentClass.subject}
                    </h3>
                    <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>
                      Instructor: <span style={{ color: "#fff" }}>{currentClassStatus.currentClass.faculty?.name || "Unassigned"}</span>
                    </p>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                        <span>Time elapsed: {currentClassStatus.elapsedMinutes} mins</span>
                        <span>{currentClassStatus.timeRemainingMinutes} mins left</span>
                      </div>
                      <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{
                          width: `${(currentClassStatus.elapsedMinutes / currentClassStatus.totalPeriodMinutes) * 100}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)"
                        }}></div>
                      </div>
                    </div>
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
                      {currentClassStatus.status === "LUNCH" || currentClassStatus.status === "BREAK" || currentClassStatus.status === "BEFORE_COLLEGE"
                        ? `${currentClassStatus.timeRemainingMinutes} minutes until next class`
                        : "No scheduled class active right now."}
                    </p>
                  </div>
                )}
              </div>

              {/* Next Class Preview */}
              <div className="dashboard-card next-class-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "1.5rem" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", fontWeight: "700" }}>
                  Next Scheduled Class
                </span>
                {currentClassStatus.nextClass ? (
                  <div style={{ marginTop: "1rem" }}>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", color: "#fff" }}>
                      {currentClassStatus.nextClass.subject}
                    </h3>
                    <p style={{ color: "var(--text-muted)", margin: "0 0 1rem 0", fontSize: "0.85rem" }}>
                      Period: <span style={{ color: "#fff" }}>{currentClassStatus.nextClass.period}</span> | Instructor: <span style={{ color: "#fff" }}>{currentClassStatus.nextClass.faculty?.name || "Unassigned"}</span>
                    </p>
                    <div style={{ display: "inline-block", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "6px", padding: "0.4rem 0.8rem", fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600" }}>
                      Upcoming today
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎓</div>
                    <h4 style={{ color: "#fff", margin: "0 0 0.25rem 0" }}>No More Classes Today</h4>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.85rem" }}>
                      All scheduled classes are complete.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Today's Timeline */}
          {currentClassStatus && currentClassStatus.todayTimeline && currentClassStatus.todayTimeline.length > 0 && (
            <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff", fontSize: "1.1rem", fontWeight: "600" }}>
                📅 Today's Timeline
              </h3>
              <div className="timeline-horizontal-scroll" style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                {currentClassStatus.todayTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className={`timeline-period-node ${item.isActive ? "active" : ""} ${item.isCompleted ? "completed" : ""}`}
                    style={{
                      flex: "0 0 160px",
                      background: item.isActive 
                        ? "rgba(99, 102, 241, 0.15)" 
                        : item.isCompleted 
                        ? "rgba(16, 185, 129, 0.05)" 
                        : "rgba(31, 41, 55, 0.4)",
                      border: `1px solid ${
                        item.isActive 
                          ? "var(--primary)" 
                          : item.isCompleted 
                          ? "rgba(16, 185, 129, 0.3)" 
                          : "var(--card-border)"
                      }`,
                      borderRadius: "12px",
                      padding: "1rem",
                      position: "relative",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                      <span>{item.period === 0 ? "Break" : `Period ${item.period}`}</span>
                      <span>{item.isActive && "🟢 Live"}</span>
                    </div>
                    <div style={{ fontWeight: "600", fontSize: "0.9rem", color: item.period === 0 ? "var(--text-muted)" : "#fff", marginBottom: "0.25rem" }}>
                      {item.subject}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.facultyName || (item.period === 0 ? "Relax" : "Free Hour")}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem", borderTop: "1px dashed rgba(255, 255, 255, 0.05)", paddingTop: "0.25rem" }}>
                      {item.startTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Timetable Grid */}
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff", fontSize: "1.2rem", fontWeight: "600" }}>
              📅 Weekly Schedule (Monday - Friday)
            </h3>
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
                        {[1, 2].map(p => renderGridCell(day, p))}
                        <td className="grid-break-cell">Short Break</td>
                        {[3, 4].map(p => renderGridCell(day, p))}
                        <td className="grid-break-cell">Lunch Break</td>
                        {[5, 6, 7, 8].map(p => renderGridCell(day, p))}
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
              background: rgba(30, 41, 59, 0.15);
              transition: all 0.2s;
            }
            .free-cell {
              color: #64748b;
              font-style: italic;
              opacity: 0.6;
              background: rgba(15, 23, 42, 0.1);
            }
            .cell-subject {
              font-weight: 600;
              color: #fff;
              font-size: 0.9rem;
            }
            .cell-faculty {
              font-size: 0.7rem;
              color: #94a3b8;
              margin-top: 4px;
            }
            .active-cell {
              background: rgba(99, 102, 241, 0.2) !important;
              border: 2px solid var(--primary) !important;
              box-shadow: inset 0 0 10px rgba(99, 102, 241, 0.2);
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
            .timeline-horizontal-scroll::-webkit-scrollbar {
              height: 6px;
            }
            .timeline-horizontal-scroll::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.02);
              border-radius: 3px;
            }
            .timeline-horizontal-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
            }
          `}</style>
        </div>
      )}

      {/* ─── LEAVE / OD TAB ─────────────────────────────────────────── */}
      {activeTab === "leave" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            
            {/* Left: Submit Form */}
            <div className="dashboard-card" style={{ flex: "1 1 350px", background: "rgba(30, 41, 59, 0.3)", borderRadius: "20px", padding: "2.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: "700" }}>📝 New Request</h3>
              <form onSubmit={handleLeaveSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Leave Type</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => handleLeaveFormChange("type", e.target.value)}
                    className="input-field"
                    style={{ width: "100%" }}
                  >
                    <option value="OD">On Duty (OD)</option>
                    <option value="MEDICAL">Medical Leave</option>
                    <option value="PERSONAL">Personal Leave</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>From Date</label>
                    <input type="date" className="input-field" value={leaveForm.fromDate} onChange={e => handleLeaveFormChange("fromDate", e.target.value)} required style={{ width: "100%" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>To Date</label>
                    <input type="date" className="input-field" value={leaveForm.toDate} onChange={e => handleLeaveFormChange("toDate", e.target.value)} required style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Reason</label>
                  <textarea
                    value={leaveForm.reason}
                    onChange={(e) => handleLeaveFormChange("reason", e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Brief reason for your request..."
                    required
                    style={{ width: "100%", resize: "vertical" }}
                  />
                </div>
                {leaveFormError && <div style={{ color: "var(--error)", fontSize: "0.85rem", fontWeight: "600" }}>{leaveFormError}</div>}
                <button type="submit" disabled={leaveSubmitting}
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    color: "#fff", border: "none", borderRadius: "8px", padding: "0.8rem",
                    fontWeight: "600", cursor: leaveSubmitting ? "not-allowed" : "pointer", marginTop: "0.5rem"
                  }}>
                  {leaveSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>

            {/* Right: Request History */}
            <div className="dashboard-card" style={{ flex: "2 1 500px", background: "rgba(30, 41, 59, 0.3)", borderRadius: "20px", padding: "2.5rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: "700" }}>🕰️ My Requests</h3>
              {leaveLoading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading requests...</div>
              ) : myLeaveRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🍃</div>
                  You haven't submitted any leave requests yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {myLeaveRequests.map(lr => (
                    <div key={lr.id} style={{
                      background: lr.status === "APPROVED" ? "rgba(16,185,129,0.05)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.05)" : "rgba(31,41,55,0.4)",
                      border: `1px solid ${lr.status === "APPROVED" ? "rgba(16,185,129,0.2)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.2)" : "var(--card-border)"}`,
                      borderRadius: "12px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem"
                    }}>
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
                        <div style={{ color: "var(--text-main)", fontSize: "0.9rem", fontWeight: "500" }}>
                          {lr.fromDate} <span style={{ color: "var(--text-muted)" }}>to</span> {lr.toDate}
                        </div>
                        <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>"{lr.reason}"</div>
                        {lr.rejectionReason && <div style={{ marginTop: "0.35rem", color: "var(--error)", fontSize: "0.8rem" }}>Reason: {lr.rejectionReason}</div>}
                        <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                          Submitted: {lr.createdAt ? new Date(lr.createdAt).toLocaleString() : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {activeTab === "resume" && <ResumeManagement />}
      {activeTab === "coding" && <CodingDashboard />}
      {activeTab === "interview" && <InterviewDashboard />}
      {activeTab === "career" && <CareerDashboard />}

    </div>
  );
}

export default StudentDashboard;
