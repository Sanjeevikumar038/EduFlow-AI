import { useState, useEffect } from "react";
import {
  createFaculty,
  getFaculty,
  deleteFaculty,
  createStudent,
  getStudents,
  deleteStudent,
  getStudentsPaged,
  getStudentProfile
} from "../services/authService";
import { getAdminAnalytics, exportSessionCsv, exportSessionPdfData, getLowAttendanceStudents } from "../services/attendanceService";
import { getAllLeaveRequests } from "../services/leaveService";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import AnalyticsControlView from "../components/admin/AnalyticsControlView";
import FacultyManagementView from "../components/admin/FacultyManagementView";
import StudentManagementView from "../components/admin/StudentManagementView";
import TimetableManagerView from "../components/admin/TimetableManagerView";
import SubjectMasterView from "../components/admin/SubjectMasterView";
import FacultyExpertiseView from "../components/admin/FacultyExpertiseView";
import FacultyLeavesView from "../components/admin/FacultyLeavesView";
import StudentLeavesView from "../components/admin/StudentLeavesView";
import WorkloadView from "../components/admin/WorkloadView";
import { getDepartmentTimetable, saveDepartmentTimetable, autoGenerateTimetable, getTimetableVersions, activateTimetableVersion } from "../services/timetableService";
import {
  getSubjects, createSubject, deleteSubject,
  getAllExpertise, allocateExpertise, removeExpertise,
  getAvailability, setAvailability, deleteAvailability,
  getFacultyWorkload,
  getClassrooms, createClassroom
} from "../services/subjectService";
import CareerDashboardAdmin from "../components/career/CareerDashboardAdmin";
import "../styles/dashboard-tweaks.css";

function DepartmentComparisonChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
        No department session records found to compile comparison.
      </div>
    );
  }

  const svgWidth = 600;
  const svgHeight = 250;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 40;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const barWidth = Math.min(60, chartWidth / data.length - 20);
  const colWidth = chartWidth / data.length;

  return (
    <div style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem", width: "100%", height: "100%" }}>
      <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
        <i className="fa-solid fa-chart-pie" style={{ color: "var(--primary)" }}></i> Department Attendance Comparison
      </h3>
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={{ overflow: "visible", minWidth: "500px" }}>
          <defs>
            <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--secondary)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>

          {[25, 50, 75, 100].map((tick) => {
            const y = svgHeight - paddingBottom - (tick / 100) * chartHeight;
            return (
              <g key={tick}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                <text x={paddingLeft - 10} y={y + 3} fill="var(--text-muted)" fontSize="8" textAnchor="end">{tick}%</text>
              </g>
            );
          })}

          <line
            x1={paddingLeft}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingRight}
            y2={svgHeight - paddingBottom}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1.5"
          />

          {data.map((dept, index) => {
            const x = paddingLeft + index * colWidth + (colWidth - barWidth) / 2;
            const barHeight = (dept.averageAttendance / 100) * chartHeight;
            const y = svgHeight - paddingBottom - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#bar-grad)"
                  rx="6"
                  ry="6"
                  style={{ transition: "all 0.5s ease" }}
                />

                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  fill="#fff"
                  fontSize="9"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {dept.averageAttendance.toFixed(1)}%
                </text>

                <text
                  x={x + barWidth / 2}
                  y={svgHeight - paddingBottom + 18}
                  fill="var(--text-muted)"
                  fontSize="8"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {dept.department.length > 12 ? dept.department.substring(0, 10) + ".." : dept.department}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Admin";
  const token = localStorage.getItem("token");

  // Tab State
  const [activeTab, setActiveTab] = useState("analytics"); // 'analytics', 'faculty' or 'students'

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("eduflow-theme");
    return saved ? saved === "dark" : false;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", "light");
    }
    localStorage.setItem("eduflow-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Admin Analytics States
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [adminAnalyticsLoading, setAdminAnalyticsLoading] = useState(true);

  // Leave Requests States (Admin)
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [studentLeaveLoading, setStudentLeaveLoading] = useState(false);
  const [leaveFilterDept, setLeaveFilterDept] = useState("All");
  const [leaveFilterStatus, setLeaveFilterStatus] = useState("All");
  const [leaveSearch, setLeaveSearch] = useState("");

  // Low Attendance Export State
  const [exportingId, setExportingId] = useState(null);

  // Timetable Manager States
  const [selectedDept, setSelectedDept] = useState("M.Tech CSE");
  const [timetableMatrix, setTimetableMatrix] = useState({});
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [savingTimetable, setSavingTimetable] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [selectedSwapCell, setSelectedSwapCell] = useState(null);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [timetableVersions, setTimetableVersions] = useState([]);

  // Subject Master States
  const [subjects, setSubjects] = useState([]);
  const [subjectForm, setSubjectForm] = useState({ subjectCode: "", subjectName: "", department: "M.Tech CSE", semester: 1, academicYear: "2024-25", credits: 3, weeklyHours: 3, subjectCategory: "THEORY" });
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState("");

  // Faculty Expertise States
  const [expertise, setExpertise] = useState([]);
  const [expertiseForm, setExpertiseForm] = useState({ facultyId: "", subjectId: "", expertiseLevel: "PRIMARY" });
  const [expertiseLoading, setExpertiseLoading] = useState(false);

  // Faculty Availability/Leaves States
  const [availability, setAvailabilityList] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ facultyId: "", date: "", available: false, reason: "" });
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Faculty Workload States
  const [workload, setWorkload] = useState([]);
  const [workloadLoading, setWorkloadLoading] = useState(false);

  // Classroom States
  const [classrooms, setClassrooms] = useState([]);
  const [classroomForm, setClassroomForm] = useState({ roomCode: "", roomName: "", capacity: 60, roomType: "LECTURE" });

  const DEPT_OPTIONS = ["M.Tech CSE", "CSE", "IT", "ECE"];

  const loadSubjects = async () => {
    try { const res = await getSubjects(token); setSubjects(res.data); } catch (e) { console.error(e); }
  };
  const loadExpertise = async () => {
    try { const res = await getAllExpertise(token); setExpertise(res.data); } catch (e) { console.error(e); }
  };
  const loadAvailability = async () => {
    try { const res = await getAvailability(token); setAvailabilityList(res.data); } catch (e) { console.error(e); }
  };
  const loadWorkload = async () => {
    setWorkloadLoading(true);
    try { const res = await getFacultyWorkload(token); setWorkload(res.data); } catch (e) { console.error(e); } finally { setWorkloadLoading(false); }
  };
  const loadClassrooms = async () => {
    try { const res = await getClassrooms(token); setClassrooms(res.data); } catch (e) { console.error(e); }
  };
  const loadVersions = async (dept) => {
    try { const res = await getTimetableVersions(token, dept); setTimetableVersions(res.data); } catch (e) { console.error(e); }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSubjectLoading(true);
    try {
      await createSubject({ ...subjectForm, semester: Number(subjectForm.semester), credits: Number(subjectForm.credits), weeklyHours: Number(subjectForm.weeklyHours) }, token);
      showFeedback("Subject created!");
      setSubjectForm({ subjectCode: "", subjectName: "", department: "M.Tech CSE", semester: 1, academicYear: "2024-25", credits: 3, weeklyHours: 3, subjectCategory: "THEORY" });
      loadSubjects();
    } catch (e) { showFeedback(e.response?.data || "Failed to create subject", "error"); }
    finally { setSubjectLoading(false); }
  };
  const handleDeleteSubject = async (id) => {
    try { await deleteSubject(id, token); showFeedback("Subject deleted/deactivated!"); loadSubjects(); }
    catch (e) { showFeedback(e.response?.data || "Failed to delete subject", "error"); }
  };
  const handleAllocateExpertise = async (e) => {
    e.preventDefault();
    setExpertiseLoading(true);
    try {
      await allocateExpertise({ facultyId: Number(expertiseForm.facultyId), subjectId: Number(expertiseForm.subjectId), expertiseLevel: expertiseForm.expertiseLevel }, token);
      showFeedback("Expertise allocated!");
      setExpertiseForm({ facultyId: "", subjectId: "", expertiseLevel: "PRIMARY" });
      loadExpertise();
    } catch (e) { showFeedback(e.response?.data || "Failed to allocate expertise", "error"); }
    finally { setExpertiseLoading(false); }
  };
  const handleRemoveExpertise = async (id) => {
    try { await removeExpertise(id, token); showFeedback("Expertise removed!"); loadExpertise(); }
    catch (e) { showFeedback("Failed to remove expertise", "error"); }
  };
  const handleAddLeave = async (e) => {
    e.preventDefault();
    setLeaveLoading(true);
    try {
      await setAvailability({ facultyId: Number(leaveForm.facultyId), date: leaveForm.date, available: leaveForm.available, reason: leaveForm.reason }, token);
      showFeedback("Leave recorded!");
      setLeaveForm({ facultyId: "", date: "", available: false, reason: "" });
      loadAvailability();
    } catch (e) { showFeedback("Failed to record leave", "error"); }
    finally { setLeaveLoading(false); }
  };
  const handleDeleteLeave = async (id) => {
    try { await deleteAvailability(id, token); showFeedback("Leave record removed!"); loadAvailability(); }
    catch (e) { showFeedback("Failed to remove leave", "error"); }
  };
  const handleAutoGenerate = async () => {
    setAutoGenerating(true);
    try {
      const res = await autoGenerateTimetable({ department: selectedDept }, token);
      showFeedback(`✅ ${res.data.message} (${res.data.totalEntries} entries)`);
      loadTimetable(selectedDept);
    } catch (e) { showFeedback(e.response?.data || "Auto-generate failed", "error"); }
    finally { setAutoGenerating(false); }
  };
  const handleActivateVersion = async (id) => {
    try { await activateTimetableVersion(id, token); showFeedback("Version activated!"); loadVersions(selectedDept); loadTimetable(selectedDept); }
    catch (e) { showFeedback("Failed to activate version", "error"); }
  };
  const handleAddClassroom = async (e) => {
    e.preventDefault();
    try { await createClassroom({ ...classroomForm, capacity: Number(classroomForm.capacity) }, token); showFeedback("Classroom added!"); setClassroomForm({ roomCode: "", roomName: "", capacity: 60, roomType: "LECTURE" }); loadClassrooms(); }
    catch (e) { showFeedback(e.response?.data || "Failed to add classroom", "error"); }
  };

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

  const loadTimetable = async (dept) => {
    if (!token) return;
    setTimetableLoading(true);
    try {
      const res = await getDepartmentTimetable(dept, token);
      const entries = res.data || [];

      const newMatrix = {};
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      days.forEach(day => {
        for (let p = 1; p <= 8; p++) {
          newMatrix[`${day}-${p}`] = { subject: "", facultyId: "" };
        }
      });

      entries.forEach(e => {
        newMatrix[`${e.dayOfWeek}-${e.period}`] = {
          subject: e.subject || "",
          facultyId: e.faculty?.id || ""
        };
      });

      setTimetableMatrix(newMatrix);
    } catch (err) {
      console.error("Error loading timetable:", err);
      showFeedback("Failed to load timetable for department.", "error");
    } finally {
      setTimetableLoading(false);
    }
  };

  const fetchAdminLeaveRequests = async () => {
    if (!token) return;
    setStudentLeaveLoading(true);
    try {
      const res = await getAllLeaveRequests(token, leaveFilterDept, leaveFilterStatus);
      setLeaveRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching admin leave requests:", err);
    } finally {
      setStudentLeaveLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "timetable") {
      loadTimetable(selectedDept);
    }
    if (activeTab === "leave") {
      fetchAdminLeaveRequests();
    }
  }, [activeTab, selectedDept, leaveFilterDept, leaveFilterStatus, token]);

  const handleSaveTimetable = async () => {
    setSavingTimetable(true);
    try {
      const entriesToSave = [];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      days.forEach(day => {
        for (let p = 1; p <= 6; p++) {
          const cell = timetableMatrix[`${day}-${p}`];
          if (cell && (cell.subject.trim() !== "" || cell.facultyId !== "")) {
            entriesToSave.push({
              dayOfWeek: day,
              period: p,
              subject: cell.subject.trim(),
              facultyId: cell.facultyId ? Number(cell.facultyId) : null
            });
          }
        }
      });

      await saveDepartmentTimetable(selectedDept, entriesToSave, token);
      showFeedback("Timetable saved successfully!");
      loadTimetable(selectedDept);
    } catch (err) {
      console.error("Error saving timetable:", err);
      showFeedback(err.response?.data || "Failed to save timetable.", "error");
    } finally {
      setSavingTimetable(false);
    }
  };

  const handleRandomizeTimetable = () => {
    let deptSubjects = [];
    if (selectedDept === "M.Tech CSE") {
      deptSubjects = ["OS", "DCN", "PCD", "AGAI"];
    } else if (selectedDept === "CSE") {
      deptSubjects = ["DSA", "COA", "DBMS", "Java Lab"];
    } else if (selectedDept === "IT") {
      deptSubjects = ["OOPs", "SE", "OS", "WebTech"];
    } else if (selectedDept === "ECE") {
      deptSubjects = ["EDC", "SS", "LIC", "MPMC"];
    } else {
      deptSubjects = ["SUB1", "SUB2", "SUB3", "SUB4"];
    }

    const newMatrix = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    days.forEach(day => {
      for (let p = 1; p <= 6; p++) {
        const randomSub = deptSubjects[Math.floor(Math.random() * deptSubjects.length)];
        let randomFacId = "";
        if (faculty.length > 0 && Math.random() > 0.15) {
          const randomFac = faculty[Math.floor(Math.random() * faculty.length)];
          randomFacId = randomFac.id;
        }
        newMatrix[`${day}-${p}`] = { subject: randomSub, facultyId: randomFacId };
      }
    });

    setTimetableMatrix(newMatrix);
    showFeedback(`Randomized timetable grid compiled for ${selectedDept}! Click Save to apply.`);
  };

  const handleCellChange = (day, period, field, value) => {
    setTimetableMatrix(prev => ({
      ...prev,
      [`${day}-${period}`]: {
        ...prev[`${day}-${period}`],
        [field]: value
      }
    }));
  };


  const fetchAdminAnalyticsData = async () => {
    if (!token) return;
    setAdminAnalyticsLoading(true);
    try {
      const res = await getAdminAnalytics(token);
      setAdminAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching admin analytics:", err);
    } finally {
      setAdminAnalyticsLoading(false);
    }
  };

  // List States
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);

  // Form States - Faculty
  const [facultyName, setFacultyName] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("");
  const [facultyDepartment, setFacultyDepartment] = useState("");

  // Form States - Student
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentDepartment, setStudentDepartment] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  // Student specific paging states
  const [studentPage, setStudentPage] = useState(0);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentSortBy, setStudentSortBy] = useState("name");
  const [studentSortDir, setStudentSortDir] = useState("asc");
  const [studentSectionFilter, setStudentSectionFilter] = useState("");
  const [studentBatchFilter, setStudentBatchFilter] = useState("");
  const [studentActiveFilter, setStudentActiveFilter] = useState("");
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchStudentsList = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const res = await getStudentsPaged({
        page: studentPage,
        size: 10,
        sortBy: studentSortBy,
        sortDir: studentSortDir,
        search: searchTerm,
        department: deptFilter === "All" ? "" : deptFilter,
        section: studentSectionFilter,
        batch: studentBatchFilter,
        active: studentActiveFilter === "" ? null : (studentActiveFilter === "true")
      }, token);
      setStudents(res.data.content || []);
      setStudentTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching paged students:", err);
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

  // Fetch data
  const fetchData = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const facRes = await getFaculty(token);
      setFaculty(facRes.data);
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setFetchLoading(false);
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAdminAnalyticsData();
    loadSubjects();
    loadExpertise();
    loadAvailability();
    loadClassrooms();
  }, [token]);

  useEffect(() => {
    if (activeTab === "students") {
      fetchStudentsList();
    }
  }, [activeTab, studentPage, studentSortBy, studentSortDir, studentSectionFilter, studentBatchFilter, studentActiveFilter, deptFilter, searchTerm, token]);

  useEffect(() => {
    if (activeTab === "workload") loadWorkload();
    if (activeTab === "timetable") loadVersions(selectedDept);
  }, [activeTab, selectedDept]);

  // Handlers - Faculty
  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!facultyName || !facultyEmail || !facultyPassword || !facultyDepartment) {
      showFeedback("Please fill in all fields", "error");
      return;
    }
    setLoading(true);
    try {
      await createFaculty(
        {
          name: facultyName,
          email: facultyEmail,
          password: facultyPassword,
          department: facultyDepartment
        },
        token
      );
      showFeedback("Faculty account created successfully!");
      setFacultyName("");
      setFacultyEmail("");
      setFacultyPassword("");
      setFacultyDepartment("");
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
    if (!studentName || !studentEmail || !studentPassword || !studentDepartment) {
      showFeedback("Please fill in all fields", "error");
      return;
    }
    setLoading(true);
    try {
      await createStudent(
        {
          name: studentName,
          email: studentEmail,
          password: studentPassword,
          department: studentDepartment
        },
        token
      );
      showFeedback("Student account created successfully!");
      setStudentName("");
      setStudentEmail("");
      setStudentPassword("");
      setStudentDepartment("");
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
  const ALL_DEPTS = ["All", "M.Tech CSE", "CSE", "IT", "ECE"];

  const filteredFaculty = faculty.filter((f) => {
    const matchesDept = deptFilter === "All" || f.department === deptFilter;
    const matchesSearch =
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const filteredStudents = students.filter((s) => {
    const matchesDept = deptFilter === "All" || s.department === deptFilter;
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getDeptCount = (dept, list) =>
    dept === "All" ? list.length : list.filter(x => x.department === dept).length;

  const renderAdminCell = (day, period) => {
    const cellKey = `${day}-${period}`;
    const cell = timetableMatrix[cellKey] || { subject: "", facultyId: "" };
    const isSelected = selectedSwapCell && selectedSwapCell.day === day && selectedSwapCell.period === period;

    const cellStyle = swapMode ? {
      cursor: "pointer",
      border: isSelected ? "2px solid var(--secondary)" : "1px dashed rgba(255,255,255,0.25)",
      boxShadow: isSelected ? "0 0 10px rgba(99, 102, 241, 0.4)" : "none",
      transition: "all 0.2s"
    } : {};

    return (
      <td
        key={period}
        style={cellStyle}
        onClick={() => {
          if (swapMode) {
            if (!selectedSwapCell) {
              setSelectedSwapCell({ day, period });
            } else {
              const d1 = selectedSwapCell.day;
              const p1 = selectedSwapCell.period;
              if (d1 === day && p1 === period) {
                setSelectedSwapCell(null);
                return;
              }
              const c1 = timetableMatrix[`${d1}-${p1}`] || { subject: "", facultyId: "" };
              const c2 = timetableMatrix[`${day}-${period}`] || { subject: "", facultyId: "" };
              setTimetableMatrix(prev => ({
                ...prev,
                [`${d1}-${p1}`]: c2,
                [`${day}-${period}`]: c1
              }));
              setSelectedSwapCell(null);
              showFeedback(`Swapped slot (${d1} P${p1}) with (${day} P${period})!`);
            }
          }
        }}
      >
        <div className="admin-cell-container" style={{ pointerEvents: swapMode ? "none" : "auto" }}>
          <input
            className="admin-cell-subject"
            type="text"
            placeholder="Sub Code"
            value={cell.subject}
            onChange={(e) => handleCellChange(day, period, "subject", e.target.value)}
          />
          <select
            className="admin-cell-faculty"
            value={cell.facultyId}
            onChange={(e) => handleCellChange(day, period, "facultyId", e.target.value)}
          >
            <option value="">-- No Faculty --</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.department || "N/A"})
              </option>
            ))}
          </select>
        </div>
      </td>
    );
  };


  // Sidebar / Mobile states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal display states
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAssignExpertiseModal, setShowAssignExpertiseModal] = useState(false);
  const [showRecordLeaveModal, setShowRecordLeaveModal] = useState(false);

  // Faculty Leaves Mock Pending Requests
  const [pendingFacultyLeaves, setPendingFacultyLeaves] = useState([
    {
      id: "mock-1",
      faculty: { id: 1, name: "Dr. Sarah Connor", department: "CSE" },
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      reason: "Medical Checkup",
      status: "PENDING"
    },
    {
      id: "mock-2",
      faculty: { id: 2, name: "Prof. Charles Xavier", department: "ECE" },
      date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
      reason: "Attending Symposium",
      status: "PENDING"
    }
  ]);

  // Combined Approve/Reject Student leaves
  const handleApproveStudentLeave = async (id) => {
    try {
      await approveLeaveRequest(id, token);
      showFeedback("Student leave request approved.");
      fetchAdminLeaveRequests();
    } catch (err) {
      showFeedback("Failed to approve student leave.", "error");
    }
  };

  const handleRejectStudentLeave = async (id) => {
    try {
      await rejectLeaveRequest(id, token, "Rejected by administrator");
      showFeedback("Student leave request rejected.");
      fetchAdminLeaveRequests();
    } catch (err) {
      showFeedback("Failed to reject student leave.", "error");
    }
  };

  // Combined Approve/Reject Faculty leaves
  const handleApproveFacultyLeave = async (leave) => {
    try {
      const facObj = faculty.find(f => f.name === leave.faculty.name) || faculty[0];
      await setAvailability({
        facultyId: facObj ? facObj.id : 1,
        date: leave.date,
        available: false,
        reason: leave.reason
      }, token);
      showFeedback(`Leave request approved for ${leave.faculty.name}`);
      setPendingFacultyLeaves(prev => prev.filter(x => x.id !== leave.id));
      loadAvailability();
    } catch (e) {
      showFeedback("Failed to approve leave request", "error");
    }
  };

  const handleRejectFacultyLeave = (leaveId, facultyName) => {
    setPendingFacultyLeaves(prev => prev.filter(x => x.id !== leaveId));
    showFeedback(`Leave request rejected for ${facultyName}`);
  };

  // Cross-referencing helper functions
  const getFacultySubjects = (facultyId) => {
    const facExpertise = expertise.filter(e => e.faculty?.id === facultyId);
    if (facExpertise.length === 0) return "General";
    return facExpertise.map(e => e.subject?.subjectCode).join(", ");
  };

  const getSubjectFaculty = (subjectId) => {
    const subExpertise = expertise.filter(e => e.subject?.id === subjectId && e.expertiseLevel === "PRIMARY");
    if (subExpertise.length === 0) return "Not Assigned";
    return subExpertise.map(e => e.faculty?.name).join(", ");
  };

  // Modal renderer helper
  const renderModal = (isOpen, onClose, title, children) => {
    if (!isOpen) return null;
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(5, 7, 17, 0.85)", backdropFilter: "blur(8px)",
        display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
        padding: "1.5rem"
      }}>
        <div style={{
          background: "#0c0f24", border: "1px solid var(--card-border)",
          borderRadius: "20px", width: "100%", maxWidth: "480px", padding: "2rem",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)",
          position: "relative",
          animation: "fadeIn 0.3s ease"
        }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: "1.25rem", right: "1.25rem",
              background: "transparent", border: "none", color: "var(--text-muted)",
              fontSize: "1.2rem", cursor: "pointer", transition: "color 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            ✕
          </button>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff", fontSize: "1.25rem", fontWeight: "700", fontFamily: "var(--font-heading)" }}>
            {title}
          </h3>
          {children}
        </div>
      </div>
    );
  };

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
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      {/* Main content viewport */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        paddingLeft: "260px",
      }} className="w-full pl-0 lg:pl-[260px]">

        {/* Topbar navigation panel */}
        <AdminTopbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} setMobileMenuOpen={setMobileMenuOpen} isDark={isDark} setIsDark={setIsDark} handleLogout={handleLogout} />

        {/* Scrollable page viewport content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "2rem" }} className="custom-scrollbar">
          
          {/* Welcome Dashboard Header */}
          <div className="dashboard-title" style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Admin Control Panel
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              Logged in as: System Administrator (ADMIN)
            </p>
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

          {/* Views render conditional switches */}
          {activeTab === "analytics" && (
            <AnalyticsControlView adminAnalytics={adminAnalytics} adminAnalyticsLoading={adminAnalyticsLoading} />
          )}

          {activeTab === "faculty" && (
            <FacultyManagementView
              filteredFaculty={filteredFaculty}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleDeleteFaculty={handleDeleteFaculty}
              deletingId={deletingId}
              setShowAddFacultyModal={setShowAddFacultyModal}
              getFacultySubjects={getFacultySubjects}
              availability={availability}
            />
          )}

          {activeTab === "students" && (
            <StudentManagementView
              students={students}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              deptFilter={deptFilter}
              setDeptFilter={setDeptFilter}
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
              studentActiveFilter={studentActiveFilter}
              setStudentActiveFilter={setStudentActiveFilter}
              fetchLoading={fetchLoading}
              handleDeleteStudent={handleDeleteStudent}
              deletingId={deletingId}
              handleViewProfile={handleViewProfile}
              setShowAddStudentModal={setShowAddStudentModal}
              ALL_DEPTS={ALL_DEPTS}
            />
          )}

          {activeTab === "timetable" && (
            <TimetableManagerView
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              timetableMatrix={timetableMatrix}
              timetableLoading={timetableLoading}
              savingTimetable={savingTimetable}
              swapMode={swapMode}
              setSwapMode={setSwapMode}
              selectedSwapCell={selectedSwapCell}
              setSelectedSwapCell={setSelectedSwapCell}
              autoGenerating={autoGenerating}
              handleAutoGenerate={handleAutoGenerate}
              handleSaveTimetable={handleSaveTimetable}
              handleRandomizeTimetable={handleRandomizeTimetable}
              handleCellChange={handleCellChange}
              faculty={faculty}
              setTimetableMatrix={setTimetableMatrix}
              showFeedback={showFeedback}
            />
          )}

          {activeTab === "subjects" && (
            <SubjectMasterView
              subjects={subjects}
              subjectFilter={subjectFilter}
              setSubjectFilter={setSubjectFilter}
              setShowAddSubjectModal={setShowAddSubjectModal}
              handleDeleteSubject={handleDeleteSubject}
              getSubjectFaculty={getSubjectFaculty}
            />
          )}

          {activeTab === "expertise" && (
            <FacultyExpertiseView
              faculty={faculty}
              expertise={expertise}
              setShowAssignExpertiseModal={setShowAssignExpertiseModal}
              handleRemoveExpertise={handleRemoveExpertise}
            />
          )}

          {activeTab === "leaves" && (
            <FacultyLeavesView
              availability={availability}
              handleDeleteLeave={handleDeleteLeave}
              setShowRecordLeaveModal={setShowRecordLeaveModal}
              pendingFacultyLeaves={pendingFacultyLeaves}
              handleApproveFacultyLeave={handleApproveFacultyLeave}
              handleRejectFacultyLeave={handleRejectFacultyLeave}
            />
          )}

          {activeTab === "leave" && (
            <StudentLeavesView
              leaveRequests={leaveRequests}
              leaveFilterDept={leaveFilterDept}
              setLeaveFilterDept={setLeaveFilterDept}
              leaveFilterStatus={leaveFilterStatus}
              setLeaveFilterStatus={setLeaveFilterStatus}
              leaveSearch={leaveSearch}
              setLeaveSearch={setLeaveSearch}
              studentLeaveLoading={studentLeaveLoading}
              fetchAdminLeaveRequests={fetchAdminLeaveRequests}
              handleApproveStudentLeave={handleApproveStudentLeave}
              handleRejectStudentLeave={handleRejectStudentLeave}
              DEPT_OPTIONS={DEPT_OPTIONS}
            />
          )}

          {activeTab === "workload" && (
            <WorkloadView
              workload={workload}
              workloadLoading={workloadLoading}
              loadWorkload={loadWorkload}
            />
          )}

          {activeTab === "career" && (
            <CareerDashboardAdmin />
          )}

        </div>
      </main>

      {/* ── Modals Overlay Forms ─────────────────────────────────────────── */}
      
      {/* 1. Add Faculty Modal */}
      {renderModal(showAddFacultyModal, () => setShowAddFacultyModal(false), "👤 Add New Faculty Profile", (
        <form className="auth-form" onSubmit={async (e) => { await handleCreateFaculty(e); setShowAddFacultyModal(false); }}>
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

          <div className="form-group">
            <label>Department</label>
            <select
              className="input-field"
              value={facultyDepartment}
              onChange={(e) => setFacultyDepartment(e.target.value)}
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

          <button className="auth-btn" type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)", marginTop: "1rem" }}>
            {loading ? "Creating..." : "Create Faculty Account"}
          </button>
        </form>
      ))}

      {/* 2. Add Student Modal */}
      {renderModal(showAddStudentModal, () => setShowAddStudentModal(false), <><i className="fa-solid fa-user-graduate"></i> Add New Student Profile</>, (
        <form className="auth-form" onSubmit={async (e) => { await handleCreateStudent(e); setShowAddStudentModal(false); }}>
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

          <div className="form-group">
            <label>Department</label>
            <select
              className="input-field"
              value={studentDepartment}
              onChange={(e) => setStudentDepartment(e.target.value)}
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
              <option value="M.Tech CSE">M.Tech CSE</option>
            </select>
          </div>

          <button className="auth-btn" type="submit" disabled={loading} style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)", marginTop: "1rem" }}>
            {loading ? "Creating..." : "Create Student Account"}
          </button>
        </form>
      ))}

      {/* 3. Add Subject Modal */}
      {renderModal(showAddSubjectModal, () => setShowAddSubjectModal(false), "📚 Add Subject", (
        <form onSubmit={async (e) => { await handleCreateSubject(e); setShowAddSubjectModal(false); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { label: "Subject Code", key: "subjectCode", placeholder: "e.g. OS" },
            { label: "Subject Name", key: "subjectName", placeholder: "e.g. Operating Systems" },
            { label: "Academic Year", key: "academicYear", placeholder: "e.g. 2024-25" },
          ].map(({ label, key, placeholder }) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input className="input-field" placeholder={placeholder} value={subjectForm[key]} onChange={e => setSubjectForm(p => ({ ...p, [key]: e.target.value }))} required />
            </div>
          ))}
          <div className="form-group">
            <label>Department</label>
            <select className="input-field" style={{ appearance: "auto" }} value={subjectForm.department} onChange={e => setSubjectForm(p => ({ ...p, department: e.target.value }))}>
              {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label>Semester</label>
              <input className="input-field" type="number" min="1" max="8" value={subjectForm.semester} onChange={e => setSubjectForm(p => ({ ...p, semester: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Credits</label>
              <input className="input-field" type="number" min="1" max="6" value={subjectForm.credits} onChange={e => setSubjectForm(p => ({ ...p, credits: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Hrs/Week</label>
              <input className="input-field" type="number" min="1" max="10" value={subjectForm.weeklyHours} onChange={e => setSubjectForm(p => ({ ...p, weeklyHours: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="input-field" style={{ appearance: "auto" }} value={subjectForm.subjectCategory} onChange={e => setSubjectForm(p => ({ ...p, subjectCategory: e.target.value }))}>
              {["THEORY", "LAB", "ELECTIVE", "PROJECT"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="auth-btn" type="submit" disabled={subjectLoading} style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)", marginTop: "0.5rem" }}>
            {subjectLoading ? "Adding..." : "Add Subject"}
          </button>
        </form>
      ))}

      {/* 4. Assign Expertise Modal */}
      {renderModal(showAssignExpertiseModal, () => setShowAssignExpertiseModal(false), "🎯 Assign Expertise Level", (
        <form onSubmit={async (e) => { await handleAllocateExpertise(e); setShowAssignExpertiseModal(false); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label>Faculty member</label>
            <select className="input-field" style={{ appearance: "auto" }} value={expertiseForm.facultyId} onChange={e => setExpertiseForm(p => ({ ...p, facultyId: e.target.value }))} required>
              <option value="">-- Select Faculty --</option>
              {faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <select className="input-field" style={{ appearance: "auto" }} value={expertiseForm.subjectId} onChange={e => setExpertiseForm(p => ({ ...p, subjectId: e.target.value }))} required>
              <option value="">-- Select Subject --</option>
              {subjects.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.subjectCode} – {s.subjectName} ({s.department})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Expertise Level</label>
            <select className="input-field" style={{ appearance: "auto" }} value={expertiseForm.expertiseLevel} onChange={e => setExpertiseForm(p => ({ ...p, expertiseLevel: e.target.value }))}>
              <option value="PRIMARY">🥇 PRIMARY – Main instructor</option>
              <option value="SECONDARY">🥈 SECONDARY – Can substitute</option>
              <option value="GUEST">👤 GUEST – Guest lecturer</option>
            </select>
          </div>
          <button className="auth-btn" type="submit" disabled={expertiseLoading} style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)", marginTop: "0.5rem" }}>
            {expertiseLoading ? "Allocating..." : "Allocate Expertise"}
          </button>
        </form>
      ))}

      {/* 5. Record Leave Modal */}
      {renderModal(showRecordLeaveModal, () => setShowRecordLeaveModal(false), "🏖️ Record Faculty Absence", (
        <form onSubmit={async (e) => { await handleAddLeave(e); setShowRecordLeaveModal(false); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label>Faculty</label>
            <select className="input-field" style={{ appearance: "auto" }} value={leaveForm.facultyId} onChange={e => setLeaveForm(p => ({ ...p, facultyId: e.target.value }))} required>
              <option value="">-- Select Faculty --</option>
              {faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input className="input-field" type="date" value={leaveForm.date} onChange={e => setLeaveForm(p => ({ ...p, date: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input className="input-field" placeholder="e.g. Sick leave, Conference" value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} />
          </div>
          <button className="auth-btn" type="submit" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", marginTop: "0.5rem" }} disabled={leaveLoading}>
            {leaveLoading ? "Saving..." : "Mark as On Leave"}
          </button>
        </form>
      ))}

      {/* Student Profile Modal */}
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
              {/* Decorative shine */}
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
                  <span>Semester {selectedStudentProfile.student.semester || "8"}</span>
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
                  <div style={{ display: "flex", alignItems: "center", justifyItems: "center", flexGrow: 1, padding: "2rem", color: "var(--text-muted)", fontStyle: "italic", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px dashed var(--card-border)" }}>
                    No family profile metadata stored.
                  </div>
                )}
              </div>
            </div>

            {/* Performance Stats */}
            <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.15)", padding: "1.25rem", borderRadius: "16px", marginBottom: "2rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px" }}><i className="fa-solid fa-chart-line" style={{ color: "var(--primary)" }}></i> Academic ERP Statistics</h4>
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
              <h4 style={{ margin: "0 0 0.75rem 0", color: "#fff", fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px" }}><i className="fa-solid fa-calendar-day" style={{ color: "var(--primary)" }}></i> Attendance Log Timeline</h4>
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
    </div>
  );
}

export default AdminDashboard;
