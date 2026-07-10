import React from "react";
import { Link } from "react-router-dom";

const ACTIONS = [
  { verb: "Mark",    label: "Attendance", icon: "📷", path: "/student/attendance" },
  { verb: "View",    label: "Timetable",  icon: "🗓", path: "/student/timetable" },
  { verb: "Solve",   label: "Coding",     icon: "💻", path: "/student/coding" },
  { verb: "Resume",  label: "Analysis",   icon: "📄", path: "/student/resume" },
  { verb: "Mock",    label: "Interview",  icon: "🎤", path: "/student/interview" },
  { verb: "Apply",   label: "Leave",      icon: "📝", path: "/student/leave" },
];

function QuickActions() {
  return (
    <div className="premium-card" style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>Quick Actions</h3>
        <span className="custom-badge custom-badge-gray">
          {ACTIONS.length} shortcuts
        </span>
      </div>

      {/* Grid: 6 columns on desktop, 3 on tablet, 2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map((action, idx) => (
          <Link
            key={idx}
            to={action.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              padding: "1.25rem 0.75rem",
              borderRadius: "12px",
              background: "var(--box-bg)",
              border: "1px solid var(--box-border)",
              textDecoration: "none",
              textAlign: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(79, 70, 229, 0.06)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--box-bg)";
              e.currentTarget.style.borderColor = "var(--box-border)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Indigo Icon Tile */}
            <div className="icon-tile icon-tile-indigo" style={{ width: "40px", height: "40px", borderRadius: "10px" }}>
              <span style={{ fontSize: "1.2rem" }}>{action.icon}</span>
            </div>

            <div>
              <p style={{ fontSize: "0.825rem", fontWeight: "700", color: "var(--text-main)", margin: 0, lineHeight: 1.1 }}>
                {action.verb}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.15rem 0 0 0", lineHeight: 1 }}>
                {action.label}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;

