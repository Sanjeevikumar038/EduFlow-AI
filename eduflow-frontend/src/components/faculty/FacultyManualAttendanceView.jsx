import React from "react";

function FacultyManualAttendanceView({
  registerRecords,
  localRegisterRecords,
  setLocalRegisterRecords,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  registerFilterSubject,
  setRegisterFilterSubject,
  registerFilterDate,
  setRegisterFilterDate,
  registerLoading,
  registerMode,
  setRegisterMode,
  manualDate,
  setManualDate,
  manualStartTime,
  setManualStartTime,
  manualEndTime,
  setManualEndTime,
  manualSubject,
  setManualSubject,
  facultySubjects,
  sessions,
  loadRegisterSession,
  handleRegisterOverride,
  handleRemarksChange,
  handleSaveRegister,
  handleSaveManualAttendance,
  handleRegisterCloseSession,
  registerSessionId,
  setRegisterSessionId
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", animation: "fadeIn 0.5s ease" }}>
      <div className="dashboard-card" style={{ background: "rgba(30, 41, 59, 0.25)", border: "1px solid var(--card-border)", borderRadius: "20px", padding: "2rem" }}>
        
        {/* Toggle Mode and Roster Select Headers */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ margin: 0, color: "#fff" }}>✍️ Attendance Register Editor</h3>
            <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Manually mark today's class logs or update past live session roster records.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => { setRegisterMode("manual"); setRegisterSessionId(""); }}
              style={{
                background: registerMode === "manual" ? "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)" : "rgba(31, 41, 55, 0.4)",
                border: "none", color: "#fff", padding: "8px 16px", borderRadius: "6px",
                fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              New Class Log
            </button>
            <button
              onClick={() => setRegisterMode("existing")}
              style={{
                background: registerMode === "existing" ? "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)" : "rgba(31, 41, 55, 0.4)",
                border: "none", color: "#fff", padding: "8px 16px", borderRadius: "6px",
                fontWeight: "600", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s"
              }}
            >
              Edit Session Roster
            </button>
          </div>
        </div>

        {/* Input Configuration Row */}
        {registerMode === "manual" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", marginBottom: "1.5rem" }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Select Subject</label>
              <select className="input-field" style={{ margin: 0 }} value={manualSubject} onChange={e => setManualSubject(e.target.value)}>
                <option value="">-- Choose Subject --</option>
                {facultySubjects.map(sub => (
                  <option key={sub.id} value={sub.subjectCode}>{sub.subjectCode} - {sub.subjectName}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Log Date</label>
              <input type="date" className="input-field" style={{ margin: 0 }} value={manualDate} onChange={e => setManualDate(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Start Time</label>
              <input type="time" className="input-field" style={{ margin: 0 }} value={manualStartTime} onChange={e => setManualStartTime(e.target.value)} />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>End Time</label>
              <input type="time" className="input-field" style={{ margin: 0 }} value={manualEndTime} onChange={e => setManualEndTime(e.target.value)} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", padding: "1.25rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", marginBottom: "1.5rem" }}>
            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: "220px" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>Select Active or Past Session</label>
              <select
                className="input-field"
                style={{ margin: 0 }}
                value={registerSessionId}
                onChange={e => { setRegisterSessionId(e.target.value); loadRegisterSession(e.target.value); }}
              >
                <option value="">-- Choose Session --</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    Session #{s.id} · {s.subject} · {new Date(s.startTime).toLocaleDateString()} @ {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Data Table */}
        {registerLoading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading records...</div>
        ) : (
          <div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--card-border)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "0.75rem 1rem" }}>Reg No.</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Student Name</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Status Status</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {localRegisterRecords.length > 0 ? (
                    localRegisterRecords.map((r) => {
                      const isAbsent = r.status === "ABSENT";
                      return (
                        <tr key={r.studentId} style={{ borderBottom: "1px solid var(--card-border)" }}>
                          <td style={{ padding: "0.75rem 1rem", color: "var(--primary)", fontWeight: "600" }}>{r.registerNumber}</td>
                          <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#fff" }}>{r.name || r.studentName}</td>
                          <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleRegisterOverride(r.studentId, isAbsent ? "PRESENT" : "ABSENT")}
                              style={{
                                background: isAbsent ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                                border: `1px solid ${isAbsent ? "var(--error)" : "var(--success)"}`,
                                color: isAbsent ? "var(--error)" : "var(--success)",
                                padding: "4px 12px",
                                borderRadius: "6px",
                                fontWeight: "700",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                                minWidth: "85px"
                              }}
                            >
                              {isAbsent ? "ABSENT" : "PRESENT"}
                            </button>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <input
                              type="text"
                              className="input-field"
                              placeholder="Add optional notes..."
                              value={r.remarks || ""}
                              onChange={e => handleRemarksChange(r.studentId, e.target.value)}
                              style={{ margin: 0, height: "30px", fontSize: "0.8rem", padding: "4px 8px" }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Choose a configuration or select a session to load students.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Row */}
            {localRegisterRecords.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem", borderTop: "1px solid var(--divider)", paddingTop: "1.5rem" }}>
                {registerMode === "existing" && (
                  <button
                    onClick={handleRegisterCloseSession}
                    style={{
                      background: "rgba(31, 41, 55, 0.6)", border: "1px solid var(--card-border)", color: "#fff",
                      borderRadius: "8px", padding: "10px 20px", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer"
                    }}
                  >
                    🔒 Close & Lock Session
                  </button>
                )}

                <button
                  onClick={registerMode === "manual" ? handleSaveManualAttendance : handleSaveRegister}
                  disabled={!hasUnsavedChanges}
                  style={{
                    background: hasUnsavedChanges ? "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)" : "rgba(255,255,255,0.03)",
                    border: "none", color: hasUnsavedChanges ? "#fff" : "var(--text-muted)",
                    borderRadius: "8px", padding: "10px 24px", fontWeight: "700", fontSize: "0.85rem",
                    cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                    boxShadow: hasUnsavedChanges ? "0 4px 12px rgba(244,63,94,0.3)" : "none"
                  }}
                >
                  Save Attendance Log
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default FacultyManualAttendanceView;
