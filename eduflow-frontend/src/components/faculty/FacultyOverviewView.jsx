import React from "react";

function StatCard({ title, value, status, icon, caption, progress, color }) {
  const badgeColor = "rgba(244, 63, 94, 0.15)";
  const badgeText = "var(--error)";
  const barColor = "#f43f5e";

  return (
    <div className="dashboard-card" style={{
      background: "rgba(30, 41, 59, 0.25)",
      border: "1px solid var(--card-border)",
      borderRadius: "16px",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      flex: "1 1 220px"
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

const formatDeptSemSec = (department, semester, section) => {
  const sem = Number(semester) || 1;
  const romanMap = {
    1: "I", 2: "II", 3: "III", 4: "IV",
    5: "V", 6: "VI", 7: "VII", 8: "VIII",
    9: "IX", 10: "X"
  };
  const romanSem = romanMap[sem] || `${sem}`;

  const rawDept = (department || "").trim();
  const upper = rawDept.toUpperCase();
  let shortDept = "Dept";
  if (upper.includes("MTECH") || upper.includes("M.TECH")) shortDept = "M.Tech CSE";
  else if (upper.includes("ARTIFICIAL INTELLIGENCE") || upper.includes("AI & DATA") || upper.includes("AIDS") || upper.includes("AI&DS")) shortDept = "AI&DS";
  else if (upper.includes("BUSINESS SYSTEMS") || upper.includes("CSBS")) shortDept = "CSBS";
  else if (upper.includes("CYBER SECURITY") || upper.includes("CSY")) shortDept = "CSY";
  else if (upper.includes("DESIGN") || upper.includes("CSD")) shortDept = "CSD";
  else if (upper.includes("MECHANICAL") || upper.includes("MECH")) shortDept = "Mech";
  else if (upper.includes("CIVIL")) shortDept = "Civil";
  else if (upper.includes("ELECTRICAL AND ELECTRONICS") || upper.includes("EEE")) shortDept = "EEE";
  else if (upper.includes("ELECTRONICS") || upper.includes("ECE")) shortDept = "ECE";
  else if (upper.includes("INFORMATION TECH") || upper.includes("IT")) shortDept = "IT";
  else if (upper.includes("COMPUTER SCIENCE") || upper.includes("CSE")) shortDept = "CSE";
  else if (upper.includes("MANAGEMENT") || upper.includes("MBA")) shortDept = "MBA";
  else {
    shortDept = rawDept.replace(/Department of\s*/i, "").trim();
  }

  const sec = (section && section.trim() !== "") ? section.trim().toUpperCase() : "A";
  return `${romanSem} ${shortDept} ${sec}`;
};

function FacultyOverviewView({ facultyAnalytics, facultyAnalyticsLoading, currentClassStatus, timetableLoading, sessions }) {
  // Extract real metrics if loaded, else use defaults
  const totalStudents = facultyAnalytics?.totalStudents !== undefined ? `${(facultyAnalytics.totalStudents * 1.0).toFixed(1)}%` : "63.0%";
  const presentToday = facultyAnalytics?.presentToday !== undefined ? `${(facultyAnalytics.presentToday * 1.0).toFixed(1)}%` : "0.0%";
  const absentToday = facultyAnalytics?.absentToday !== undefined ? `${(facultyAnalytics.absentToday * 1.0).toFixed(1)}%` : "0.0%";
  const avgAttendance = facultyAnalytics?.avgAttendance !== undefined ? `${(facultyAnalytics.avgAttendance * 1.0).toFixed(1)}%` : "0.0%";

  const progressTotal = facultyAnalytics?.totalStudents !== undefined ? Math.min(100, Math.round(facultyAnalytics.totalStudents)) : 63;
  const progressPresent = facultyAnalytics?.presentToday !== undefined ? Math.min(100, Math.round(facultyAnalytics.presentToday)) : 0;
  const progressAbsent = facultyAnalytics?.absentToday !== undefined ? Math.min(100, Math.round(facultyAnalytics.absentToday)) : 0;
  const progressAvg = facultyAnalytics?.avgAttendance !== undefined ? Math.min(100, Math.round(facultyAnalytics.avgAttendance)) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      
      {/* 4 Stat Cards Row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", width: "100%" }}>
        <StatCard
          title="Department Students"
          value={totalStudents}
          status="M.TECH CSE"
          icon={<i className="fa-solid fa-user-graduate"></i>}
          caption="Registered Active Students"
          progress={progressTotal}
          color="rose"
        />
        <StatCard
          title="Present Today"
          value={presentToday}
          status="ACTIVE"
          icon={<i className="fa-solid fa-check"></i>}
          caption="Unique Students Checked In"
          progress={progressPresent}
          color="rose"
        />
        <StatCard
          title="Absent Today"
          value={absentToday}
          status="CLEAN"
          icon={<i className="fa-solid fa-times"></i>}
          caption="Not Checked In Today"
          progress={progressAbsent}
          color="rose"
        />
        <StatCard
          title="Avg Attendance"
          value={avgAttendance}
          status="DEPT AVG"
          icon={<i className="fa-solid fa-chart-line"></i>}
          caption="Cumulative Avg Rate"
          progress={progressAvg}
          color="rose"
        />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
        
        {/* Left Card: Today's Sessions */}
        <div className="dashboard-card" style={{ flex: "2 1 500px", background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
            <i className="fa-solid fa-calendar-day" style={{ color: "var(--primary)" }}></i> Today's Teaching Sessions
          </h3>
          {timetableLoading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading timeline...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {currentClassStatus?.todayTimeline && currentClassStatus.todayTimeline.length > 0 ? (
                currentClassStatus.todayTimeline.map((session, idx) => {
                  const isCurrent = currentClassStatus?.status === "CLASS" && currentClassStatus?.periodNumber === session.period;
                  return (
                    <div key={idx} style={{
                      background: isCurrent ? "rgba(244, 63, 94, 0.05)" : "transparent",
                      border: isCurrent ? "1px solid rgba(244, 63, 94, 0.2)" : "1px solid rgba(255, 255, 255, 0.03)",
                      borderRadius: "12px",
                      padding: "1rem 1.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: isCurrent ? "#f43f5e" : "var(--primary)" }}>
                            Period {session.period}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {session.time}
                          </span>
                          {(session.department || session.semester) && (
                            <span style={{
                              fontSize: "0.7rem",
                              fontWeight: "800",
                              color: "#38bdf8",
                              background: "rgba(56, 189, 248, 0.12)",
                              border: "1px solid rgba(56, 189, 248, 0.3)",
                              padding: "2px 6px",
                              borderRadius: "4px"
                            }}>
                              {formatDeptSemSec(session.department, session.semester, session.section)}
                            </span>
                          )}
                        </div>
                        <h4 style={{ margin: "0.35rem 0 0 0", color: "var(--text-main)", fontSize: "0.95rem", fontWeight: "700" }}>
                          {session.subjectCode ? `${session.subjectCode} — ` : ""}{session.subject}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          <i className="fa-solid fa-location-dot" style={{ color: "var(--primary)" }}></i> Room: {session.room || "Classroom"} · {session.department ? session.department.replace(/Department of\s*/i, "") : "Department"}
                        </span>
                      </div>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: "800",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        backgroundColor: isCurrent ? "rgba(244, 63, 94, 0.15)" : "rgba(255,255,255,0.05)",
                        color: isCurrent ? "#f43f5e" : "var(--text-muted)"
                      }}>
                        {isCurrent ? "IN PROGRESS" : "SCHEDULED"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  <i className="fa-solid fa-umbrella-beach"></i> No teaching periods scheduled for today.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Card: Recent Activity */}
        <div className="dashboard-card" style={{ flex: "1 1 350px", background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "var(--text-main)", fontSize: "1.2rem", fontFamily: "var(--font-heading)", fontWeight: "600", borderBottom: "1px solid var(--card-border)", paddingBottom: "0.5rem" }}>
            <i className="fa-solid fa-bolt" style={{ color: "var(--primary)" }}></i> Recent Session Log
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {sessions && sessions.length > 0 ? (
              sessions.slice(0, 4).map((s, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                    <i className="fa-solid fa-mobile-screen" style={{ color: "var(--primary)" }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h5 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>
                      QR Session Conducted
                    </h5>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.subject} · {new Date(s.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    Done
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                No recent activity logs.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FacultyOverviewView;
