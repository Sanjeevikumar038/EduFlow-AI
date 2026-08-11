import React, { useState, useEffect } from "react";
import { getStudentTimetable, getCurrentClassStatus } from "../../services/timetableService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const PERIODS = [
  { num: 1, label: "P1", time: "8:45 – 9:40 AM" },
  { num: 2, label: "P2", time: "9:40 – 10:35 AM" },
  { num: 3, label: "P3", time: "10:50 – 11:45 AM" },
  { num: 4, label: "P4", time: "11:45 AM – 12:40 PM" },
  { num: 5, label: "P5", time: "1:30 – 2:25 PM" },
  { num: 6, label: "P6", time: "2:25 – 3:20 PM" },
];

function TimetablePage() {
  const token = localStorage.getItem("token");
  const studentDept = localStorage.getItem("department") || "Department of Computer Science and Engineering";
  const studentSem = Number(localStorage.getItem("semester")) || 3;
  const studentSec = localStorage.getItem("section") || "A";

  const [timetableData, setTimetableData] = useState([]);
  const [currentClassStatus, setCurrentClassStatus] = useState(null);
  const [simParams, setSimParams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);

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

  const formatDeptYearSec = (dept, sem, sec) => {
    const roman = getRomanYear(sem);
    const rawDept = (dept || "").trim();
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
    return `${roman} ${shortDept} ${sec || "A"}`;
  };

  // Derive department/sem/sec from loaded timetable if present, else fallback to localStorage
  const activeDept = timetableData[0]?.department || studentDept;
  const activeSem = timetableData[0]?.semester || studentSem;
  const activeSec = timetableData[0]?.section || studentSec;

  const classBadge = formatDeptYearSec(activeDept, activeSem, activeSec);
  const classYear = getYearFromSem(activeSem);

  // Extract unique valid subjects for reference panel (excluding LIBRARY_STUDY/FREE_ACTIVITY)
  const uniqueSubjects = [];
  const seen = new Set();
  if (timetableData && Array.isArray(timetableData)) {
    timetableData.forEach(entry => {
      const code = entry.courseCode || entry.subject;
      if (code && code !== "LIBRARY_STUDY" && code !== "FREE_ACTIVITY" && !seen.has(code)) {
        seen.add(code);
        const name = entry.subjectName || entry.subject || "Course Subject";
        uniqueSubjects.push({
          code: code,
          abbr: getSubjectAbbreviation(code, name),
          name: name,
          staff: entry.faculty?.name || entry.facultyName || "Course Instructor",
          staffDept: entry.faculty?.department || activeDept,
          room: entry.room ? (entry.room.roomCode || entry.room.roomName) : "Classroom"
        });
      }
    });
    uniqueSubjects.sort((a, b) => a.abbr.localeCompare(b.abbr));
  }

  const fetchTimetableAndStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const timetableRes = await getStudentTimetable(token);
      setTimetableData(Array.isArray(timetableRes.data) ? timetableRes.data : []);

      const statusRes = await getCurrentClassStatus(simParams, token);
      setCurrentClassStatus(statusRes.data);
    } catch (err) {
      console.error("Error fetching student timetable/status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableAndStatus();
    if (!simParams && token) {
      const interval = setInterval(() => {
        getCurrentClassStatus(null, token)
          .then((res) => setCurrentClassStatus(res.data))
          .catch((err) => console.error(err));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token, simParams]);

  const isActiveCell = (day, periodNum) =>
    currentClassStatus &&
    currentClassStatus.status === "CLASS" &&
    currentClassStatus.periodNumber === periodNum &&
    (simParams?.simulatedDay
      ? simParams.simulatedDay.toLowerCase() === day.toLowerCase()
      : new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day.toLowerCase());

  const todayName = simParams?.simulatedDay ||
    new Date().toLocaleDateString("en-US", { weekday: "long" });

  const tdBase = {
    border: "1px solid var(--card-border)",
    padding: "10px 8px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "0.85rem",
    color: "var(--text-main)",
  };

  const breakTd = {
    ...tdBase,
    background: "rgba(10,15,30,0.25)",
    width: "36px",
    padding: "0",
    writingMode: "vertical-rl",
    textOrientation: "mixed",
    fontSize: "0.68rem",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-full pb-8">
      
      {/* ── Header ── */}
      <div className="glass-card p-6 rounded-2xl" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.35rem" }}>
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
              {classBadge}
            </span>
            <h2 className="text-2xl font-bold text-white mb-0" style={{ margin: 0 }}>
              Class Timetable
            </h2>
          </div>
          <p className="text-slate-400 text-sm" style={{ margin: 0 }}>
            {classYear} • Section {activeSec} • {activeDept}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => window.print()}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--card-border)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <i className="fa-solid fa-print"></i> Print Schedule
          </button>
        </div>
      </div>

      {/* ── Main Timetable Card ── */}
      <div className="glass-card rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: "var(--primary)", marginBottom: "0.75rem" }}></i>
            <p>Loading your weekly class schedule...</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
              <thead>
                <tr style={{ background: "rgba(30,41,59,0.4)" }}>
                  <th style={{ ...tdBase, width: "100px", background: "rgba(15,23,42,0.5)", fontWeight: "700", color: "#f8fafc", fontSize: "0.8rem" }}>
                    Day / Period
                  </th>

                  {/* P1, P2 */}
                  {PERIODS.slice(0, 2).map(p => (
                    <th key={p.num} style={{ ...tdBase, color: "var(--text-main)", fontWeight: "700", minWidth: "120px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--primary)" }}>{p.label}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px" }}>{p.time}</div>
                    </th>
                  ))}

                  {/* Short Break */}
                  <th style={{ ...breakTd, background: "rgba(10,15,30,0.3)", color: "var(--text-muted)", border: "1px solid var(--card-border)" }}>
                    Break (10:35–10:50)
                  </th>

                  {/* P3, P4 */}
                  {PERIODS.slice(2, 4).map(p => (
                    <th key={p.num} style={{ ...tdBase, color: "var(--text-main)", fontWeight: "700", minWidth: "120px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--primary)" }}>{p.label}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px" }}>{p.time}</div>
                    </th>
                  ))}

                  {/* Lunch Break */}
                  <th style={{ ...breakTd, background: "rgba(10,15,30,0.3)", color: "var(--text-muted)", border: "1px solid var(--card-border)" }}>
                    Lunch (12:40–1:30)
                  </th>

                  {/* P5, P6 */}
                  {PERIODS.slice(4, 6).map(p => (
                    <th key={p.num} style={{ ...tdBase, color: "var(--text-main)", fontWeight: "700", minWidth: "120px" }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--primary)" }}>{p.label}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px" }}>{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, i) => {
                  const isToday = todayName.toLowerCase() === day.toLowerCase();
                  const rowBg = isToday ? "rgba(99,102,241,0.04)" : i % 2 === 0 ? "rgba(15,23,42,0.1)" : "transparent";
                  const isFirstRow = i === 0;

                  const renderCell = (periodNum) => {
                    const entry = timetableData.find(
                      (e) => e.dayOfWeek?.toLowerCase() === day.toLowerCase() && e.period === periodNum
                    );
                    const active = isActiveCell(day, periodNum);
                    const isStudy = entry && (entry.subject === "LIBRARY_STUDY" || entry.subject === "FREE_ACTIVITY");
                    
                    if (!entry || !entry.subject || entry.subject.trim() === "" || isStudy) {
                      return (
                        <td key={periodNum} style={{ ...tdBase, background: rowBg, color: "rgba(255,255,255,0.2)", fontSize: "0.75rem", fontStyle: "italic", height: "76px" }}>
                          Free
                        </td>
                      );
                    }

                    const code = entry.courseCode || entry.subject;
                    const name = entry.subjectName || entry.subject;
                    const facName = entry.faculty?.name || entry.facultyName || "Course Instructor";
                    const subAbbr = getSubjectAbbreviation(code, name);
                    const roomInfo = entry.room ? (entry.room.roomCode || entry.room.roomName) : "Classroom";

                    const tooltipText = `Course Code: ${code}\nCourse: ${name}\nFaculty: ${facName}\nRoom: ${roomInfo}`;

                    return (
                      <td 
                        key={periodNum} 
                        style={{
                          ...tdBase,
                          background: active ? "rgba(99,102,241,0.14)" : (rowBg || "rgba(30, 41, 59, 0.4)"),
                          border: active ? "1px solid var(--primary)" : "1px solid var(--card-border)",
                          boxShadow: active ? "inset 0 0 12px rgba(99,102,241,0.15)" : "none",
                          padding: "10px 8px",
                          position: "relative",
                          cursor: "pointer",
                          height: "76px",
                          minWidth: "120px"
                        }}
                        title={tooltipText}
                        onClick={() => setSelectedCell(entry)}
                      >
                        {active && (
                          <span style={{ position: "absolute", top: "5px", right: "6px", width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" }} />
                        )}

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "4px" }}>
                          <span style={{
                            fontWeight: "800",
                            fontSize: "0.95rem",
                            color: active ? "#fff" : "#818cf8",
                            background: active ? "var(--primary)" : "rgba(99, 102, 241, 0.15)",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                            padding: "3px 10px",
                            borderRadius: "6px",
                            letterSpacing: "0.5px"
                          }}>
                            {subAbbr}
                          </span>
                          <span style={{
                            fontSize: "0.72rem",
                            color: "#cbd5e1",
                            fontWeight: "500",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "120px"
                          }}>
                            <i className="fa-solid fa-user-tie" style={{ fontSize: "0.65rem", marginRight: "4px", color: "var(--success)" }}></i>
                            {facName}
                          </span>
                        </div>
                      </td>
                    );
                  };

                  return (
                    <tr key={day}>
                      <td style={{ ...tdBase, fontWeight: "700", color: isToday ? "var(--primary)" : "#f8fafc", background: isToday ? "rgba(99,102,241,0.06)" : "rgba(15,23,42,0.4)", borderLeft: isToday ? "3px solid var(--primary)" : "1px solid var(--card-border)", fontSize: "0.82rem", textAlign: "center" }}>
                        {day}
                        {isToday && <span style={{ display: "block", fontSize: "0.55rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>Today</span>}
                      </td>
                      {renderCell(1)}
                      {renderCell(2)}
                      
                      {/* BREAK */}
                      {isFirstRow && (
                        <td rowSpan={DAYS.length} style={{
                          ...breakTd,
                          background: "rgba(10,15,30,0.15)",
                          verticalAlign: "middle",
                          textAlign: "center",
                          padding: "0 4px",
                        }}>SHORT BREAK</td>
                      )}
                      
                      {renderCell(3)}
                      {renderCell(4)}
                      
                      {/* LUNCH BREAK */}
                      {isFirstRow && (
                        <td rowSpan={DAYS.length} style={{
                          ...breakTd,
                          background: "rgba(10,15,30,0.15)",
                          verticalAlign: "middle",
                          textAlign: "center",
                          padding: "0 4px",
                        }}>LUNCH BREAK</td>
                      )}
                      
                      {renderCell(5)}
                      {renderCell(6)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Course & Faculty Reference Details Table ── */}
        {uniqueSubjects.length > 0 && (
          <div style={{ marginTop: "2.5rem", borderTop: "1px solid var(--card-border)", paddingTop: "1.5rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#fff", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fa-solid fa-list-check" style={{ color: "var(--primary)" }}></i>
              Course & Faculty Reference Details
            </h4>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "rgba(30,41,59,0.3)", borderBottom: "1px solid var(--card-border)", textAlign: "left" }}>
                    <th style={{ ...tdBase, width: "45px", color: "var(--text-muted)", fontWeight: "700" }}>S.No</th>
                    <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Subject / Acronym</th>
                    <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Course Code</th>
                    <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Course Title</th>
                    <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Name of the Staff</th>
                    <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Room / Lab</th>
                    <th style={{ ...tdBase, color: "var(--text-muted)", fontWeight: "700" }}>Weekly Periods</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueSubjects.map((sub, idx) => {
                    const count = timetableData.filter(
                      e => (e.courseCode?.trim().toUpperCase() === sub.code.toUpperCase()) || (e.subject?.trim().toUpperCase() === sub.code.toUpperCase())
                    ).length;
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--card-border)", background: idx % 2 === 0 ? "rgba(15,23,42,0.05)" : "transparent" }}>
                        <td style={{ ...tdBase, color: "var(--text-muted)" }}>{idx + 1}</td>
                        <td style={{ ...tdBase, textAlign: "left", fontWeight: "800", color: "#38bdf8", letterSpacing: "0.04em" }}>{sub.abbr}</td>
                        <td style={{ ...tdBase, textAlign: "left", fontWeight: "700", color: "var(--primary)" }}>{sub.code}</td>
                        <td style={{ ...tdBase, textAlign: "left", color: "#f8fafc", fontWeight: "500" }}>{sub.name}</td>
                        <td style={{ ...tdBase, textAlign: "left", color: "var(--success)", fontWeight: "600" }}>
                          <i className="fa-solid fa-user-tie" style={{ marginRight: "6px" }}></i>{sub.staff}
                        </td>
                        <td style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)" }}>{sub.room}</td>
                        <td style={{ ...tdBase, color: count > 0 ? "#38bdf8" : "var(--text-muted)", fontWeight: count > 0 ? "700" : "400" }}>{count > 0 ? `${count} Hrs` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Session Detail Modal ── */}
      {selectedCell && (
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
          onClick={() => setSelectedCell(null)}
        >
          <div 
            style={{
              background: "rgba(30, 41, 59, 0.95)",
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
                {classBadge}
              </span>
              <button 
                onClick={() => setSelectedCell(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ margin: "0 0 0.5rem 0", color: "#fff", fontSize: "1.15rem", fontWeight: "700" }}>
              {selectedCell.courseCode ? `${selectedCell.courseCode} — ` : ""}{selectedCell.subjectName || selectedCell.subject}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "1.25rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Day & Period:</span>
                <span style={{ color: "#fff", fontWeight: "700" }}>{selectedCell.dayOfWeek}, Period {selectedCell.period}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Faculty Member:</span>
                <span style={{ color: "var(--success)", fontWeight: "700" }}>
                  {selectedCell.faculty?.name || selectedCell.facultyName || "Course Instructor"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Assigned Room:</span>
                <span style={{ color: "#818cf8", fontWeight: "700" }}>
                  {selectedCell.room ? (selectedCell.room.roomCode || selectedCell.room.roomName) : "Classroom"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Department:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedCell.department || activeDept}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCell(null)}
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

export default TimetablePage;
