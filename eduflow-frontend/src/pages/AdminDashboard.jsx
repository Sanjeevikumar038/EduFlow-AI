import { useState, useEffect } from "react";
import {
  createFaculty,
  getFaculty,
  deleteFaculty,
  createStudent,
  getStudents,
  deleteStudent,
  getStudentsPaged,
  getStudentProfile,
  bulkCreateFaculty,
  bulkCreateStudents,
  deleteAllFaculty,
  purgeMockData
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
import InstitutionalClassesView from "../components/admin/InstitutionalClassesView";
import SubjectMasterView from "../components/admin/SubjectMasterView";
import FacultyExpertiseView from "../components/admin/FacultyExpertiseView";
import FacultyLeavesView from "../components/admin/FacultyLeavesView";
import StudentLeavesView from "../components/admin/StudentLeavesView";
import WorkloadView from "../components/admin/WorkloadView";
import { getDepartmentTimetable, saveDepartmentTimetable, autoGenerateTimetable, generateInstitutionalTimetable, randomizeClassTimetable, getTimetableVersions, activateTimetableVersion } from "../services/timetableService";
import {
  getSubjects, createSubject, deleteSubject, deleteAllSubjects,
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
  const [selectedDept, setSelectedDept] = useState("Department of Artificial Intelligence and Data Science");
  const [selectedSem, setSelectedSem] = useState(3);
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [availableSections, setAvailableSections] = useState(["A", "B", "C"]);
  const [allSectionMatrices, setAllSectionMatrices] = useState({});
  const [timetableMatrix, setTimetableMatrix] = useState({});
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [savingTimetable, setSavingTimetable] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [selectedSwapCell, setSelectedSwapCell] = useState(null);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [timetableVersions, setTimetableVersions] = useState([]);
  const [validationReport, setValidationReport] = useState(null);

  // Subject Master States
  const [subjects, setSubjects] = useState([]);
  const [subjectForm, setSubjectForm] = useState({ subjectCode: "", subjectName: "", department: "Department of Artificial Intelligence and Data Science", semester: 1, academicYear: "2024-25", credits: 3, weeklyHours: 3, subjectCategory: "THEORY" });
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

  const DEPT_OPTIONS = ["Department of Artificial Intelligence and Data Science", "Department of Computer Science and Engineering", "Department of Information Technology", "Department of Electronics and Communication Engineering"];
  const ALL_DEPTS = [
    "All",
    "Department of Artificial Intelligence and Data Science",
    "Department of Computer Science and Engineering",
    "Department of Information Technology",
    "Department of Electronics and Communication Engineering",
    "Department of Electrical and Electronics Engineering",
    "Department of Mechanical Engineering",
    "Department of Mechatronics",
    "Department of Computer Science and Business Systems",
    "Department of Civil Engineering",
    "Department of MTech Computer Science and Engineering"
  ];

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
  const handleDeleteAllSubjects = async () => {
    if (!window.confirm("Are you sure you want to purge ALL subjects from Subject Master?")) return;
    try {
      await deleteAllSubjects(token);
      showFeedback("All subjects purged successfully!");
      loadSubjects();
    } catch (e) {
      try {
        await Promise.all((subjects || []).map(s => deleteSubject(s.id, token)));
        showFeedback("All subjects purged successfully!");
        loadSubjects();
      } catch (err) {
        showFeedback(e.response?.data?.message || "Failed to delete subjects", "error");
      }
    }
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

  const loadTimetable = async (dept, sem = selectedSem, sec = selectedSection) => {
    const targetDept = dept || selectedDept || "Department of Artificial Intelligence and Data Science";
    const currentSec = (sec || selectedSection || "ALL").trim().toUpperCase();
    console.log("[loadTimetable] Function invoked. Input dept:", dept, "| selectedDept state:", selectedDept, "| targetDept to load:", targetDept, "| sem:", sem, "| sec:", currentSec);
    if (!token || !targetDept) return;
    setTimetableLoading(true);
    try {
      console.log("[loadTimetable] Executing API Request: GET /api/admin/timetable/department?department=" + encodeURIComponent(targetDept) + "&semester=" + sem);
      const res = await getDepartmentTimetable(targetDept, token, sem);
      const allEntries = Array.isArray(res.data) ? res.data : [];

      // 1. Discover all unique sections that exist for this department & semester
      const foundSections = Array.from(new Set(
        allEntries.map(e => e.section ? e.section.trim().toUpperCase() : "").filter(s => s !== "")
      )).sort();
      const discoveredSections = foundSections.length > 0 ? foundSections : ["A", "B", "C"];
      setAvailableSections(discoveredSections);

      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const matricesObj = {};

      // 2. Build full timetable grid matrix for every discovered section
      discoveredSections.forEach(sName => {
        const sMatrix = {};
        days.forEach(day => {
          for (let p = 1; p <= 6; p++) {
            sMatrix[`${day}-${p}`] = {
              subject: "",
              subjectCode: "",
              subjectName: "",
              facultyId: "",
              facultyName: "",
              courseDepartment: targetDept,
              facultyDepartment: targetDept,
              department: targetDept,
              semester: sem,
              section: sName,
              weeklyHours: 3
            };
          }
        });

        const secEntries = allEntries.filter(e => {
          if (!e) return false;
          const eSec = e.section ? e.section.trim().toUpperCase() : "A";
          return eSec === sName;
        });

        secEntries.forEach(e => {
          if (e && e.dayOfWeek && e.period) {
            const rawDay = String(e.dayOfWeek).trim();
            const dayTitle = rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase();
            const subCode = e.subject ? e.subject.trim() : "";
            const facName = e.faculty?.name || (e.faculty?.id ? `Faculty #${e.faculty.id}` : "Unassigned");
            const courseDept = e.department || targetDept;
            const facDept = e.faculty?.department || courseDept;

            sMatrix[`${dayTitle}-${e.period}`] = {
              subject: subCode,
              subjectCode: subCode,
              subjectName: e.subjectName || subCode,
              facultyId: e.faculty?.id || "",
              facultyName: facName,
              courseDepartment: courseDept,
              facultyDepartment: facDept,
              department: courseDept,
              semester: e.semester || sem,
              section: sName,
              weeklyHours: 3
            };
          }
        });

        if (subjects && subjects.length > 0) {
          Object.values(sMatrix).forEach(cell => {
            if (cell.subjectCode) {
              const subMatch = subjects.find(s =>
                s.subjectCode && s.subjectCode.trim().toLowerCase() === cell.subjectCode.toLowerCase()
              );
              if (subMatch) {
                cell.subjectName = subMatch.subjectName || cell.subjectCode;
                if (subMatch.weeklyHours) cell.weeklyHours = subMatch.weeklyHours;
              }
            }
          });
        }

        matricesObj[sName] = sMatrix;
      });

      setAllSectionMatrices(matricesObj);

      // 3. Set active matrix based on selected section
      const activeSecKey = currentSec === "ALL" ? discoveredSections[0] : currentSec;
      setTimetableMatrix(matricesObj[activeSecKey] || matricesObj[discoveredSections[0]] || {});

      console.log("[loadTimetable] Successfully loaded sections:", discoveredSections, "| Total Entries:", allEntries.length);
    } catch (err) {
      console.error("Error loading timetable:", err);
      const newMatrix = {};
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      days.forEach(day => {
        for (let p = 1; p <= 6; p++) {
          newMatrix[`${day}-${p}`] = {
            subject: "",
            subjectCode: "",
            subjectName: "",
            facultyId: "",
            facultyName: "",
            courseDepartment: targetDept,
            facultyDepartment: targetDept,
            department: targetDept,
            semester: sem,
            section: "A",
            weeklyHours: 3
          };
        }
      });
      setTimetableMatrix(newMatrix);
      setAllSectionMatrices({ A: newMatrix });
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
      loadTimetable(selectedDept, selectedSem, selectedSection);
    }
    if (activeTab === "leave") {
      fetchAdminLeaveRequests();
    }
  }, [activeTab, selectedDept, selectedSem, selectedSection, leaveFilterDept, leaveFilterStatus, token]);

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

      await saveDepartmentTimetable(selectedDept, entriesToSave, token, null, selectedSem);
      showFeedback(`Timetable saved successfully for ${selectedDept} (Sem ${selectedSem})!`);
      loadTimetable(selectedDept, selectedSem);
    } catch (err) {
      console.error("Error saving timetable:", err);
      showFeedback(err.response?.data || "Failed to save timetable.", "error");
    } finally {
      setSavingTimetable(false);
    }
  };

  const handleRandomizeTimetable = async () => {
    setTimetableLoading(true);
    try {
      const res = await randomizeClassTimetable({
        department: selectedDept,
        semester: selectedSem
      }, token);

      const entries = res.data || [];
      const newMatrix = {};
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      days.forEach(day => {
        for (let p = 1; p <= 6; p++) {
          newMatrix[`${day}-${p}`] = { subject: "", facultyId: "" };
        }
      });

      entries.forEach(e => {
        if (e.dayOfWeek && e.period) {
          const rawDay = String(e.dayOfWeek).trim();
          const dayTitle = rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase();
          newMatrix[`${dayTitle}-${e.period}`] = {
            subject: e.subject || "",
            facultyId: e.faculty?.id || ""
          };
        }
      });

      setTimetableMatrix(newMatrix);
      showFeedback(`🎲 Reshuffled grid for ${selectedDept} (Semester ${selectedSem}) without violating institutional master timetable or creating faculty conflicts!`);
    } catch (err) {
      console.error("Error randomizing grid:", err);
      showFeedback(err.response?.data?.message || err.response?.data || "Failed to randomize grid.", "error");
    } finally {
      setTimetableLoading(false);
    }
  };

  const handleGenerateInstitutional = async (academicYear = "2026-2027", semesterCycle = "ODD") => {
    setAutoGenerating(true);
    setValidationReport(null);
    try {
      const res = await generateInstitutionalTimetable({
        academicYear,
        semesterCycle
      }, token);
      
      const report = res.data || {};
      setValidationReport(report);
      showFeedback(`🌐 Institution Master Timetable generated (${semesterCycle} Cycle, ${academicYear})! Status: ${report.overallStatus} (${report.subjectsScheduled || 0} entries scheduled)`);
      loadTimetable(selectedDept, selectedSem);
    } catch (err) {
      console.error("Error generating institutional timetable:", err);
      showFeedback(err.response?.data?.message || err.response?.data || "Failed to generate institution master timetable.", "error");
    } finally {
      setAutoGenerating(false);
    }
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
  const [studentDepartment, setStudentDepartment] = useState("M.Tech CSE");
  const [studentRegisterNumber, setStudentRegisterNumber] = useState("");
  const [studentSection, setStudentSection] = useState("A");
  const [studentSemester, setStudentSemester] = useState("8");
  const [studentBatch, setStudentBatch] = useState("2023 - 2028");

  // UI & Modal States
  const [showBulkImportFacultyModal, setShowBulkImportFacultyModal] = useState(false);
  const [showBulkImportStudentModal, setShowBulkImportStudentModal] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkImportParsed, setBulkImportParsed] = useState([]);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  // Helper to split CSV line while respecting quoted strings
  const parseCSVLine = (line) => {
    if (!line) return [];
    if (line.includes("\t")) {
      return line.split("\t").map(p => p.trim().replace(/^["']|["']$/g, ""));
    }
    const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g;
    const parts = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1] : match[2];
      if (val !== undefined) parts.push(val.trim());
    }
    return parts;
  };

  // Smart Bulk Import Helper (handles any column order, missing emails, quoted fields, and long department names)
  const parseBulkInput = (text, roleType) => {
    if (!text || !text.trim()) return [];
    const lines = text.trim().split(/\r?\n/);
    const result = [];

    lines.forEach((line, lineIdx) => {
      if (!line.trim()) return;
      const parts = parseCSVLine(line);
      if (parts.length < 2) return;

      const firstLower = parts[0].toLowerCase();
      if (firstLower.includes("id") && (parts[1].toLowerCase().includes("name") || parts[1].toLowerCase().includes("faculty"))) return;
      if (firstLower === "name" || firstLower === "faculty name" || firstLower === "student name" || firstLower === "email") return;

      let id = "";
      let name = "";
      let email = "";
      let password = "123456";
      let department = "CSE";

      parts.forEach(part => {
        if (!part) return;
        const partLower = part.toLowerCase();

        if (part.includes("@")) {
          email = part;
        } else if (
          partLower.includes("department") || 
          partLower.includes("departement") || 
          partLower.includes("engineering") || 
          partLower.includes("school") || 
          partLower.includes("science") || 
          ["cse", "it", "ece", "eee", "civil", "mechanical", "mechatronics", "csbs", "m.tech cse", "ai & ds", "aids", "mba", "sh"].includes(partLower)
        ) {
          department = part;
        } else if (/^[A-Z0-9_-]{3,12}$/i.test(part) && !name && !partLower.includes("dr") && !partLower.includes("mr") && !partLower.includes("mrs") && !partLower.includes("prof")) {
          id = part;
        } else if (!name) {
          name = part;
        }
      });

      if (!name && id) name = id;
      if (!name) return;

      // Clean name of leftover quotes or odd formatting
      name = name.replace(/^["']|["']$/g, "").trim();

      // Preserve exact department string directly from Excel spreadsheet
      department = department.replace(/^["']|["']$/g, "").trim();
      if (department.toLowerCase().includes("departement")) {
        department = department.replace(/departement/gi, "Department");
      }

      // Auto-generate college email if missing in spreadsheet
      if (!email) {
        let cleanName = name.toLowerCase()
          .replace(/dr\.?|mr\.?|mrs\.?|ms\.?|prof\.?/gi, "")
          .replace(/asst\.?|assoc\.?|professor|hod|cse|ece|eee|it|mct/gi, "")
          .replace(/[^a-z0-9]/g, "");
        
        if (cleanName.length >= 3) {
          if (cleanName.length > 20) cleanName = cleanName.substring(0, 20);
          email = `${cleanName}@skcet.ac.in`;
        } else if (id) {
          email = `${id.toLowerCase().replace(/[^a-z0-9]/g, "")}@skcet.ac.in`;
        } else {
          email = `faculty${lineIdx + 1}@skcet.ac.in`;
        }
      }

      result.push({ name, email, password, department });
    });

    return result;
  };

  // Bulk Import File Handler (supports .xlsx, .xls, .csv, .tsv)
  const handleFileUpload = (file, roleType) => {
    if (!file) return;
    const isBinary = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    const reader = new FileReader();

    if (isBinary && window.XLSX) {
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = window.XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvText = window.XLSX.utils.sheet_to_csv(worksheet);
          setBulkImportText(csvText);
          setBulkImportParsed(parseBulkInput(csvText, roleType));
        } catch (err) {
          console.error("Error reading binary excel file:", err);
          showFeedback("Failed to parse binary Excel file.", "error");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (evt) => {
        const text = evt.target?.result || "";
        setBulkImportText(text);
        setBulkImportParsed(parseBulkInput(text, roleType));
      };
      reader.readAsText(file);
    }
  };

  const handleBulkImportSubmit = async (roleType) => {
    if (!bulkImportParsed || bulkImportParsed.length === 0) {
      showFeedback("No valid records found to import.", "error");
      return;
    }
    setBulkImportLoading(true);
    try {
      if (roleType === "FACULTY") {
        const res = await bulkCreateFaculty(bulkImportParsed, token);
        showFeedback(`✅ Bulk Import Completed! Created: ${res.data.created}, Updated: ${res.data.updated || 0}, Skipped: ${res.data.skipped}`);
        setShowBulkImportFacultyModal(false);
        fetchData();
      } else {
        const res = await bulkCreateStudents(bulkImportParsed, token);
        showFeedback(`✅ Bulk Import Completed! Created: ${res.data.created}, Skipped (Existing): ${res.data.skipped}`);
        setShowBulkImportStudentModal(false);
        fetchStudentsList();
      }
      setBulkImportText("");
      setBulkImportParsed([]);
    } catch (err) {
      console.error("Bulk import error:", err);
      const errMsg = err.response?.data?.message || (typeof err.response?.data === "string" ? err.response?.data : "") || err.message;
      showFeedback(`Failed to complete bulk import: ${errMsg}`, "error");
    } finally {
      setBulkImportLoading(false);
    }
  };

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
      showFeedback("Please fill in required fields", "error");
      return;
    }
    setLoading(true);
    try {
      await createStudent(
        {
          name: studentName,
          email: studentEmail,
          password: studentPassword,
          department: studentDepartment,
          registerNumber: studentRegisterNumber,
          section: studentSection,
          semester: Number(studentSemester),
          batch: studentBatch
        },
        token
      );
      showFeedback("Student account created successfully!");
      setStudentName("");
      setStudentEmail("");
      setStudentPassword("");
      setStudentRegisterNumber("");
      setStudentDepartment("M.Tech CSE");
      setStudentSection("A");
      setStudentSemester("8");
      setStudentBatch("2023 - 2028");
      fetchData();
      if (activeTab === "students") fetchStudentsList();
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

  const handleClearAllFaculty = async () => {
    if (!window.confirm("⚠️ Are you sure you want to delete ALL faculty members from the database? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      try {
        const res = await deleteAllFaculty(token);
        showFeedback(`✅ Cleared all faculty accounts! Deleted: ${res.data.deleted || 0}`);
      } catch (backendErr) {
        console.warn("Bulk delete endpoint unavailable, running batch deletion fallback:", backendErr);
        let deletedCount = 0;
        await Promise.allSettled(
          faculty.map(async (f) => {
            try {
              await deleteFaculty(f.id, token);
              deletedCount++;
            } catch (e) {}
          })
        );
        showFeedback(`✅ Cleared all faculty accounts! Deleted: ${deletedCount}`);
      }
      fetchData();
    } catch (err) {
      console.error("Clear faculty error:", err);
      showFeedback("Failed to clear faculty accounts.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeMockData = async () => {
    try {
      const res = await purgeMockData(token);
      showFeedback(res.data?.message || "✅ Legacy mock faculty & demo subjects purged successfully!");
      fetchData();
      loadSubjects();
    } catch (err) {
      console.error("Purge error:", err);
      const msg = typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || err.message || "Failed to purge mock data.";
      showFeedback(msg, "error");
    }
  };

  // Department canonical alias map & deduplication
  const DEPT_ALIASES = {
    "ECE": "Department of Electronics and Communication Engineering",
    "ELECTRONICS AND COMMUNICATION ENGINEERING": "Department of Electronics and Communication Engineering",
    "IT": "Department of Information Technology",
    "INFORMATION TECHNOLOGY": "Department of Information Technology",
    "CSE": "Department of Computer Science and Engineering",
    "COMPUTER SCIENCE AND ENGINEERING": "Department of Computer Science and Engineering",
    "M.TECH CSE": "Department of MTech Computer Science and Engineering",
    "MTECH CSE": "Department of MTech Computer Science and Engineering",
    "M.TECH": "Department of MTech Computer Science and Engineering",
    "MTECH": "Department of MTech Computer Science and Engineering",
    "EEE": "Department of Electrical and Electronics Engineering",
    "ELECTRICAL AND ELECTRONICS ENGINEERING": "Department of Electrical and Electronics Engineering",
    "MECH": "Department of Mechanical Engineering",
    "MECHANICAL": "Department of Mechanical Engineering",
    "MECHANICAL ENGINEERING": "Department of Mechanical Engineering",
    "MECHATRONICS": "Department of Mechatronics",
    "CIVIL": "Department of Civil Engineering",
    "CIVIL ENGINEERING": "Department of Civil Engineering",
    "AI & DATA SCIENCE": "Department of Artificial Intelligence and Data Science",
    "AI & DS": "Department of Artificial Intelligence and Data Science",
    "AIDS": "Department of Artificial Intelligence and Data Science",
    "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE": "Department of Artificial Intelligence and Data Science",
    "CSE (AI & ML/CYBER SECURITY)": "Department of Computer Science and Engineering (AI & ML / Cyber Security)",
    "CSBS": "Department of Computer Science and Business Systems",
    "CS & BUSINESS SYSTEMS": "Department of Computer Science and Business Systems"
  };

  const getCanonicalDept = (deptStr, availableDepts = []) => {
    if (!deptStr) return "";
    const trimmed = deptStr.trim();
    const upper = trimmed.toUpperCase();
    const targetFull = DEPT_ALIASES[upper];

    if (targetFull) {
      return targetFull;
    }
    return trimmed;
  };

  const rawDeptsList = [
    ...faculty.map((f) => f.department).filter(Boolean),
    ...students.map((s) => s.department).filter(Boolean)
  ];

  const allDepts = Array.from(
    new Set(rawDeptsList.map((d) => getCanonicalDept(d, rawDeptsList)))
  ).sort();

  const facultyDepts = Array.from(
    new Set(faculty.map((f) => getCanonicalDept(f.department, rawDeptsList)).filter(Boolean))
  ).sort();

  const filteredFaculty = faculty.filter((f) => {
    const canonicalFDept = getCanonicalDept(f.department, rawDeptsList);
    const canonicalFilter = getCanonicalDept(deptFilter, rawDeptsList);
    const matchesDept = deptFilter === "All" || canonicalFDept === canonicalFilter || f.department === deptFilter;
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
  const [modalFacultySearch, setModalFacultySearch] = useState("");
  const [modalSubjectSearch, setModalSubjectSearch] = useState("");
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
        background: "rgba(5, 7, 17, 0.75)", backdropFilter: "blur(8px)",
        display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
        padding: "1.5rem"
      }}>
        <div className="modal-card-dialog" style={{
          borderRadius: "20px", width: "100%", maxWidth: "480px", padding: "2rem",
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
          >
            ✕
          </button>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", fontWeight: "700", fontFamily: "var(--font-heading)" }}>
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
          
          {/* Welcome Dashboard Header - Only shown on Main Analytics Control View */}
          {activeTab === "analytics" && (
            <div className="dashboard-title" style={{ marginBottom: "2rem" }}>
              <h1 style={{ fontSize: "2rem", fontWeight: "800", background: "linear-gradient(135deg, #fff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Admin Control Panel
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
                Logged in as: System Administrator (ADMIN)
              </p>
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

          {/* Views render conditional switches */}
          {activeTab === "analytics" && (
            <AnalyticsControlView adminAnalytics={adminAnalytics} adminAnalyticsLoading={adminAnalyticsLoading} />
          )}

          {activeTab === "faculty" && (
            <FacultyManagementView
              filteredFaculty={filteredFaculty}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              deptFilter={deptFilter}
              setDeptFilter={setDeptFilter}
              facultyDepts={facultyDepts}
              handleDeleteFaculty={handleDeleteFaculty}
              handleClearAllFaculty={handleClearAllFaculty}
              handlePurgeMockData={handlePurgeMockData}
              deletingId={deletingId}
              setShowAddFacultyModal={setShowAddFacultyModal}
              setShowBulkImportFacultyModal={setShowBulkImportFacultyModal}
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
              setShowBulkImportStudentModal={setShowBulkImportStudentModal}
              ALL_DEPTS={ALL_DEPTS}
            />
          )}

          {activeTab === "timetable" && (
            <TimetableManagerView
              selectedDept={selectedDept}
              setSelectedDept={setSelectedDept}
              selectedSem={selectedSem}
              setSelectedSem={setSelectedSem}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              availableSections={availableSections}
              allSectionMatrices={allSectionMatrices}
              allDepts={allDepts}
              timetableMatrix={timetableMatrix}
              timetableLoading={timetableLoading}
              savingTimetable={savingTimetable}
              swapMode={swapMode}
              setSwapMode={setSwapMode}
              selectedSwapCell={selectedSwapCell}
              setSelectedSwapCell={setSelectedSwapCell}
              autoGenerating={autoGenerating}
              handleAutoGenerate={handleAutoGenerate}
              handleGenerateInstitutional={handleGenerateInstitutional}
              validationReport={validationReport}
              handleSaveTimetable={handleSaveTimetable}
              handleRandomizeTimetable={handleRandomizeTimetable}
              handleCellChange={handleCellChange}
              faculty={faculty}
              subjects={subjects}
              setTimetableMatrix={setTimetableMatrix}
              showFeedback={showFeedback}
            />
          )}

          {activeTab === "classes" && (
            <InstitutionalClassesView
              token={token}
              allDepts={ALL_DEPTS}
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
              handleDeleteAllSubjects={handleDeleteAllSubjects}
              getSubjectFaculty={getSubjectFaculty}
              token={token}
              loadSubjects={loadSubjects}
              showFeedback={showFeedback}
              ALL_DEPTS={ALL_DEPTS}
            />
          )}

          {activeTab === "expertise" && (
            <FacultyExpertiseView
              faculty={faculty}
              expertise={expertise}
              setShowAssignExpertiseModal={setShowAssignExpertiseModal}
              handleRemoveExpertise={handleRemoveExpertise}
              token={token}
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
              token={token}
              showFeedback={showFeedback}
              facultyDepts={facultyDepts}
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
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.88rem" }}>Faculty Name</label>
            <input
              className="input-field"
              type="text"
              placeholder="e.g. Dr. Ananya Sharma"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.88rem" }}>College Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="faculty@skcet.ac.in"
              value={facultyEmail}
              onChange={(e) => setFacultyEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.88rem" }}>Temporary Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Initial password"
              value={facultyPassword}
              onChange={(e) => setFacultyPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px" }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.88rem" }}>Department</label>
            <select
              className="input-field"
              value={facultyDepartment}
              onChange={(e) => setFacultyDepartment(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "10px", appearance: "auto" }}
            >
              <option value="" disabled>-- Select Department --</option>
              <option value="Department of Artificial Intelligence and Data Science">Department of Artificial Intelligence and Data Science (AI & DS)</option>
              <option value="Department of Computer Science and Engineering">Department of Computer Science and Engineering (CSE)</option>
              <option value="Department of Computer Science and Engineering (AI & ML / Cyber Security)">Department of Computer Science and Engineering (AI & ML / Cyber Security)</option>
              <option value="Department of Computer Science and Business Systems">Department of Computer Science and Business Systems (CSBS)</option>
              <option value="Department of Information Technology">Department of Information Technology (IT)</option>
              <option value="Department of MTech Computer Science and Engineering">Department of MTech Computer Science and Engineering (M.Tech CSE)</option>
              <option value="Department of Electronics and Communication Engineering">Department of Electronics and Communication Engineering (ECE)</option>
              <option value="Department of Electrical and Electronics Engineering">Department of Electrical and Electronics Engineering (EEE)</option>
              <option value="Department of Mechanical Engineering">Department of Mechanical Engineering (Mech)</option>
              <option value="Department of Mechatronics">Department of Mechatronics</option>
              <option value="Department of Civil Engineering">Department of Civil Engineering</option>
            </select>
          </div>

          <button className="auth-btn" type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", padding: "0.85rem", borderRadius: "12px", border: "none", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
            {loading ? "Creating Account..." : "Create Faculty Account"}
          </button>
        </form>
      ))}

      {/* 2. Add Student Modal */}
      {renderModal(showAddStudentModal, () => setShowAddStudentModal(false), "🎓 Add New Student Profile", (
        <form className="auth-form" onSubmit={async (e) => { await handleCreateStudent(e); setShowAddStudentModal(false); }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Student Name *</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Sanjeevkumar D"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px" }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Email Address *</label>
              <input
                className="input-field"
                type="email"
                placeholder="727723euci045@skcet.ac.in"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Reg No. (Auto-gen if empty)</label>
              <input
                className="input-field"
                type="text"
                placeholder="727723EUCI045"
                value={studentRegisterNumber}
                onChange={(e) => setStudentRegisterNumber(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px" }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Department *</label>
              <select
                className="input-field"
                value={studentDepartment}
                onChange={(e) => setStudentDepartment(e.target.value)}
                required
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", appearance: "auto" }}
              >
                <option value="Department of MTech Computer Science and Engineering">Department of MTech Computer Science and Engineering (Integrated 5-Yr)</option>
                <option value="Department of Computer Science and Engineering">Department of Computer Science and Engineering (B.E. 4-Yr)</option>
                <option value="Department of Information Technology">Department of Information Technology (B.Tech 4-Yr)</option>
                <option value="Department of Electronics and Communication Engineering">Department of Electronics and Communication Engineering (B.E. 4-Yr)</option>
                <option value="Department of Electrical and Electronics Engineering">Department of Electrical and Electronics Engineering (B.E. 4-Yr)</option>
                <option value="Department of Mechanical Engineering">Department of Mechanical Engineering (B.E. 4-Yr)</option>
                <option value="Department of Mechatronics">Department of Mechatronics (B.E. 4-Yr)</option>
                <option value="Department of Artificial Intelligence and Data Science">Department of Artificial Intelligence and Data Science (B.Tech 4-Yr)</option>
                <option value="Department of Computer Science and Business Systems">Department of Computer Science and Business Systems (B.Tech 4-Yr)</option>
                <option value="Department of Civil Engineering">Department of Civil Engineering (B.E. 4-Yr)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Section</label>
              <select
                className="input-field"
                value={studentSection}
                onChange={(e) => setStudentSection(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", appearance: "auto" }}
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Semester</label>
              <select
                className="input-field"
                value={studentSemester}
                onChange={(e) => setStudentSemester(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px", appearance: "auto" }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Batch</label>
              <input
                className="input-field"
                type="text"
                placeholder="2023 - 2028"
                value={studentBatch}
                onChange={(e) => setStudentBatch(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px" }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", marginBottom: "0.35rem", fontWeight: "600", fontSize: "0.85rem" }}>Initial Password *</label>
            <input
              className="input-field"
              type="password"
              placeholder="123456"
              value={studentPassword}
              onChange={(e) => setStudentPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "10px" }}
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", padding: "0.85rem", borderRadius: "12px", border: "none", color: "#fff", fontWeight: "700", cursor: "pointer" }}>
            {loading ? "Creating Student Profile..." : "Create Student Profile"}
          </button>
        </form>
      ))}

      {/* 3. Bulk Import Faculty Modal */}
      {renderModal(showBulkImportFacultyModal, () => { setShowBulkImportFacultyModal(false); setBulkImportText(""); setBulkImportParsed([]); }, "📥 Bulk Import Faculty (Excel / CSV)", (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Upload an <b>Excel (.xlsx, .xls)</b> or <b>.csv</b> file, or paste rows copied directly from Excel.<br />
            Expected format: <code>Name, Email, Password, Department</code>
          </p>

          <div className="bulk-import-dropzone" onClick={() => document.getElementById("faculty-csv-input")?.click()}>
            <input
              id="faculty-csv-input"
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.tsv"
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e.target.files?.[0], "FACULTY")}
            />
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>📊</div>
            <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--primary)" }}>Click to Browse Excel / CSV File</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Supports .xlsx, .xls, .csv files</div>
          </div>

          <textarea
            className="input-field"
            rows="4"
            placeholder="Or paste Excel rows here:&#10;Dr. Faculty Name, faculty@skcet.ac.in, Pass123, M.Tech CSE"
            value={bulkImportText}
            onChange={(e) => {
              setBulkImportText(e.target.value);
              setBulkImportParsed(parseBulkInput(e.target.value, "FACULTY"));
            }}
            style={{ width: "100%", fontSize: "0.85rem", padding: "0.75rem", borderRadius: "10px", fontFamily: "monospace" }}
          />

          {bulkImportParsed.length > 0 && (
            <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}>
              <table className="bulk-preview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Dept</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkImportParsed.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>{row.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--primary)" }}>
              {bulkImportParsed.length} records ready to import
            </span>
            <button
              onClick={() => handleBulkImportSubmit("FACULTY")}
              disabled={bulkImportLoading || bulkImportParsed.length === 0}
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                border: "none", color: "#fff", borderRadius: "10px", padding: "0.65rem 1.25rem",
                fontWeight: "700", fontSize: "0.85rem", cursor: bulkImportParsed.length > 0 ? "pointer" : "not-allowed",
                opacity: bulkImportParsed.length > 0 ? 1 : 0.5
              }}
            >
              {bulkImportLoading ? "Importing..." : `Import ${bulkImportParsed.length} Faculty`}
            </button>
          </div>
        </div>
      ))}

      {/* 4. Bulk Import Student Modal */}
      {renderModal(showBulkImportStudentModal, () => { setShowBulkImportStudentModal(false); setBulkImportText(""); setBulkImportParsed([]); }, "📥 Bulk Import Students (Excel / CSV)", (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Upload an <b>Excel (.xlsx, .xls)</b> or <b>.csv</b> file, or paste rows copied directly from Excel.<br />
            Expected format: <code>Name, Email, Password, Department</code>
          </p>

          <div className="bulk-import-dropzone" onClick={() => document.getElementById("student-csv-input")?.click()}>
            <input
              id="student-csv-input"
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.tsv"
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e.target.files?.[0], "STUDENT")}
            />
            <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>📊</div>
            <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--primary)" }}>Click to Browse Excel / CSV File</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Supports .xlsx, .xls, .csv files</div>
          </div>

          <textarea
            className="input-field"
            rows="4"
            placeholder="Or paste Excel rows here:&#10;Sanjeev Kumar, sanjeev@skcet.ac.in, Pass123, CSE&#10;Priya Dharshini, priya@skcet.ac.in, Pass123, IT"
            value={bulkImportText}
            onChange={(e) => {
              setBulkImportText(e.target.value);
              setBulkImportParsed(parseBulkInput(e.target.value, "STUDENT"));
            }}
            style={{ width: "100%", fontSize: "0.85rem", padding: "0.75rem", borderRadius: "10px", fontFamily: "monospace" }}
          />

          {bulkImportParsed.length > 0 && (
            <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}>
              <table className="bulk-preview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Dept</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkImportParsed.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.name}</td>
                      <td>{row.email}</td>
                      <td>{row.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--primary)" }}>
              {bulkImportParsed.length} records ready to import
            </span>
            <button
              onClick={() => handleBulkImportSubmit("STUDENT")}
              disabled={bulkImportLoading || bulkImportParsed.length === 0}
              style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                border: "none", color: "#fff", borderRadius: "10px", padding: "0.65rem 1.25rem",
                fontWeight: "700", fontSize: "0.85rem", cursor: bulkImportParsed.length > 0 ? "pointer" : "not-allowed",
                opacity: bulkImportParsed.length > 0 ? 1 : 0.5
              }}
            >
              {bulkImportLoading ? "Importing..." : `Import ${bulkImportParsed.length} Students`}
            </button>
          </div>
        </div>
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
      {renderModal(showAssignExpertiseModal, () => {
        setShowAssignExpertiseModal(false);
        setModalFacultySearch("");
        setModalSubjectSearch("");
      }, "🎯 Assign Expertise Level", (
        <form onSubmit={async (e) => { await handleAllocateExpertise(e); setShowAssignExpertiseModal(false); setModalFacultySearch(""); setModalSubjectSearch(""); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label>Faculty member</label>
            <input
              type="text"
              className="input-field"
              placeholder="Search faculty name or department..."
              value={modalFacultySearch}
              onChange={e => setModalFacultySearch(e.target.value)}
              style={{ marginBottom: "6px" }}
            />
            <select className="input-field" style={{ appearance: "auto" }} value={expertiseForm.facultyId} onChange={e => setExpertiseForm(p => ({ ...p, facultyId: e.target.value }))} required>
              <option value="">-- Select Faculty ({faculty.filter(f => !modalFacultySearch.trim() || f.name?.toLowerCase().includes(modalFacultySearch.toLowerCase()) || f.department?.toLowerCase().includes(modalFacultySearch.toLowerCase())).length}) --</option>
              {faculty
                .filter(f => !modalFacultySearch.trim() || f.name?.toLowerCase().includes(modalFacultySearch.toLowerCase()) || f.department?.toLowerCase().includes(modalFacultySearch.toLowerCase()))
                .map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              className="input-field"
              placeholder="Search subject code or name..."
              value={modalSubjectSearch}
              onChange={e => setModalSubjectSearch(e.target.value)}
              style={{ marginBottom: "6px" }}
            />
            <select className="input-field" style={{ appearance: "auto" }} value={expertiseForm.subjectId} onChange={e => setExpertiseForm(p => ({ ...p, subjectId: e.target.value }))} required>
              <option value="">-- Select Subject ({subjects.filter(s => s.active).filter(s => !modalSubjectSearch.trim() || s.subjectCode?.toLowerCase().includes(modalSubjectSearch.toLowerCase()) || s.subjectName?.toLowerCase().includes(modalSubjectSearch.toLowerCase())).length}) --</option>
              {subjects
                .filter(s => s.active)
                .filter(s => !modalSubjectSearch.trim() || s.subjectCode?.toLowerCase().includes(modalSubjectSearch.toLowerCase()) || s.subjectName?.toLowerCase().includes(modalSubjectSearch.toLowerCase()))
                .map(s => <option key={s.id} value={s.id}>{s.subjectCode} – {s.subjectName} ({s.department})</option>)}
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
