import React from "react";

function FacultyScheduleView({ timetableData = [], currentClassStatus, timetableLoading, simParams, facultySubjects = [] }) {

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
  
  const formatDeptSemSec = (department, semester, section) => {
    const sem = Number(semester) || 1;
    const romanMap = {
      1: "I", 2: "II", 3: "III", 4: "IV",
      5: "V", 6: "VI", 7: "VII", 8: "VIII",
      9: "IX", 10: "X"
    };
    const romanSem = romanMap[sem] || `${sem}`;

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
    return `${romanSem} ${shortDept} ${sec}`;
  };

  const renderFacultyGridCell = (day, period) => {
    const entry = timetableData.find(e => e.dayOfWeek === day && e.period === period);
    const isFreeActivity = entry && entry.subject === "FREE_ACTIVITY";
    const hasClass = entry && entry.subject && entry.subject.trim() !== "" && !isFreeActivity;

    const isActiveCell = currentClassStatus &&
      currentClassStatus.status === "CLASS" &&
      currentClassStatus.periodNumber === period &&
      (simParams?.simulatedDay
        ? simParams.simulatedDay === day
        : new Date().toLocaleDateString("en-US", { weekday: "long" }) === day);

    const cellStyle = {
      padding: "8px 6px",
      minHeight: "96px",
      minWidth: "120px",
      verticalAlign: "middle",
      border: "1px solid rgba(255,255,255,0.06)",
      textAlign: "center",
      borderRadius: "8px",
      transition: "all 0.2s ease"
    };

    if (isFreeActivity) {
      const displayVal = entry.activityName ? `Free Activity (${entry.activityName})` : "Free Activity Period";
      return (
        <td key={period} style={{ ...cellStyle, background: "rgba(16, 185, 129, 0.05)", border: "1px dashed rgba(16, 185, 129, 0.2)" }}>
          <div style={{ color: "#10b981", fontWeight: "700", fontSize: "0.8rem" }}>{displayVal}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Self-Directed</div>
        </td>
      );
    } else if (hasClass) {
      const courseCode = entry.courseCode || entry.subject;
      let courseName = entry.subjectName;
      if (!courseName || courseName.trim() === "" || courseName.toUpperCase() === (courseCode || "").toUpperCase()) {
        const found = (facultySubjects || []).find(s => 
          (s.subjectCode && s.subjectCode.trim().toUpperCase() === (courseCode || "").toUpperCase()) ||
          (s.code && s.code.trim().toUpperCase() === (courseCode || "").toUpperCase())
        );
        if (found && (found.subjectName || found.name)) {
          courseName = found.subjectName || found.name;
        }
      }
      if (!courseName) courseName = courseCode;
      const roomInfo = entry.room ? (entry.room.roomCode || entry.room.roomName || "Room") : "Classroom";
      const deptSecBadge = formatDeptSemSec(entry.department, entry.semester, entry.section);

      const tooltipText = `Class: ${deptSecBadge}\nCourse Code: ${courseCode}\nCourse Name: ${courseName}\nRoom: ${roomInfo}`;

      return (
        <td
          key={period}
          title={tooltipText}
          style={{ 
            ...cellStyle, 
            background: isActiveCell ? "rgba(99, 102, 241, 0.25)" : "rgba(30, 41, 59, 0.55)", 
            border: isActiveCell ? "2px solid #818cf8" : "1px solid rgba(99, 102, 241, 0.25)" 
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            {/* 1. Dept & Section Badge (e.g. III Mech A, I CSE B) */}
            <span style={{
              fontSize: "0.72rem",
              fontWeight: "800",
              color: "#38bdf8",
              background: "rgba(56, 189, 248, 0.12)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              padding: "2px 6px",
              borderRadius: "4px",
              letterSpacing: "0.2px",
              whiteSpace: "nowrap"
            }}>
              {deptSecBadge}
            </span>

            {/* 2. Course Code (e.g. 25EC504, 25CSI502) */}
            <span style={{
              fontWeight: "800",
              fontSize: "0.82rem",
              color: "#f8fafc",
              letterSpacing: "0.3px",
              marginTop: "2px"
            }}>
              {courseCode}
            </span>

            {/* 3. Course Name (Real Data) */}
            <span style={{
              fontSize: "0.68rem",
              fontWeight: "600",
              color: "#cbd5e1",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "115px"
            }}>
              {courseName}
            </span>

            {/* 4. Room Info */}
            <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", marginTop: "1px" }}>
              <i className="fa-solid fa-door-open" style={{ marginRight: "3px", color: "#818cf8" }}></i>{roomInfo}
            </span>
          </div>
        </td>
      );
    } else {
      return (
        <td key={period} style={{ ...cellStyle, background: "rgba(15, 23, 42, 0.2)" }}>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", fontStyle: "italic" }}>Free</div>
        </td>
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, color: "#fff" }}>📅 Weekly Teaching Schedule</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
            Overview of teaching slots, break periods, and department assignments.
          </p>
        </div>

        {timetableLoading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            Loading weekly teaching schedule...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="timetable-grid-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <thead>
                <tr>
                  <th style={hdrStyle}>Day</th>
                  <th style={hdrStyle}>P1<span className="time-sub" style={subHdrStyle}>8:15-9:15</span></th>
                  <th style={hdrStyle}>P2<span className="time-sub" style={subHdrStyle}>9:15-10:15</span></th>
                  <th style={{ ...hdrStyle, background: "rgba(31, 41, 55, 0.35)", minWidth: "40px" }}>Break<span className="time-sub" style={subHdrStyle}>10:15-10:45</span></th>
                  <th style={hdrStyle}>P3<span className="time-sub" style={subHdrStyle}>10:45-11:45</span></th>
                  <th style={hdrStyle}>P4<span className="time-sub" style={subHdrStyle}>11:45-12:45</span></th>
                  <th style={{ ...hdrStyle, background: "rgba(31, 41, 55, 0.35)", minWidth: "40px" }}>Lunch<span className="time-sub" style={subHdrStyle}>12:45-1:45</span></th>
                  <th style={hdrStyle}>P5<span className="time-sub" style={subHdrStyle}>1:45-2:45</span></th>
                  <th style={hdrStyle}>P6<span className="time-sub" style={subHdrStyle}>2:45-3:45</span></th>
                </tr>
              </thead>
              <tbody>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <tr key={day}>
                    <td style={{ fontWeight: 700, color: "#f1f5f9", background: "rgba(30, 41, 59, 0.4)", padding: "12px 8px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", minWidth: "90px" }}>
                      {day}
                    </td>
                    {[1, 2].map(p => renderFacultyGridCell(day, p))}
                    <td style={breakCellStyle}>Short Break</td>
                    {[3, 4].map(p => renderFacultyGridCell(day, p))}
                    <td style={breakCellStyle}>Lunch Break</td>
                    {[5, 6].map(p => renderFacultyGridCell(day, p))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

const hdrStyle = {
  background: "rgba(31, 41, 55, 0.6)",
  color: "#f1f5f9",
  fontWeight: "600",
  padding: "12px 8px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  minWidth: "100px",
  textAlign: "center"
};

const subHdrStyle = {
  display: "block",
  fontSize: "0.65rem",
  color: "#94a3b8",
  fontWeight: "normal",
  marginTop: "4px"
};

const breakCellStyle = {
  background: "rgba(31, 41, 55, 0.25)",
  color: "#64748b",
  fontSize: "0.75rem",
  fontStyle: "italic",
  maxWidth: "35px",
  writingMode: "vertical-rl",
  textOrientation: "mixed",
  letterSpacing: "2px",
  fontWeight: "600",
  borderLeft: "1px dashed rgba(255, 255, 255, 0.1)",
  borderRight: "1px dashed rgba(255, 255, 255, 0.1)",
  textAlign: "center",
  padding: "12px 8px"
};

export default FacultyScheduleView;
