import React from "react";

function SubjectMasterView({
  subjects,
  subjectFilter,
  setSubjectFilter,
  setShowAddSubjectModal,
  handleDeleteSubject,
  getSubjectFaculty
}) {
  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ margin: 0 }}>📚 Subject Master ({subjects.length})</h3>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input 
            className="input-field" 
            placeholder="Search subjects..." 
            value={subjectFilter} 
            onChange={e => setSubjectFilter(e.target.value)} 
            style={{ maxWidth: "220px", height: "36px", fontSize: "0.85rem" }} 
          />
          <button
            onClick={() => setShowAddSubjectModal(true)}
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              border: "none", color: "#fff", borderRadius: "8px", padding: "0.5rem 1.25rem",
              fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <span>+</span> Add Subject
          </button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", borderBottom: "2px solid var(--card-border)" }}>
              <th style={{ padding: "0.75rem 1rem" }}>Code</th>
              <th style={{ padding: "0.75rem 1rem" }}>Subject Name</th>
              <th style={{ padding: "0.75rem 1rem" }}>Department</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Sem</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Credits</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Hrs/Wk</th>
              <th style={{ padding: "0.75rem 1rem" }}>Category</th>
              <th style={{ padding: "0.75rem 1rem" }}>Primary Faculty</th>
              <th style={{ padding: "0.75rem 1rem" }}>Status</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.filter(s => !subjectFilter || s.subjectCode?.toLowerCase().includes(subjectFilter.toLowerCase()) || s.subjectName?.toLowerCase().includes(subjectFilter.toLowerCase())).map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)", opacity: s.active ? 1 : 0.5 }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "var(--primary)" }}>{s.subjectCode}</td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{s.subjectName}</td>
                <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{s.department}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{s.semester}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{s.credits}</td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{s.weeklyHours}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ 
                    background: s.subjectCategory === "LAB" ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.15)", 
                    color: s.subjectCategory === "LAB" ? "#818cf8" : "#34d399", 
                    borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 
                  }}>
                    {s.subjectCategory}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", fontWeight: "600" }}>{getSubjectFaculty(s.id)}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ color: s.active ? "var(--success)" : "var(--error)", fontWeight: 600, fontSize: "0.75rem" }}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                  <button onClick={() => handleDeleteSubject(s.id)} style={{ background: "transparent", border: "1px solid var(--error)", color: "var(--error)", borderRadius: "4px", padding: "4px 10px", cursor: "pointer", fontSize: "0.75rem" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubjectMasterView;
