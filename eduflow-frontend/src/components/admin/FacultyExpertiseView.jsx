import React, { useState, useEffect, useMemo } from "react";
import { getFacultyWorkloadAllocations } from "../../services/subjectService";

function FacultyExpertiseView({
  faculty = [],
  expertise = [],
  setShowAssignExpertiseModal,
  handleRemoveExpertise,
  token
}) {
  const [workloadAllocations, setWorkloadAllocations] = useState([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    const fetchAllocations = async () => {
      if (!token) return;
      setLoadingAllocations(true);
      try {
        const res = await getFacultyWorkloadAllocations(null, null, token);
        setWorkloadAllocations(res.data || []);
      } catch (err) {
        console.error("Failed to load faculty workload allocations:", err);
      } finally {
        setLoadingAllocations(false);
      }
    };
    fetchAllocations();
  }, [token]);

  // Extract distinct departments for filter dropdown
  const departments = useMemo(() => {
    const depts = new Set();
    faculty.forEach(f => {
      if (f.department && f.department.trim()) {
        depts.add(f.department.trim());
      }
    });
    return Array.from(depts).sort();
  }, [faculty]);

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      // 1. Department Filter
      if (selectedDept !== "ALL" && f.department?.trim() !== selectedDept) {
        return false;
      }

      // Find faculty's expertise & allocations
      const facExpertise = expertise.filter(e => e.faculty?.id === f.id);
      const facAllocations = workloadAllocations.filter(a =>
        a.faculty?.id === f.id ||
        (a.facultyName && f.name && a.facultyName.trim().toLowerCase() === f.name.trim().toLowerCase())
      );

      // 2. Filter Type
      if (filterType === "AI_WORKLOAD" && facAllocations.length === 0) return false;
      if (filterType === "SPECIALIZATION" && facExpertise.length === 0) return false;
      if (filterType === "UNASSIGNED" && (facAllocations.length > 0 || facExpertise.length > 0)) return false;

      // 3. Search Query matching
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();

      const nameMatch = f.name?.toLowerCase().includes(q);
      const deptMatch = f.department?.toLowerCase().includes(q);
      const emailMatch = f.email?.toLowerCase().includes(q);

      const subjectMatch = facAllocations.some(a =>
        a.subjectName?.toLowerCase().includes(q) ||
        a.courseCode?.toLowerCase().includes(q)
      );

      const tagMatch = facExpertise.some(e =>
        e.subject?.subjectCode?.toLowerCase().includes(q) ||
        e.subject?.subjectName?.toLowerCase().includes(q) ||
        e.expertiseLevel?.toLowerCase().includes(q)
      );

      return nameMatch || deptMatch || emailMatch || subjectMatch || tagMatch;
    });
  }, [faculty, expertise, workloadAllocations, searchQuery, selectedDept, filterType]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedDept !== "ALL" || filterType !== "ALL";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDept("ALL");
    setFilterType("ALL");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            🎯 Faculty Expertise & AI Workload Assignments
          </h3>
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
            View AI-allocated workload subjects (from faculty_workload_allocations) & expertise specializations
          </span>
        </div>
        <button
          onClick={() => setShowAssignExpertiseModal(true)}
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
            border: "none", color: "#fff", borderRadius: "10px", padding: "0.6rem 1.35rem",
            fontWeight: "600", fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)", transition: "all 0.2s ease"
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>+</span> Assign Expertise Tag
        </button>
      </div>

      {/* Search & Filter Control Panel */}
      <div style={{
        background: "rgba(30, 41, 59, 0.4)",
        border: "1px solid var(--card-border)",
        borderRadius: "14px",
        padding: "1rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        backdropFilter: "blur(8px)"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          {/* Main Search Input */}
          <div style={{ flex: "1 1 320px", position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: "14px", color: "#818cf8", fontSize: "0.95rem" }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Search faculty name, department, subject code, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 2.5rem 0.65rem 2.6rem",
                borderRadius: "10px",
                border: "1px solid rgba(129, 140, 248, 0.3)",
                background: "rgba(15, 23, 42, 0.6)",
                color: "#fff",
                fontSize: "0.88rem",
                outline: "none",
                transition: "all 0.2s ease"
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "0 1 auto" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(15, 23, 42, 0.7)",
                color: "#fff",
                fontSize: "0.84rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Filter Category Tabs */}
          <div style={{ display: "flex", gap: "6px", background: "rgba(15, 23, 42, 0.5)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { id: "ALL", label: "All" },
              { id: "AI_WORKLOAD", label: "🤖 AI Workload" },
              { id: "SPECIALIZATION", label: "🎯 Specialization" },
              { id: "UNASSIGNED", label: "⚠️ Unassigned" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  border: "none",
                  borderRadius: "7px",
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  background: filterType === tab.id ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
                  color: filterType === tab.id ? "#fff" : "var(--text-muted)",
                  transition: "all 0.2s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Counter & Active Filter Pills */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.3rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <div>
            Showing <strong style={{ color: "#fff" }}>{filteredFaculty.length}</strong> of <strong style={{ color: "#fff" }}>{faculty.length}</strong> faculty members
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                borderRadius: "6px",
                padding: "2px 10px",
                fontSize: "0.75rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              Reset Search & Filters ✕
            </button>
          )}
        </div>
      </div>

      {loadingAllocations && (
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1rem" }}>
          Loading AI subject allocations...
        </div>
      )}

      {/* Empty State when zero faculty match filters */}
      {!loadingAllocations && filteredFaculty.length === 0 && (
        <div style={{
          background: "rgba(30, 41, 59, 0.2)",
          border: "1px dashed var(--card-border)",
          borderRadius: "16px",
          padding: "3rem 1.5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem"
        }}>
          <span style={{ fontSize: "2.5rem" }}>🔎</span>
          <div>
            <h4 style={{ margin: 0, color: "#fff", fontSize: "1.05rem" }}>No Faculty Members Found</h4>
            <span style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              No faculty matched your search query "{searchQuery}" and filter criteria.
            </span>
          </div>
          <button
            onClick={clearAllFilters}
            style={{
              background: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "#818cf8",
              borderRadius: "8px",
              padding: "0.5rem 1.25rem",
              fontWeight: "600",
              fontSize: "0.82rem",
              cursor: "pointer"
            }}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* Grid of Faculty Specialization & Workload Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {filteredFaculty.map(f => {
          const facExpertise = expertise.filter(e => e.faculty?.id === f.id);
          const facAllocations = workloadAllocations.filter(a =>
            a.faculty?.id === f.id ||
            (a.facultyName && f.name && a.facultyName.trim().toLowerCase() === f.name.trim().toLowerCase())
          );

          return (
            <div key={f.id} className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff", fontSize: "0.9rem", flexShrink: 0 }}>
                  {f.name ? f.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() : "FC"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: "0.98rem", fontWeight: "700", color: "#fff" }}>{f.name}</h4>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.department || "N/A"} · {f.email}</span>
                </div>
              </div>

              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

              {/* 1. AI Assigned Subjects (Stored in faculty_workload_allocations) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    🤖 Assigned Subjects (AI Workload)
                  </span>
                  {facAllocations.length > 0 && (
                    <span style={{ fontSize: "0.72rem", background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "999px", padding: "1px 8px", fontWeight: "700" }}>
                      {facAllocations.length} Course{facAllocations.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {facAllocations.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    {facAllocations.map(alloc => (
                      <div
                        key={alloc.id}
                        style={{
                          background: "rgba(30, 41, 59, 0.6)",
                          border: "1px solid rgba(99, 102, 241, 0.25)",
                          borderRadius: "8px",
                          padding: "0.5rem 0.75rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ minWidth: 0, paddingRight: "8px" }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {alloc.subjectName || alloc.courseCode}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                            {alloc.courseCode} · Sec {alloc.section || "A"} · {alloc.hoursPerWeek || 3} hrs/wk
                          </div>
                        </div>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          flexShrink: 0,
                          background: alloc.status === "APPROVED" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                          border: `1px solid ${alloc.status === "APPROVED" ? "#10b981" : "#f59e0b"}`,
                          color: alloc.status === "APPROVED" ? "#34d399" : "#f59e0b"
                        }}>
                          {alloc.status === "APPROVED" ? "APPROVED" : "DRAFT"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    No AI workload subjects assigned yet.
                  </span>
                )}
              </div>

              {/* 2. Manual Expertise Tags */}
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  Specialization Tags
                </span>
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
                          {e.subject?.subjectCode || e.subject?.subjectName} ({e.expertiseLevel?.toLowerCase()})
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
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>No specialization tags assigned.</span>
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
