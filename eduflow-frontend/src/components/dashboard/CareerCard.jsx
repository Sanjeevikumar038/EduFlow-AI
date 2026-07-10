import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";
import { Link } from "react-router-dom";

function CareerCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getCareerDashboard(token)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl animate-pulse" style={{ height: "160px", background: "rgba(30,41,59,0.4)", border: "1px solid rgba(255,255,255,0.05)" }} />
    );
  }

  const score      = data?.overallCareerScore ?? 0;
  const status     = data?.status ?? "Needs Improvement";
  const attendance = data?.attendanceScore ?? 0;
  const resume     = data?.resumeScore ?? 0;
  const coding     = data?.codingScore ?? 0;
  const interview  = data?.interviewScore ?? 0;

  const components = [
    { label: "Attend", val: attendance, color: "#a78bfa" },
    { label: "Resume", val: resume,     color: "#60a5fa" },
    { label: "Coding", val: coding,     color: "#34d399" },
    { label: "Intrvw", val: interview,  color: "#fbbf24" },
  ];

  return (
    <Link 
      to="/student/career"
      className="premium-card block"
      style={{ minHeight: "160px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
    >
      {/* Top Row: Info + Icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Career Readiness
          </span>
          <h3 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-main)", lineHeight: "1.1", marginTop: "0.25rem" }}>
            {score}/100
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "inline-block" }}>
            {status}
          </span>
        </div>

        {/* Amber Icon Tile */}
        <div className="icon-tile icon-tile-amber">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      </div>

      {/* Middle: Progress Bar */}
      <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
        <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div 
            style={{ 
              height: "100%", 
              width: `${score}%`, 
              borderRadius: "999px", 
              background: "#fbbf24", /* Amber progress bar */
              transition: "width 1.2s ease-out" 
            }} 
          />
        </div>
      </div>

      {/* Bottom: 4 Breakdown Counters */}
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {components.map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              flex: 1, 
              textAlign: "center", 
              padding: "0.25rem", 
              borderRadius: "8px", 
              background: "var(--box-bg)", 
              border: "1px solid var(--box-border)" 
            }}
          >
            <p style={{ fontSize: "0.875rem", fontWeight: "700", color: item.color, margin: 0, lineHeight: "1" }}>
              {item.val}
            </p>
            <p style={{ fontSize: "0.55rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0", textTransform: "uppercase", letterSpacing: "0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}

export default CareerCard;

