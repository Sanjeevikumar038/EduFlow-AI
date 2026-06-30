import { useState, useEffect } from "react";
import {
  createFaculty,
  getFaculty,
  deleteFaculty,
  createStudent,
  getStudents,
  deleteStudent
} from "../services/authService";
import { getAdminAnalytics, exportSessionCsv, exportSessionPdfData, getLowAttendanceStudents } from "../services/attendanceService";
import { getAllLeaveRequests } from "../services/leaveService";
import { useNavigate } from "react-router-dom";
import AnalyticsCard from "../components/AnalyticsCard";
import { getDepartmentTimetable, saveDepartmentTimetable, autoGenerateTimetable, getTimetableVersions, activateTimetableVersion } from "../services/timetableService";
import {
  getSubjects, createSubject, deleteSubject,
  getAllExpertise, allocateExpertise, removeExpertise,
  getAvailability, setAvailability, deleteAvailability,
  getFacultyWorkload,
  getClassrooms, createClassroom
} from "../services/subjectService";
import CareerDashboardAdmin from "../components/career/CareerDashboardAdmin";


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
        📊 Department Attendance Comparison
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
    try { const res = await getSubjects(token); setSubjects(res.data); } catch(e) { console.error(e); }
  };
  const loadExpertise = async () => {
    try { const res = await getAllExpertise(token); setExpertise(res.data); } catch(e) { console.error(e); }
  };
  const loadAvailability = async () => {
    try { const res = await getAvailability(token); setAvailabilityList(res.data); } catch(e) { console.error(e); }
  };
  const loadWorkload = async () => {
    setWorkloadLoading(true);
    try { const res = await getFacultyWorkload(token); setWorkload(res.data); } catch(e) { console.error(e); } finally { setWorkloadLoading(false); }
  };
  const loadClassrooms = async () => {
    try { const res = await getClassrooms(token); setClassrooms(res.data); } catch(e) { console.error(e); }
  };
  const loadVersions = async (dept) => {
    try { const res = await getTimetableVersions(token, dept); setTimetableVersions(res.data); } catch(e) { console.error(e); }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSubjectLoading(true);
    try {
      await createSubject({ ...subjectForm, semester: Number(subjectForm.semester), credits: Number(subjectForm.credits), weeklyHours: Number(subjectForm.weeklyHours) }, token);
      showFeedback("Subject created!");
      setSubjectForm({ subjectCode: "", subjectName: "", department: "M.Tech CSE", semester: 1, academicYear: "2024-25", credits: 3, weeklyHours: 3, subjectCategory: "THEORY" });
      loadSubjects();
    } catch(e) { showFeedback(e.response?.data || "Failed to create subject", "error"); }
    finally { setSubjectLoading(false); }
  };
  const handleDeleteSubject = async (id) => {
    try { await deleteSubject(id, token); showFeedback("Subject deleted/deactivated!"); loadSubjects(); }
    catch(e) { showFeedback(e.response?.data || "Failed to delete subject", "error"); }
  };
  const handleAllocateExpertise = async (e) => {
    e.preventDefault();
    setExpertiseLoading(true);
    try {
      await allocateExpertise({ facultyId: Number(expertiseForm.facultyId), subjectId: Number(expertiseForm.subjectId), expertiseLevel: expertiseForm.expertiseLevel }, token);
      showFeedback("Expertise allocated!");
      setExpertiseForm({ facultyId: "", subjectId: "", expertiseLevel: "PRIMARY" });
      loadExpertise();
    } catch(e) { showFeedback(e.response?.data || "Failed to allocate expertise", "error"); }
    finally { setExpertiseLoading(false); }
  };
  const handleRemoveExpertise = async (id) => {
    try { await removeExpertise(id, token); showFeedback("Expertise removed!"); loadExpertise(); }
    catch(e) { showFeedback("Failed to remove expertise", "error"); }
  };
  const handleAddLeave = async (e) => {
    e.preventDefault();
    setLeaveLoading(true);
    try {
      await setAvailability({ facultyId: Number(leaveForm.facultyId), date: leaveForm.date, available: leaveForm.available, reason: leaveForm.reason }, token);
      showFeedback("Leave recorded!");
      setLeaveForm({ facultyId: "", date: "", available: false, reason: "" });
      loadAvailability();
    } catch(e) { showFeedback("Failed to record leave", "error"); }
    finally { setLeaveLoading(false); }
  };
  const handleDeleteLeave = async (id) => {
    try { await deleteAvailability(id, token); showFeedback("Leave record removed!"); loadAvailability(); }
    catch(e) { showFeedback("Failed to remove leave", "error"); }
  };
  const handleAutoGenerate = async () => {
    setAutoGenerating(true);
    try {
      const res = await autoGenerateTimetable({ department: selectedDept }, token);
      showFeedback(`✅ ${res.data.message} (${res.data.totalEntries} entries)`);
      loadTimetable(selectedDept);
    } catch(e) { showFeedback(e.response?.data || "Auto-generate failed", "error"); }
    finally { setAutoGenerating(false); }
  };
  const handleActivateVersion = async (id) => {
    try { await activateTimetableVersion(id, token); showFeedback("Version activated!"); loadVersions(selectedDept); loadTimetable(selectedDept); }
    catch(e) { showFeedback("Failed to activate version", "error"); }
  };
  const handleAddClassroom = async (e) => {
    e.preventDefault();
    try { await createClassroom({ ...classroomForm, capacity: Number(classroomForm.capacity) }, token); showFeedback("Classroom added!"); setClassroomForm({ roomCode: "", roomName: "", capacity: 60, roomType: "LECTURE" }); loadClassrooms(); }
    catch(e) { showFeedback(e.response?.data || "Failed to add classroom", "error"); }
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
        for (let p = 1; p <= 8; p++) {
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
      deptSubjects = ["OS", "DCN", "PCD", "AIES", "AGAI", "DBMS", "CC LAB", "AI LAB", "SE"];
    } else if (selectedDept === "CSE") {
      deptSubjects = ["DSA", "COA", "TOC", "DAA", "CN", "AI", "DBMS", "Java Lab"];
    } else if (selectedDept === "IT") {
      deptSubjects = ["OOPs", "SE", "OS", "WebTech", "MobileApp", "Security", "Cloud", "Web Lab"];
    } else if (selectedDept === "ECE") {
      deptSubjects = ["EDC", "SS", "LIC", "MPMC", "DSP", "VLSI", "Antenna", "Embedded Lab"];
    } else {
      deptSubjects = ["SUB1", "SUB2", "SUB3", "SUB4", "SUB5", "SUB6", "SUB7", "SUB8"];
    }

    const newMatrix = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    days.forEach(day => {
      for (let p = 1; p <= 8; p++) {
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
    fetchAdminAnalyticsData();
    loadSubjects();
    loadExpertise();
    loadAvailability();
    loadClassrooms();
  }, [token]);

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
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem", flexWrap: "wrap" }}>
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
          📊 Analytics Control
        </button>
        <button
          onClick={() => { setActiveTab("faculty"); setSearchTerm(""); setDeptFilter("All"); setDeletingId(null); }}
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
          onClick={() => { setActiveTab("students"); setSearchTerm(""); setDeptFilter("All"); setDeletingId(null); }}
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
        <button
          onClick={() => { setActiveTab("timetable"); setSearchTerm(""); setDeletingId(null); }}
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
          📅 Timetable Manager
        </button>
        <button
          onClick={() => { setActiveTab("subjects"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "subjects" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "subjects" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📚 Subject Master
        </button>
        <button
          onClick={() => { setActiveTab("expertise"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "expertise" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "expertise" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          🎯 Faculty Expertise
        </button>
        <button
          onClick={() => { setActiveTab("leaves"); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "leaves" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "leaves" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          🏖️ Faculty Leaves
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
            transition: "all 0.3s ease"
          }}
        >
          📄 Student Leaves/OD
        </button>
        <button
          onClick={() => { setActiveTab("workload"); loadWorkload(); setSearchTerm(""); setDeletingId(null); }}
          style={{
            background: activeTab === "workload" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "workload" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap"
          }}
        >
          📊 Workload
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
            transition: "all 0.3s ease",
            whiteSpace: "nowrap"
          }}
        >
          ⭐ Career
        </button>
      </div>

      {activeTab === "career" && <CareerDashboardAdmin />}

      {activeTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
          
          {/* Reusable Analytics Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", width: "100%" }}>
            <AnalyticsCard
              title="Total Students"
              score={adminAnalytics?.totalStudents ?? 0}
              status="Total Active"
              icon="🎓"
              subText="System Student Count"
              maxScore={100}
            />
            <AnalyticsCard
              title="Total Faculty"
              score={adminAnalytics?.totalFaculty ?? 0}
              status="Total Conductor"
              icon="👤"
              subText="System Faculty Count"
              maxScore={100}
            />
            <AnalyticsCard
              title="Total Sessions"
              score={adminAnalytics?.totalSessions ?? 0}
              status="Conducted"
              icon="⚡"
              subText="Total Attendance Sessions"
              maxScore={100}
            />
          </div>

          {/* Spotlight Cards (Best / Needs Improvement) */}
          <div style={{ display: "flex", gap: "1.5rem", width: "100%", flexWrap: "wrap" }}>
            <div className="dashboard-card" style={{ flex: "1 1 300px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "2rem" }}>🏆</span>
              <div>
                <h4 style={{ margin: 0, color: "var(--success)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Best Performing Department</h4>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.3rem", fontWeight: "700" }}>{adminAnalytics?.bestDepartment ?? "Loading..."}</p>
              </div>
            </div>

            <div className="dashboard-card" style={{ flex: "1 1 300px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "2rem" }}>⚠️</span>
              <div>
                <h4 style={{ margin: 0, color: "var(--error)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Needs Improvement</h4>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.3rem", fontWeight: "700" }}>{adminAnalytics?.needsImprovementDepartment ?? "Loading..."}</p>
              </div>
            </div>
          </div>

          {/* SVG comparison chart and details grid side by side */}
          <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
            
            {/* SVG Chart */}
            <div style={{ flex: "2 1 500px" }}>
              {adminAnalyticsLoading ? (
                <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading comparison chart...
                </div>
              ) : (
                <DepartmentComparisonChart data={adminAnalytics?.departmentComparison} />
              )}
            </div>

            {/* Department grid */}
            <div className="dashboard-card" style={{ flex: "1 1 350px", background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
              <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
                📋 Department Comparison Summary
              </h3>

              {adminAnalyticsLoading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading records...</div>
              ) : adminAnalytics?.departmentComparison && adminAnalytics.departmentComparison.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--card-border)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.5rem" }}>Department</th>
                        <th style={{ padding: "0.5rem", textAlign: "center" }}>Students</th>
                        <th style={{ padding: "0.5rem", textAlign: "center" }}>Sessions</th>
                        <th style={{ padding: "0.5rem", textAlign: "right" }}>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminAnalytics.departmentComparison.map((d, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "0.75rem 0.5rem", fontWeight: "600", color: "var(--primary)" }}>{d.department}</td>
                          <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", fontWeight: "500" }}>{d.totalStudents}</td>
                          <td style={{ padding: "0.75rem 0.5rem", textAlign: "center", color: "var(--text-muted)" }}>{d.totalSessions}</td>
                          <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", fontWeight: "700" }}>
                            {d.averageAttendance.toFixed(1)}%
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

        </div>
      )}

      {(activeTab === "faculty" || activeTab === "students") ? (
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
                    <option value="M.Tech CSE">mtech cse 5 years</option>
                  </select>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
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
                style={{ maxWidth: "280px", height: "38px", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              />
            </div>

            {/* Department Filter Pills */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
              {ALL_DEPTS.map(dept => {
                const count = getDeptCount(dept, activeTab === "faculty" ? faculty : students);
                const isActive = deptFilter === dept;
                return (
                  <button
                    key={dept}
                    onClick={() => setDeptFilter(dept)}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                        : "rgba(31, 41, 55, 0.5)",
                      border: isActive ? "none" : "1px solid var(--card-border)",
                      color: isActive ? "#fff" : "var(--text-muted)",
                      borderRadius: "999px",
                      padding: "0.35rem 0.9rem",
                      fontSize: "0.8rem",
                      fontWeight: isActive ? "700" : "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: isActive ? "0 2px 10px rgba(99,102,241,0.35)" : "none"
                    }}
                  >
                    {dept}
                    <span style={{
                      background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                      borderRadius: "999px",
                      padding: "1px 7px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      color: isActive ? "#fff" : "var(--text-muted)"
                    }}>{count}</span>
                  </button>
                );
              })}
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
                      <th style={{ padding: "0.75rem 1rem" }}>Department</th>
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
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{f.department || "N/A"}</td>
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
                            <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{s.department || "N/A"}</td>
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
      ) : null}

      {activeTab === "timetable" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
          
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, color: "#fff" }}>📅 Timetable Matrix Builder</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                  Configure weekly subject schedules and allocate registered faculty members to periods.
                </p>
              </div>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>SELECT DEPARTMENT:</span>
                  <select
                    className="input-field"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    style={{ background: "#0f172a", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", borderRadius: "6px", padding: "8px 12px", fontSize: "0.85rem", minWidth: "140px" }}
                  >
                    <option value="M.Tech CSE">M.Tech CSE</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>
                
                <button
                  onClick={handleAutoGenerate}
                  disabled={autoGenerating}
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid var(--success)",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "10px 15px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    alignSelf: "flex-end",
                    margin: 0
                  }}
                >
                  {autoGenerating ? "⏳ Generating..." : "🤖 Auto Generate"}
                </button>

                <button
                  onClick={() => {
                    setSwapMode(!swapMode);
                    setSelectedSwapCell(null);
                  }}
                  style={{
                    background: swapMode ? "var(--success)" : "rgba(31, 41, 55, 0.6)",
                    border: swapMode ? "none" : "1px solid var(--card-border)",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "10px 15px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    alignSelf: "flex-end",
                    margin: 0
                  }}
                >
                  {swapMode ? "⛔ Stop Swapping" : "🔀 Swap Mode"}
                </button>

                <button
                  onClick={handleRandomizeTimetable}
                  style={{
                    background: "rgba(99, 102, 241, 0.15)",
                    border: "1px solid var(--primary)",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "10px 15px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    alignSelf: "flex-end",
                    margin: 0
                  }}
                >
                  🎲 Randomize Grid
                </button>

                <button
                  onClick={handleSaveTimetable}
                  disabled={savingTimetable || timetableLoading}
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "6px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    alignSelf: "flex-end",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                    margin: 0
                  }}
                >
                  {savingTimetable ? "Saving..." : "💾 Save Timetable"}
                </button>
              </div>
            </div>

            {swapMode && (
              <div style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px dashed var(--success)",
                color: "var(--success)",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                animation: "fadeIn 0.3s ease"
              }}>
                ℹ️ <strong>Swap Mode Active:</strong> Click on any slot to select it, then click another slot to swap their subjects and professors.
              </div>
            )}

            {timetableLoading ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                Loading weekly timetable matrix...
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="timetable-grid-table admin-table">
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>P1<span className="time-sub">8:45-9:40</span></th>
                      <th>P2<span className="time-sub">9:40-10:35</span></th>
                      <th className="break-hdr">Break</th>
                      <th>P3<span className="time-sub">10:50-11:45</span></th>
                      <th>P4<span className="time-sub">11:45-12:40</span></th>
                      <th className="break-hdr">Lunch</th>
                      <th>P5<span className="time-sub">1:40-2:35</span></th>
                      <th>P6<span className="time-sub">2:35-3:30</span></th>
                      <th>P7<span className="time-sub">3:30-4:25</span></th>
                      <th>P8<span className="time-sub">4:25-5:20</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                      <tr key={day}>
                        <td className="day-name-cell">{day}</td>
                        {[1, 2].map(p => renderAdminCell(day, p))}
                        <td className="grid-break-cell">Short Break</td>
                        {[3, 4].map(p => renderAdminCell(day, p))}
                        <td className="grid-break-cell">Lunch Break</td>
                        {[5, 6, 7, 8].map(p => renderAdminCell(day, p))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              padding: 10px 6px;
              height: 75px;
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
            }
            .admin-table td {
              background: rgba(30, 41, 59, 0.15);
            }
            .admin-cell-container {
              display: flex;
              flex-direction: column;
              gap: 6px;
              padding: 4px;
            }
            .admin-cell-subject {
              background: #0f172a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #fff;
              border-radius: 4px;
              padding: 6px 8px;
              font-size: 0.8rem;
              outline: none;
              text-align: center;
              font-weight: 600;
              transition: border-color 0.2s;
            }
            .admin-cell-subject:focus {
              border-color: var(--primary);
            }
            .admin-cell-faculty {
              background: #0f172a;
              border: 1px solid rgba(255, 255, 255, 0.08);
              color: #94a3b8;
              border-radius: 4px;
              padding: 4px 6px;
              font-size: 0.7rem;
              outline: none;
              cursor: pointer;
              transition: border-color 0.2s;
              width: 100%;
            }
            .admin-cell-faculty:focus {
              border-color: var(--secondary);
            }
          `}</style>
        </div>
      )}

      {/* ─── SUBJECT MASTER TAB ─── */}
      {activeTab === "subjects" && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-card" style={{ flex: "0 0 340px", background: "rgba(30, 41, 59, 0.25)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff" }}>📚 Add Subject</h3>
            <form onSubmit={handleCreateSubject} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              <button className="auth-btn" type="submit" disabled={subjectLoading}>{subjectLoading ? "Adding..." : "Add Subject"}</button>
            </form>
          </div>

          <div className="dashboard-card" style={{ flex: "1 1 500px", background: "rgba(30, 41, 59, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0 }}>Subject List ({subjects.length})</h3>
              <input className="input-field" placeholder="Search subjects..." value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ maxWidth: "220px", height: "36px", fontSize: "0.85rem" }} />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
                    {["Code", "Name", "Dept", "Sem", "Credits", "Hrs", "Category", "Status", ""].map(h => <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {subjects.filter(s => !subjectFilter || s.subjectCode?.toLowerCase().includes(subjectFilter.toLowerCase()) || s.subjectName?.toLowerCase().includes(subjectFilter.toLowerCase())).map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)", opacity: s.active ? 1 : 0.5 }}>
                      <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600, color: "var(--primary)" }}>{s.subjectCode}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>{s.subjectName}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-muted)" }}>{s.department}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-muted)" }}>{s.semester}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-muted)" }}>{s.credits}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-muted)" }}>{s.weeklyHours}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><span style={{ background: s.subjectCategory === "LAB" ? "rgba(99,102,241,0.2)" : "rgba(16,185,129,0.2)", color: s.subjectCategory === "LAB" ? "#818cf8" : "#34d399", borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }}>{s.subjectCategory}</span></td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><span style={{ color: s.active ? "var(--success)" : "var(--error)", fontWeight: 600, fontSize: "0.75rem" }}>{s.active ? "Active" : "Inactive"}</span></td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><button onClick={() => handleDeleteSubject(s.id)} style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "3px 10px", cursor: "pointer", fontSize: "0.75rem" }}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── FACULTY EXPERTISE TAB ─── */}
      {activeTab === "expertise" && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-card" style={{ flex: "0 0 340px", background: "rgba(30, 41, 59, 0.25)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff" }}>🎯 Assign Expertise</h3>
            <form onSubmit={handleAllocateExpertise} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label>Faculty</label>
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
              <button className="auth-btn" type="submit" disabled={expertiseLoading}>{expertiseLoading ? "Allocating..." : "Allocate Expertise"}</button>
            </form>
          </div>

          <div className="dashboard-card" style={{ flex: "1 1 500px", background: "rgba(30, 41, 59, 0.2)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0" }}>Expertise Allocations ({expertise.length})</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
                    {["Faculty", "Department", "Subject", "Code", "Level", ""].map(h => <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {expertise.map(e => {
                    const levelColor = e.expertiseLevel === "PRIMARY" ? "#fbbf24" : e.expertiseLevel === "SECONDARY" ? "#818cf8" : "#94a3b8";
                    return (
                      <tr key={e.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                        <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>{e.faculty?.name}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-muted)" }}>{e.faculty?.department}</td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>{e.subject?.subjectName}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: "var(--primary)", fontWeight: 600 }}>{e.subject?.subjectCode}</td>
                        <td style={{ padding: "0.6rem 0.75rem" }}><span style={{ background: `${levelColor}22`, color: levelColor, borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>{e.expertiseLevel}</span></td>
                        <td style={{ padding: "0.6rem 0.75rem" }}><button onClick={() => handleRemoveExpertise(e.id)} style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "3px 10px", cursor: "pointer", fontSize: "0.75rem" }}>Remove</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── FACULTY LEAVES TAB ─── */}
      {activeTab === "leaves" && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-card" style={{ flex: "0 0 340px", background: "rgba(30, 41, 59, 0.25)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0", color: "#fff" }}>🏖️ Record Leave</h3>
            <form onSubmit={handleAddLeave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              <button className="auth-btn" type="submit" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }} disabled={leaveLoading}>{leaveLoading ? "Saving..." : "Mark as On Leave"}</button>
            </form>
          </div>

          <div className="dashboard-card" style={{ flex: "1 1 500px", background: "rgba(30, 41, 59, 0.2)" }}>
            <h3 style={{ margin: "0 0 1.5rem 0" }}>Leave Records ({availability.length})</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
                    {["Faculty", "Department", "Date", "Status", "Reason", ""].map(h => <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {availability.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                      <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>{a.faculty?.name}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-muted)" }}>{a.faculty?.department}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>{a.date}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><span style={{ background: a.available ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)", color: a.available ? "var(--success)" : "var(--error)", borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>{a.available ? "Available" : "On Leave"}</span></td>
                      <td style={{ padding: "0.6rem 0.75rem", color: "var(--text-muted)" }}>{a.reason || "—"}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}><button onClick={() => handleDeleteLeave(a.id)} style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "3px 10px", cursor: "pointer", fontSize: "0.75rem" }}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── STUDENT LEAVES / OD TAB ─── */}
      {activeTab === "leave" && (
        <div style={{ animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ margin: 0 }}>📄 Student Leave/OD Requests</h3>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <select className="input-field" value={leaveFilterDept} onChange={(e) => setLeaveFilterDept(e.target.value)} style={{ minWidth: "150px" }}>
                  <option value="All">All Departments</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="input-field" value={leaveFilterStatus} onChange={(e) => setLeaveFilterStatus(e.target.value)} style={{ minWidth: "150px" }}>
                  <option value="All">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <input type="text" className="input-field" placeholder="Search Reg No or Name..." value={leaveSearch} onChange={e => setLeaveSearch(e.target.value)} style={{ minWidth: "200px" }} />
                <button onClick={fetchAdminLeaveRequests} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid var(--primary)", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}>
                  🔄 Refresh
                </button>
              </div>
            </div>

            {studentLeaveLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading student leave requests...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Student</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Dept</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Type</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Date Range</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Reason</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests
                      .filter(r => 
                        !leaveSearch || 
                        r.student.registerNumber.toLowerCase().includes(leaveSearch.toLowerCase()) || 
                        r.student.name.toLowerCase().includes(leaveSearch.toLowerCase())
                      )
                      .map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div style={{ fontWeight: 600 }}>{r.student.name}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.student.registerNumber}</div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{r.student.department}</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{r.leaveType}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{r.startDate} to {r.endDate}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>{r.reason}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                          <span style={{
                            background: r.status === "APPROVED" ? "rgba(16,185,129,0.15)" : r.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                            color: r.status === "APPROVED" ? "var(--success)" : r.status === "REJECTED" ? "var(--error)" : "var(--warning)",
                            padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700
                          }}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {leaveRequests.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No leave requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FACULTY WORKLOAD TAB ─── */}
      {activeTab === "workload" && (
        <div style={{ animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0 }}>📊 Faculty Workload Dashboard</h3>
              <button onClick={loadWorkload} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid var(--primary)", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}>🔄 Refresh</button>
            </div>
            {workloadLoading ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading workload data...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
                      {["Faculty", "Department", "Allocated Periods", "Max Periods", "Utilization", "Status"].map(h => <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {workload.map(w => {
                      const statusColor = w.workloadStatus === "Heavy Load" ? "#ef4444" : w.workloadStatus === "Balanced" ? "#10b981" : "#f59e0b";
                      const statusEmoji = w.workloadStatus === "Heavy Load" ? "🔴" : w.workloadStatus === "Balanced" ? "🟢" : "🟡";
                      const barWidth = Math.min(100, w.utilizationPercentage);
                      return (
                        <tr key={w.facultyId} style={{ borderBottom: "1px solid var(--card-border)" }}>
                          <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{w.facultyName}</td>
                          <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{w.department}</td>
                          <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: 700 }}>{w.allocatedPeriods}</td>
                          <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{w.availablePeriods}</td>
                          <td style={{ padding: "0.75rem 1rem", minWidth: "160px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                                <div style={{ width: `${barWidth}%`, height: "100%", background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`, borderRadius: "999px", transition: "width 0.6s ease" }} />
                              </div>
                              <span style={{ minWidth: "44px", fontWeight: 600, color: statusColor }}>{w.utilizationPercentage?.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <span style={{ background: `${statusColor}22`, color: statusColor, borderRadius: "6px", padding: "4px 12px", fontSize: "0.8rem", fontWeight: 700 }}>{statusEmoji} {w.workloadStatus}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "career" && (
        <CareerDashboardAdmin />
      )}
    </div>
  );
}

export default AdminDashboard;
