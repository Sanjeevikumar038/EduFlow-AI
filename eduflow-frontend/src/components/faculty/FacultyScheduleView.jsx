import React from "react";

function FacultyScheduleView({ timetableData, currentClassStatus, timetableLoading, simParams }) {
  
  const renderFacultyGridCell = (day, period) => {
    const entry = timetableData.find(e => e.dayOfWeek === day && e.period === period);
    const isFreeActivity = entry && entry.subject === "FREE_ACTIVITY";
    const isMyClass = entry && entry.faculty && (
      entry.faculty.id === Number(localStorage.getItem("userId")) ||
      entry.faculty.name === localStorage.getItem("name") ||
      (localStorage.getItem("email") && entry.faculty.email === localStorage.getItem("email"))
    );

    const isActiveCell = currentClassStatus &&
      currentClassStatus.status === "CLASS" &&
      currentClassStatus.periodNumber === period &&
      (simParams?.simulatedDay
        ? simParams.simulatedDay === day
        : new Date().toLocaleDateString("en-US", { weekday: "long" }) === day);

    const cellStyle = {
      padding: "12px 8px",
      height: "75px",
      verticalAlign: "middle",
      border: "1px solid rgba(255,255,255,0.06)",
      textAlign: "center"
    };

    if (isFreeActivity) {
      const displayVal = entry.activityName ? `Free Activity (${entry.activityName})` : "Free Activity Period";
      return (
        <td key={period} style={{ ...cellStyle, background: "rgba(16, 185, 129, 0.05)", border: "1px dashed rgba(16, 185, 129, 0.2)" }}>
          <div style={{ color: "#10b981", fontWeight: "700", fontSize: "0.8rem" }}>{displayVal}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Self-Directed</div>
        </td>
      );
    } else if (isMyClass) {
      return (
        <td key={period} style={{ 
          ...cellStyle, 
          background: isActiveCell ? "rgba(244, 63, 94, 0.12)" : "rgba(244, 63, 94, 0.04)", 
          border: isActiveCell ? "2px solid #f43f5e" : "1px solid rgba(244, 63, 94, 0.2)" 
        }}>
          <div style={{ color: "#fff", fontWeight: "700", fontSize: "0.85rem" }}>{entry.subject}</div>
          <div style={{ color: "#f43f5e", fontSize: "0.72rem", fontWeight: "600", marginTop: "2px" }}>{entry.department}</div>
        </td>
      );
    } else if (entry && entry.subject && entry.subject.trim() !== "") {
      return (
        <td key={period} style={{ ...cellStyle, background: "rgba(255,255,255,0.02)" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: "500" }}>{entry.subject}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "2px" }}>{entry.faculty?.name || "Unassigned"}</div>
        </td>
      );
    } else {
      return (
        <td key={period} style={{ ...cellStyle }}>
          <div style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.8rem" }}>-</div>
        </td>
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ margin: 0, color: "#fff" }}>📅 Weekly Teaching Schedule</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
            Overview of teaching slots, break periods, and department assignments.
          </p>
        </div>

        {timetableLoading ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            Loading weekly teaching schedule...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="timetable-grid-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <thead>
                <tr>
                  <th style={hdrStyle}>Day</th>
                  <th style={hdrStyle}>P1<span className="time-sub" style={subHdrStyle}>8:15-9:15</span></th>
                  <th style={hdrStyle}>P2<span className="time-sub" style={subHdrStyle}>9:15-10:15</span></th>
                  <th style={{ ...hdrStyle, background: "rgba(31, 41, 55, 0.35)", minWidth: "40px" }}>Break<span className="time-sub" style={subHdrStyle}>10:15-10:45</span></th>
                  <th style={hdrStyle}>P3<span className="time-sub" style={subHdrStyle}>10:45-11:45</span></th>
                  <th style={hdrStyle}>P4<span className="time-sub" style={subHdrStyle}>11:45-12:45</span></th>
                  <th style={{ ...hdrStyle, background: "rgba(31, 41, 55, 0.35)", minWidth: "40px" }}>Lunch<span className="time-sub" style={subHdrStyle}>12:45-1:45</span></th>
                  <th style={hdrStyle}>P5<span className="time-sub" style={subHdrStyle}>1:45-2:45</span></th>
                  <th style={hdrStyle}>P6<span className="time-sub" style={subHdrStyle}>2:45-3:45</span></th>
                </tr>
              </thead>
              <tbody>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <tr key={day}>
                    <td style={{ fontWeight: 700, color: "#f1f5f9", background: "rgba(30, 41, 59, 0.4)", padding: "12px 8px", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center", minWidth: "90px" }}>
                      {day}
                    </td>
                    {[1, 2].map(p => renderFacultyGridCell(day, p))}
                    <td style={breakCellStyle}>Short Break</td>
                    {[3, 4].map(p => renderFacultyGridCell(day, p))}
                    <td style={breakCellStyle}>Lunch Break</td>
                    {[5, 6].map(p => renderFacultyGridCell(day, p))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

const hdrStyle = {
  background: "rgba(31, 41, 55, 0.6)",
  color: "#f1f5f9",
  fontWeight: "600",
  padding: "12px 8px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  minWidth: "100px",
  textAlign: "center"
};

const subHdrStyle = {
  display: "block",
  fontSize: "0.65rem",
  color: "#94a3b8",
  fontWeight: "normal",
  marginTop: "4px"
};

const breakCellStyle = {
  background: "rgba(31, 41, 55, 0.25)",
  color: "#64748b",
  fontSize: "0.75rem",
  fontStyle: "italic",
  maxWidth: "35px",
  writingMode: "vertical-rl",
  textOrientation: "mixed",
  letterSpacing: "2px",
  fontWeight: "600",
  borderLeft: "1px dashed rgba(255, 255, 255, 0.1)",
  borderRight: "1px dashed rgba(255, 255, 255, 0.1)",
  textAlign: "center",
  padding: "12px 8px"
};

export default FacultyScheduleView;
