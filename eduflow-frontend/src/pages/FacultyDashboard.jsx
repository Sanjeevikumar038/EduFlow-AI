import { useState, useEffect } from "react";
import { getStudents, createStudent, deleteStudent, getStudentsPaged, getStudentProfile } from "../services/authService";
import { startSession, endSession, getActiveSession, getSessionRecords, getAllSessions, getSessionReport, getFacultyAnalytics, exportSessionCsv, exportSessionPdfData, getLowAttendanceStudents, getSessionStudents, markManualAttendance, closeSession, getMySubjects, saveBulkAttendance, saveManualAttendanceSession } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";
import AnalyticsCard from "../components/AnalyticsCard";
import { getFacultyTimetable, getDepartmentTimetable, getCurrentClassStatus, getSuggestedSubject, assignFreeActivityPeriod, getFreeActivitySubmissions, overrideFreeActivityAttendance, getCodingProblems } from "../services/timetableService";
import SimulationControl from "../components/SimulationControl";
import { getDepartmentLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from "../services/leaveService";
import CareerDashboardFaculty from "../components/career/CareerDashboardFaculty";
import FacultySidebar from "../components/faculty/FacultySidebar";
import FacultyTopbar from "../components/faculty/FacultyTopbar";
import FacultyOverviewView from "../components/faculty/FacultyOverviewView";
import FacultyQrSessionView from "../components/faculty/FacultyQrSessionView";
import FacultyManualAttendanceView from "../components/faculty/FacultyManualAttendanceView";
import FacultyScheduleView from "../components/faculty/FacultyScheduleView";
import FacultyCareerView from "../components/faculty/FacultyCareerView";
import FacultyAdvisorStudentsView from "../components/faculty/FacultyAdvisorStudentsView";
import FacultyAdvisorLeavesView from "../components/faculty/FacultyAdvisorLeavesView";
import FacultyAdvisorAnalyticsView from "../components/faculty/FacultyAdvisorAnalyticsView";

const normalizeDepartment = (dept) => {
  if (!dept) return "";
  const upper = String(dept).trim().toUpperCase();
  if (upper.includes("MTECH") || upper.includes("M.TECH") || upper.includes("M.TECH. CSE") || upper.includes("EUCI")) {
    return "Department of MTech Computer Science and Engineering";
  }
  if (upper.includes("ARTIFICIAL INTELLIGENCE") || upper.includes("AI & DATA") || upper.includes("AI & DS") || upper === "AIDS" || upper.includes("AI AND DATA") || upper.includes("EUAI") || upper.includes("EUAD")) {
    return "Department of Artificial Intelligence and Data Science";
  }
  if (upper.includes("BUSINESS SYSTEMS") || upper === "CSBS" || upper.includes("EUBS") || upper.includes("EUCB")) {
    return "Department of Computer Science and Business Systems";
  }
  if (upper === "CSE" || upper.includes("COMPUTER SCIENCE AND ENGINEERING") || (upper.includes("COMPUTER SCIENCE") && !upper.includes("BUSINESS")) || upper.includes("EUCS")) {
    return "Department of Computer Science and Engineering";
  }
  if (upper === "IT" || upper.includes("INFORMATION TECH") || upper.includes("INFORMATION TECHNOLOGY") || upper.includes("EUIT")) {
    return "Department of Information Technology";
  }
  if (upper === "ECE" || upper.includes("ELECTRONICS AND COMMUNICATION") || upper.includes("ELECTRONICS & COMMUNICATION") || upper.includes("ELECTRONICS") || upper.includes("EUEC")) {
    return "Department of Electronics and Communication Engineering";
  }
  if (upper === "EEE" || upper.includes("ELECTRICAL AND ELECTRONICS") || upper.includes("ELECTRICAL & ELECTRONICS") || upper.includes("EUEE")) {
    return "Department of Electrical and Electronics Engineering";
  }
  if (upper.includes("MECH") || upper.includes("MECHANICAL") || upper.includes("EUME")) {
    return "Department of Mechanical Engineering";
  }
  if (upper.includes("CIVIL") || upper.includes("EUCE") || upper.includes("EUCV")) {
    return "Department of Civil Engineering";
  }
  if (upper.includes("MECHATRONICS") || upper.includes("EUMT")) {
    return "Department of Mechatronics Engineering";
  }
  return dept.trim();
};

function FacultyDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Faculty";
  const token = localStorage.getItem("token");
  const isAdvisor = localStorage.getItem("classAdvisor") === "true";

  // Tab State
  const [activeTab, setActiveTab] = useState("overview"); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("eduflow-theme");
    return saved ? saved === "dark" : true;
  });
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.setAttribute("data-theme", "light");
    }
    localStorage.setItem("eduflow-theme", isDark ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("eduflow-theme-changed", { detail: isDark ? "dark" : "light" }));
  }, [isDark]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsDark(e.detail === "dark");
    };
    window.addEventListener("eduflow-theme-changed", handleThemeChange);
    return () => window.removeEventListener("eduflow-theme-changed", handleThemeChange);
  }, []);

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
  const [facultySubjects, setFacultySubjects] = useState([]);
  const [customSubject, setCustomSubject] = useState("");
  const [sessionDuration, setSessionDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [checkedInStudents, setCheckedInStudents] = useState([]);
  const [sessionStudents, setSessionStudents] = useState([]);

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

  // Attendance Register States
  const [registerSessionId, setRegisterSessionId] = useState("");
  const [registerRecords, setRegisterRecords] = useState([]);
  const [localRegisterRecords, setLocalRegisterRecords] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [registerFilterSubject, setRegisterFilterSubject] = useState("");
  const [registerFilterDate, setRegisterFilterDate] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMode, setRegisterMode] = useState("manual"); // "manual" or "existing"
  const [showEditModal, setShowEditModal] = useState(false);
  const [manualDate, setManualDate] = useState(new Date().toISOString().substring(0, 10));
  const [manualStartTime, setManualStartTime] = useState("09:30");
  const [manualEndTime, setManualEndTime] = useState("10:30");
  const [manualSubject, setManualSubject] = useState("");

  // Free Activity states
  const [freeActivityDay, setFreeActivityDay] = useState("Monday");
  const [freeActivityName, setFreeActivityName] = useState("Coding Practice");
  const [freeActivitySubmissions, setFreeActivitySubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [questionBankProblems, setQuestionBankProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");

  const fetchQuestionBank = async () => {
    if (!token) return;
    try {
      const res = await getCodingProblems(token);
      setQuestionBankProblems(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedProblemId(res.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching question bank:", err);
    }
  };

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
      const timetableRes = await getFacultyTimetable(token);
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

  const handleAssignFreeActivity = async (e) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
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

      const date = getSimulatedDate(freeActivityDay);
      const dept = localStorage.getItem("department") || "M.Tech CSE";
      await assignFreeActivityPeriod({
        date: date,
        activityName: freeActivityName,
        department: dept,
        questionBankId: freeActivityName === "Coding Practice" ? selectedProblemId : null
      }, token);
      showFeedback(`Successfully assigned "${freeActivityName}" to ${freeActivityDay}'s Free Activity Period.`);
      fetchTimetableAndStatus();
      fetchFreeActivitySubmissions();
    } catch (err) {
      console.error(err);
      showFeedback("Failed to assign Free Activity Period.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFreeActivitySubmissions = async () => {
    if (!token) return;
    setSubmissionsLoading(true);
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

      const date = getSimulatedDate(freeActivityDay);
      const res = await getFreeActivitySubmissions(date, token);
      setFreeActivitySubmissions(res.data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleOverrideAttendance = async (submissionId, status) => {
    if (!token) return;
    try {
      await overrideFreeActivityAttendance({ submissionId, status }, token);
      showFeedback(`Attendance successfully overridden to ${status}.`);
      fetchFreeActivitySubmissions();
    } catch (err) {
      console.error("Error overriding attendance:", err);
      showFeedback("Failed to override attendance.", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "schedule") {
      fetchFreeActivitySubmissions();
      fetchQuestionBank();
    }
  }, [activeTab, freeActivityDay, token]);

  // Fetch faculty subjects
  useEffect(() => {
    if (token) {
      getMySubjects(token)
        .then(res => {
          const subjects = res.data || [];
          setFacultySubjects(subjects);
          if (subjects.length === 1) {
            setSessionSubject(subjects[0].subjectCode);
            setRegisterFilterSubject(subjects[0].subjectCode);
            setManualSubject(subjects[0].subjectCode);
          } else if (subjects.length > 1) {
            setManualSubject(subjects[0].subjectCode);
          }
        })
        .catch(err => console.error("Error fetching faculty subjects:", err));
    }
  }, [token]);

  // QR Selection prefill hook
  useEffect(() => {
    if (activeTab === "qr-session" && !activeSession && token) {
      getSuggestedSubject(simParams, token).then(res => {
        if (res.data?.suggestedSubject) {
          setSessionSubject(res.data.suggestedSubject);
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
    navigate("/");
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
    fetchSessions();
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

  const sortStudentsByRoll = (list = []) => {
    return [...list].sort((a, b) => {
      const regA = (a.registerNumber || "").trim();
      const regB = (b.registerNumber || "").trim();
      if (regA && regB) {
        return regA.localeCompare(regB, undefined, { numeric: true, sensitivity: "base" });
      }
      const nameA = (a.name || a.studentName || "").trim();
      const nameB = (b.name || b.studentName || "").trim();
      return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
    });
  };

  const fetchSessionRecords = async () => {
    if (!token || !activeSession) return;
    try {
      const res = await getSessionStudents(activeSession.id, token);
      const rawStuds = res.data || [];
      const allStuds = sortStudentsByRoll(rawStuds);
      setSessionStudents(allStuds);

      // Filter present/late to populate checkedInStudents for backward-compatibility counts
      const presentList = allStuds.filter(s => s.status === "PRESENT" || s.status === "LATE").map(s => ({
        id: s.studentId,
        studentName: s.name,
        registerNumber: s.registerNumber,
        time: s.time,
        status: s.status
      }));
      setCheckedInStudents(presentList);
    } catch (error) {
      console.error("Error fetching session students roster:", error);
    }
  };

  const handleManualOverride = async (studentId, status) => {
    if (!token || !activeSession) return;
    try {
      await markManualAttendance(activeSession.id, studentId, status, token);
      showFeedback(`Manually marked student as ${status}`);
      fetchSessionRecords();
    } catch (error) {
      showFeedback(error.response?.data || "Failed to update attendance status.", "error");
    }
  };

  // Live update checked in student records
  useEffect(() => {
    if (!activeSession) {
      setCheckedInStudents([]);
      setSessionStudents([]);
      return;
    }

    fetchSessionRecords();

    const recordsInterval = setInterval(() => {
      fetchSessionRecords();
    }, 5000); // pull records every 5 seconds

    return () => clearInterval(recordsInterval);
  }, [activeSession]);

  const [studentPage, setStudentPage] = useState(0);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentSortBy, setStudentSortBy] = useState("name");
  const [studentSortDir, setStudentSortDir] = useState("asc");
  const [studentSectionFilter, setStudentSectionFilter] = useState("");
  const [studentBatchFilter, setStudentBatchFilter] = useState("");
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchFacultyStudentsList = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const dept = localStorage.getItem("department") || "M.Tech CSE";
      const res = await getStudentsPaged({
        page: studentPage,
        size: 10,
        sortBy: studentSortBy,
        sortDir: studentSortDir,
        search: searchTerm,
        department: dept,
        section: studentSectionFilter,
        batch: studentBatchFilter
      }, token);
      setStudents(res.data.content || []);
      setStudentTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching faculty paged students:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleViewProfile = async (studentId) => {
    try {
      const res = await getStudentProfile(studentId, token);
      setSelectedStudentProfile(res.data);
      setShowProfileModal(true);
    } catch (err) {
      showFeedback("Failed to fetch student profile details.", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "students") {
      fetchFacultyStudentsList();
    }
  }, [activeTab, studentPage, studentSortBy, studentSortDir, studentSectionFilter, studentBatchFilter, searchTerm, token]);

  const fetchSessions = async (shouldAutoSelect = false) => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await getAllSessions(token);
      const sessList = res.data || [];
      setSessions(sessList);
      if (sessList.length > 0 && (shouldAutoSelect || (!registerSessionId && registerMode === "existing"))) {
        const targetId = String(sessList[0].id);
        setRegisterSessionId(targetId);
        loadRegisterSession(sessList[0].id);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      showFeedback("Failed to fetch sessions.", "error");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const [showReportModal, setShowReportModal] = useState(false);

  const handleViewReport = async (session) => {
    if (!session) {
      setShowReportModal(false);
      return;
    }
    setSelectedSession(session);
    setReportLoading(true);
    try {
      const res = await getSessionReport(session.id, token);
      setReportRecords(res.data || []);
      setShowReportModal(true);
    } catch (error) {
      console.error("Error fetching session report:", error);
      showFeedback("Failed to load attendance report.", "error");
    } finally {
      setReportLoading(false);
    }
  };

  const handleEditSession = (session) => {
    setSelectedSession(session);
    setRegisterSessionId(session.id);
    loadRegisterSession(session.id);
    setShowEditModal(true);
  };

  const loadRegisterSession = async (sessionId) => {
    if (!sessionId) {
      setRegisterRecords([]);
      setLocalRegisterRecords([]);
      setHasUnsavedChanges(false);
      return;
    }
    setRegisterLoading(true);
    try {
      const res = await getSessionStudents(sessionId, token);
      const rawRecords = res.data || [];
      const records = sortStudentsByRoll(rawRecords);
      setRegisterRecords(records);
      setLocalRegisterRecords(JSON.parse(JSON.stringify(records))); // deep copy
      setHasUnsavedChanges(false);
    } catch (err) {
      showFeedback("Failed to load attendance register records.", "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterOverride = (studentId, status) => {
    setLocalRegisterRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status: status } : r));
    setHasUnsavedChanges(true);
  };

  const handleRemarksChange = (studentId, val) => {
    setLocalRegisterRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, remarks: val } : r));
    setHasUnsavedChanges(true);
  };

  const handleSaveRegister = async () => {
    if (!registerSessionId) return;
    setRegisterLoading(true);
    try {
      const requests = localRegisterRecords.map(r => ({
        studentId: r.studentId,
        status: r.status === "PENDING" ? "ABSENT" : r.status,
        remarks: r.remarks || ""
      }));
      await saveBulkAttendance(registerSessionId, requests, token);
      showFeedback("Attendance register saved/updated successfully!");
      setHasUnsavedChanges(false);
      setShowEditModal(false);
      await loadRegisterSession(registerSessionId);
    } catch (error) {
      showFeedback(error.response?.data || "Failed to save/update attendance register.", "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSaveManualAttendance = async () => {
    if (!manualSubject) {
      showFeedback("Please select a subject.", "error");
      return;
    }
    if (!manualDate || !manualStartTime || !manualEndTime) {
      showFeedback("Please fill in Date, Start Time, and End Time.", "error");
      return;
    }
    setRegisterLoading(true);
    try {
      const selectedCourse = facultySubjects.find(s => 
        s.subjectCode?.toLowerCase() === manualSubject?.toLowerCase() || 
        s.id === manualSubject
      );

      const payload = {
        date: manualDate,
        startTime: manualStartTime,
        endTime: manualEndTime,
        subject: manualSubject,
        department: selectedCourse?.department || localStorage.getItem("department"),
        semester: selectedCourse?.semester,
        section: selectedCourse?.section || "A",
        records: localRegisterRecords.map(r => ({
          studentId: r.studentId,
          status: r.status === "PENDING" ? "ABSENT" : r.status,
          remarks: r.remarks || ""
        }))
      };
      await saveManualAttendanceSession(payload, token);
      showFeedback("Manual attendance saved successfully!");
      setHasUnsavedChanges(false);
      await fetchSessions(true);
      setRegisterMode("existing");
    } catch (error) {
      showFeedback(error.response?.data || "Failed to save manual attendance.", "error");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterCloseSession = async () => {
    if (!registerSessionId) return;
    try {
      await closeSession(registerSessionId, token);
      showFeedback("Attendance session closed and locked successfully.");
      fetchSessions();
      loadRegisterSession(registerSessionId);
    } catch (error) {
      showFeedback(error.response?.data || "Failed to close attendance session.", "error");
    }
  };

  useEffect(() => {
    if (activeTab === "analytics" || activeTab === "register") {
      fetchSessions(registerMode === "existing" && !registerSessionId);
      setSelectedSession(null);
      setReportRecords([]);
      if (activeTab === "register") {
        fetchStudents();
        if (registerMode === "existing" && registerSessionId) {
          loadRegisterSession(registerSessionId);
        }
      }
    }
  }, [activeTab, registerMode, registerSessionId]);

  useEffect(() => {
    if (activeTab === "register" && registerMode === "manual" && students.length > 0) {
      // Find selected course details from facultySubjects
      const selectedCourse = facultySubjects.find(s => 
        s.subjectCode?.toLowerCase() === manualSubject?.toLowerCase() || 
        s.id === manualSubject
      );

      const targetDept = selectedCourse?.department || localStorage.getItem("department") || "";
      const targetSem = selectedCourse?.semester;
      const targetSec = selectedCourse?.section;

      const normTarget = normalizeDepartment(targetDept).toLowerCase();

      let matchedStudents = students.filter(s => {
        if (!targetDept) return true;
        const normStudentDept = normalizeDepartment(s.department).toLowerCase();
        const normRegDept = s.registerNumber ? normalizeDepartment(s.registerNumber).toLowerCase() : "";
        const deptMatch = (normStudentDept && normStudentDept === normTarget) || (normRegDept && normRegDept === normTarget);
        const semMatch = !targetSem || s.semester == targetSem;
        const secMatch = !targetSec || !s.section || s.section.toUpperCase() === targetSec.toUpperCase();
        return deptMatch && semMatch && secMatch;
      });

      // Fallback: match by department only (if semester/section is not yet partitioned)
      if (matchedStudents.length === 0 && targetDept) {
        matchedStudents = students.filter(s => {
          const normStudentDept = normalizeDepartment(s.department).toLowerCase();
          const normRegDept = s.registerNumber ? normalizeDepartment(s.registerNumber).toLowerCase() : "";
          return (normStudentDept && normStudentDept === normTarget) || (normRegDept && normRegDept === normTarget);
        });
      }

      const sortedMatched = sortStudentsByRoll(matchedStudents);
      const initialRecords = sortedMatched.map(s => ({
        studentId: s.id,
        registerNumber: s.registerNumber,
        name: s.name,
        status: "PRESENT",
        remarks: ""
      }));
      setLocalRegisterRecords(initialRecords);
      setHasUnsavedChanges(true);
    }
  }, [activeTab, registerMode, students, manualSubject, facultySubjects]);

  useEffect(() => {
    if (activeTab === "register" && registerMode === "manual" && manualDate && manualStartTime && manualSubject && sessions.length > 0) {
      const match = sessions.find(s => {
        const sDate = s.startTime.substring(0, 10);
        const sTime = s.startTime.substring(11, 16);
        return s.subject.toLowerCase() === manualSubject.toLowerCase() &&
               sDate === manualDate &&
               sTime === manualStartTime;
      });

      if (match) {
        showFeedback("An attendance session already exists for this date and time. Opening it for editing.", "info");
        setRegisterMode("existing");
        setRegisterSessionId(String(match.id));
        setRegisterFilterSubject(manualSubject);
        setRegisterFilterDate(manualDate);
        loadRegisterSession(match.id);
      }
    }
  }, [manualDate, manualStartTime, manualSubject, sessions, registerMode, activeTab]);

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
    const finalSubject = sessionSubject;
    if (!finalSubject) {
      showFeedback("Please select a subject.", "error");
      return;
    }
    setSessionLoading(true);
    try {
      const selectedCourse = facultySubjects.find(s => 
        s.subjectCode?.toLowerCase() === finalSubject?.toLowerCase() || 
        s.id === finalSubject
      );

      const res = await startSession(
        {
          subject: finalSubject,
          durationMinutes: parseInt(sessionDuration, 10),
          department: selectedCourse?.department || localStorage.getItem("department"),
          semester: selectedCourse?.semester,
          section: selectedCourse?.section || "A"
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

  const email = localStorage.getItem("email") || "";
  const department = localStorage.getItem("department") || "M.Tech CSE";

  let subtitle = "";
  if (isAdvisor) {
    subtitle = `Class Advisor • ${department}`;
  } else {
    let assignedSubject = department || "Department Faculty";
    subtitle = `Subject Faculty • ${assignedSubject}`;
  }

  return (
    <div className="portal-layout" style={{
      display: "flex", width: "100vw", minHeight: "100vh",
      backgroundColor: "var(--bg-primary)", color: "var(--text-main)", overflow: "hidden",
    }}>
      {/* Backdrop for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 30,
          }}
          className="lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <FacultySidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} name={name} subtitle={subtitle} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main viewport */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        paddingLeft: "260px",
      }} className="w-full pl-0 lg:pl-[260px]">

        {/* Topbar navigation panel */}
        <FacultyTopbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} setMobileMenuOpen={setMobileMenuOpen} name={name} subtitle={subtitle} isDark={isDark} setIsDark={setIsDark} handleLogout={handleLogout} />

        {/* Scrollable page viewport content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "2rem" }} className="custom-scrollbar">
          
          {/* Welcome section - only shown on dashboard/overview */}
          {activeTab === "overview" && (
          <div className="dashboard-title" style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Welcome back, {name}
            </h1>
            <div style={{ marginTop: "0.5rem" }}>
              <span style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#e11d48",
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid rgba(244, 63, 94, 0.2)",
                padding: "0.3rem 0.8rem",
                borderRadius: "20px",
                display: "inline-block"
              }}>
                {subtitle}
              </span>
            </div>
          </div>
          )}

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

          {/* Render Views */}
          {activeTab === "overview" && (
            <FacultyOverviewView
              facultyAnalytics={facultyAnalytics}
              facultyAnalyticsLoading={facultyAnalyticsLoading}
              currentClassStatus={currentClassStatus}
              timetableLoading={timetableLoading}
              sessions={sessions}
            />
          )}

          {activeTab === "qr-session" && (
            <FacultyQrSessionView
              activeSession={activeSession}
              sessionSubject={sessionSubject}
              setSessionSubject={setSessionSubject}
              facultySubjects={facultySubjects}
              customSubject={customSubject}
              setCustomSubject={setCustomSubject}
              sessionDuration={sessionDuration}
              setSessionDuration={setSessionDuration}
              timeLeft={timeLeft}
              sessionLoading={sessionLoading}
              checkedInStudents={checkedInStudents}
              sessionStudents={sessionStudents}
              handleStartSession={handleStartSession}
              handleEndSession={handleEndSession}
              formatTimeLeft={formatTimeLeft}
              handleManualOverride={handleManualOverride}
              isAdvisor={isAdvisor}
            />
          )}

          {activeTab === "register" && (
            <FacultyManualAttendanceView
              registerRecords={registerRecords}
              localRegisterRecords={localRegisterRecords}
              setLocalRegisterRecords={setLocalRegisterRecords}
              hasUnsavedChanges={hasUnsavedChanges}
              setHasUnsavedChanges={setHasUnsavedChanges}
              registerFilterSubject={registerFilterSubject}
              setRegisterFilterSubject={setRegisterFilterSubject}
              registerFilterDate={registerFilterDate}
              setRegisterFilterDate={setRegisterFilterDate}
              registerLoading={registerLoading}
              registerMode={registerMode}
              setRegisterMode={setRegisterMode}
              manualDate={manualDate}
              setManualDate={setManualDate}
              manualStartTime={manualStartTime}
              setManualStartTime={setManualStartTime}
              manualEndTime={manualEndTime}
              setManualEndTime={setManualEndTime}
              manualSubject={manualSubject}
              setManualSubject={setManualSubject}
              facultySubjects={facultySubjects}
              sessions={sessions}
              loadRegisterSession={loadRegisterSession}
              handleRegisterOverride={handleRegisterOverride}
              handleRemarksChange={handleRemarksChange}
              handleSaveRegister={handleSaveRegister}
              handleSaveManualAttendance={handleSaveManualAttendance}
              handleRegisterCloseSession={handleRegisterCloseSession}
              registerSessionId={registerSessionId}
              setRegisterSessionId={setRegisterSessionId}
              fetchSessions={fetchSessions}
            />
          )}

          {activeTab === "schedule" && (
            <FacultyScheduleView
              timetableData={timetableData}
              currentClassStatus={currentClassStatus}
              timetableLoading={timetableLoading}
              simParams={simParams}
              facultySubjects={facultySubjects}
            />
          )}

          {activeTab === "career" && (
            <FacultyCareerView />
          )}

          {/* Advisor-specific views */}
          {isAdvisor && activeTab === "students" && (
            <FacultyAdvisorStudentsView
              students={students}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              studentPage={studentPage}
              setStudentPage={setStudentPage}
              studentTotalPages={studentTotalPages}
              studentSortBy={studentSortBy}
              setStudentSortBy={setStudentSortBy}
              studentSortDir={studentSortDir}
              setStudentSortDir={setStudentSortDir}
              studentSectionFilter={studentSectionFilter}
              setStudentSectionFilter={setStudentSectionFilter}
              studentBatchFilter={studentBatchFilter}
              setStudentBatchFilter={setStudentBatchFilter}
              fetchLoading={fetchLoading}
              handleViewProfile={handleViewProfile}
            />
          )}

          {isAdvisor && activeTab === "leave" && (
            <FacultyAdvisorLeavesView
              leaveRequests={leaveRequests}
              leaveFilter={leaveFilter}
              setLeaveFilter={setLeaveFilter}
              leaveLoading={leaveLoading}
              rejectReason={rejectReason}
              setRejectReason={setRejectReason}
              rejectingId={rejectingId}
              setRejectingId={setRejectingId}
              handleApproveLeave={handleApproveLeave}
              handleRejectLeave={handleRejectLeave}
              fetchLeaveRequests={fetchLeaveRequests}
            />
          )}

          {activeTab === "analytics" && (
            <FacultyAdvisorAnalyticsView
              lowAttendanceStudents={lowAttendanceStudents}
              lowAttendanceLoading={lowAttendanceLoading}
              fetchLowAttendanceStudents={fetchLowAttendanceStudents}
              handleExportCsv={handleExportCsv}
              handlePrintPdf={handlePrintPdf}
              exportingId={exportingId}
              sessions={sessions}
              analyticsLoading={analyticsLoading}
              handleViewReport={handleViewReport}
              handleEditSession={handleEditSession}
              selectedSession={selectedSession}
              reportLoading={reportLoading}
              reportRecords={reportRecords}
              showReportModal={showReportModal}
            />
          )}

        </div>
      </main>

      {/* Student Profile Modal (Common to advisor views) */}
      {showProfileModal && selectedStudentProfile && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(5, 7, 17, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "2rem"
        }}>
          <div style={{
            background: "rgba(30, 41, 59, 0.95)",
            border: "1px solid var(--card-border)",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "750px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2.5rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)",
            position: "relative"
          }}>
            <button
              onClick={() => setShowProfileModal(false)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "1.5rem",
                cursor: "pointer",
                opacity: 0.7
              }}
            >
              ✕
            </button>

            {/* Modern Header Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)",
              padding: "2rem",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              marginBottom: "1.5rem",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Decorative radial shine */}
              <div style={{
                position: "absolute", top: "-50%", right: "-20%", width: "250px", height: "250px",
                background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
                pointerEvents: "none"
              }} />

              {/* Student Photo with premium frame */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {(() => {
                  const regNum = selectedStudentProfile.student.registerNumber;
                  const photoUrl = regNum ? `/students_photos/${regNum.toLowerCase()}.jpg` : null;
                  return photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={selectedStudentProfile.student.name}
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      style={{
                        width: 110, height: 110, borderRadius: "24px",
                        objectFit: "cover", objectPosition: "top",
                        border: "3px solid var(--primary)",
                        boxShadow: "0 12px 28px rgba(99,102,241,0.3)",
                        transition: "transform 0.3s ease"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    />
                  ) : null;
                })()}
                <div style={{
                  width: 110, height: 110, borderRadius: "24px",
                  background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                  display: "none", alignItems: "center", justifyContent: "center",
                  fontSize: "3rem", fontWeight: "800", color: "#fff", flexShrink: 0,
                  border: "3px solid var(--primary)",
                  boxShadow: "0 12px 28px rgba(99,102,241,0.3)"
                }}>
                  {selectedStudentProfile.student.name?.charAt(0) || "S"}
                </div>
                {/* Active Indicator Badge */}
                <div style={{
                  position: "absolute", bottom: "-6px", right: "-6px",
                  background: selectedStudentProfile.student.active ? "var(--success)" : "var(--error)",
                  color: "#fff", fontSize: "0.68rem", fontWeight: "800",
                  padding: "4px 8px", borderRadius: "10px", textTransform: "uppercase",
                  border: "2px solid #1e293b", letterSpacing: "0.5px"
                }}>
                  {selectedStudentProfile.student.active ? "Active" : "Inactive"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", background: "rgba(99, 102, 241, 0.2)", color: "var(--primary)", padding: "4px 10px", borderRadius: "20px", fontWeight: "700", width: "fit-content", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {selectedStudentProfile.student.department || "M.Tech CSE"} Student
                </span>
                <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                  {selectedStudentProfile.student.name}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.9rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: "700", color: "var(--primary)" }}>#{selectedStudentProfile.student.registerNumber || "N/A"}</span>
                  <span>•</span>
                  <span>Section {selectedStudentProfile.student.section || "A"}</span>
                  <span>•</span>
                  <span>Semester {selectedStudentProfile.student.semester || "7"}</span>
                </div>
              </div>
            </div>

            {/* Profile Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
              {/* Personal & Academic */}
              <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.05rem", fontWeight: "700", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>👤</span> Personal & Academic Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.8rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>📧 Email Address:</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "600", wordBreak: "break-all" }}>{selectedStudentProfile.student.email}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>📞 Contact Phone:</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.student.phone || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>📅 Academic Batch:</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.student.batch || "2023 - 2028"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>🎂 Date of Birth:</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.student.dateOfBirth ? selectedStudentProfile.student.dateOfBirth.split(" ")[0] : "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                    <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>⚧️ Gender / Sex:</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.student.gender || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ color: "var(--text-muted)" }}>🏠 Home Address:</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "600", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", lineHeight: "1.4" }}>{selectedStudentProfile.student.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Parent Details */}
              <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <h4 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.05rem", fontWeight: "700", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>👪</span> Family & Emergency Details
                </h4>
                {selectedStudentProfile.profile ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.8rem", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>👴 Father Name:</span>
                      <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.profile.fatherName || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>📞 Father Phone:</span>
                      <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.profile.fatherPhone || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>👵 Mother Name:</span>
                      <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.profile.motherName || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>📞 Mother Phone:</span>
                      <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{selectedStudentProfile.profile.motherPhone || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>📧 Guardian Email:</span>
                      <span style={{ color: "var(--text-main)", fontWeight: "600", wordBreak: "break-all" }}>{selectedStudentProfile.profile.guardianEmail || "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "6px" }}>
                      <span style={{ color: "var(--text-muted)", width: "130px", flexShrink: 0 }}>🩸 Blood Group:</span>
                      <span style={{
                        color: selectedStudentProfile.profile.bloodGroup ? "var(--error)" : "var(--text-main)",
                        fontWeight: "800", background: selectedStudentProfile.profile.bloodGroup ? "rgba(239,68,68,0.1)" : "transparent",
                        padding: selectedStudentProfile.profile.bloodGroup ? "2px 8px" : 0,
                        borderRadius: "6px"
                      }}>
                        {selectedStudentProfile.profile.bloodGroup || "N/A"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1, padding: "2rem", color: "var(--text-muted)", fontStyle: "italic", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px dashed var(--card-border)" }}>
                    No family profile metadata stored.
                  </div>
                )}
              </div>
            </div>


            {/* Performance Stats */}
            <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", padding: "1.25rem", borderRadius: "16px", marginBottom: "2rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1rem" }}>📈 Academic ERP Statistics</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--success)" }}>
                    {selectedStudentProfile.statistics.attendancePercentage ? `${selectedStudentProfile.statistics.attendancePercentage.toFixed(1)}%` : "0.0%"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Attendance</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fff" }}>
                    {selectedStudentProfile.statistics.totalClasses}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Classes</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)" }}>
                    {selectedStudentProfile.statistics.present}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Present Count</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--error)" }}>
                    {selectedStudentProfile.statistics.absent}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Absent Count</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#fbbf24" }}>
                    {selectedStudentProfile.statistics.careerScore || 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Career score</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#38bdf8" }}>
                    {selectedStudentProfile.statistics.codingSolved || 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Coding Solved</div>
                </div>
              </div>
            </div>

            {/* Attendance History Timeline */}
            <div>
              <h4 style={{ margin: "0 0 0.75rem 0", color: "#fff", fontSize: "1rem" }}>📅 Attendance Log Timeline</h4>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>
                      <th style={{ padding: "0.5rem" }}>Date / Time</th>
                      <th style={{ padding: "0.5rem" }}>Subject</th>
                      <th style={{ padding: "0.5rem" }}>Method</th>
                      <th style={{ padding: "0.5rem", textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentProfile.attendanceHistory && selectedStudentProfile.attendanceHistory.length > 0 ? (
                      selectedStudentProfile.attendanceHistory.map((h, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{h.date} {h.time ? `@ ${h.time}` : ""}</td>
                          <td style={{ padding: "0.5rem", fontWeight: "600" }}>{h.subject}</td>
                          <td style={{ padding: "0.5rem" }}>
                            <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>
                              {h.method}
                            </span>
                          </td>
                          <td style={{ padding: "0.5rem", textAlign: "right", fontWeight: "700", color: h.status === "PRESENT" ? "var(--success)" : "var(--error)" }}>
                            {h.status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                          No attendance sessions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Inline Modal */}
      {showEditModal && selectedSession && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(5, 7, 17, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "2rem"
        }}>
          <div style={{
            background: "var(--bg-main)",
            border: "1px solid var(--card-border)",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "750px",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--card-border)", background: "rgba(30,41,59,0.4)" }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "transparent", border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer", opacity: 0.7 }}
              >✕</button>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "#fff" }}>Edit Attendance Session</h2>
              <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Session #{selectedSession.id} · {selectedSession.subject} · {new Date(selectedSession.startTime).toLocaleDateString()}
              </p>
            </div>

            {/* Roster Area */}
            <div style={{ padding: "0", overflowY: "auto", flexGrow: 1 }}>
              {registerLoading ? (
                <div style={{ padding: "3rem", textAlign: "center", color: "var(--primary)" }}>Loading roster...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
                  <thead style={{ position: "sticky", top: 0, background: "var(--bg-main)", zIndex: 10 }}>
                    <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "1rem" }}>Reg No</th>
                      <th style={{ padding: "1rem" }}>Student</th>
                      <th style={{ padding: "1rem", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "1rem" }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localRegisterRecords.map(r => {
                      const isAbsent = r.status === "ABSENT" || r.status === "PENDING";
                      return (
                        <tr key={r.studentId} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "var(--text-main)" }}>{r.registerNumber}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>{r.name}</td>
                          <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                            <button
                              onClick={() => handleRegisterOverride(r.studentId, isAbsent ? "PRESENT" : "ABSENT")}
                              style={{
                                background: isAbsent ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                                border: `1px solid ${isAbsent ? "var(--error)" : "var(--success)"}`,
                                color: isAbsent ? "var(--error)" : "var(--success)",
                                padding: "4px 12px", borderRadius: "6px", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer", minWidth: "85px"
                              }}
                            >
                              {isAbsent ? "ABSENT" : "PRESENT"}
                            </button>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <input
                              type="text" className="input-field" placeholder="Notes..."
                              value={r.remarks || ""}
                              onChange={e => handleRemarksChange(r.studentId, e.target.value)}
                              style={{ margin: 0, height: "30px", fontSize: "0.8rem", padding: "4px 8px" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    {localRegisterRecords.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No students found for this session.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer Action */}
            <div style={{ padding: "1.25rem 2rem", borderTop: "1px solid var(--card-border)", background: "rgba(30,41,59,0.4)", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: "transparent", border: "1px solid var(--card-border)", color: "#fff", borderRadius: "8px", padding: "8px 20px", fontWeight: "600", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRegister}
                disabled={!hasUnsavedChanges || registerLoading}
                style={{
                  background: hasUnsavedChanges ? "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)" : "rgba(255,255,255,0.03)",
                  border: "none", color: hasUnsavedChanges ? "#fff" : "var(--text-muted)", borderRadius: "8px", padding: "8px 24px", fontWeight: "700", cursor: hasUnsavedChanges ? "pointer" : "not-allowed"
                }}
              >
                {registerLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default FacultyDashboard;
