import React from "react";

function WorkloadView({
  workload,
  workloadLoading,
  loadWorkload
}) {
  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>📊 Faculty Workload Dashboard</h3>
        <button onClick={loadWorkload} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid var(--primary)", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}>🔄 Refresh</button>
      </div>
      
      <div style={{ overflowX: "auto" }}>
        {workloadLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading workload data...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
                {["Faculty Name", "Department", "Allocated Periods", "Max Periods", "Utilization", "Status"].map(h => <th key={h} style={{ padding: "0.75rem 1rem" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {workload.map(w => {
                const statusColor = w.workloadStatus === "Heavy Load" ? "#ef4444" : w.workloadStatus === "Balanced" ? "#10b981" : "#f59e0b";
                const statusEmoji = w.workloadStatus === "Heavy Load" ? "🔴" : w.workloadStatus === "Balanced" ? "🟢" : "🟡";
                const barWidth = Math.min(100, w.utilizationPercentage);
                return (
                  <tr key={w.facultyId} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{w.facultyName}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{w.department}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: 700 }}>{w.allocatedPeriods}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{w.availablePeriods}</td>
                    <td style={{ padding: "0.75rem 1rem", minWidth: "160px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                          <div style={{ width: `${barWidth}%`, height: "100%", background: `linear-gradient(90deg, ${statusColor}88, ${statusColor})`, borderRadius: "999px" }} />
                        </div>
                        <span style={{ minWidth: "44px", fontWeight: 600, color: statusColor }}>{w.utilizationPercentage?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ background: `${statusColor}22`, color: statusColor, borderRadius: "6px", padding: "4px 12px", fontSize: "0.8rem", fontWeight: 700 }}>{statusEmoji} {w.workloadStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default WorkloadView;
