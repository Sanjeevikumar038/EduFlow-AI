import React from "react";

function FacultyAdvisorLeavesView({
  leaveRequests,
  leaveFilter,
  setLeaveFilter,
  leaveLoading,
  rejectReason,
  setRejectReason,
  rejectingId,
  setRejectingId,
  handleApproveLeave,
  handleRejectLeave,
  fetchLeaveRequests
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.3)", borderRadius: "20px", padding: "2.5rem" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: "700" }}>
            📋 Department Leave Requests
          </h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
              <button
                key={f}
                onClick={() => { setLeaveFilter(f); fetchLeaveRequests(f); }}
                style={{
                  background: leaveFilter === f ? "linear-gradient(135deg, #f43f5e, #be123c)" : "rgba(31,41,55,0.5)",
                  border: leaveFilter === f ? "none" : "1px solid var(--card-border)",
                  color: "#fff", borderRadius: "6px", padding: "0.4rem 0.9rem",
                  fontWeight: "600", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {leaveLoading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading leave requests...</div>
        ) : leaveRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", fontStyle: "italic" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
            No {leaveFilter !== "ALL" ? leaveFilter.toLowerCase() : ""} leave requests found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {leaveRequests.map(lr => (
              <div key={lr.id} style={{
                background: lr.status === "APPROVED" ? "rgba(16,185,129,0.06)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                border: `1px solid ${lr.status === "APPROVED" ? "rgba(16,185,129,0.2)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.25)"}`,
                borderRadius: "14px", padding: "1.5rem", animation: "fadeIn 0.3s ease"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={{
                        background: lr.status === "APPROVED" ? "rgba(16,185,129,0.15)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                        color: lr.status === "APPROVED" ? "var(--success)" : lr.status === "REJECTED" ? "var(--error)" : "var(--warning)",
                        border: `1px solid ${lr.status === "APPROVED" ? "rgba(16,185,129,0.3)" : lr.status === "REJECTED" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
                        borderRadius: "6px", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: "700"
                      }}>{lr.status}</span>
                      <span style={{ background: "rgba(244,63,94,0.15)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.3)", borderRadius: "6px", padding: "0.2rem 0.6rem", fontSize: "0.7rem", fontWeight: "600" }}>
                        {lr.type}
                      </span>
                    </div>
                    <div style={{ fontWeight: "700", fontSize: "1rem" }}>{lr.studentName || `Student #${lr.studentId}`}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.2rem" }}>
                      Reg: {lr.registerNumber || "N/A"} • {lr.department}
                    </div>
                    <div style={{ marginTop: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      📅 {lr.fromDate} → {lr.toDate}
                    </div>
                    {lr.reason && <div style={{ marginTop: "0.5rem", color: "var(--text-main)", fontSize: "0.85rem", fontStyle: "italic" }}>"{lr.reason}"</div>}
                    {lr.rejectionReason && <div style={{ marginTop: "0.35rem", color: "var(--error)", fontSize: "0.8rem" }}>Rejection reason: {lr.rejectionReason}</div>}
                  </div>

                  {lr.status === "PENDING" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "200px" }}>
                      {rejectingId === lr.id ? (
                        <>
                          <input
                            type="text" className="input-field" placeholder="Rejection reason..."
                            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                            style={{ fontSize: "0.82rem", padding: "0.5rem 0.75rem", margin: 0 }}
                          />
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => handleRejectLeave(lr.id)}
                              style={{ flex: 1, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--error)", borderRadius: "6px", padding: "0.45rem", fontWeight: "600", fontSize: "0.82rem", cursor: "pointer" }}
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason(""); }}
                              style={{ background: "transparent", border: "1px solid var(--card-border)", color: "var(--text-muted)", borderRadius: "6px", padding: "0.45rem 0.75rem", cursor: "pointer", fontSize: "0.82rem" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApproveLeave(lr.id)}
                            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "var(--success)", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(lr.id)}
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--error)", borderRadius: "8px", padding: "0.6rem 1.2rem", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" }}
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyAdvisorLeavesView;
