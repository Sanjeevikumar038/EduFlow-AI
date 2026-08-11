import React from "react";

function FacultyManagementView({
  filteredFaculty,
  searchTerm,
  setSearchTerm,
  deptFilter,
  setDeptFilter,
  facultyDepts = [],
  handleDeleteFaculty,
  handleClearAllFaculty,
  handlePurgeMockData,
  deletingId,
  setShowAddFacultyModal,
  setShowBulkImportFacultyModal,
  getFacultySubjects,
  availability
}) {
  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ margin: 0 }}>
          👤 Faculty Directory
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
            ({filteredFaculty.length} visible)
          </span>
        </h3>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {setDeptFilter && (
            <select
              className="input-field"
              value={deptFilter || "All"}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ maxWidth: "230px", height: "38px", cursor: "pointer", fontWeight: "500" }}
            >
              <option value="All">🏢 All Departments ({facultyDepts.length})</option>
              {facultyDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
          <input
            className="input-field"
            type="text"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "200px", height: "38px" }}
          />
          {handleClearAllFaculty && filteredFaculty.length > 0 && (
            <button
              onClick={handleClearAllFaculty}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#f87171", borderRadius: "8px", padding: "0.5rem 1rem",
                fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <span>🗑️</span> Clear All Faculty
            </button>
          )}
          {setShowBulkImportFacultyModal && (
            <button
              onClick={() => setShowBulkImportFacultyModal(true)}
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                color: "#818cf8", borderRadius: "8px", padding: "0.5rem 1rem",
                fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
              }}
            >
              <span>📥</span> Import Excel / CSV
            </button>
          )}
          <button
            onClick={() => setShowAddFacultyModal(true)}
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              border: "none", color: "#fff", borderRadius: "8px", padding: "0.5rem 1.25rem",
              fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <span>+</span> Add Faculty
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
              <th style={{ padding: "0.75rem 1rem" }}>Faculty Name</th>
              <th style={{ padding: "0.75rem 1rem" }}>Email</th>
              <th style={{ padding: "0.75rem 1rem" }}>Department</th>
              <th style={{ padding: "0.75rem 1rem" }}>Assigned Specializations</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.length > 0 ? (
              filteredFaculty.map((f) => {
                const todayStr = new Date().toISOString().split("T")[0];
                const hasLeaveToday = availability.some(a => a.faculty?.id === f.id && a.date === todayStr && !a.available);
                return (
                  <tr key={f.id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{f.name}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{f.email}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{f.department || "N/A"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600" }}>
                        {getFacultySubjects(f.id)}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <span style={{
                        background: hasLeaveToday ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: hasLeaveToday ? "var(--error)" : "var(--success)",
                        padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700"
                      }}>
                        {hasLeaveToday ? "On Leave" : "Active"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleDeleteFaculty(f.id)}
                        style={{
                          background: deletingId === f.id ? "var(--error)" : "transparent",
                          border: "1px solid var(--error)", color: deletingId === f.id ? "#fff" : "var(--error)",
                          borderRadius: "6px", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem"
                        }}
                      >
                        {deletingId === f.id ? "Confirm?" : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  No faculty members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FacultyManagementView;
