import React, { useState } from "react";

const getStudentPhotoUrl = (registerNumber) =>
  registerNumber ? `/students_photos/${registerNumber.toLowerCase()}.jpg` : null;

function StudentAvatar({ registerNumber, name, size = 38 }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getStudentPhotoUrl(registerNumber);
  if (!photoUrl || imgError) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: "700", color: "#fff", flexShrink: 0
      }}>{name ? name.charAt(0).toUpperCase() : "S"}</div>
    );
  }
  return (
    <img src={photoUrl} alt={name} onError={() => setImgError(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: "2px solid var(--card-border)", flexShrink: 0 }}
    />
  );
}

function StudentManagementView({
  students,
  searchTerm,
  setSearchTerm,
  deptFilter,
  setDeptFilter,
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
  studentActiveFilter,
  setStudentActiveFilter,
  fetchLoading,
  handleDeleteStudent,
  deletingId,
  handleViewProfile,
  setShowAddStudentModal,
  setShowBulkImportStudentModal,
  ALL_DEPTS = ["All", "M.Tech CSE", "CSE", "IT", "ECE", "EEE", "Mechanical", "Mechatronics", "AI & Data Science", "CSBS", "Civil"]
}) {
  const deptsList = Array.isArray(ALL_DEPTS) ? ALL_DEPTS : ["All", "M.Tech CSE", "CSE", "IT", "ECE", "EEE", "Mechanical", "Mechatronics", "AI & Data Science", "CSBS", "Civil"];
  return (
    <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.2)", display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <h3 style={{ margin: 0 }}>
          🎓 Student Directory
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
            ({students?.length || 0} visible)
          </span>
        </h3>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="input-field"
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setStudentPage(0); }}
            style={{ maxWidth: "220px", height: "38px" }}
          />
          {setShowBulkImportStudentModal && (
            <button
              onClick={() => setShowBulkImportStudentModal(true)}
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
            onClick={() => setShowAddStudentModal(true)}
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              border: "none", color: "#fff", borderRadius: "8px", padding: "0.5rem 1.25rem",
              fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <span>+</span> Add Student
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <select
          className="input-field"
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setStudentPage(0); }}
          style={{ flex: "1", minWidth: "120px", fontSize: "0.8rem", height: "36px" }}
        >
          <option value="All">All Departments</option>
          {deptsList.filter(x => x !== "All").map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="input-field"
          value={studentSectionFilter}
          onChange={(e) => { setStudentSectionFilter(e.target.value); setStudentPage(0); }}
          style={{ flex: "1", minWidth: "120px", fontSize: "0.8rem", height: "36px" }}
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
          style={{ flex: "1", minWidth: "120px", fontSize: "0.8rem", height: "36px" }}
        >
          <option value="">All Batches</option>
          <option value="2023-2028">2023-2028</option>
          <option value="2024-2029">2024-2029</option>
        </select>

        <select
          className="input-field"
          value={studentActiveFilter}
          onChange={(e) => { setStudentActiveFilter(e.target.value); setStudentPage(0); }}
          style={{ flex: "1", minWidth: "120px", fontSize: "0.8rem", height: "36px" }}
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Discontinued</option>
        </select>

        <select
          className="input-field"
          value={`${studentSortBy}-${studentSortDir}`}
          onChange={(e) => {
            const [by, dir] = e.target.value.split("-");
            setStudentSortBy(by);
            setStudentSortDir(dir);
            setStudentPage(0);
          }}
          style={{ flex: "1.5", minWidth: "150px", fontSize: "0.8rem", height: "36px" }}
        >
          <option value="name-asc">Sort by Name (A-Z)</option>
          <option value="name-desc">Sort by Name (Z-A)</option>
          <option value="registerNumber-asc">Sort by Reg No (Asc)</option>
          <option value="registerNumber-desc">Sort by Reg No (Desc)</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        {fetchLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>Loading students...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                <th style={{ padding: "0.75rem 0.5rem" }}></th>
                <th style={{ padding: "0.75rem 1rem" }}>Reg No.</th>
                <th style={{ padding: "0.75rem 1rem" }}>Student Name</th>
                <th style={{ padding: "0.75rem 1rem" }}>Department / Sec</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Attendance %</th>
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
                    <td style={{ padding: "0.5rem 0.5rem" }}>
                      <StudentAvatar registerNumber={s.registerNumber} name={s.name} size={40} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: "600", fontSize: "0.82rem" }}>{s.registerNumber || "Pending"}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "var(--text-main)" }}>{s.name}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      {s.department || "N/A"} {s.section ? `- ${s.section}` : ""}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: "700", color: s.attendancePercentage < 75 ? "var(--error)" : "var(--success)" }}>
                      {s.attendancePercentage !== undefined ? `${s.attendancePercentage.toFixed(1)}%` : "0.0%"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <span style={{
                        background: s.active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: s.active ? "var(--success)" : "var(--error)",
                        padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700"
                      }}>
                        {s.active ? "Active" : "Discontinued"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleViewProfile(s.id)}
                        style={{
                          background: "transparent", border: "1px solid var(--primary)", color: "var(--primary)",
                          borderRadius: "6px", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem"
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(s.id)}
                        style={{
                          background: deletingId === s.id ? "var(--error)" : "transparent",
                          border: "1px solid var(--error)", color: deletingId === s.id ? "#fff" : "var(--error)",
                          borderRadius: "6px", padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem"
                        }}
                      >
                        {deletingId === s.id ? "Confirm?" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {studentTotalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "1rem", padding: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
          <button
            disabled={studentPage === 0}
            onClick={() => setStudentPage(prev => prev - 1)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid var(--card-border)",
              color: studentPage === 0 ? "var(--text-muted)" : "#fff",
              padding: "0.35rem 0.85rem", borderRadius: "6px", cursor: "pointer"
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
              padding: "0.35rem 0.85rem", borderRadius: "6px", cursor: "pointer"
            }}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentManagementView;
