import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";
import { Link } from "react-router-dom";

function InterviewCard() {
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

  const score    = data?.interviewScore ? Math.round(data.interviewScore * 4) : 0;
  const sessions = data?.totalMockSessions ?? 0;
  const best     = data?.bestInterviewScore ?? 0;
  const streak   = data?.interviewStreak ?? 0;
  const caption  = sessions === 0 ? "No sessions yet" : `${sessions} session${sessions > 1 ? "s" : ""}`;

  return (
    <Link 
      to="/student/interview"
      className="premium-card block"
      style={{ minHeight: "160px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
    >
      {/* Top Row: Info + Icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            AI Interview
          </span>
          <h3 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-main)", lineHeight: "1.1", marginTop: "0.25rem" }}>
            {score}%
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "inline-block" }}>
            {caption}
          </span>
        </div>

        {/* Blue Icon Tile */}
        <div className="icon-tile icon-tile-blue">
          <span style={{ fontSize: "1.25rem" }}>🎤</span>
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
              background: "#3b82f6", /* Blue progress bar */
              transition: "width 1.2s ease-out" 
            }} 
          />
        </div>
      </div>

      {/* Bottom: 2 Counters */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[
          { label: "Best", val: `${best}%`, color: "#34d399" },
          { label: "Streak", val: `${streak} 🔥`, color: "#fbbf24" },
        ].map((item, idx) => (
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
            <p style={{ fontSize: "0.55rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}

export default InterviewCard;

