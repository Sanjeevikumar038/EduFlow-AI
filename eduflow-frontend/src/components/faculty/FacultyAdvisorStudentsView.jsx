import React, { useState } from "react";

// Derive photo URL from register number (e.g. "727723EUCI045" → "/students_photos/727723euci045.jpg")
const getStudentPhotoUrl = (registerNumber) =>
  registerNumber ? `/students_photos/${registerNumber.toLowerCase()}.jpg` : null;

function StudentAvatar({ registerNumber, name, size = 36 }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getStudentPhotoUrl(registerNumber);
  if (!photoUrl || imgError) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: "700", color: "#fff", flexShrink: 0
      }}>
        {name ? name.charAt(0).toUpperCase() : "S"}
      </div>
    );
  }
  return (
    <img
      src={photoUrl}
      alt={name}
      onError={() => setImgError(true)}
      style={{
        width: size, height: size, borderRadius: "50%",
        objectFit: "cover", objectPosition: "top",
        border: "2px solid var(--card-border)", flexShrink: 0
      }}
    />
  );
}

function FacultyAdvisorStudentsView({
  students,
  searchTerm,
  setSearchTerm,
  studentPage,
  setStudentPage,
  studentTotalPages,
  studentSortBy,
  setStudentSortBy,
  studentSortDir,
  setStudentSortDir,
  studentSectionFilter,
  setStudentSectionFilter,
  studentBatchFilter,
  setStudentBatchFilter,
  fetchLoading,
  handleViewProfile
}) {
  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ margin: 0 }}>🎓 Class Student Directory</h3>
        <input
          className="input-field"
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setStudentPage(0); }}
          style={{ maxWidth: "240px", height: "38px" }}
        />
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <select
          className="input-field"
          value={studentSectionFilter}
          onChange={(e) => { setStudentSectionFilter(e.target.value); setStudentPage(0); }}
          style={{ flex: "1", minWidth: "120px", fontSize: "0.82rem", height: "38px", color: "var(--text-main)", padding: "0 2.5rem 0 1rem" }}
        >
          <option value="">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>

        <select
          className="input-field"
          value={studentBatchFilter}
          onChange={(e) => { setStudentBatchFilter(e.target.value); setStudentPage(0); }}
          style={{ flex: "1", minWidth: "120px", fontSize: "0.82rem", height: "38px", color: "var(--text-main)", padding: "0 2.5rem 0 1rem" }}
        >
          <option value="">All Batches</option>
          <option value="2023-2028">2023-2028</option>
          <option value="2024-2029">2024-2029</option>
        </select>

        <select
          className="input-field"
          value={studentSortBy}
          onChange={(e) => { setSearchTerm(""); setStudentSortBy(e.target.value); setStudentPage(0); }}
          style={{ flex: "1.5", minWidth: "150px", fontSize: "0.82rem", height: "38px", color: "var(--text-main)", padding: "0 2.5rem 0 1rem" }}
        >
          <option value="name">Sort by Name</option>
          <option value="registerNumber">Sort by Reg No</option>
          <option value="email">Sort by Email</option>
        </select>

        <select
          className="input-field"
          value={studentSortDir}
          onChange={(e) => { setStudentSortDir(e.target.value); setStudentPage(0); }}
          style={{ flex: "1", minWidth: "110px", fontSize: "0.82rem", height: "38px", color: "var(--text-main)", padding: "0 2.5rem 0 1rem" }}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        {fetchLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading records...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem 1rem" }}></th>
                <th style={{ padding: "0.75rem 1rem" }}>Reg No.</th>
                <th style={{ padding: "0.75rem 1rem" }}>Student Name</th>
                <th style={{ padding: "0.75rem 1rem" }}>Email</th>
                <th style={{ padding: "0.75rem 1rem" }}>Section</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--card-border)", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      <StudentAvatar registerNumber={s.registerNumber} name={s.name} size={40} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: "600", fontSize: "0.82rem" }}>{s.registerNumber || "N/A"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "var(--text-main)" }}>{s.name}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>{s.email}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{s.section || "A"}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <span style={{
                        background: s.active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: s.active ? "var(--success)" : "var(--error)",
                        padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700"
                      }}>
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleViewProfile(s.id)}
                        style={{
                          background: "linear-gradient(135deg, var(--primary), var(--secondary))", border: "none", color: "#fff",
                          borderRadius: "6px", padding: "0.3rem 0.8rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600"
                        }}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No students found in your department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {studentTotalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem", padding: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
          <button
            disabled={studentPage === 0}
            onClick={() => setStudentPage(prev => prev - 1)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--card-border)",
              color: studentPage === 0 ? "var(--text-muted)" : "#fff",
              padding: "0.3rem 0.75rem", borderRadius: "6px", cursor: "pointer"
            }}
          >
            ◀ Previous
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Page {studentPage + 1} of {studentTotalPages}
          </span>
          <button
            disabled={studentPage === studentTotalPages - 1}
            onClick={() => setStudentPage(prev => prev + 1)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--card-border)",
              color: studentPage === studentTotalPages - 1 ? "var(--text-muted)" : "#fff",
              padding: "0.3rem 0.75rem", borderRadius: "6px", cursor: "pointer"
            }}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default FacultyAdvisorStudentsView;
