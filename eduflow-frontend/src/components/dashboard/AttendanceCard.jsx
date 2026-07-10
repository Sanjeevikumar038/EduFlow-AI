import React, { useState, useEffect } from "react";
import { getStudentAnalytics } from "../../services/attendanceService";
import { Link } from "react-router-dom";

function AttendanceCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getStudentAnalytics(token)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl animate-pulse" style={{ height: "160px", background: "rgba(30,41,59,0.4)", border: "1px solid rgba(255,255,255,0.05)" }} />
    );
  }

  const percent = data?.overallAttendancePercentage !== undefined ? Math.round(data.overallAttendancePercentage) : 100;
  const present = data?.presentClasses ?? 0;
  const absent = data?.absentClasses ?? 0;
  const total = present + absent;
  const caption = total === 0 ? "No records yet" : `${present} / ${total} classes`;

  return (
    <Link 
      to="/student/attendance"
      className="premium-card block"
      style={{ minHeight: "160px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
    >
      {/* Top Row: Info + Icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Attendance
          </span>
          <h3 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-main)", lineHeight: "1.1", marginTop: "0.25rem" }}>
            {percent}%
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "inline-block" }}>
            {caption}
          </span>
        </div>

        {/* Indigo Icon Tile */}
        <div className="icon-tile icon-tile-indigo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="m9 14 2 2 4-4" />
          </svg>
        </div>
      </div>

      {/* Bottom: Progress Bar */}
      <div style={{ marginTop: "1rem" }}>
        <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div 
            style={{ 
              height: "100%", 
              width: `${percent}%`, 
              borderRadius: "999px", 
              background: "#4f46e5", /* Indigo progress bar */
              transition: "width 1.2s ease-out" 
            }} 
          />
        </div>
      </div>
    </Link>
  );
}

export default AttendanceCard;

