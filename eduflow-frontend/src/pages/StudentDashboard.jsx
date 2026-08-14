import { useState, useEffect } from "react";
import { getActiveSession, markAttendance, getStudentAnalytics } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import AnalyticsCard from "../components/AnalyticsCard";
import { getStudentTimetable, getCurrentClassStatus, getActiveFreeActivityChallenge, submitFreeActivitySolution, runFreeActivitySolution, getCodingHistory } from "../services/timetableService";
import SimulationControl from "../components/SimulationControl";
import StudentDashboardHome from "./student/StudentDashboardHome";
import { submitLeaveRequest, getMyLeaveRequests } from "../services/leaveService";
import ResumeManagement from "../components/career/ResumeManagement";
import CodingDashboard from "../components/career/CodingDashboard";
import InterviewDashboard from "../components/career/InterviewDashboard";
import CareerDashboard from "../components/career/CareerDashboard";
import NotificationBell from "../components/career/NotificationBell";
import API_BASE from "../services/api";

function AttendanceTrendChart({ trendData }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)", fontStyle: "italic", background: "rgba(30, 41, 59, 0.2)", border: "1px solid var(--card-border)", borderRadius: "16px" }}>
        <i className="fa-solid fa-chart-pie"></i> No trend data available yet. Trends will appear as attendance is marked.
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
      <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
        <i className="fa-solid fa-chart-line" style={{ color: "var(--primary)" }}></i> Attendance Trend
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

  // Free Activity & Coding Challenge states
  const [freeActivityChallenge, setFreeActivityChallenge] = useState(null);
  const [studentCode, setStudentCode] = useState("");
  const [studentLanguage, setStudentLanguage] = useState("python");
  const [submissionStatus, setSubmissionStatus] = useState("NONE"); // NONE, SUBMITTING, PASSED, FAILED
  const [submissionLogs, setSubmissionLogs] = useState("");
  const [aiReviewFeedback, setAiReviewFeedback] = useState("");
  const [challengeAttendanceStatus, setChallengeAttendanceStatus] = useState("PENDING");
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [codingPasteWarning, setCodingPasteWarning] = useState(null);

  const triggerCodingPasteWarning = (msg = "Copying & Pasting is strictly disabled during coding activities! Please type your solution.") => {
    setCodingPasteWarning(msg);
    setTimeout(() => setCodingPasteWarning(null), 3500);
  };
  const [codingHistory, setCodingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCodingHistory = async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const res = await getCodingHistory(token);
      setCodingHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching coding history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Leave Request States
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ type: "OD", fromDate: "", toDate: "", reason: "" });
  const [leaveFormError, setLeaveFormError] = useState("");

  const getSubjectFullName = (code) => {
    if (!code) return "Elective Course";
    const cleanCode = code.trim().toUpperCase();
    const map = {
      "25CS1701": "Advanced Cloud Computing & Virtualization",
      "25CSI701": "Cyber Security & Information Assurance",
      "25IOC01": "Internet of Things & Connected Systems",
      "25IOC02": "Industrial Optimization & Embedded Systems",
      "25XXXX": "Professional Elective — Advanced Deep Learning",
      "AGAI": "Agentic AI & Autonomous Systems",
      "SE": "Software Engineering & Clean Architecture",
      "DTF": "Design Thinking Fundamentals",
      "DCN": "Data Communication Networks",
      "OS": "Operating Systems & Kernels",
      "DSA": "Data Structures & Algorithms",
      "DBMS": "Database Management Systems",
      "COA": "Computer Organization & Architecture",
      "OOPS": "Object Oriented Programming",
      "WEBTECH": "Full Stack Web Technology"
    };
    return map[cleanCode] || cleanCode;
  };

  const uniqueSubjects = [];
  const seen = new Set();
  if (timetableData && Array.isArray(timetableData)) {
    timetableData.forEach(entry => {
      if (entry.subject && entry.subject !== "FREE_ACTIVITY" && !seen.has(entry.subject)) {
        seen.add(entry.subject);
        const subCode = entry.subject.trim();
        const subName = entry.subjectName || getSubjectFullName(subCode);
        const facName = entry.faculty?.name || entry.facultyName || "Course Instructor";
        uniqueSubjects.push({
          code: subCode,
          name: subName,
          staff: facName
        });
      }
    });
    uniqueSubjects.sort((a, b) => a.code.localeCompare(b.code));
  }

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
      const res = await fetch(`${API_BASE}/api/career/dashboard`, {
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

  useEffect(() => {
    const isFreeActivity = currentClassStatus &&
      currentClassStatus.status === "CLASS" &&
      currentClassStatus.currentClass &&
      currentClassStatus.currentClass.subject === "FREE_ACTIVITY";
      
    const isCodingPractice = isFreeActivity &&
      currentClassStatus.currentClass.activityName === "Coding Practice";

    if (isCodingPractice && !freeActivityChallenge && !challengeLoading && token) {
      const getSimulatedDate = (weekdayName) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const targetIndex = daysOfWeek.indexOf(weekdayName);
        if (targetIndex === -1) return new Date().toISOString().split("T")[0];
        const today = new Date();
        const todayIndex = today.getDay();
        const diff = targetIndex - todayIndex;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        return targetDate.toISOString().split("T")[0];
      };

      const day = simParams?.simulatedDay || new Date().toLocaleDateString("en-US", { weekday: "long" });
      const date = getSimulatedDate(day);
      const dept = localStorage.getItem("department") || "M.Tech CSE";
      
      const fetchChallenge = async () => {
        setChallengeLoading(true);
        try {
          const res = await getActiveFreeActivityChallenge(date, dept, token);
          setFreeActivityChallenge(res.data);
          if (res.data) {
            setStudentCode(res.data.boilerplatePython || "");
            setStudentLanguage("python");
          }
        } catch (err) {
          console.error("Error fetching free activity challenge:", err);
        } finally {
          setChallengeLoading(false);
        }
      };
      
      fetchChallenge();
    } else if (!isCodingPractice) {
      setFreeActivityChallenge(null);
      setStudentCode("");
      setSubmissionStatus("NONE");
      setSubmissionLogs("");
      setAiReviewFeedback("");
    }
  }, [currentClassStatus, simParams, token]);

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
    if (activeTab === "coding-history") fetchCodingHistory();
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

    // Parse decoded payload across all supported formats (JSON, colon, URL, OTP)
    let parsed = null;
    const text = String(decodedText || "").trim();

    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const data = JSON.parse(text);
        const sId = data.sessionId || data.id || data.session_id;
        const otp = data.otp || data.currentOtp || data.code;
        if (otp) {
          parsed = { sessionId: sId ? parseInt(sId, 10) : undefined, otp: String(otp).trim() };
        }
      } catch (e) {}
    } else if (text.startsWith("eduflow:session:")) {
      const parts = text.split(":");
      if (parts.length >= 4) {
        parsed = { sessionId: parseInt(parts[2], 10), otp: String(parts[3]).trim() };
      }
    } else if (text.includes(":") && !isNaN(text.split(":")[0])) {
      const parts = text.split(":");
      parsed = { sessionId: parseInt(parts[0], 10), otp: String(parts[1]).trim() };
    } else if (/^\d{4,8}$/.test(text)) {
      parsed = { otp: text.trim() };
    }

    if (parsed && parsed.otp) {
      if (parsed.sessionId && activeSession?.id && parsed.sessionId !== activeSession.id) {
        showFeedback("Scanned QR code is for a different class session!", "error");
        return;
      }
      submitAttendance(parsed.otp, parsed.sessionId);
    } else {
      showFeedback("Invalid QR code format. Please scan the official class QR code.", "error");
    }
  };

  const submitAttendance = async (otp, parsedSessionId = null) => {
    const targetSessionId = parsedSessionId || activeSession?.id;
    if (!targetSessionId) {
      showFeedback("No active session found. Please wait for the teacher to start a session.", "error");
      return;
    }
    if (!coords) {
      showFeedback("GPS location access is required. Please authorize location permission first.", "error");
      requestLocation();
      return;
    }

    setMarkingLoading(true);
    try {
      const res = await markAttendance(
        {
          sessionId: targetSessionId,
          otp: otp,
          latitude: coords.latitude,
          longitude: coords.longitude
        },
        token
      );
      showFeedback(res.data || "Attendance marked successfully as PRESENT!", "success");
      fetchAnalytics();
      fetchActiveSession();
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

  const handleRunChallenge = async () => {
    if (!freeActivityChallenge) return;
    setSubmissionStatus("SUBMITTING");
    setSubmissionLogs("Compiling and executing code in run mode...");
    try {
      const payload = {
        code: studentCode,
        language: studentLanguage,
        questionBankId: freeActivityChallenge.id
      };
      const res = await runFreeActivitySolution(payload, token);
      const tcResults = res.data;
      let logs = "Compilation/Execution results (Run Mode):\n";
      let allPassed = true;
      tcResults.forEach((tc, idx) => {
        const passed = tc.passed;
        if (!passed) allPassed = false;
        logs += `Test case ${idx + 1}: Input [${tc.input}] -> Expected [${tc.expected}], Actual [${tc.output || "No output"}] (${passed ? "PASSED" : "FAILED"})\n`;
        if (tc.error) {
          logs += `Error details: ${tc.error}\n`;
        }
      });
      setSubmissionStatus("NONE");
      setSubmissionLogs(logs);
      showFeedback(allPassed ? "All test cases passed (Run)!" : "Some test cases failed (Run).", allPassed ? "success" : "warning");
    } catch (err) {
      setSubmissionStatus("NONE");
      setSubmissionLogs(err.response?.data || "Execution error: compilation failed.");
      showFeedback("Failed to run code.", "error");
    }
  };

  const handleSubmitChallenge = async () => {
    if (!freeActivityChallenge) return;
    setSubmissionStatus("SUBMITTING");
    setSubmissionLogs("Compiling and executing test cases...");
    setAiReviewFeedback("");

    try {
      const getSimulatedDate = (weekdayName) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const targetIndex = daysOfWeek.indexOf(weekdayName);
        if (targetIndex === -1) return new Date().toISOString().split("T")[0];
        const today = new Date();
        const todayIndex = today.getDay();
        const diff = targetIndex - todayIndex;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        return targetDate.toISOString().split("T")[0];
      };

      const day = simParams?.simulatedDay || new Date().toLocaleDateString("en-US", { weekday: "long" });
      const date = getSimulatedDate(day);
      const dept = localStorage.getItem("department") || "M.Tech CSE";
      
      const payload = {
        date: date,
        code: studentCode,
        language: studentLanguage,
        department: dept,
        simulatedDay: simParams?.simulatedDay || "",
        simulatedTime: simParams?.simulatedTime || ""
      };

      const res = await submitFreeActivitySolution(payload, token);
      const data = res.data;

      let tcResults = [];
      try {
        tcResults = JSON.parse(data.testCaseResultsJson);
      } catch (e) {}

      let logs = "Compilation successful.\n";
      tcResults.forEach((tc, idx) => {
        logs += `Test case ${idx + 1}: Input [${tc.input}] -> Expected [${tc.expected}], Actual [${tc.output}] (${tc.passed ? "PASSED" : "FAILED"})\n`;
        if (tc.error) {
          logs += `Error details: ${tc.error}\n`;
        }
      });

      if (data.allPassed) {
        setSubmissionStatus("PASSED");
        logs += "\nAll test cases passed! Attendance automatically marked PRESENT.";
        setChallengeAttendanceStatus("PRESENT");
        showFeedback("Challenge Solved! Attendance marked PRESENT.");
      } else {
        setSubmissionStatus("FAILED");
        logs += "\nSome test cases failed. Attendance status: PENDING faculty review.";
        setChallengeAttendanceStatus("PENDING");
        showFeedback("Some test cases failed. Attendance is pending review.", "error");
      }

      setSubmissionLogs(logs);
      setAiReviewFeedback(data.aiFeedback);
      
      // Refresh history
      fetchCodingHistory();
    } catch (err) {
      setSubmissionStatus("FAILED");
      setSubmissionLogs(err.response?.data || "Compilation failed: command line execution error.");
      showFeedback(err.response?.data || "Failed to submit code.", "error");
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

  const getSubjectAbbreviation = (code, name) => {
    if (!code && !name) return "";
    const cleanName = (name || code).trim();
    const cleanCode = (code || name).trim();

    const lowerName = cleanName.toLowerCase();
    if (lowerName.includes("operating system")) return "OS";
    if (lowerName.includes("relational database") || lowerName.includes("rdbms") || lowerName.includes("database")) return "RDBMS";
    if (lowerName.includes("artificial intelligence") || lowerName.includes("ai")) return "AI";
    if (lowerName.includes("compiler")) return "CI";
    if (lowerName.includes("computer network") || lowerName.includes("networking")) return "CN";
    if (lowerName.includes("data structure") || lowerName.includes("dsa")) return "DSA";
    if (lowerName.includes("universal human") || lowerName.includes("uhv")) return "UHV";
    if (lowerName.includes("java")) return "JAVA";
    if (lowerName.includes("python")) return "PYTHON";
    if (lowerName.includes("web technology") || lowerName.includes("web tech")) return "WT";
    if (lowerName.includes("machine learning") || lowerName.includes("ml")) return "ML";
    if (lowerName.includes("software engineering")) return "SE";
    if (lowerName.includes("mathematics") || lowerName.includes("maths")) return "MATH";

    if (cleanCode.length <= 5 && !/\d{3,}/.test(cleanCode)) {
      return cleanCode.toUpperCase();
    }

    const words = cleanName.split(/[\s_\-]+/).filter(w => w.length > 0 && !/^(and|of|for|in|the|with|to)$/i.test(w));
    if (words.length >= 2) {
      return words.map(w => w[0].toUpperCase()).join("");
    }
    return cleanCode;
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
    const isFreeActivity = entry && entry.subject === "FREE_ACTIVITY";

    let cellBg = "rgba(30, 41, 59, 0.1)";
    let borderStyle = "1px solid rgba(255, 255, 255, 0.06)";
    if (isFreeActivity) {
      cellBg = "rgba(16, 185, 129, 0.08)";
      borderStyle = "1px dashed rgba(16, 185, 129, 0.3)";
    } else if (hasClass) {
      cellBg = isActiveCell ? "rgba(99, 102, 241, 0.25)" : "rgba(30, 41, 59, 0.5)";
      borderStyle = isActiveCell ? "2px solid #818cf8" : "1px solid rgba(99, 102, 241, 0.25)";
    }

    if (isFreeActivity) {
      const displayVal = entry.activityName ? `Free Activity (${entry.activityName})` : "Free Activity Period";
      return (
        <td key={period} style={{ padding: "10px 8px", height: "78px", minWidth: "120px", verticalAlign: "middle", textAlign: "center", background: cellBg, border: borderStyle }}>
          <div style={{ color: "#10b981", fontWeight: "700", fontSize: "0.8rem" }}>{displayVal}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Self-Directed</div>
        </td>
      );
    } else if (hasClass) {
      const subCode = entry.subject;
      const facName = entry.faculty?.name || entry.facultyName || "Course Instructor";
      const roomInfo = entry.room ? (entry.room.roomCode || entry.room.roomName || "Classroom") : "Classroom";
      const subAbbr = getSubjectAbbreviation(subCode, subCode);

      const tooltipText = `Course: ${subCode}\nFaculty: ${facName}\nRoom/Lab: ${roomInfo}`;

      return (
        <td
          key={period}
          title={tooltipText}
          style={{ padding: "10px 8px", height: "78px", minWidth: "120px", verticalAlign: "middle", textAlign: "center", background: cellBg, border: borderStyle, borderRadius: "8px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <span style={{
              fontWeight: "800",
              fontSize: "0.9rem",
              color: "#818cf8",
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              padding: "2px 8px",
              borderRadius: "6px"
            }}>
              {subAbbr}
            </span>
            <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px" }}>
              <i className="fa-solid fa-user-tie" style={{ fontSize: "0.65rem", marginRight: "4px", color: "var(--success)" }}></i>
              {facName}
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
              <i className="fa-solid fa-door-open" style={{ marginRight: "3px" }}></i>{roomInfo}
            </span>
          </div>
        </td>
      );
    } else {
      return (
        <td key={period} style={{ padding: "10px 8px", height: "78px", minWidth: "120px", verticalAlign: "middle", textAlign: "center", background: "rgba(15, 23, 42, 0.2)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", opacity: 0.6 }}>Free</span>
        </td>
      );
    }
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
          <i className="fa-solid fa-chart-pie"></i> Portal Overview
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
          <i className="fa-solid fa-calendar-check"></i> Smart Attendance
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
          <i className="fa-solid fa-calendar-days"></i> Timetable
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
          <i className="fa-solid fa-file-invoice"></i> Leave / OD
        </button>
        <button
          onClick={() => setActiveTab("coding-history")}
          style={{
            background: activeTab === "coding-history" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "coding-history" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          <i className="fa-solid fa-scroll"></i> Coding History
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
          <i className="fa-solid fa-file-lines"></i> Resume
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
          <i className="fa-solid fa-code"></i> Coding
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
          <i className="fa-solid fa-microphone-lines"></i> Interview
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
          <i className="fa-solid fa-star"></i> Career
        </button>
      </div>

      {activeTab === "overview" && (
        <StudentDashboardHome />
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
                    <i className="fa-solid fa-location-crosshairs"></i> GPS Verification
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
                <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 2s infinite" }}><i className="fa-solid fa-satellite-dish"></i></div>
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
                      <div style={{ fontSize: "2.5rem" }}><i className="fa-solid fa-camera"></i></div>
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
                <i className="fa-solid fa-shield-halved"></i> Mock locations and bypass methods are strictly disabled.
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
                  currentClassStatus.currentClass.subject === "FREE_ACTIVITY" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.4rem", color: "var(--success)" }}>
                        <i className="fa-solid fa-star"></i> Free Activity Period
                      </h3>
                      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
                        Assigned Activity: <span style={{ color: "#fff", fontWeight: "700" }}>{currentClassStatus.currentClass.activityName || "Open Activity"}</span>
                      </p>

                      {/* Countdown Timer */}
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          <span>Time Remaining:</span>
                          <span style={{ color: "var(--warning)", fontWeight: "700" }}>{currentClassStatus.timeRemainingMinutes} mins left</span>
                        </div>
                      </div>

                      {/* Attendance Status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Attendance Status:</span>
                        <span style={{
                          background: challengeAttendanceStatus === "PRESENT" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          color: challengeAttendanceStatus === "PRESENT" ? "var(--success)" : "var(--warning)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "700"
                        }}>
                          {challengeAttendanceStatus}
                        </span>
                      </div>

                      {/* Coding challenge logic */}
                      {currentClassStatus.currentClass.activityName === "Coding Practice" ? (
                        freeActivityChallenge ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                            <div 
                              className="no-copy-zone"
                              onCopy={(e) => {
                                e.preventDefault();
                                triggerCodingPasteWarning("Copying challenge descriptions is strictly prohibited!");
                              }}
                              onCut={(e) => {
                                e.preventDefault();
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                triggerCodingPasteWarning("Right-click context menu is disabled!");
                              }}
                              onDragStart={(e) => {
                                e.preventDefault();
                              }}
                              style={{ 
                                background: "rgba(99, 102, 241, 0.05)", 
                                border: "1px solid rgba(99, 102, 241, 0.2)", 
                                borderRadius: "12px", 
                                padding: "1rem",
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                                msUserSelect: "none"
                              }}
                            >
                              <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)", userSelect: "none" }}><i className="fa-solid fa-code"></i> Challenge: {freeActivityChallenge.title}</h4>
                              <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2e8f0", whiteSpace: "pre-line", userSelect: "none" }}>
                                {freeActivityChallenge.description}
                              </p>
                            </div>

                            {/* Read-Only Status Banner */}
                            {challengeAttendanceStatus === "PRESENT" && (
                              <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "10px", color: "var(--success)", fontSize: "0.85rem", fontWeight: "600", textAlign: "center" }}>
                                🎉 Challenge successfully solved! Attendance marked PRESENT. Workspace is now read-only.
                              </div>
                            )}
                            {challengeAttendanceStatus !== "PRESENT" && currentClassStatus && currentClassStatus.timeRemainingMinutes <= 0 && (
                              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "10px", color: "var(--error)", fontSize: "0.85rem", fontWeight: "600", textAlign: "center" }}>
                                ⏳ Time has expired for this period. Workspace is now read-only.
                              </div>
                            )}

                            {/* Language Selector */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Select Language</label>
                              <select
                                className="input-field"
                                value={studentLanguage}
                                disabled={challengeAttendanceStatus === "PRESENT" || (currentClassStatus && currentClassStatus.timeRemainingMinutes <= 0)}
                                onChange={(e) => {
                                  setStudentLanguage(e.target.value);
                                  if (e.target.value === "python") setStudentCode(freeActivityChallenge.boilerplatePython || "");
                                  else if (e.target.value === "java") setStudentCode(freeActivityChallenge.boilerplateJava || "");
                                  else if (e.target.value === "cpp") setStudentCode(freeActivityChallenge.boilerplateCpp || "");
                                  else if (e.target.value === "c") setStudentCode(freeActivityChallenge.boilerplateC || "");
                                }}
                                style={{ margin: 0, height: "35px", fontSize: "0.8rem" }}
                              >
                                <option value="python">Python 3</option>
                                <option value="java">Java 17</option>
                                <option value="cpp">C++ 17</option>
                                <option value="c">C (GCC)</option>
                              </select>
                            </div>

                            {/* Code Editor */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", position: "relative" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Solution Editor</label>
                                <span style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "2px 7px",
                                  borderRadius: "6px",
                                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                                  border: "1px solid rgba(239, 68, 68, 0.3)",
                                  color: "#f87171",
                                  fontSize: "0.68rem",
                                  fontWeight: "700"
                                }}>
                                  <i className="fa-solid fa-lock" style={{ fontSize: "0.6rem" }}></i>
                                  Anti-Cheat: Paste Disabled
                                </span>
                              </div>

                              {codingPasteWarning && (
                                <div style={{
                                  background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                                  color: "#ffffff",
                                  padding: "0.6rem 1rem",
                                  borderRadius: "8px",
                                  fontSize: "0.8rem",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
                                  border: "1px solid rgba(255,255,255,0.2)",
                                  marginBottom: "4px"
                                }}>
                                  <i className="fa-solid fa-shield-halved"></i>
                                  <span>{codingPasteWarning}</span>
                                </div>
                              )}

                              <textarea
                                value={studentCode}
                                onChange={(e) => setStudentCode(e.target.value)}
                                onKeyDown={(e) => {
                                  if (((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) || (e.shiftKey && e.key === 'Insert')) {
                                    e.preventDefault();
                                    triggerCodingPasteWarning();
                                  }
                                }}
                                onPaste={(e) => {
                                  e.preventDefault();
                                  triggerCodingPasteWarning();
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  triggerCodingPasteWarning("Drag and drop is disabled in coding challenge mode!");
                                }}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  triggerCodingPasteWarning("Right-click menu is disabled in assessment mode!");
                                }}
                                spellCheck="false"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                disabled={challengeAttendanceStatus === "PRESENT" || (currentClassStatus && currentClassStatus.timeRemainingMinutes <= 0)}
                                rows={8}
                                style={{
                                  background: "#0f172a",
                                  border: "1px solid var(--card-border)",
                                  borderRadius: "10px",
                                  padding: "10px",
                                  color: "#38bdf8",
                                  fontFamily: "monospace",
                                  fontSize: "0.85rem",
                                  width: "100%",
                                  boxSizing: "border-box",
                                  resize: "vertical"
                                }}
                              />
                            </div>

                            {/* Submission Logs */}
                            {submissionLogs && (
                              <div style={{ background: "#020617", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "10px" }}>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Console output / test case results</div>
                                <pre style={{ margin: 0, fontSize: "0.75rem", color: submissionStatus === "PASSED" ? "var(--success)" : "var(--error)", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                                  {submissionLogs}
                                </pre>
                              </div>
                            )}

                            {/* AI Review feedback */}
                            {aiReviewFeedback && (
                              <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "10px", padding: "12px" }}>
                                <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: "700", marginBottom: "6px" }}>🤖 AI Code Review & Feedback:</div>
                                <div style={{ fontSize: "0.8rem", color: "#e2e8f0", whiteSpace: "pre-line", lineHeight: "1.4" }}>
                                  {aiReviewFeedback}
                                </div>
                              </div>
                            )}

                            {/* Run & Submit Action Buttons */}
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                              <button
                                onClick={handleRunChallenge}
                                disabled={submissionStatus === "SUBMITTING" || challengeAttendanceStatus === "PRESENT" || (currentClassStatus && currentClassStatus.timeRemainingMinutes <= 0)}
                                style={{
                                  flex: 1,
                                  background: "rgba(255,255,255,0.05)",
                                  color: "#fff",
                                  border: "1px solid var(--card-border)",
                                  borderRadius: "8px",
                                  padding: "0.7rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  transition: "all 0.3s"
                                }}
                              >
                                ⚙️ Run Code
                              </button>
                              <button
                                onClick={handleSubmitChallenge}
                                disabled={submissionStatus === "SUBMITTING" || challengeAttendanceStatus === "PRESENT" || (currentClassStatus && currentClassStatus.timeRemainingMinutes <= 0)}
                                style={{
                                  flex: 1,
                                  background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "0.7rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  transition: "all 0.3s"
                                }}
                              >
                                {submissionStatus === "SUBMITTING" ? "Running..." : <><i className="fa-solid fa-rocket"></i> Submit Solution</>}
                              </button>
                            </div>

                          </div>
                        ) : (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1.5rem", textAlign: "center" }}>
                            Retrieving coding challenge details...
                          </div>
                        )
                      ) : (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1.5rem", textAlign: "center", border: "1px dashed var(--card-border)", borderRadius: "12px" }}>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                            <i className="fa-solid fa-calendar-day"></i> Engage in the assigned self-directed learning activity. Attendance is marked manually by faculty.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem", color: "var(--text-main)" }}>
                        {currentClassStatus.currentClass.subject}
                      </h3>
                      <p style={{ color: "var(--text-muted)", margin: "0 0 1.5rem 0", fontSize: "0.9rem" }}>
                        Instructor: <span style={{ color: "var(--text-main)" }}>{currentClassStatus.currentClass.faculty?.name || "Unassigned"}</span>
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
                  )
                ) : (
                  <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                      {currentClassStatus.status === "LUNCH" || currentClassStatus.status === "BREAK" ? <i className="fa-solid fa-mug-hot"></i> : <i className="fa-solid fa-umbrella-beach"></i>}
                    </div>
                    <h4 style={{ color: "var(--text-main)", margin: "0 0 0.25rem 0" }}>
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
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.3rem", color: "var(--text-main)" }}>
                      {currentClassStatus.nextClass.subject}
                    </h3>
                    <p style={{ color: "var(--text-muted)", margin: "0 0 1rem 0", fontSize: "0.85rem" }}>
                      Period: <span style={{ color: "var(--text-main)" }}>{currentClassStatus.nextClass.period}</span> | Instructor: <span style={{ color: "var(--text-main)" }}>{currentClassStatus.nextClass.faculty?.name || "Unassigned"}</span>
                    </p>
                    <div style={{ display: "inline-block", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "6px", padding: "0.4rem 0.8rem", fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600" }}>
                      Upcoming today
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}><i className="fa-solid fa-graduation-cap"></i></div>
                    <h4 style={{ color: "var(--text-main)", margin: "0 0 0.25rem 0" }}>No More Classes Today</h4>
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
              <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
                <i className="fa-solid fa-calendar-day" style={{ color: "var(--primary)" }}></i> Today's Timeline
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
                      border: `1px solid ${item.isActive
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
              <i className="fa-solid fa-calendar-days" style={{ color: "var(--primary)" }}></i> Weekly Schedule (Monday - Friday)
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="timetable-grid-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>P1<span className="time-sub">8:15-9:15</span></th>
                    <th>P2<span className="time-sub">9:15-10:15</span></th>
                    <th className="break-hdr">Break<span className="time-sub">10:15-10:45</span></th>
                    <th>P3<span className="time-sub">10:45-11:45</span></th>
                    <th>P4<span className="time-sub">11:45-12:45</span></th>
                    <th className="break-hdr">Lunch<span className="time-sub">12:45-1:45</span></th>
                    <th>P5<span className="time-sub">1:45-2:45</span></th>
                    <th>P6<span className="time-sub">2:45-3:45</span></th>
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
                        {[5, 6].map(p => renderGridCell(day, p))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Subject/Staff reference directory */}
            {uniqueSubjects.length > 0 && (
              <div style={{ marginTop: "2rem", borderTop: "1px dashed rgba(255,255,255,0.08)", paddingTop: "1.5rem" }}>
                <h4 style={{ color: "#fff", fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <i className="fa-solid fa-book"></i> Course Information & Instructors
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)", fontWeight: "600" }}>
                        <th style={{ padding: "0.75rem 1rem" }}>Code / Acronym</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Course Title</th>
                        <th style={{ padding: "0.75rem 1rem" }}>Name of the Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uniqueSubjects.map((sub, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "#e5e7eb" }}>
                          <td style={{ padding: "0.75rem 1rem", fontWeight: "700", color: "var(--primary)" }}>{sub.code}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>{sub.name}</td>
                          <td style={{ padding: "0.75rem 1rem", color: "#a5b4fc" }}>{sub.staff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
              <h3 style={{ margin: "0 0 1.5rem 0", fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: "700" }}><i className="fa-solid fa-pen-to-square"></i> New Request</h3>
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
              <h3 style={{ margin: "0 0 1.5rem 0", fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: "700" }}><i className="fa-solid fa-clock-rotate-left"></i> My Requests</h3>
              {leaveLoading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading requests...</div>
              ) : myLeaveRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}><i className="fa-solid fa-leaf"></i></div>
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

      {/* ─── CODING HISTORY TAB ─────────────────────────────────────────── */}
      {activeTab === "coding-history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.3)", borderRadius: "20px", padding: "2.5rem" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: "700" }}>📜 My Coding Submissions</h3>
            {historyLoading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading submissions history...</div>
            ) : codingHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>💻</div>
                You haven't submitted any coding challenge solutions yet.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-muted)", fontWeight: "600" }}>
                      <th style={{ padding: "0.75rem 1rem" }}>Problem</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Language</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Score</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Submitted At</th>
                      <th style={{ padding: "0.75rem 1rem" }}>AI Feedback Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codingHistory.map((sub) => (
                      <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "#e5e7eb" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "var(--primary)" }}>{sub.problemTitle || "Challenge"}</td>
                        <td style={{ padding: "0.75rem 1rem", textTransform: "uppercase", fontSize: "0.75rem" }}>{sub.language}</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: "700", color: sub.allPassed ? "var(--success)" : "var(--warning)" }}>{sub.score}%</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{
                            background: sub.allPassed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                            color: sub.allPassed ? "var(--success)" : "var(--error)",
                            border: `1px solid ${sub.allPassed ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                            borderRadius: "6px", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: "700"
                          }}>
                            {sub.allPassed ? "ALL PASSED" : "FAILED"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : ""}</td>
                        <td style={{ padding: "0.75rem 1rem", maxWidth: "250px", overflow: "hidden", textOverride: "ellipsis", whiteSpace: "nowrap" }}>
                          <span title={sub.aiFeedback} style={{ cursor: "pointer", color: "#a5b4fc", textDecoration: "underline" }} onClick={() => alert(sub.aiFeedback)}>
                            View AI Feedback
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
