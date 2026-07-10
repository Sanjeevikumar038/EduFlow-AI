import React from "react";

function FacultyAdvisorAnalyticsView({
  lowAttendanceStudents,
  lowAttendanceLoading,
  fetchLowAttendanceStudents,
  handleExportCsv,
  handlePrintPdf,
  exportingId,
  sessions,
  analyticsLoading,
  handleViewReport,
  selectedSession,
  reportLoading,
  reportRecords
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      
      {/* Low Attendance Alert Roster */}
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, color: "#fff" }}>⚠️ Low Attendance Alert Roster (Below 75%)</h3>
            <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Students requiring monitoring or warnings due to low attendance scores.
            </p>
          </div>
          <button
            onClick={fetchLowAttendanceStudents}
            style={{
              background: "rgba(244, 63, 94, 0.15)", border: "1px solid #f43f5e", color: "#fff",
              borderRadius: "6px", padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem"
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {lowAttendanceLoading ? (
          <div style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>Analyzing attendance criteria...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Reg No.</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Student</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Dept / Section</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Att %</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Warning Level</th>
                </tr>
              </thead>
              <tbody>
                {lowAttendanceStudents.length > 0 ? (
                  lowAttendanceStudents.map(s => {
                    const pct = s.attendancePercentage || 0;
                    const level = pct < 50 ? "CRITICAL" : "WARN";
                    const levelColor = pct < 50 ? "var(--error)" : "var(--warning)";
                    return (
                      <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "var(--primary)" }}>{s.registerNumber}</td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#fff" }}>{s.name}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{s.department} - {s.section || "A"}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: "800", color: "var(--error)" }}>
                          {pct.toFixed(1)}%
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                          <span style={{
                            background: level === "CRITICAL" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                            color: levelColor, border: `1px solid ${levelColor}44`,
                            padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700"
                          }}>{level}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      🎉 Excellent! All department students are above the 75% attendance threshold.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conducted Sessions Directory */}
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
        <h3 style={{ margin: "0 0 1rem 0" }}>📱 Session History Log & Exports</h3>
        {analyticsLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading histories...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Session ID</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Subject</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Conducted By</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "var(--primary)" }}>#{s.id}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#fff" }}>{s.subject}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{s.facultyName}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>
                      {new Date(s.startTime).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleExportCsv(s)}
                          disabled={exportingId === s.id}
                          style={{
                            background: "transparent", border: "1px solid var(--success)", color: "var(--success)",
                            borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.75rem"
                          }}
                        >
                          {exportingId === s.id ? "Exporting..." : "CSV"}
                        </button>
                        <button
                          onClick={() => handlePrintPdf(s)}
                          disabled={exportingId === `${s.id}-pdf`}
                          style={{
                            background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)",
                            borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.75rem"
                          }}
                        >
                          {exportingId === `${s.id}-pdf` ? "Printing..." : "PDF"}
                        </button>
                        <button
                          onClick={() => handleViewReport(s)}
                          style={{
                            background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)", border: "none", color: "#fff",
                            borderRadius: "4px", padding: "4px 10px", fontWeight: "600", cursor: "pointer", fontSize: "0.75rem"
                          }}
                        >
                          Report
                        </button>
                      </div>
                    </td>
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

export default FacultyAdvisorAnalyticsView;
