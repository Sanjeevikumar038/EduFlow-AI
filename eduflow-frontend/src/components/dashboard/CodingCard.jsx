import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";
import { Link } from "react-router-dom";

function CodingCard() {
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

  const solved = data?.totalCodingSolved ?? 0;
  const easy   = data?.easySolved ?? 0;
  const medium = data?.mediumSolved ?? 0;
  const hard   = data?.hardSolved ?? 0;
  const target = 50;
  const percent = Math.min((solved / target) * 100, 100);

  return (
    <Link 
      to="/student/coding"
      className="premium-card block"
      style={{ minHeight: "160px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
    >
      {/* Top Row: Info + Icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Coding Solved
          </span>
          <h3 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-main)", lineHeight: "1.1", marginTop: "0.25rem" }}>
            {solved}
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "inline-block" }}>
            Target: {target} problems
          </span>
        </div>

        {/* Green Icon Tile */}
        <div className="icon-tile icon-tile-green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
      </div>

      {/* Middle: Progress Bar */}
      <div style={{ marginTop: "0.75rem", marginBottom: "0.75rem" }}>
        <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div 
            style={{ 
              height: "100%", 
              width: `${percent}%`, 
              borderRadius: "999px", 
              background: "#10b981", /* Green progress bar */
              transition: "width 1.2s ease-out" 
            }} 
          />
        </div>
      </div>

      {/* Bottom: 3 Counters */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[
          { label: "Easy", val: easy, color: "#34d399" },
          { label: "Medium", val: medium, color: "#fbbf24" },
          { label: "Hard", val: hard, color: "#f87171" },
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

export default CodingCard;

