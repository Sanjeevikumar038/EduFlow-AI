import React from "react";

function TimetableManagerView({
  selectedDept,
  setSelectedDept,
  selectedSem = 3,
  setSelectedSem,
  selectedSection = "ALL",
  setSelectedSection,
  availableSections = ["A", "B", "C"],
  allSectionMatrices = {},
  allDepts = ["M.Tech CSE", "CSE", "IT", "ECE", "EEE", "Department of Artificial Intelligence and Data Science", "Mechanical", "Civil", "Mechatronics", "CSBS"],
  timetableMatrix,
  timetableLoading,
  savingTimetable,
  swapMode,
  setSwapMode,
  selectedSwapCell,
  setSelectedSwapCell,
  autoGenerating,
  handleAutoGenerate,
  handleGenerateInstitutional,
  validationReport,
  handleSaveTimetable,
  handleRandomizeTimetable,
  handleCellChange,
  faculty = [],
  subjects = [],
  setTimetableMatrix,
  showFeedback
}) {

  const [academicYearInput, setAcademicYearInput] = React.useState("2026-2027");
  const [semesterCycleInput, setSemesterCycleInput] = React.useState("ODD");

  const normalizeDeptName = (dept) => {
    if (!dept) return "";
    const upper = dept.trim().toUpperCase();
    if (upper.includes("MTECH") || upper.includes("M.TECH")) return "DEPARTMENT OF MTECH COMPUTER SCIENCE AND ENGINEERING";
    if (upper.includes("ARTIFICIAL INTELLIGENCE") || upper.includes("AI & DATA") || upper.includes("AI AND DATA") || upper.includes("AIDS") || upper.includes("AI&DS")) return "DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE";
    if (upper.includes("BUSINESS SYSTEMS") || upper.includes("CSBS")) return "DEPARTMENT OF COMPUTER SCIENCE AND BUSINESS SYSTEMS";
    if (upper === "IT" || upper.includes("INFORMATION TECH") || upper.includes("INFORMATION TECHNOLOGY")) return "DEPARTMENT OF INFORMATION TECHNOLOGY";
    if (upper === "CSE" || upper.includes("COMPUTER SCIENCE")) return "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING";
    if (upper === "ECE" || upper.includes("ELECTRONICS AND COMMUNICATION") || upper.includes("ELECTRONICS & COMMUNICATION") || upper.includes("ELECTRONICS")) return "DEPARTMENT OF ELECTRONICS AND COMMUNICATION ENGINEERING";
    if (upper === "EEE" || upper.includes("ELECTRICAL AND ELECTRONICS") || upper.includes("ELECTRICAL & ELECTRONICS")) return "DEPARTMENT OF ELECTRICAL AND ELECTRONICS ENGINEERING";
    if (upper.includes("MECH") || upper.includes("MECHANICAL")) return "DEPARTMENT OF MECHANICAL ENGINEERING";
    if (upper.includes("CIVIL")) return "DEPARTMENT OF CIVIL ENGINEERING";
    if (upper.includes("MECHATRONICS")) return "DEPARTMENT OF MECHATRONICS ENGINEERING";
    return upper;
  };

  const matchDepartment = (d1, d2) => {
    if (!d1 || !d2) return false;
    const n1 = normalizeDeptName(d1);
    const n2 = normalizeDeptName(d2);
    return n1 === n2;
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
    if (lowerName.includes("physics")) return "PHY";
    if (lowerName.includes("chemistry")) return "CHEM";
    if (lowerName.includes("digital communication")) return "DC";
    if (lowerName.includes("multilingual")) return "MP";
    if (lowerName.includes("server side")) return "ASSP";

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

  const renderAdminCell = (day, period, targetMatrix = timetableMatrix) => {
    const cellKey = `${day}-${period}`;
    const cell = targetMatrix[cellKey] || { subject: "", facultyId: "" };
    const isSelected = selectedSwapCell && selectedSwapCell.day === day && selectedSwapCell.period === period;

    const subCode = cell.subjectCode || cell.subject || "";
    const matchingSub = (subjects || []).find(s => (s.subjectCode && s.subjectCode.toUpperCase() === subCode.toUpperCase()) || (s.id && String(s.id) === subCode));
    const subName = (cell.subjectName && cell.subjectName !== subCode) ? cell.subjectName : (matchingSub?.subjectName || subCode);
    const facName = cell.facultyName || (cell.facultyId ? `Faculty #${cell.facultyId}` : "");
    const subAbbr = getSubjectAbbreviation(subCode, subName);
    const isStudy = subCode === "LIBRARY_STUDY" || subCode === "FREE_ACTIVITY";

    const tooltipText = subCode && !isStudy ? (
      `Course Code: ${subCode}\nFull Name: ${subName}\nFaculty: ${facName || "Unassigned"}\nFaculty Dept: ${cell.facultyDepartment || cell.department || selectedDept}\nWeekly Load: ${cell.weeklyHours || 3} Hrs/Wk`
    ) : "Free Period (No Subject Scheduled)";

    const cellStyle = {
      textAlign: "center",
      verticalAlign: "middle",
      padding: "10px 8px",
      minWidth: "120px",
      height: "76px",
      borderRadius: "10px",
      transition: "all 0.2s ease",
      cursor: swapMode ? "pointer" : "default",
      border: isSelected
        ? "2px solid var(--secondary)"
        : (swapMode ? "1px dashed rgba(99, 102, 241, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)"),
      background: isSelected
        ? "rgba(99, 102, 241, 0.25)"
        : (subCode ? "rgba(30, 41, 59, 0.5)" : "rgba(15, 23, 42, 0.2)"),
      boxShadow: isSelected ? "0 0 12px rgba(99, 102, 241, 0.5)" : "none"
    };

    return (
      <td
        key={period}
        style={cellStyle}
        title={tooltipText}
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
        {swapMode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
            <select
              className="admin-cell-subject-select"
              value={cell.subject || ""}
              onChange={(e) => handleCellChange(day, period, "subject", e.target.value)}
              style={{
                width: "100%",
                fontWeight: "700",
                color: cell.subject ? "var(--primary)" : "var(--text-muted)",
                fontSize: "0.8rem",
                padding: "4px 6px",
                borderRadius: "6px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                textAlign: "center"
              }}
            >
              <option value="">-- Free --</option>
              {(subjects || []).map((s) => (
                <option key={s.id || s.subjectCode} value={s.subjectCode || s.subjectName}>
                  {s.subjectCode} — {s.subjectName}
                </option>
              ))}
            </select>
            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {facName || "Select Subject"}
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "4px" }}>
            {subCode && !isStudy ? (
              <>
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
                <span style={{ fontSize: "0.72rem", color: "#cbd5e1", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px" }}>
                  <i className="fa-solid fa-user-tie" style={{ fontSize: "0.65rem", marginRight: "4px", color: "var(--success)" }}></i>
                  {facName}
                </span>
              </>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", opacity: 0.6 }}>
                Free
              </span>
            )}
          </div>
        )}
      </td>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      
      {/* ─── INSTITUTION MASTER TIMETABLE GENERATION PANEL ─── */}
      <div className="dashboard-card" style={{ background: "linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "20px", padding: "1.75rem", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "1.25rem" }}>
                <i className="fa-solid fa-globe" style={{ color: "#818cf8", marginRight: "8px" }}></i>
                Institution Master Timetable Generator
              </h3>
              <span style={{ background: "rgba(99, 102, 241, 0.2)", border: "1px solid #6366f1", color: "#a5b4fc", fontSize: "0.7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "12px" }}>
                ONE Global Optimization Run
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.35rem 0 0 0" }}>
              Generates a single conflict-free timetable for the ENTIRE institution across all departments, semesters, sections, and faculty.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Academic Year:</label>
              <input
                type="text"
                className="input-field"
                value={academicYearInput}
                onChange={(e) => setAcademicYearInput(e.target.value)}
                style={{ borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", width: "130px", background: "rgba(15, 23, 42, 0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Semester Cycle:</label>
              <select
                className="input-field"
                value={semesterCycleInput}
                onChange={(e) => setSemesterCycleInput(e.target.value)}
                style={{ borderRadius: "8px", padding: "8px 12px", fontSize: "0.85rem", width: "210px", background: "rgba(15, 23, 42, 0.6)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
              >
                <option value="ODD">Odd Semesters (1, 3, 5, 7, 9)</option>
                <option value="EVEN">Even Semesters (2, 4, 6, 8, 10)</option>
              </select>
            </div>

            {handleGenerateInstitutional && (
              <button
                onClick={() => handleGenerateInstitutional(academicYearInput, semesterCycleInput)}
                disabled={autoGenerating}
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c084fc 100%)",
                  border: "none", color: "#fff", borderRadius: "10px", padding: "10px 22px",
                  cursor: "pointer", fontSize: "0.9rem", fontWeight: "700", transition: "all 0.2s",
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)", display: "flex", alignItems: "center", gap: "8px"
                }}
              >
                {autoGenerating ? "⏳ Running Global Optimization..." : "🚀 Generate Institution Master Timetable"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Report Details Display */}
      {validationReport && (
        <div className="dashboard-card" style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fa-solid fa-square-check" style={{ color: validationReport.overallStatus === "PASS" ? "var(--success)" : (validationReport.overallStatus === "WARNING" ? "#f59e0b" : "#ef4444") }}></i>
                Institution Timetable Validation Report
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                Academic Year: <strong>{validationReport.academicYear}</strong> | Semester Cycle: <strong>{validationReport.semesterCycle}</strong> | Generation Time: <strong>{validationReport.generationTimeMs} ms</strong>
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                background: validationReport.overallStatus === "PASS" ? "rgba(16, 185, 129, 0.2)" : (validationReport.overallStatus === "WARNING" ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)"),
                border: `1.5px solid ${validationReport.overallStatus === "PASS" ? "var(--success)" : (validationReport.overallStatus === "WARNING" ? "#f59e0b" : "#ef4444")}`,
                color: validationReport.overallStatus === "PASS" ? "var(--success)" : (validationReport.overallStatus === "WARNING" ? "#f59e0b" : "#ef4444"),
                padding: "6px 16px", borderRadius: "20px", fontWeight: "800", fontSize: "0.95rem", letterSpacing: "1px"
              }}>
                STATUS: {validationReport.overallStatus}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>DEPARTMENTS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginTop: "4px" }}>{validationReport.departmentsGenerated}</div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>SEMESTERS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginTop: "4px" }}>{validationReport.semestersGenerated?.length || 5}</div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>SECTIONS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#fff", marginTop: "4px" }}>{validationReport.sectionsGenerated}</div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>SUBJECTS SCHEDULED</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#818cf8", marginTop: "4px" }}>{validationReport.subjectsScheduled}</div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>FACULTY CONFLICTS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: validationReport.facultyConflicts === 0 ? "var(--success)" : "#ef4444", marginTop: "4px" }}>
                {validationReport.facultyConflicts} {validationReport.facultyConflicts === 0 ? "✓" : "❌"}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>CLASS CONFLICTS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: validationReport.classConflicts === 0 ? "var(--success)" : "#ef4444", marginTop: "4px" }}>
                {validationReport.classConflicts} {validationReport.classConflicts === 0 ? "✓" : "❌"}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>ROOM CONFLICTS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: validationReport.roomConflicts === 0 ? "var(--success)" : "#ef4444", marginTop: "4px" }}>
                {validationReport.roomConflicts} {validationReport.roomConflicts === 0 ? "✓" : "❌"}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>WEEKLY HOUR VIOLATIONS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: validationReport.weeklyHourViolations === 0 ? "var(--success)" : "#f59e0b", marginTop: "4px" }}>
                {validationReport.weeklyHourViolations}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>MISSING SUBJECTS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: validationReport.missingSubjects === 0 ? "var(--success)" : "#f59e0b", marginTop: "4px" }}>
                {validationReport.missingSubjects}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>TIMETABLE QUALITY</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
                {validationReport.timetableQualityScore !== undefined ? `${validationReport.timetableQualityScore.toFixed(1)}%` : "100.0%"}
              </div>
              <span style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#10b981", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700" }}>
                {validationReport.timetableQualityRating || "EXCELLENT"}
              </span>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>CONSECUTIVE THEORY CLUSTERS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: validationReport.consecutiveTheoryViolations === 0 ? "var(--success)" : "#ef4444", marginTop: "4px" }}>
                {validationReport.consecutiveTheoryViolations || 0} {validationReport.consecutiveTheoryViolations === 0 ? "✓" : "❌"}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>MULTI-DAY SPREAD %</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#38bdf8", marginTop: "4px" }}>
                {validationReport.multiDayDistributedPercentage !== undefined ? `${validationReport.multiDayDistributedPercentage.toFixed(1)}%` : "100.0%"}
              </div>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(129, 140, 248, 0.3)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>FACULTY SCHEDULE QUALITY</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#818cf8", marginTop: "4px" }}>
                {validationReport.facultyScheduleQualityScore !== undefined ? `${validationReport.facultyScheduleQualityScore.toFixed(1)}%` : "100.0%"}
              </div>
              <span style={{ background: "rgba(129, 140, 248, 0.15)", border: "1px solid rgba(129, 140, 248, 0.3)", color: "#818cf8", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700" }}>
                {validationReport.facultyScheduleQualityRating || "EXCELLENT"}
              </span>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "1rem", textAlign: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: "600" }}>FACULTY IDLE GAPS</span>
              <div style={{ fontSize: "1.4rem", fontWeight: "800", color: validationReport.facultyIdleGapCount === 0 ? "var(--success)" : "#f59e0b", marginTop: "4px" }}>
                {validationReport.facultyIdleGapCount || 0} {validationReport.facultyIdleGapCount === 0 ? "✓" : ""}
              </div>
            </div>
          </div>

          {/* ─── WEEKLY HOUR VIOLATIONS DETAILED REPORT ─── */}
          {validationReport.weeklyHourViolationReport && validationReport.weeklyHourViolationReport.length > 0 && (
            <div style={{ marginTop: "1.5rem", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "12px", padding: "1.25rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#f59e0b", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                Weekly Hour Violations Detailed Report ({validationReport.weeklyHourViolationReport.length} subjects)
              </h4>
              <div style={{ overflowX: "auto", maxHeight: "300px" }}>
                <table className="admin-table" style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(30, 41, 59, 0.8)", color: "#cbd5e1" }}>
                      <th style={{ padding: "8px 12px" }}>Code</th>
                      <th style={{ padding: "8px 12px" }}>Subject Name</th>
                      <th style={{ padding: "8px 12px" }}>Department</th>
                      <th style={{ padding: "8px 12px" }}>Sem</th>
                      <th style={{ padding: "8px 12px" }}>Sec</th>
                      <th style={{ padding: "8px 12px" }}>Faculty</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Required</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Scheduled</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Diff</th>
                      <th style={{ padding: "8px 12px" }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationReport.weeklyHourViolationReport.map((v, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "8px 12px", fontWeight: "700", color: "#f59e0b" }}>{v.subjectCode}</td>
                        <td style={{ padding: "8px 12px", color: "#fff" }}>{v.subjectName}</td>
                        <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{v.department}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{v.semester}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{v.section}</td>
                        <td style={{ padding: "8px 12px", color: "#a5b4fc" }}>{v.faculty}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700" }}>{v.requiredWeeklyHours}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: "#f59e0b", fontWeight: "700" }}>{v.scheduledHours}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: "#ef4444", fontWeight: "700" }}>-{v.difference}</td>
                        <td style={{ padding: "8px 12px", color: "#cbd5e1", fontSize: "0.75rem" }}>{v.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── UNSCHEDULED / MISSING SUBJECTS DETAILED REPORT ─── */}
          {validationReport.unscheduledReport && validationReport.unscheduledReport.length > 0 && (
            <div style={{ marginTop: "1.5rem", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", padding: "1.25rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#ef4444", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-circle-xmark"></i>
                Unscheduled / Missing Subjects Detailed Report ({validationReport.unscheduledReport.length} subjects)
              </h4>
              <div style={{ overflowX: "auto", maxHeight: "300px" }}>
                <table className="admin-table" style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(30, 41, 59, 0.8)", color: "#cbd5e1" }}>
                      <th style={{ padding: "8px 12px" }}>Subject</th>
                      <th style={{ padding: "8px 12px" }}>Faculty</th>
                      <th style={{ padding: "8px 12px" }}>Department</th>
                      <th style={{ padding: "8px 12px" }}>Sem</th>
                      <th style={{ padding: "8px 12px" }}>Sec</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Required</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Scheduled</th>
                      <th style={{ padding: "8px 12px" }}>Constraint Preventing Placement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationReport.unscheduledReport.map((m, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "8px 12px", fontWeight: "700", color: "#ef4444" }}>{m.subject}</td>
                        <td style={{ padding: "8px 12px", color: "#a5b4fc" }}>{m.faculty}</td>
                        <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{m.department}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{m.semester}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{m.section}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700" }}>{m.requiredHours}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: "#ef4444", fontWeight: "700" }}>{m.hoursScheduled}</td>
                        <td style={{ padding: "8px 12px", color: "#fca5a5", fontSize: "0.75rem" }}>{m.constraintPreventingPlacement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* ─── ISSUE 1: CURRICULUM CAPACITY ANALYSIS REPORT ─── */}
          {validationReport.curriculumCapacityReport && validationReport.curriculumCapacityReport.length > 0 && (
            <div style={{ marginTop: "1.5rem", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "12px", padding: "1.25rem" }}>
              <h4 style={{ margin: "0 0 1rem 0", color: "#a5b4fc", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-calculator"></i>
                Curriculum Capacity Analysis Report (Required Hours vs 30 Available Slot Capacity)
              </h4>
              <div style={{ overflowX: "auto", maxHeight: "300px" }}>
                <table className="admin-table" style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(30, 41, 59, 0.8)", color: "#cbd5e1" }}>
                      <th style={{ padding: "8px 12px" }}>Department</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Sem</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Sec</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Required Hours</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Available Hours</th>
                      <th style={{ padding: "8px 12px", textAlign: "center" }}>Difference</th>
                      <th style={{ padding: "8px 12px" }}>Capacity Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationReport.curriculumCapacityReport.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: c.totalRequiredHours > 30 ? "rgba(239, 68, 68, 0.1)" : "transparent" }}>
                        <td style={{ padding: "8px 12px", fontWeight: "700", color: "#fff" }}>{c.department}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{c.semester}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>{c.section}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "800", color: c.totalRequiredHours > 30 ? "#ef4444" : "#818cf8" }}>{c.totalRequiredHours}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "700" }}>30</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: "800", color: c.difference > 0 ? "#ef4444" : "var(--success)" }}>
                          {c.difference > 0 ? `+${c.difference}` : c.difference}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{
                            padding: "3px 8px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: "700",
                            background: c.totalRequiredHours > 30 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                            color: c.totalRequiredHours > 30 ? "#ef4444" : "var(--success)",
                            border: `1px solid ${c.totalRequiredHours > 30 ? "#ef4444" : "var(--success)"}`
                          }}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── FILTERED TIMETABLE MATRIX VIEW ─── */}
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, color: "#fff" }}><i className="fa-solid fa-filter" style={{ color: "var(--primary)", marginRight: "8px" }}></i> Filtered Timetable View</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
              Select a Department and Semester to filter the Master Timetable. <em>Changing filters NEVER triggers a regeneration.</em>
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>FILTER DEPARTMENT:</span>
              <select
                className="input-field"
                value={selectedDept}
                onChange={(e) => {
                  const val = e.target.value;
                  console.log("[Dropdown onChange] dropdown.value:", val);
                  setSelectedDept(val);
                  console.log("[setSelectedDept] State update requested with value:", val);
                }}
                style={{ borderRadius: "6px", padding: "8px 12px", fontSize: "0.85rem", minWidth: "180px", maxWidth: "300px", cursor: "pointer" }}
              >
                {allDepts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {setSelectedSem && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>FILTER SEMESTER:</span>
                <select
                  className="input-field"
                  value={selectedSem}
                  onChange={(e) => {
                    const semVal = parseInt(e.target.value, 10);
                    console.log("[Semester Dropdown onChange] value:", semVal);
                    setSelectedSem(semVal);
                  }}
                  style={{ borderRadius: "6px", padding: "8px 12px", fontSize: "0.85rem", minWidth: "120px", cursor: "pointer" }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {setSelectedSection && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600" }}>FILTER SECTION:</span>
                <select
                  className="input-field"
                  value={selectedSection || "ALL"}
                  onChange={(e) => {
                    const secVal = e.target.value;
                    console.log("[Section Dropdown onChange] value:", secVal);
                    setSelectedSection(secVal);
                  }}
                  style={{ borderRadius: "6px", padding: "8px 12px", fontSize: "0.85rem", minWidth: "140px", cursor: "pointer" }}
                >
                  <option value="ALL">All Sections (Overview)</option>
                  {availableSections.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => {
                setSwapMode(!swapMode);
                setSelectedSwapCell(null);
              }}
              style={{
                background: swapMode ? "var(--success)" : "rgba(31, 41, 59, 0.6)",
                border: swapMode ? "none" : "1px solid var(--card-border)", color: "#fff",
                borderRadius: "6px", padding: "10px 15px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                transition: "all 0.2s", alignSelf: "flex-end", margin: 0
              }}
            >
              {swapMode ? "⛔ Stop Swapping" : "🔀 Swap Mode"}
            </button>

            <button
              onClick={handleRandomizeTimetable}
              disabled={autoGenerating}
              style={{
                background: "rgba(31, 41, 59, 0.6)", border: "1px solid var(--card-border)", color: "#fff",
                borderRadius: "6px", padding: "10px 15px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                transition: "all 0.2s", alignSelf: "flex-end", margin: 0
              }}
            >
              🎲 Randomize Grid
            </button>

            <button
              onClick={handleSaveTimetable}
              disabled={savingTimetable}
              style={{
                background: "var(--primary-gradient)", border: "none", color: "#fff",
                borderRadius: "6px", padding: "10px 18px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600",
                boxShadow: "var(--neon-glow-primary)", transition: "all 0.2s", alignSelf: "flex-end", margin: 0
              }}
            >
              {savingTimetable ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>

        {/* Quick Section Switch Tabs */}
        {availableSections && availableSections.length > 0 && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", marginRight: "4px" }}>
              SECTIONS:
            </span>
            <button
              onClick={() => setSelectedSection("ALL")}
              style={{
                background: selectedSection === "ALL" ? "var(--primary)" : "rgba(30, 41, 59, 0.6)",
                color: "#fff",
                border: selectedSection === "ALL" ? "none" : "1px solid var(--card-border)",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              📋 All Sections ({availableSections.length})
            </button>
            {availableSections.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                style={{
                  background: selectedSection === sec ? "var(--primary)" : "rgba(30, 41, 59, 0.6)",
                  color: "#fff",
                  border: selectedSection === sec ? "none" : "1px solid var(--card-border)",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                📍 Section {sec}
              </button>
            ))}
          </div>
        )}

        {/* ─── GRID DISPLAY ─── */}
        {timetableLoading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: "var(--primary)", marginBottom: "1rem" }}></i>
            <p>Loading filtered master timetable...</p>
          </div>
        ) : selectedSection === "ALL" ? (
          /* Multi-Section All Classes Overview */
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {availableSections.map((secName) => {
              const currentMatrix = allSectionMatrices[secName] || {};
              return (
                <div key={secName} style={{ background: "rgba(15, 23, 42, 0.3)", borderRadius: "16px", padding: "1.25rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        background: "rgba(56, 189, 248, 0.15)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        color: "#38bdf8",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "800",
                        fontSize: "0.9rem"
                      }}>
                        Section {secName}
                      </span>
                      <h4 style={{ margin: 0, color: "#fff", fontSize: "0.95rem", fontWeight: "600" }}>
                        {selectedDept} • Semester {selectedSem}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedSection(secName)}
                      style={{
                        background: "rgba(56, 189, 248, 0.1)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        color: "#38bdf8",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        fontWeight: "700",
                        transition: "all 0.2s"
                      }}
                    >
                      ✏️ Edit Section {secName} Grid
                    </button>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-table timetable-grid" style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                      <thead>
                        <tr style={{ background: "rgba(15, 23, 42, 0.8)", textAlign: "center" }}>
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
                            <td style={{ fontWeight: "700", color: "#f8fafc", background: "rgba(15, 23, 42, 0.4)", textAlign: "center", padding: "10px" }}>
                              {day}
                            </td>
                            {[1, 2].map(p => renderAdminCell(day, p, currentMatrix))}
                            <td className="grid-break-cell">Short Break</td>
                            {[3, 4].map(p => renderAdminCell(day, p, currentMatrix))}
                            <td className="grid-break-cell">Lunch Break</td>
                            {[5, 6].map(p => renderAdminCell(day, p, currentMatrix))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Section Timetable Grid */
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table timetable-grid" style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ background: "rgba(15, 23, 42, 0.8)", textAlign: "center" }}>
                  <th style={{ padding: "14px", width: "120px" }}>Day / Period</th>
                  <th style={{ padding: "14px" }}>P1 (8:45-9:40)</th>
                  <th style={{ padding: "14px" }}>P2 (9:40-10:35)</th>
                  <th style={{ padding: "14px", background: "rgba(30,41,59,0.5)", width: "90px" }}>Break</th>
                  <th style={{ padding: "14px" }}>P3 (10:50-11:45)</th>
                  <th style={{ padding: "14px" }}>P4 (11:45-12:40)</th>
                  <th style={{ padding: "14px", background: "rgba(30,41,59,0.5)", width: "90px" }}>Lunch</th>
                  <th style={{ padding: "14px" }}>P5 (1:30-2:25)</th>
                  <th style={{ padding: "14px" }}>P6 (2:25-3:20)</th>
                </tr>
              </thead>
              <tbody>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <tr key={day} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ fontWeight: "700", color: "#f8fafc", background: "rgba(15, 23, 42, 0.4)", textAlign: "center", padding: "12px" }}>
                      {day}
                    </td>
                    {[1, 2].map(p => renderAdminCell(day, p, timetableMatrix))}
                    <td className="grid-break-cell">Short Break</td>
                    {[3, 4].map(p => renderAdminCell(day, p, timetableMatrix))}
                    <td className="grid-break-cell">Lunch Break</td>
                    {[5, 6].map(p => renderAdminCell(day, p, timetableMatrix))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Course Code & Faculty Details Reference Legend Table */}
        {(() => {
          console.log("[TimetableManagerView] Reference Panel Debug:");
          console.log("  selectedDept:", selectedDept);
          const map = new Map();
          if (selectedSection === "ALL") {
            (availableSections || []).forEach(sName => {
              const secMatrix = allSectionMatrices[sName] || {};
              Object.values(secMatrix).forEach(cell => {
                if (cell && cell.subject && cell.subject.trim() !== "") {
                  const code = cell.subjectCode || cell.subject.trim();
                  const mapKey = `${sName}-${code}`;
                  if (!map.has(mapKey)) {
                    map.set(mapKey, {
                      code: code,
                      name: cell.subjectName || code,
                      section: sName,
                      facultyName: cell.facultyName || (cell.facultyId ? `Faculty #${cell.facultyId}` : "Unassigned"),
                      facultyDepartment: cell.facultyDepartment || cell.courseDepartment || selectedDept,
                      courseDepartment: cell.courseDepartment || cell.department || selectedDept,
                      weeklyHours: cell.weeklyHours || 3
                    });
                  }
                }
              });
            });
          } else {
            const gridCells = Object.values(timetableMatrix || {});
            gridCells.forEach(cell => {
              if (cell && cell.subject && cell.subject.trim() !== "") {
                const code = cell.subjectCode || cell.subject.trim();
                const matchingSub = (subjects || []).find(s => (s.subjectCode && s.subjectCode.toUpperCase() === code.toUpperCase()) || (s.id && String(s.id) === code));
                const realName = (cell.subjectName && cell.subjectName !== code) ? cell.subjectName : (matchingSub?.subjectName || code);
                if (!map.has(code)) {
                  map.set(code, {
                    code: code,
                    name: realName,
                    section: selectedSection,
                    facultyName: cell.facultyName || (cell.facultyId ? `Faculty #${cell.facultyId}` : "Unassigned"),
                    facultyDepartment: cell.facultyDepartment || cell.courseDepartment || selectedDept,
                    courseDepartment: cell.courseDepartment || cell.department || selectedDept,
                    weeklyHours: cell.weeklyHours || 3
                  });
                }
              }
            });
          }

          const legendList = Array.from(map.values());

          return (
            <div style={{ marginTop: "2.5rem", background: "rgba(15, 23, 42, 0.4)", borderRadius: "16px", padding: "1.5rem", border: "1px solid var(--card-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h4 style={{ margin: 0, color: "#fff", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="fa-solid fa-list-check" style={{ color: "var(--primary)" }}></i>
                  Course & Assigned Faculty Reference Details
                </h4>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Showing {legendList.length} course allocations for {selectedDept} (Sem {selectedSem} {selectedSection === "ALL" ? `• All ${availableSections.length} Sections` : `• Sec ${selectedSection}`})
                </span>
              </div>

              {legendList.length === 0 ? (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic", textAlign: "center", padding: "1rem" }}>
                  No subject allocations loaded for {selectedDept} (Sem {selectedSem}).
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table" style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(30, 41, 59, 0.7)", color: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: "12px 16px" }}>Section</th>
                        <th style={{ padding: "12px 16px" }}>Course Code</th>
                        <th style={{ padding: "12px 16px" }}>Full Course Name</th>
                        <th style={{ padding: "12px 16px" }}>Assigned Faculty Member</th>
                        <th style={{ padding: "12px 16px" }}>Faculty Department</th>
                        <th style={{ padding: "12px 16px" }}>Course Department</th>
                        <th style={{ padding: "12px 16px", textAlign: "center" }}>Weekly Load</th>
                      </tr>
                    </thead>
                    <tbody>
                      {legendList.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                          <td style={{ padding: "12px 16px", fontWeight: "800", color: "#38bdf8" }}>Sec {item.section || "A"}</td>
                          <td style={{ padding: "12px 16px", fontWeight: "700", color: "var(--primary)" }}>{item.code}</td>
                          <td style={{ padding: "12px 16px", color: "#f8fafc", fontWeight: "500" }}>{item.name}</td>
                          <td style={{ padding: "12px 16px", color: "var(--success)", fontWeight: "600" }}>
                            <i className="fa-solid fa-user-tie" style={{ marginRight: "8px" }}></i>{item.facultyName}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#a5b4fc" }}>{item.facultyDepartment}</td>
                          <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{item.courseDepartment}</td>
                          <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: "600", color: "#a855f7" }}>{item.weeklyHours} Hrs/Wk</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })()}
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
  );
}

export default TimetableManagerView;
