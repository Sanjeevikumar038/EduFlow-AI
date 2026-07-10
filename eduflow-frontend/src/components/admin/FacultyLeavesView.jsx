import React from "react";

function FacultyLeavesView({
  availability,
  handleDeleteLeave,
  setShowRecordLeaveModal,
  pendingFacultyLeaves,
  handleApproveFacultyLeave,
  handleRejectFacultyLeave
}) {
  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>🏖️ Faculty Leave & Absences</h3>
        <button
          onClick={() => setShowRecordLeaveModal(true)}
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            border: "none", color: "#fff", borderRadius: "8px", padding: "0.5rem 1.25rem",
            fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
          }}
        >
          <span>+</span> Record Leave
        </button>
      </div>

      {/* Combined Table of Leave Requests & Logs */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
              <th style={{ padding: "0.75rem 1rem" }}>Faculty</th>
              <th style={{ padding: "0.75rem 1rem" }}>Department</th>
              <th style={{ padding: "0.75rem 1rem" }}>Date</th>
              <th style={{ padding: "0.75rem 1rem" }}>Reason</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Mock Pending Requests */}
            {pendingFacultyLeaves.map(pl => (
              <tr key={pl.id} style={{ borderBottom: "1px solid var(--card-border)", background: "rgba(245,158,11,0.03)" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{pl.faculty.name}</td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{pl.faculty.department}</td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{pl.date}</td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{pl.reason}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                  <span style={{ background: "rgba(245,158,11,0.15)", color: "var(--warning)", borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                    PENDING
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      onClick={() => handleApproveFacultyLeave(pl)}
                      style={{ background: "var(--success)", border: "none", color: "#fff", borderRadius: "4px", padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectFacultyLeave(pl.id, pl.faculty.name)}
                      style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", fontSize: "0.75rem" }}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Approved Leaves from database */}
            {availability.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{a.faculty?.name}</td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{a.faculty?.department}</td>
                <td style={{ padding: "0.75rem 1rem" }}>{a.date}</td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{a.reason || "—"}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                  <span style={{ background: "rgba(239,68,68,0.15)", color: "var(--error)", borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                    ON LEAVE
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  <button onClick={() => handleDeleteLeave(a.id)} style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "3px 10px", cursor: "pointer", fontSize: "0.75rem" }}>
                    Revoke
                  </button>
                </td>
              </tr>
            ))}

            {pendingFacultyLeaves.length === 0 && availability.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No leaves recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyLeavesView;
