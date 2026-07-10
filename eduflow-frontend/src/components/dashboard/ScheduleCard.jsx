import React, { useState, useEffect } from "react";
import { getCurrentClassStatus } from "../../services/timetableService";
import { Link } from "react-router-dom";

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

const FALLBACK_CLASSES = [
  { period: 1, subject: "DCN", startTime: "8:45 AM", endTime: "9:40 AM", facultyName: "Mr. Pradeep", isActive: false, isCompleted: false },
  { period: 2, subject: "SE", startTime: "9:40 AM", endTime: "10:35 AM", facultyName: "Mr. Vimit Varghese", isActive: false, isCompleted: false },
  { period: 3, subject: "DTF", startTime: "10:50 AM", endTime: "11:45 AM", facultyName: "Mr. Sreeraj", isActive: false, isCompleted: false },
  { period: 4, subject: "AGAI", startTime: "11:45 AM", endTime: "12:40 PM", facultyName: "Mrs. Divya", isActive: false, isCompleted: false },
  { period: 5, subject: "DCN", startTime: "1:40 PM", endTime: "2:35 PM", facultyName: "Mr. Pradeep", isActive: false, isCompleted: false },
  { period: 6, subject: "SE", startTime: "2:35 PM", endTime: "3:30 PM", facultyName: "Mr. Vimit Varghese", isActive: false, isCompleted: false },
];

function ScheduleCard() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setTimeline(FALLBACK_CLASSES);
      setIsFallback(true);
      setLoading(false);
      return;
    }
    getCurrentClassStatus(null, token)
      .then(res => {
        const tl = res.data?.todayTimeline || [];
        const classes = tl.filter(p => p.period > 0 && p.subject && p.subject !== "Free Hour" && p.subject !== "FREE_ACTIVITY");
        if (classes.length === 0) {
          setTimeline(FALLBACK_CLASSES);
          setIsFallback(true);
        } else {
          setTimeline(classes);
          setIsFallback(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setTimeline(FALLBACK_CLASSES);
        setIsFallback(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="premium-card animate-pulse" style={{ height: "380px" }} />
    );
  }

  const dayName = isFallback ? "Tuesday" : new Date().toLocaleDateString("en-US", { weekday: "long" });
  const totalClasses = timeline.length;

  return (
    <div className="premium-card" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "380px", padding: 0 }}>
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--card-border)" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>Today's Schedule</h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem", display: "inline-block" }}>{dayName}</span>
        </div>
        <span className="custom-badge custom-badge-indigo">
          {totalClasses} classes
        </span>
      </div>

      {/* Scrollable list of periods */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }} className="custom-scrollbar space-y-3">
        {timeline.map((item, idx) => {
          const subCode = item.subject || "";
          const displayName = SUBJECT_NAME_MAP[subCode] || subCode;
          const isLive = item.isActive;
          const isDone = item.isCompleted;
          
          let badgeText = "Soon";
          let badgeClass = "custom-badge-indigo";
          
          if (isLive) {
            badgeText = "Live";
            badgeClass = "custom-badge-green";
          } else if (isDone) {
            badgeText = "Done";
            badgeClass = "custom-badge-gray";
          }

          return (
            <div 
              key={idx} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                padding: "0.75rem 1rem", 
                borderRadius: "12px", 
                background: isLive ? "rgba(79, 70, 229, 0.08)" : "var(--box-bg)", 
                border: isLive ? "1px solid rgba(79, 70, 229, 0.25)" : "1px solid var(--box-border)",
                transition: "all 0.2s ease"
              }}
            >
              {/* Left: Dot + Period label + Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
                {/* Dot marker */}
                <span 
                  style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    backgroundColor: isLive ? "#10b981" : isDone ? "var(--text-muted)" : "#4f46e5",
                    flexShrink: 0
                  }} 
                />
                
                {/* Period label */}
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: isLive ? "var(--text-main)" : "var(--text-muted)", width: "24px", flexShrink: 0 }}>
                  P{item.period}
                </span>

                {/* Details */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: "700", color: "var(--text-main)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0" }}>
                    {item.startTime}–{item.endTime} {item.facultyName && `· ${item.facultyName}`}
                  </p>
                </div>
              </div>

              {/* Right: Badge */}
              <span className={`custom-badge ${badgeClass}`} style={{ flexShrink: 0, marginLeft: "0.5rem" }}>
                {badgeText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--card-border)", textAlign: "center" }}>
        <Link 
          to="/student/timetable" 
          style={{ fontSize: "0.75rem", fontWeight: "600", color: "#818cf8", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#a5b4fc"}
          onMouseLeave={e => e.currentTarget.style.color = "#818cf8"}
        >
          View full timetable →
        </Link>
      </div>
    </div>
  );
}

export default ScheduleCard;

