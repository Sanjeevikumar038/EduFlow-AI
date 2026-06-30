import React from "react";

function AnalyticsCard({ title, score, status, maxScore = 100, icon = "📊", subText = "", onClick = null }) {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  // Determine status color based on status text or percentage
  const getStatusColors = () => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("excellent") || statusLower.includes("best") || percentage >= 95) {
      return {
        text: "var(--success)",
        bg: "rgba(16, 185, 129, 0.1)",
        border: "rgba(16, 185, 129, 0.2)",
        progress: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
        shadow: "0 0 10px rgba(16, 185, 129, 0.2)"
      };
    } else if (statusLower.includes("good") || percentage >= 85) {
      return {
        text: "var(--primary)",
        bg: "rgba(99, 102, 241, 0.1)",
        border: "rgba(99, 102, 241, 0.2)",
        progress: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
        shadow: "0 0 10px rgba(99, 102, 241, 0.2)"
      };
    } else if (statusLower.includes("average") || percentage >= 75) {
      return {
        text: "var(--warning)",
        bg: "rgba(245, 158, 11, 0.1)",
        border: "rgba(245, 158, 11, 0.2)",
        progress: "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
        shadow: "0 0 10px rgba(245, 158, 11, 0.2)"
      };
    } else {
      return {
        text: "var(--error)",
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.2)",
        progress: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
        shadow: "0 0 10px rgba(239, 68, 68, 0.2)"
      };
    }
  };

  const colors = getStatusColors();

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(30, 41, 59, 0.45)",
        border: `1px solid ${colors.border}`,
        borderRadius: "16px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        minWidth: "220px",
        flex: "1 1 240px",
      }}
      className="analytics-card-hover"
    >
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-30px",
          width: "100px",
          height: "100px",
          background: `radial-gradient(circle, ${colors.bg} 0%, transparent 70%)`,
          pointerEvents: "none"
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>{icon}</span>
          <span style={{ fontWeight: "600", color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {title}
          </span>
        </div>
        {status && (
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: "700",
              color: colors.text,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              padding: "0.25rem 0.6rem",
              borderRadius: "20px",
              textTransform: "uppercase"
            }}
          >
            {status}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "2.25rem", fontWeight: "800", color: "#fff", fontFamily: "var(--font-heading)" }}>
          {typeof score === "number" ? `${score.toFixed(1)}%` : score}
        </span>
      </div>

      <div style={{ width: "100%", marginTop: "auto" }}>
        <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.5rem" }}>
          <div
            style={{
              height: "100%",
              width: `${percentage}%`,
              background: colors.progress,
              borderRadius: "3px",
              boxShadow: colors.shadow,
              transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          />
        </div>
        {subText && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>
            {subText}
          </span>
        )}
      </div>
    </div>
  );
}

export default AnalyticsCard;
