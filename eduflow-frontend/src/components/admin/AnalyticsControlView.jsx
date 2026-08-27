import React from "react";

function StatCard({ title, value, status, icon, caption, progress, color, loading }) {
  const badgeColor = color === "amber" ? "rgba(245, 158, 11, 0.15)" : color === "emerald" ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)";
  const badgeText = color === "amber" ? "var(--warning)" : color === "emerald" ? "var(--success)" : "var(--error)";
  const barColor = color === "amber" ? "#f59e0b" : color === "emerald" ? "#10b981" : "#f43f5e";

  return (
    <div className="dashboard-card" style={{
      background: "rgba(30, 41, 59, 0.25)",
      border: "1px solid var(--card-border)",
      borderRadius: "16px",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      flex: "1 1 240px",
      position: "relative"
    }}>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)" }}></div>
              <div style={{ width: "100px", height: "16px", borderRadius: "4px", background: "rgba(255,255,255,0.1)" }}></div>
            </div>
            <div style={{ width: "60px", height: "16px", borderRadius: "999px", background: "rgba(255,255,255,0.1)" }}></div>
          </div>
          <div>
            <div style={{ width: "80px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", marginTop: "0.5rem" }}></div>
          </div>
          <div>
            <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "999px", marginBottom: "0.5rem" }}></div>
            <div style={{ width: "120px", height: "12px", borderRadius: "4px", background: "rgba(255,255,255,0.1)" }}></div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.95rem" }}>{title}</span>
            </div>
            <span style={{
              fontSize: "0.7rem",
              fontWeight: "800",
              color: badgeText,
              backgroundColor: badgeColor,
              padding: "2px 8px",
              borderRadius: "999px",
              textTransform: "uppercase"
            }}>
              {status}
            </span>
          </div>
          <div>
            <span style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
              {value}
            </span>
          </div>
          <div>
            <div style={{ height: "6px", width: "100%", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden", marginBottom: "0.5rem" }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: barColor, borderRadius: "999px" }} />
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{caption}</span>
          </div>
        </>
      )}
    </div>
  );
}

function AnalyticsControlView({ adminAnalytics, adminAnalyticsLoading }) {
  // Use real recent activities from backend, or clean fallback
  const activitiesList = (adminAnalytics?.recentActivities && adminAnalytics.recentActivities.length > 0)
    ? adminAnalytics.recentActivities
    : [
        { id: "act-1", title: "System Initialized", details: "EduFlow Analytics engine active", time: "Just now", iconType: "user" }
      ];

  const getIcon = (iconType) => {
    switch (iconType) {
      case "session":
        return <i className="fa-solid fa-bolt" style={{ color: "#10b981" }}></i>;
      case "leave":
        return <i className="fa-solid fa-file-invoice" style={{ color: "#f59e0b" }}></i>;
      case "user":
      default:
        return <i className="fa-solid fa-user-graduate" style={{ color: "#6366f1" }}></i>;
    }
  };

  const totalStud = adminAnalytics?.totalStudents ?? 0;
  const totalFac = adminAnalytics?.totalFaculty ?? 0;
  const totalSess = adminAnalytics?.totalSessions ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      
      {/* Stat Cards Row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", width: "100%" }}>
        <StatCard
          title="Total Students"
          value={`${totalStud}`}
          status="TOTAL ACTIVE"
          icon={<i className="fa-solid fa-user-graduate"></i>}
          caption="Registered Students Count"
          progress={totalStud ? Math.min(100, totalStud) : 0}
          color="emerald"
          loading={adminAnalyticsLoading}
        />
        <StatCard
          title="Total Faculty"
          value={`${totalFac}`}
          status="TOTAL CONDUCTORS"
          icon={<i className="fa-solid fa-user"></i>}
          caption="Faculty & Instructors Count"
          progress={totalFac ? Math.min(100, totalFac * 5) : 0}
          color="amber"
          loading={adminAnalyticsLoading}
        />
        <StatCard
          title="Total Sessions"
          value={`${totalSess}`}
          status="CONDUCTED"
          icon={<i className="fa-solid fa-bolt"></i>}
          caption="Total Attendance Sessions"
          progress={totalSess ? Math.min(100, totalSess * 10) : 0}
          color="rose"
          loading={adminAnalyticsLoading}
        />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
        
        {/* Department-wise breakdown */}
        <div className="dashboard-card" style={{ flex: "2 1 500px", background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
            📋 Department-wise Breakdown
          </h3>
          {adminAnalyticsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ width: "40%", height: "16px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}></div>
                    <div style={{ width: "10%", height: "16px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "999px", height: "6px" }}></div>
                    <div style={{ width: "20%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "4px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {adminAnalytics?.departmentComparison && adminAnalytics.departmentComparison.length > 0 ? (
                adminAnalytics.departmentComparison.map((d, idx) => {
                  const barWidth = Math.min(100, d.averageAttendance || 0);
                  return (
                    <div key={idx} style={{ paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                        <span style={{ fontWeight: "600", color: "var(--primary)" }}>{d.department}</span>
                        <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{d.averageAttendance?.toFixed(1)}%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${barWidth}%`, height: "100%", background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)", borderRadius: "999px" }} />
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                          {d.totalStudents} students · {d.totalSessions} sessions
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontStyle: "italic" }}>No records found.</div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card" style={{ flex: "1 1 350px", background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
            ⚡ Recent Activity
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {activitiesList.map(act => (
              <div key={act.id} style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                  {getIcon(act.iconType)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>{act.title}</h5>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{act.details}</p>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AnalyticsControlView;
