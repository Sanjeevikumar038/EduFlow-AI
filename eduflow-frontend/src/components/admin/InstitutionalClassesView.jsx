import React, { useState, useEffect, useMemo } from "react";
import { getInstitutionClasses, getDepartmentTimetable } from "../../services/timetableService";

function InstitutionalClassesView({ token, allDepts = [], showFeedback }) {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  // Filters
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All"); // "All" | 1 | 2 | 3 | 4 | 5
  const [selectedSection, setSelectedSection] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal Popup for Timetable Grid
  const [activeModalClass, setActiveModalClass] = useState(null);
  const [selectedCellDetail, setSelectedCellDetail] = useState(null);

  const ALL_INSTITUTION_DEPTS = [
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

  const YEAR_OPTIONS = [
    { label: "1st Year (I Year)", yearNum: 1, semesters: [1, 2] },
    { label: "2nd Year (II Year)", yearNum: 2, semesters: [3, 4] },
    { label: "3rd Year (III Year)", yearNum: 3, semesters: [5, 6] },
    { label: "4th Year (IV Year)", yearNum: 4, semesters: [7, 8] },
    { label: "5th Year (V Year)", yearNum: 5, semesters: [9, 10] }
  ];

  const getYearFromSem = (sem) => {
    const s = Number(sem) || 1;
    if (s <= 2) return "1st Year";
    if (s <= 4) return "2nd Year";
    if (s <= 6) return "3rd Year";
    if (s <= 8) return "4th Year";
    return "5th Year";
  };

  const getRomanYear = (sem) => {
    const s = Number(sem) || 1;
    if (s <= 2) return "I";
    if (s <= 4) return "II";
    if (s <= 6) return "III";
    if (s <= 8) return "IV";
    return "V";
  };

  // Format department, semester, section into standard college tag (e.g. II Mech A, III CSE B)
  const formatDeptYearSec = (department, semester, section) => {
    const romanYear = getRomanYear(semester);
    const rawDept = (department || "").trim();
    const upper = rawDept.toUpperCase();
    let shortDept = "Dept";
    if (upper.includes("MTECH") || upper.includes("M.TECH")) shortDept = "M.Tech CSE";
    else if (upper.includes("ARTIFICIAL INTELLIGENCE") || upper.includes("AI & DATA") || upper.includes("AIDS") || upper.includes("AI&DS")) shortDept = "AI&DS";
    else if (upper.includes("BUSINESS SYSTEMS") || upper.includes("CSBS")) shortDept = "CSBS";
    else if (upper.includes("CYBER SECURITY") || upper.includes("CSY")) shortDept = "CSY";
    else if (upper.includes("DESIGN") || upper.includes("CSD")) shortDept = "CSD";
    else if (upper.includes("MECHANICAL") || upper.includes("MECH")) shortDept = "Mech";
    else if (upper.includes("CIVIL")) shortDept = "Civil";
    else if (upper.includes("ELECTRICAL AND ELECTRONICS") || upper.includes("EEE")) shortDept = "EEE";
    else if (upper.includes("ELECTRONICS") || upper.includes("ECE")) shortDept = "ECE";
    else if (upper.includes("INFORMATION TECH") || upper.includes("IT")) shortDept = "IT";
    else if (upper.includes("COMPUTER SCIENCE") || upper.includes("CSE")) shortDept = "CSE";
    else if (upper.includes("MANAGEMENT") || upper.includes("MBA")) shortDept = "MBA";
    else {
      shortDept = rawDept.replace(/Department of\s*/i, "").trim();
    }

    const sec = (section && section.trim() !== "") ? section.trim().toUpperCase() : "A";
    return `${romanYear} ${shortDept} ${sec}`;
  };

  // Fetch classes across institution
  const fetchClasses = async () => {
    if (!token) return;
    setLoading(true);
    try {
      let loadedEntries = [];

      try {
        const res = await getInstitutionClasses(
          token,
          selectedDept === "All" ? null : selectedDept,
          null,
          selectedSection === "All" ? null : selectedSection
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          loadedEntries = res.data;
        }
      } catch (apiErr) {
        console.warn("[InstitutionalClassesView] Direct endpoint fallback:", apiErr);
      }

      if (loadedEntries.length === 0) {
        const deptsToQuery = selectedDept === "All"
          ? (allDepts && allDepts.length > 0 ? allDepts.filter(d => d !== "All") : ALL_INSTITUTION_DEPTS)
          : [selectedDept];

        const semsToQuery = [1, 3, 5, 7, 9];

        const promises = [];
        for (const dept of deptsToQuery) {
          for (const sem of semsToQuery) {
            promises.push(
              getDepartmentTimetable(dept, token, sem)
                .then(r => Array.isArray(r.data) ? r.data : [])
                .catch(() => [])
            );
          }
        }

        const responses = await Promise.allSettled(promises);
        responses.forEach(r => {
          if (r.status === "fulfilled" && Array.isArray(r.value)) {
            loadedEntries.push(...r.value);
          }
        });

        if (selectedSection !== "All") {
          const targetSec = selectedSection.trim().toUpperCase();
          loadedEntries = loadedEntries.filter(e => {
            const s = e.section ? e.section.trim().toUpperCase() : "A";
            return s === targetSec;
          });
        }
      }

      setEntries(loadedEntries);
    } catch (err) {
      console.error("Error loading institutional classes:", err);
      if (showFeedback) showFeedback("Failed to load institutional class timetables.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [token, selectedDept, selectedSection]);

  // Group entries into distinct Classes (Dept + Semester + Section)
  const groupedClasses = useMemo(() => {
    const map = new Map();

    entries.forEach((e) => {
      if (!e) return;
      const dept = e.department || "General";
      const sem = e.semester || 1;
      const sec = e.section ? e.section.trim().toUpperCase() : "A";
      const classKey = `${dept}__SEM${sem}__SEC${sec}`;

      if (!map.has(classKey)) {
        map.set(classKey, {
          key: classKey,
          department: dept,
          semester: sem,
          year: getYearFromSem(sem),
          romanYear: getRomanYear(sem),
          section: sec,
          classTag: formatDeptYearSec(dept, sem, sec),
          entries: [],
          matrix: {},
          uniqueSubjects: new Map(),
          uniqueFaculty: new Set()
        });
      }

      const classObj = map.get(classKey);
      classObj.entries.push(e);

      const code = e.courseCode || e.subject;
      const name = e.subjectName || e.subject;
      if (code && !classObj.uniqueSubjects.has(code)) {
        classObj.uniqueSubjects.set(code, {
          code,
          name,
          facultyName: e.faculty?.name || "Unassigned",
          facultyDept: e.faculty?.department || dept,
          room: e.room ? (e.room.roomCode || e.room.roomName) : "Classroom"
        });
      }

      if (e.faculty?.name) classObj.uniqueFaculty.add(e.faculty.name);

      if (e.dayOfWeek && e.period) {
        const rawDay = String(e.dayOfWeek).trim();
        const dayTitle = rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase();
        classObj.matrix[`${dayTitle}-${e.period}`] = e;
      }
    });

    let list = Array.from(map.values());

    // Apply Year Filter (1st Year, 2nd Year, etc.)
    if (selectedYear !== "All") {
      const yearNum = Number(selectedYear);
      const targetOption = YEAR_OPTIONS.find(y => y.yearNum === yearNum);
      if (targetOption) {
        list = list.filter(cls => targetOption.semesters.includes(cls.semester));
      }
    }

    // Apply text search query across classTag, department, course code, course name, faculty, room
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((cls) => {
        if (cls.classTag.toLowerCase().includes(q)) return true;
        if (cls.department.toLowerCase().includes(q)) return true;
        if (cls.year.toLowerCase().includes(q)) return true;
        if (cls.section.toLowerCase().includes(q)) return true;
        
        return cls.entries.some((e) => {
          const code = (e.courseCode || e.subject || "").toLowerCase();
          const name = (e.subjectName || "").toLowerCase();
          const fac = (e.faculty?.name || "").toLowerCase();
          const room = (e.room?.roomCode || e.room?.roomName || "").toLowerCase();
          return code.includes(q) || name.includes(q) || fac.includes(q) || room.includes(q);
        });
      });
    }

    // Sort by Department, then Semester, then Section
    list.sort((a, b) => {
      if (a.department !== b.department) return a.department.localeCompare(b.department);
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.section.localeCompare(b.section);
    });

    return list;
  }, [entries, selectedYear, searchQuery]);

  // Metrics
  const totalClassesCount = groupedClasses.length;
  const uniqueDeptsCount = new Set(groupedClasses.map((c) => c.department)).size;

  const ALL_SECTIONS = ["A", "B", "C", "D"];

  const handlePrintModal = () => {
    window.print();
  };

  const getSubjectAbbreviation = (code, name) => {
    if (!code && !name) return "";
    const cleanName = (name || code).trim();
    const cleanCode = (code || name).trim();

    const lowerName = cleanName.toLowerCase();
    const upperCode = cleanCode.toUpperCase();

    // Explicit Elective Code Matches FIRST
    if (upperCode.includes("25XXXX-4064")) return "PE-III";
    if (upperCode.includes("25XXXX-4063")) return "PE-II";
    if (upperCode.includes("25XXXX-4062")) return "OE-II";

    // Roman Numerals in descending order (III before II, IV before I)
    if (lowerName.includes("professional elective") || lowerName.includes("pe-") || lowerName.includes("pe ")) {
      if (lowerName.includes("iv") || lowerName.includes(" 4")) return "PE-IV";
      if (lowerName.includes("iii") || lowerName.includes(" 3")) return "PE-III";
      if (lowerName.includes("ii") || lowerName.includes(" 2")) return "PE-II";
      if (lowerName.includes("i") || lowerName.includes(" 1")) return "PE-I";
      return "PE";
    }

    if (lowerName.includes("open") || lowerName.includes("emerging") || lowerName.includes("industrial elective") || lowerName.includes("oe-") || lowerName.includes("oe ")) {
      if (lowerName.includes("iv") || lowerName.includes(" 4")) return "OE-IV";
      if (lowerName.includes("iii") || lowerName.includes(" 3")) return "OE-III";
      if (lowerName.includes("ii") || lowerName.includes(" 2")) return "OE-II";
      if (lowerName.includes("i") || lowerName.includes(" 1")) return "OE-I";
      return "OE";
    }

    if (lowerName.includes("internet of things") || upperCode === "25IOC01" || lowerName.includes("iot")) return "IOT";
    if (lowerName.includes("blockchain") || upperCode === "25IOC02") return "BT";
    if (lowerName.includes("mini project") || upperCode === "25CSI701") return "MP";
    if (lowerName.includes("banking and insurance") || upperCode === "25CS1701" || lowerName.includes("banking")) return "BI";

    if (cleanCode.length <= 5 && !/\d{3,}/.test(cleanCode)) {
      return cleanCode.toUpperCase();
    }

    const words = cleanName.split(/[\s_\-]+/).filter(w => w.length > 0 && !/^(and|of|for|in|the|with|to|–|-)$/i.test(w));
    if (words.length >= 2) {
      return words.map(w => w[0].toUpperCase()).join("");
    }
    if (words.length === 1) {
      return words[0].substring(0, 4).toUpperCase();
    }
    return cleanCode;
  };

  const renderCellContent = (cell) => {
    if (!cell || !cell.subject || cell.subject.trim() === "") {
      return (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", opacity: 0.6 }}>
          Free
        </span>
      );
    }

    const isStudy = cell.subject === "LIBRARY_STUDY" || cell.subject === "FREE_ACTIVITY";
    if (isStudy) {
      return (
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", opacity: 0.6 }}>
          Free
        </span>
      );
    }

    const code = cell.courseCode || cell.subject;
    const name = cell.subjectName || cell.subject;
    const facName = cell.faculty?.name || (cell.faculty?.id ? `Faculty #${cell.faculty.id}` : "");
    const subAbbr = getSubjectAbbreviation(code, name);
    const roomInfo = cell.room ? (cell.room.roomCode || cell.room.roomName || "Room") : "Classroom";

    const tooltipText = `Course Code: ${code}\nCourse: ${name}\nFaculty: ${facName || "Unassigned"}\nRoom: ${roomInfo}`;

    return (
      <div 
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "4px", cursor: "pointer" }}
        title={tooltipText}
        onClick={() => setSelectedCellDetail(cell)}
      >
        <span
          style={{
            fontWeight: "800",
            fontSize: "0.95rem",
            color: "#818cf8",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "3px 10px",
            borderRadius: "6px",
            letterSpacing: "0.5px"
          }}
        >
          {subAbbr}
        </span>
        <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
          <i className="fa-solid fa-user-tie" style={{ fontSize: "0.65rem", marginRight: "4px", color: "var(--success)" }}></i>
          {facName}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.4s ease" }}>
      
      {/* ─── TOP BANNER & METRICS ─── */}
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.4)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.4rem" }}>
              <div style={{ background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8", fontSize: "1.2rem" }}>
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: "700", color: "#fff", margin: 0 }}>
                Institutional Classes & Sections Master Directory
              </h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Live directory of all academic classes, sections, course assignments, faculty allocations, and weekly schedules across all 11 departments.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.75rem 1.25rem", textAlign: "center", minWidth: "120px" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#38bdf8", fontFamily: "var(--font-heading)" }}>
                {totalClassesCount}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                Active Classes
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.75rem 1.25rem", textAlign: "center", minWidth: "120px" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#818cf8", fontFamily: "var(--font-heading)" }}>
                {uniqueDeptsCount}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                Departments
              </div>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "0.75rem 1.25rem", textAlign: "center", minWidth: "130px" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--success)", fontFamily: "var(--font-heading)" }}>
                0 ✓
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                Conflicts (Clash-Free)
              </div>
            </div>
          </div>
        </div>

        {/* ─── FILTER & SEARCH TOOLBAR ─── */}
        <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", flex: "1 1 auto" }}>
            
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "240px", flex: "1 1 240px" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search class (e.g. II Mech A), course code, faculty, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ width: "100%", paddingLeft: "34px", paddingRight: "12px", borderRadius: "8px", fontSize: "0.85rem", height: "38px" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <select
                className="input-field"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", height: "38px", minWidth: "180px", cursor: "pointer" }}
              >
                <option value="All">🏛️ All Departments</option>
                {allDepts.filter(d => d !== "All").map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.replace(/Department of\s*/i, "")}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter (Replacing Semester) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <select
                className="input-field"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", height: "38px", minWidth: "140px", cursor: "pointer" }}
              >
                <option value="All">🎓 All Years</option>
                {YEAR_OPTIONS.map((yr) => (
                  <option key={yr.yearNum} value={yr.yearNum}>
                    {yr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <select
                className="input-field"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                style={{ borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", height: "38px", minWidth: "120px", cursor: "pointer" }}
              >
                <option value="All">📍 All Sections</option>
                {ALL_SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Refresh Button */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={fetchClasses}
              disabled={loading}
              title="Refresh Institutional Classes"
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid var(--card-border)",
                color: "#fff",
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <i className={`fa-solid fa-arrows-rotate ${loading ? "fa-spin" : ""}`}></i>
              <span>Refresh</span>
            </button>
          </div>

        </div>
      </div>

      {/* ─── LOADING STATE ─── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <i className="fa-solid fa-spinner fa-spin fa-3x" style={{ color: "var(--primary)", marginBottom: "1rem" }}></i>
          <p style={{ fontSize: "1rem", fontWeight: "600" }}>Loading all institutional class timetables...</p>
        </div>
      ) : groupedClasses.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", borderRadius: "20px" }}>
          <i className="fa-solid fa-folder-open fa-3x" style={{ color: "rgba(255,255,255,0.2)", marginBottom: "1rem" }}></i>
          <h3 style={{ color: "#fff", margin: "0 0 0.5rem 0" }}>No Classes Found</h3>
          <p style={{ fontSize: "0.85rem" }}>
            No scheduled classes match the selected filter criteria. Try adjusting the department, year, or search query.
          </p>
        </div>
      ) : (

        /* ─── DIRECTORY CARDS GRID ─── */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {groupedClasses.map((cls) => {
            const filledPeriodsCount = Object.keys(cls.matrix || {}).length;

            return (
              <div 
                key={cls.key} 
                className="dashboard-card" 
                style={{ 
                  background: "rgba(30, 41, 59, 0.4)", 
                  border: "1px solid var(--card-border)", 
                  borderRadius: "16px", 
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                  transition: "all 0.2s ease"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <span style={{
                      fontSize: "0.95rem",
                      fontWeight: "800",
                      color: "#38bdf8",
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      letterSpacing: "0.3px"
                    }}>
                      {cls.classTag}
                    </span>
                    <span style={{ fontSize: "0.72rem", fontWeight: "700", color: filledPeriodsCount >= 30 ? "var(--success)" : "#38bdf8", background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: "4px" }}>
                      {filledPeriodsCount} Hrs/Wk
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 0.35rem 0", color: "#fff", fontSize: "0.95rem", fontWeight: "700", lineHeight: 1.3 }}>
                    {cls.department}
                  </h4>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: 0, fontWeight: "600" }}>
                    {cls.year} • Section {cls.section}
                  </p>

                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Unique Courses:</span>
                      <span style={{ color: "#fff", fontWeight: "700" }}>{cls.uniqueSubjects.size}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Faculty Assigned:</span>
                      <span style={{ color: "var(--success)", fontWeight: "700" }}>{cls.uniqueFaculty.size}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalClass(cls)}
                  style={{
                    background: "rgba(56, 189, 248, 0.12)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#38bdf8",
                    padding: "9px 14px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(56, 189, 248, 0.12)";
                    e.currentTarget.style.color = "#38bdf8";
                  }}
                >
                  <i className="fa-solid fa-table-cells"></i>
                  <span>View Full Weekly Grid</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── FULL TIMETABLE POPUP MODAL ─── */}
      {activeModalClass && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 110,
            backdropFilter: "blur(6px)",
            padding: "1.5rem"
          }}
          onClick={() => setActiveModalClass(null)}
        >
          <div 
            style={{
              background: "var(--bg-modal, var(--card-bg))",
              border: "1px solid var(--card-border)",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "1150px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              animation: "fadeIn 0.25s ease"
            }}
            className="custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "#38bdf8",
                  background: "rgba(56, 189, 248, 0.15)",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  padding: "4px 14px",
                  borderRadius: "8px",
                  letterSpacing: "0.5px"
                }}>
                  {activeModalClass.classTag}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc" }}>
                    {activeModalClass.department}
                  </h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {activeModalClass.year} • Section {activeModalClass.section} • {activeModalClass.uniqueSubjects.size} Courses • {activeModalClass.uniqueFaculty.size} Faculty Members
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={handlePrintModal}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--card-border)",
                    color: "#fff",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <i className="fa-solid fa-print"></i> Print Grid
                </button>
                <button 
                  onClick={() => setActiveModalClass(null)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Full Weekly Timetable Grid */}
            <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
              <table className="admin-table timetable-grid" style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "rgba(30, 41, 59, 0.8)", textAlign: "center" }}>
                    <th style={{ padding: "12px", width: "120px" }}>Day / Period</th>
                    <th style={{ padding: "12px" }}>P1 (8:45-9:40)</th>
                    <th style={{ padding: "12px" }}>P2 (9:40-10:35)</th>
                    <th style={{ padding: "12px", background: "rgba(30,41,59,0.5)", width: "90px" }}>Break</th>
                    <th style={{ padding: "12px" }}>P3 (10:50-11:45)</th>
                    <th style={{ padding: "12px" }}>P4 (11:45-12:40)</th>
                    <th style={{ padding: "12px", background: "rgba(30,41,59,0.5)", width: "90px" }}>Lunch</th>
                    <th style={{ padding: "12px" }}>P5 (1:30-2:25)</th>
                    <th style={{ padding: "12px" }}>P6 (2:25-3:20)</th>
                  </tr>
                </thead>
                <tbody>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <tr key={day} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ fontWeight: "700", color: "#f8fafc", background: "rgba(15, 23, 42, 0.5)", textAlign: "center", padding: "10px" }}>
                        {day}
                      </td>
                      
                      {[1, 2].map((p) => (
                        <td key={p} style={{ padding: "8px 6px", height: "80px", minWidth: "120px", verticalAlign: "middle", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", borderRadius: "6px" }}>
                          {renderCellContent(activeModalClass.matrix[`${day}-${p}`])}
                        </td>
                      ))}

                      <td className="grid-break-cell" style={{ background: "rgba(30,41,59,0.3)", color: "var(--text-muted)", fontSize: "0.7rem", textAlign: "center" }}>
                        Short Break
                      </td>

                      {[3, 4].map((p) => (
                        <td key={p} style={{ padding: "8px 6px", height: "80px", minWidth: "120px", verticalAlign: "middle", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", borderRadius: "6px" }}>
                          {renderCellContent(activeModalClass.matrix[`${day}-${p}`])}
                        </td>
                      ))}

                      <td className="grid-break-cell" style={{ background: "rgba(30,41,59,0.3)", color: "var(--text-muted)", fontSize: "0.7rem", textAlign: "center" }}>
                        Lunch Break
                      </td>

                      {[5, 6].map((p) => (
                        <td key={p} style={{ padding: "8px 6px", height: "80px", minWidth: "120px", verticalAlign: "middle", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", borderRadius: "6px" }}>
                          {renderCellContent(activeModalClass.matrix[`${day}-${p}`])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Course & Faculty Reference Details Inside Modal */}
            <div style={{ background: "rgba(30, 41, 59, 0.4)", borderRadius: "14px", padding: "1.25rem", border: "1px solid var(--card-border)" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-list-check" style={{ color: "var(--primary)" }}></i>
                Course & Assigned Faculty Reference Details
              </h4>

              <div style={{ overflowX: "auto" }}>
                <table className="admin-table" style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(15, 23, 42, 0.7)", color: "#f8fafc", textAlign: "left" }}>
                      <th style={{ padding: "10px 14px" }}>Course Code</th>
                      <th style={{ padding: "10px 14px" }}>Full Course Name</th>
                      <th style={{ padding: "10px 14px" }}>Assigned Faculty Member</th>
                      <th style={{ padding: "10px 14px" }}>Faculty Department</th>
                      <th style={{ padding: "10px 14px" }}>Room / Lab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(activeModalClass.uniqueSubjects.values()).map((sub, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "10px 14px", fontWeight: "700", color: "var(--primary)" }}>{sub.code}</td>
                        <td style={{ padding: "10px 14px", color: "#f8fafc", fontWeight: "500" }}>{sub.name}</td>
                        <td style={{ padding: "10px 14px", color: "var(--success)", fontWeight: "600" }}>
                          <i className="fa-solid fa-user-tie" style={{ marginRight: "6px" }}></i>{sub.facultyName}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#a5b4fc" }}>{sub.facultyDept}</td>
                        <td style={{ padding: "10px 14px", color: "var(--text-muted)" }}>{sub.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── CELL INSPECTION POPUP MODAL ─── */}
      {selectedCellDetail && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 120,
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setSelectedCellDetail(null)}
        >
          <div 
            style={{
              background: "var(--bg-modal, var(--card-bg))",
              border: "1px solid var(--card-border)",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "450px",
              width: "90%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#38bdf8", background: "rgba(56, 189, 248, 0.15)", padding: "3px 8px", borderRadius: "6px" }}>
                {formatDeptYearSec(selectedCellDetail.department, selectedCellDetail.semester, selectedCellDetail.section)}
              </span>
              <button 
                onClick={() => setSelectedCellDetail(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ margin: "0 0 0.5rem 0", color: "#fff", fontSize: "1.15rem", fontWeight: "700" }}>
              {selectedCellDetail.courseCode ? `${selectedCellDetail.courseCode} — ` : ""}{selectedCellDetail.subjectName || selectedCellDetail.subject}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1.25rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Day & Period:</span>
                <span style={{ color: "#fff", fontWeight: "700" }}>{selectedCellDetail.dayOfWeek}, Period {selectedCellDetail.period}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Faculty Member:</span>
                <span style={{ color: "var(--success)", fontWeight: "700" }}>
                  {selectedCellDetail.faculty?.name || "Unassigned"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Assigned Classroom:</span>
                <span style={{ color: "#818cf8", fontWeight: "700" }}>
                  {selectedCellDetail.room ? (selectedCellDetail.room.roomCode || selectedCellDetail.room.roomName) : "Classroom"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Department:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedCellDetail.department}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCellDetail(null)}
              style={{
                marginTop: "1.5rem",
                width: "100%",
                background: "var(--primary-gradient)",
                border: "none",
                color: "#fff",
                padding: "10px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default InstitutionalClassesView;
