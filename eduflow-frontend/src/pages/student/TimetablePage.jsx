import React, { useState, useEffect } from "react";
import { getStudentTimetable, getCurrentClassStatus } from "../../services/timetableService";
import SimulationControl from "../../components/SimulationControl";

const PERIOD_DETAILS = [
  { num: 1, label: "Period 1", time: "08:15 - 09:15" },
  { num: 2, label: "Period 2", time: "09:15 - 10:15" },
  { num: 3, label: "Period 3", time: "10:45 - 11:45" },
  { num: 4, label: "Period 4", time: "11:45 - 12:45" },
  { num: 5, label: "Period 5", time: "13:45 - 14:45" },
  { num: 6, label: "Period 6", time: "14:45 - 15:45" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function TimetablePage() {
  const token = localStorage.getItem("token");
  const [timetableData, setTimetableData] = useState([]);
  const [currentClassStatus, setCurrentClassStatus] = useState(null);
  const [simParams, setSimParams] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate unique subjects for reference panel
  const subjectMappingInfo = {
    "AGAI": { code: "AGAI", name: "Agentic AI", staff: "Mrs. Divya" },
    "SE": { code: "SE", name: "Software Engineering", staff: "Mr. Vimit Varghesse" },
    "DTF": { code: "DTF", name: "Design Thinking Fundamentals", staff: "Mr. Sreeraj" },
    "DCN": { code: "DCN", name: "Data Communication Networks", staff: "Mr. Pradeep" },
  };

  const uniqueSubjects = [];
  const seen = new Set();
  if (timetableData && Array.isArray(timetableData)) {
    timetableData.forEach(entry => {
      if (entry.subject && !seen.has(entry.subject)) {
        seen.add(entry.subject);
        const codeUpper = entry.subject.toUpperCase().trim();
        const details = subjectMappingInfo[codeUpper] || {
          code: entry.subject,
          name: entry.subject === "OS" ? "Operating Systems" :
            entry.subject === "DSA" ? "Data Structures & Algorithms" :
              entry.subject === "DBMS" ? "Database Management Systems" :
                entry.subject === "COA" ? "Computer Organization & Architecture" :
                  entry.subject === "OOPs" ? "Object Oriented Programming" :
                    entry.subject === "WebTech" ? "Web Technology" : entry.subject,
          staff: entry.faculty?.name || "Unassigned"
        };
        uniqueSubjects.push(details);
      }
    });
    uniqueSubjects.sort((a, b) => a.code.localeCompare(b.code));
  }

  const fetchTimetableAndStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const timetableRes = await getStudentTimetable(token);
      setTimetableData(timetableRes.data || []);

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

  const getSubject = (day, periodNum) => {
    const entry = timetableData.find(
      (e) => e.dayOfWeek?.toLowerCase() === day.toLowerCase() && e.period === periodNum
    );
    return entry?.subject?.trim() || "";
  };

  const isActiveCell = (day, periodNum) =>
    currentClassStatus &&
    currentClassStatus.status === "CLASS" &&
    currentClassStatus.periodNumber === periodNum &&
    (simParams?.simulatedDay
      ? simParams.simulatedDay.toLowerCase() === day.toLowerCase()
      : new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day.toLowerCase());

  const todayName = simParams?.simulatedDay ||
    new Date().toLocaleDateString("en-US", { weekday: "long" });

  const PERIODS = [
    { num: 1, roman: "I",   time: "8:15 – 9:15 AM" },
    { num: 2, roman: "II",  time: "9:15 – 10:15 AM" },
    { num: 3, roman: "III", time: "10:45 – 11:45 AM" },
    { num: 4, roman: "IV",  time: "11:45 AM – 12:45 PM" },
    { num: 5, roman: "V",   time: "1:45 – 2:45 PM" },
    { num: 6, roman: "VI",  time: "2:45 – 3:45 PM" },
  ];

  const tdBase = {
    border: "1px solid var(--card-border)",
    padding: "12px 14px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "0.85rem",
    color: "var(--text-main)",
  };

  const breakTd = {
    ...tdBase,
    background: "rgba(10,15,30,0.25)",
    width: "32px",
    padding: "0",
    writingMode: "vertical-rl",
    textOrientation: "mixed",
    fontSize: "0.65rem",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-full pb-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-1">Class Timetable</h2>
        <p className="text-slate-400 text-sm">IV M.Tech CSE — Weekly Schedule</p>
      </div>


      {/* Main Timetable Card */}
      <div className="glass-card rounded-2xl p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ background: "rgba(30,41,59,0.3)" }}>
                {/* Period\Day diagonal header */}
                <th style={{ ...tdBase, width: "90px", background: "rgba(15,23,42,0.3)", position: "relative", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.7rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                    <span style={{ alignSelf: "flex-end", fontSize: "0.65rem", color: "var(--text-muted)" }}>Period</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Day ↙</span>
                  </div>
                </th>
                {/* P1, P2 */}
                {PERIODS.slice(0, 2).map(p => (
                  <th key={p.num} style={{ ...tdBase, color: "var(--text-main)", fontWeight: "700", minWidth: "100px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "800" }}>{p.roman}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "3px" }}>{p.time}</div>
                  </th>
                ))}
                {/* BREAK header — shows time vertically */}
                <th style={{ ...breakTd, background: "rgba(10,15,30,0.3)", color: "var(--text-muted)", border: "1px solid var(--card-border)" }}>
                  10:15 – 10:45
                </th>
                {/* P3, P4 */}
                {PERIODS.slice(2, 4).map(p => (
                  <th key={p.num} style={{ ...tdBase, color: "var(--text-main)", fontWeight: "700", minWidth: "100px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "800" }}>{p.roman}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "3px" }}>{p.time}</div>
                  </th>
                ))}
                {/* LUNCH header — shows time vertically */}
                <th style={{ ...breakTd, background: "rgba(10,15,30,0.3)", color: "var(--text-muted)", border: "1px solid var(--card-border)" }}>
                  12:45 – 1:45
                </th>
                {/* P5, P6 */}
                {PERIODS.slice(4, 6).map(p => (
                  <th key={p.num} style={{ ...tdBase, color: "var(--text-main)", fontWeight: "700", minWidth: "100px" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: "800" }}>{p.roman}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: "500", marginTop: "3px" }}>{p.time}</div>
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
                  const isFreeActivity = entry && entry.subject === "FREE_ACTIVITY";
                  
                  let displayVal = null;
                  if (entry && entry.subject) {
                    if (isFreeActivity) {
                      displayVal = (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: "700", color: "#10b981", fontSize: "0.85rem" }}>FREE</span>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "500" }}>{entry.activityName || "Activity"}</span>
                        </div>
                      );
                    } else {
                      displayVal = (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: "700", color: active ? "var(--primary)" : "var(--text-main)", fontSize: "0.85rem" }}>{entry.subject}</span>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: "500" }}>
                            {entry.room?.roomCode || "Lab 2"} · {entry.faculty?.name?.split(" ").slice(-1)[0] || "Staff"}
                          </span>
                        </div>
                      );
                    }
                  }

                  let cellBg = active ? "rgba(99,102,241,0.12)" : rowBg;
                  let borderStyle = "1px solid var(--card-border)";
                  if (isFreeActivity) {
                    cellBg = active ? "rgba(99,102,241,0.18)" : "rgba(16, 185, 129, 0.04)";
                    borderStyle = "1px dashed rgba(16, 185, 129, 0.2)";
                  }

                  return (
                    <td key={periodNum} style={{
                      ...tdBase,
                      background: cellBg,
                      border: borderStyle,
                      boxShadow: active ? "inset 0 0 12px rgba(99,102,241,0.1)" : "none",
                      padding: "12px 10px",
                      position: "relative",
                    }}>
                      {active && (
                        <span style={{ position: "absolute", top: "4px", right: "5px", width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                      )}
                      {displayVal || <span style={{ color: "rgba(255,255,255,0.05)", fontSize: "0.75rem" }}>—</span>}
                    </td>
                  );
                };

                return (
                  <tr key={day}>
                    <td style={{ ...tdBase, fontWeight: "700", color: isToday ? "var(--primary)" : "var(--text-main)", background: isToday ? "rgba(99,102,241,0.04)" : "rgba(15,23,42,0.1)", borderLeft: isToday ? "3px solid var(--primary)" : "1px solid var(--card-border)", fontSize: "0.8rem", textAlign: "left", paddingLeft: "12px" }}>
                      {day.slice(0, 3).toUpperCase()}
                      {isToday && <span style={{ display: "block", fontSize: "0.55rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>Today</span>}
                    </td>
                    {renderCell(1)}
                    {renderCell(2)}
                    {/* BREAK — single rowSpan cell in first row only, spans all 5 day rows */}
                    {isFirstRow && (
                      <td rowSpan={DAYS.length} style={{
                        ...breakTd,
                        background: "rgba(10,15,30,0.15)",
                        verticalAlign: "middle",
                        textAlign: "center",
                        padding: "0 4px",
                      }}>BREAK</td>
                    )}
                    {renderCell(3)}
                    {renderCell(4)}
                    {/* LUNCH BREAK — single rowSpan cell in first row only */}
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

        {/* Course Reference Table — matching image layout */}
        {uniqueSubjects.length > 0 && (
          <div style={{ marginTop: "2rem", borderTop: "1px solid var(--card-border)", paddingTop: "1.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "rgba(30,41,59,0.15)", borderBottom: "1px solid var(--card-border)" }}>
                  <th style={{ ...tdBase, width: "42px", color: "var(--text-muted)", fontWeight: "700" }}>S.</th>
                  <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Code / Acronym</th>
                  <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Course Title</th>
                  <th style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)", fontWeight: "700" }}>Name of the Staff</th>
                  <th style={{ ...tdBase, color: "var(--text-muted)", fontWeight: "700" }}>Total No. of Periods</th>
                </tr>
              </thead>
              <tbody>
                {uniqueSubjects.map((sub, idx) => {
                  const count = timetableData.filter(
                    e => e.subject?.trim().toUpperCase() === sub.code.toUpperCase()
                  ).length;
                  return (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--card-border)", background: idx % 2 === 0 ? "rgba(15,23,42,0.05)" : "transparent" }}>
                      <td style={{ ...tdBase, color: "var(--text-muted)" }}>{idx + 1}</td>
                      <td style={{ ...tdBase, textAlign: "left", fontWeight: "800", color: "var(--primary)", letterSpacing: "0.04em" }}>{sub.code}</td>
                      <td style={{ ...tdBase, textAlign: "left", color: "var(--text-main)" }}>{sub.name}</td>
                      <td style={{ ...tdBase, textAlign: "left", color: "var(--text-muted)" }}>{sub.staff}</td>
                      <td style={{ ...tdBase, color: count > 0 ? "var(--text-main)" : "var(--text-muted)", fontWeight: count > 0 ? "700" : "400" }}>{count > 0 ? count : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimetablePage;



