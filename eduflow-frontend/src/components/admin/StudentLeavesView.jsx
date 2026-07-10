import React from "react";

function StudentLeavesView({
  leaveRequests,
  leaveFilterDept,
  setLeaveFilterDept,
  leaveFilterStatus,
  setLeaveFilterStatus,
  leaveSearch,
  setLeaveSearch,
  studentLeaveLoading,
  fetchAdminLeaveRequests,
  handleApproveStudentLeave,
  handleRejectStudentLeave,
  DEPT_OPTIONS
}) {
  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ margin: 0 }}>📄 Student Leave/OD Requests</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <select className="input-field" value={leaveFilterDept} onChange={(e) => setLeaveFilterDept(e.target.value)} style={{ minWidth: "150px" }}>
            <option value="All">All Departments</option>
            {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input-field" value={leaveFilterStatus} onChange={(e) => setLeaveFilterStatus(e.target.value)} style={{ minWidth: "150px" }}>
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input type="text" className="input-field" placeholder="Search student..." value={leaveSearch} onChange={e => setLeaveSearch(e.target.value)} style={{ minWidth: "180px" }} />
          <button onClick={fetchAdminLeaveRequests} style={{ background: "rgba(99,102,241,0.15)", border: "1px solid var(--primary)", color: "#fff", borderRadius: "6px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        {studentLeaveLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading leave requests...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
            <thead>
              <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
                <th style={{ padding: "0.75rem 1rem" }}>Student</th>
                <th style={{ padding: "0.75rem 1rem" }}>Dept</th>
                <th style={{ padding: "0.75rem 1rem" }}>Type</th>
                <th style={{ padding: "0.75rem 1rem" }}>Date Range</th>
                <th style={{ padding: "0.75rem 1rem" }}>Reason</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests
                .filter(r =>
                  !leaveSearch ||
                  r.studentName?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
                  r.registerNumber?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
                  r.student?.name?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
                  r.student?.registerNumber?.toLowerCase().includes(leaveSearch.toLowerCase())
                )
                .map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 600 }}>{r.studentName || r.student?.name || "Pending Name"}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.registerNumber || r.student?.registerNumber}</div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{r.department}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{r.type}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{r.fromDate} to {r.toDate}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>{r.reason}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <span style={{
                        background: r.status === "APPROVED" ? "rgba(16,185,129,0.15)" : r.status === "REJECTED" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)",
                        color: r.status === "APPROVED" ? "var(--success)" : r.status === "REJECTED" ? "var(--error)" : "var(--warning)",
                        padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      {r.status === "PENDING" ? (
                        <div style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleApproveStudentLeave(r.id)}
                            style={{ background: "var(--success)", border: "none", color: "#fff", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectStudentLeave(r.id)}
                            style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "3px 8px", cursor: "pointer", fontSize: "0.75rem" }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              {leaveRequests.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No student leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentLeavesView;
