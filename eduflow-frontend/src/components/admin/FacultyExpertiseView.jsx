import React from "react";

function FacultyExpertiseView({
  faculty,
  expertise,
  setShowAssignExpertiseModal,
  handleRemoveExpertise
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>🎯 Faculty Expertise & Specializations</h3>
        <button
          onClick={() => setShowAssignExpertiseModal(true)}
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            border: "none", color: "#fff", borderRadius: "8px", padding: "0.5rem 1.25rem",
            fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
          }}
        >
          <span>+</span> Assign Expertise
        </button>
      </div>

      {/* Grid of Faculty Specialization Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {faculty.map(f => {
          const facExpertise = expertise.filter(e => e.faculty?.id === f.id);
          return (
            <div key={f.id} className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff", fontSize: "0.85rem", flexShrink: 0 }}>
                  {f.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#fff" }}>{f.name}</h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.department} · {f.email}</span>
                </div>
              </div>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.05)" }} />
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Assigned Subjects</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {facExpertise.length > 0 ? (
                    facExpertise.map(e => (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: e.expertiseLevel === "PRIMARY" ? "rgba(251,191,36,0.15)" : "rgba(99,102,241,0.15)",
                          border: `1px solid ${e.expertiseLevel === "PRIMARY" ? "#fbbf24" : "#818cf8"}`,
                          color: e.expertiseLevel === "PRIMARY" ? "#fbbf24" : "#818cf8"
                        }}>
                          {e.subject?.subjectCode} ({e.expertiseLevel.toLowerCase()})
                        </span>
                        <button
                          onClick={() => handleRemoveExpertise(e.id)}
                          style={{ background: "transparent", border: "none", color: "var(--error)", cursor: "pointer", fontSize: "0.8rem", padding: "2px" }}
                          title="Remove allocation"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No subjects assigned.</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FacultyExpertiseView;
