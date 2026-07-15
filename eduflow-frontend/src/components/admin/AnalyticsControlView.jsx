import React from "react";

function StatCard({ title, value, status, icon, caption, progress, color }) {
  const badgeColor = color === "amber" ? "rgba(245, 158, 11, 0.15)" : "rgba(244, 63, 94, 0.15)";
  const badgeText = color === "amber" ? "var(--warning)" : "var(--error)";
  const barColor = color === "amber" ? "#f59e0b" : "#f43f5e";

  return (
    <div className="dashboard-card" style={{
      background: "rgba(30, 41, 59, 0.25)",
      border: "1px solid var(--card-border)",
      borderRadius: "16px",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      flex: "1 1 240px"
    }}>
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
          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: barColor, borderRadius: "999px" }} />
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{caption}</span>
      </div>
    </div>
  );
}

function AnalyticsControlView({ adminAnalytics, adminAnalyticsLoading }) {
  const recentActivities = [
    { id: 1, icon: <i className="fa-solid fa-user"></i>, title: "Faculty Account Created", details: "Dr. Sarah Connor registered under CSE department.", time: "5 mins ago" },
    { id: 2, icon: <i className="fa-solid fa-calendar-days"></i>, title: "Timetable Updated", details: "Timetable periods assigned for M.Tech CSE.", time: "1 hour ago" },
    { id: 3, icon: <i className="fa-solid fa-file-invoice"></i>, title: "OD Request Approved", details: "Approved student leave request for John Doe.", time: "2 hours ago" },
    { id: 4, icon: <i className="fa-solid fa-book"></i>, title: "New Subject Registered", details: "Subject 'Applied Generative AI' registered.", time: "1 day ago" },
    { id: 5, icon: <i className="fa-solid fa-gear"></i>, title: "System Maintenance", details: "Weekly database backup completed successfully.", time: "1 day ago" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      
      {/* Stat Cards Row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", width: "100%" }}>
        <StatCard
          title="Total Students"
          value={adminAnalytics?.totalStudents !== undefined ? `${(adminAnalytics.totalStudents * 1.0).toFixed(1)}%` : "78.0%"}
          status="TOTAL ACTIVE"
          icon={<i className="fa-solid fa-user-graduate"></i>}
          caption="System Student Count"
          progress={78}
          color="amber"
        />
        <StatCard
          title="Total Faculty"
          value={adminAnalytics?.totalFaculty !== undefined ? `${(adminAnalytics.totalFaculty * 1.0).toFixed(1)}%` : "19.0%"}
          status="TOTAL CONDUCTOR"
          icon={<i className="fa-solid fa-user"></i>}
          caption="System Faculty Count"
          progress={19}
          color="rose"
        />
        <StatCard
          title="Total Sessions"
          value={adminAnalytics?.totalSessions !== undefined ? `${(adminAnalytics.totalSessions * 1.0).toFixed(1)}%` : "0.0%"}
          status="CONDUCTED"
          icon={<i className="fa-solid fa-bolt"></i>}
          caption="Total Attendance Sessions"
          progress={0}
          color="rose"
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
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading comparisons...</div>
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
            {recentActivities.map(act => (
              <div key={act.id} style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                  {act.icon}
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
