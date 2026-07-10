import React, { useState, useEffect } from "react";
import { getStudentAnalytics } from "../../services/attendanceService";
import { Link as RouterLink } from "react-router-dom";

const SUBJECT_NAME_MAP = {
  "OS": "Operating Systems", 
  "DCN": "Data Comm. Networks",
  "PCD": "Parallel & Cloud Computing", 
  "AIES": "AI Expert Systems",
  "AGAI": "Agentic AI", 
  "SE": "Software Engineering",
  "DTF": "DTF",
  "CC LAB": "Cloud Computing Lab", 
  "AI LAB": "AI Lab",
  "DSA": "Data Structures & Algo", 
  "COA": "Computer Org. & Arch.",
  "DBMS": "Database Mgmt Systems", 
  "TOC": "Theory of Computation",
  "Java Lab": "Java Programming Lab", 
  "OOPs": "Object Oriented Prog.",
  "WebTech": "Web Technologies", 
  "Cloud": "Cloud Computing",
  "Web Lab": "Web Dev Lab", 
  "EDC": "Electronic Devices & Cir.",
  "DSP": "Digital Signal Processing", 
  "VLSI": "VLSI Design",
  "Embedded Lab": "Embedded Systems Lab",
};

function SubjectAttendanceCard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    getStudentAnalytics(token)
      .then(res => { 
        setSubjects(res.data?.subjectWiseAttendance || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="premium-card animate-pulse" style={{ height: "380px" }} />
    );
  }

  const getBarColor = (pct) => {
    if (pct >= 85) return "#10b981"; // Green
    if (pct >= 75) return "#3b82f6"; // Blue
    if (pct >= 65) return "#fbbf24"; // Amber
    return "#ef4444"; // Red
  };

  const subjectsCount = subjects.length;

  return (
    <div className="premium-card" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "380px", padding: 0 }}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--card-border)" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>Subject Attendance</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem", display: "inline-block" }}>
            {subjectsCount} subject{subjectsCount !== 1 ? "s" : ""} tracked
          </span>
        </div>
        {subjects.some(s => (s.attendancePercentage ?? 0) < 75) && (
          <span className="custom-badge custom-badge-red">
            ⚠ Low
          </span>
        )}
      </div>

      {/* Body Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }} className="custom-scrollbar">
        {subjectsCount === 0 ? (
          /* Empty State */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "220px", textAlign: "center" }}>
            {/* Centered bar-chart SVG icon */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1rem", opacity: 0.5 }}>
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>No data yet</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.25rem 0 0 0", maxWidth: "220px" }}>
              Attendance will appear after sessions are held
            </p>
          </div>
        ) : (
          /* List of tracked subjects */
          <div className="space-y-4">
            {subjects.map((item, idx) => {
              const pct = item.attendancePercentage ?? 0;
              const present = item.presentClasses ?? 0;
              const absent = item.absentClasses ?? 0;
              const total = present + absent;
              const subCode = item.subject || "";
              const displayName = SUBJECT_NAME_MAP[subCode] || subCode;
              const isLow = pct < 75;

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span 
                      style={{ fontSize: "0.825rem", fontWeight: "600", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}
                      title={displayName}
                    >
                      {displayName} {isLow && <span style={{ color: "#ef4444" }} title="Below threshold">⚠️</span>}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        {present}/{total}
                      </span>
                      <span style={{ fontSize: "0.825rem", fontWeight: "800", color: getBarColor(pct) }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div 
                      style={{ 
                        height: "100%", 
                        width: `${pct}%`, 
                        borderRadius: "999px", 
                        background: getBarColor(pct),
                        transition: "width 1.2s ease-out" 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--card-border)", textAlign: "center" }}>
        <RouterLink 
          to="/student/attendance" 
          style={{ fontSize: "0.75rem", fontWeight: "600", color: "#818cf8", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"}
          onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}
        >
          View detailed attendance →
        </RouterLink>
      </div>
    </div>
  );
}

export default SubjectAttendanceCard;

