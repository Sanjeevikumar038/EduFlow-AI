import React, { useState } from "react";

function FacultyQrSessionView({
  activeSession,
  sessionSubject,
  setSessionSubject,
  facultySubjects,
  customSubject,
  setCustomSubject,
  sessionDuration,
  setSessionDuration,
  timeLeft,
  sessionLoading,
  checkedInStudents = [],
  sessionStudents = [],
  handleStartSession,
  handleEndSession,
  formatTimeLeft,
  handleManualOverride,
  isAdvisor
}) {
  const [filterStatus, setFilterStatus] = useState("ALL"); // "ALL", "PRESENT", "PENDING"
  const [searchTerm, setSearchTerm] = useState("");

  const presentList = sessionStudents.filter(s => s.status === "PRESENT" || s.status === "LATE");
  const pendingList = sessionStudents.filter(s => s.status !== "PRESENT" && s.status !== "LATE");

  const filteredStudents = sessionStudents.filter(s => {
    // 1. Status filter
    if (filterStatus === "PRESENT" && s.status !== "PRESENT" && s.status !== "LATE") return false;
    if (filterStatus === "PENDING" && (s.status === "PRESENT" || s.status === "LATE")) return false;

    // 2. Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = s.name && s.name.toLowerCase().includes(q);
      const matchReg = s.registerNumber && s.registerNumber.toLowerCase().includes(q);
      return matchName || matchReg;
    }
    return true;
  }).sort((a, b) => {
    const regA = (a.registerNumber || "").trim();
    const regB = (b.registerNumber || "").trim();
    if (regA && regB) {
      return regA.localeCompare(regB, undefined, { numeric: true, sensitivity: "base" });
    }
    const nameA = (a.name || a.studentName || "").trim();
    const nameB = (b.name || b.studentName || "").trim();
    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", width: "100%", animation: "fadeIn 0.5s ease", padding: "10px 0" }}>
      
      {/* Active Session vs Config Form */}
      {activeSession ? (
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          width: "100%",
          maxWidth: "1180px",
          alignItems: "stretch"
        }}>
          
          {/* Left Panel: QR Code, OTP & Session Controls */}
          <div className="dashboard-card" style={{
            flex: "1 1 380px",
            maxWidth: "440px",
            background: "rgba(30, 41, 59, 0.35)",
            border: "1px solid var(--card-border)",
            borderRadius: "24px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem",
            textAlign: "center"
          }}>
            {/* Active status pulse badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: "var(--success, #10b981)", display: "inline-block",
                boxShadow: "0 0 10px #10b981",
                animation: "pulse 1.5s infinite"
              }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#10b981", textTransform: "uppercase", letterSpacing: "1px" }}>
                ACTIVE ATTENDANCE SESSION
              </span>
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: "1.4rem", color: "#fff", fontWeight: "800" }}>
                {activeSession.subject}
              </h3>
              {activeSession.department && (
                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {activeSession.department} {activeSession.semester ? `· Sem ${activeSession.semester}` : ""} {activeSession.section ? `(${activeSession.section})` : ""}
                </p>
              )}
            </div>

            {/* QR Code with OTP */}
            <div style={{
              background: "#fff",
              padding: "1rem",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              position: "relative"
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `eduflow:session:${activeSession.id}:${activeSession.currentOtp}:${encodeURIComponent(activeSession.subject || "")}`
                )}`}
                alt="Session QR Code"
                style={{ width: "200px", height: "200px" }}
              />
              <div style={{ fontSize: "0.85rem", color: "#000", fontWeight: "800", background: "rgba(244, 63, 94, 0.12)", padding: "4px 10px", borderRadius: "6px", letterSpacing: "1px" }}>
                OTP: <span style={{ color: "#e11d48" }}>{activeSession.currentOtp || "123456"}</span>
              </div>
            </div>

            {/* Timer and Countdown */}
            <div>
              <span style={{ fontSize: "2rem", fontWeight: "800", color: timeLeft < 60 ? "#ef4444" : "#f43f5e", fontFamily: "var(--font-heading)" }}>
                {formatTimeLeft(timeLeft)}
              </span>
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Time remaining in this session
              </span>
            </div>

            {/* Summary Counters */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              width: "100%"
            }}>
              <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: "700", textTransform: "uppercase" }}>Signed In</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#10b981" }}>
                  {presentList.length}
                </div>
              </div>
              <div style={{ background: "rgba(244, 63, 94, 0.08)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "10px", borderRadius: "12px" }}>
                <div style={{ fontSize: "0.72rem", color: "#f43f5e", fontWeight: "700", textTransform: "uppercase" }}>Not Signed In</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f43f5e" }}>
                  {pendingList.length}
                </div>
              </div>
            </div>

            {/* Stop control button */}
            <button
              onClick={handleEndSession}
              disabled={sessionLoading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
                border: "none", color: "#fff", padding: "12px", borderRadius: "12px",
                fontWeight: "700", cursor: "pointer", fontSize: "0.95rem",
                boxShadow: "0 4px 14px rgba(244, 63, 94, 0.35)",
                transition: "opacity 0.2s"
              }}
            >
              {sessionLoading ? "Processing..." : "🛑 Stop Session"}
            </button>
          </div>

          {/* Right Panel: Live Real-Time Students Present & Cohort Roster */}
          <div className="dashboard-card" style={{
            flex: "2 1 500px",
            background: "rgba(30, 41, 59, 0.35)",
            border: "1px solid var(--card-border)",
            borderRadius: "24px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem"
          }}>
            {/* Header & Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#fff", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📋</span> Live Attendance Roster
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Real-time check-in stream ({presentList.length} / {sessionStudents.length} present)
                </p>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: "flex", gap: "6px", background: "rgba(0,0,0,0.25)", padding: "4px", borderRadius: "10px" }}>
                <button
                  type="button"
                  onClick={() => setFilterStatus("ALL")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: filterStatus === "ALL" ? "var(--primary, #4f46e5)" : "transparent",
                    color: filterStatus === "ALL" ? "#fff" : "var(--text-muted)",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  All ({sessionStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("PRESENT")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: filterStatus === "PRESENT" ? "#10b981" : "transparent",
                    color: filterStatus === "PRESENT" ? "#fff" : "var(--text-muted)",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Present ({presentList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("PENDING")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: filterStatus === "PENDING" ? "#ef4444" : "transparent",
                    color: filterStatus === "PENDING" ? "#fff" : "var(--text-muted)",
                    fontSize: "0.78rem",
                    fontWeight: "700",
                    cursor: "pointer"
                  }}
                >
                  Not Signed In ({pendingList.length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <input
                type="text"
                placeholder="🔍 Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--card-border)",
                  background: "rgba(0, 0, 0, 0.2)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            {/* Student Roster List */}
            <div style={{
              flex: 1,
              maxHeight: "440px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              paddingRight: "4px"
            }}>
              {filteredStudents.length === 0 ? (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>⏳</div>
                  <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600" }}>
                    {filterStatus === "PRESENT" ? "No students signed in yet" : "No students match your search filter"}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem" }}>
                    Student check-ins will automatically appear here in real time as they scan the QR code.
                  </p>
                </div>
              ) : (
                filteredStudents.map((st, idx) => {
                  const isPresent = st.status === "PRESENT" || st.status === "LATE";
                  const initials = st.name
                    ? st.name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().substring(0, 2)
                    : "ST";

                  return (
                    <div
                      key={st.studentId || st.registerNumber || idx}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "14px",
                        background: isPresent ? "rgba(16, 185, 129, 0.06)" : "rgba(255, 255, 255, 0.02)",
                        border: isPresent ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(255, 255, 255, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Left: Avatar & Info */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: isPresent ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.08)",
                          color: isPresent ? "#10b981" : "var(--text-muted)",
                          border: isPresent ? "1px solid #10b981" : "1px solid transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "0.85rem"
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.92rem", fontWeight: "700", color: "#fff" }}>
                            {st.name}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", gap: "8px", alignItems: "center" }}>
                            <span>{st.registerNumber}</span>
                            {st.time && (
                              <span>• ⏱️ {st.time}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge & Manual override action */}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {isPresent ? (
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            fontSize: "0.75rem",
                            fontWeight: "800",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            ✓ {st.qrStatus || "PRESENT"}
                          </span>
                        ) : (
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            background: "rgba(255, 255, 255, 0.05)",
                            color: "var(--text-muted)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}>
                            ⚪ NOT SIGNED IN
                          </span>
                        )}

                        {/* Quick Manual Override button if faculty wants to mark manually */}
                        {handleManualOverride && (
                          <button
                            type="button"
                            onClick={() => handleManualOverride(st.studentId, isPresent ? "ABSENT" : "PRESENT")}
                            style={{
                              padding: "4px 8px",
                              background: "transparent",
                              border: "1px solid var(--card-border)",
                              borderRadius: "6px",
                              color: isPresent ? "#f43f5e" : "#10b981",
                              fontSize: "0.72rem",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                            title={isPresent ? "Mark student absent" : "Manually mark student present"}
                          >
                            {isPresent ? "Mark Absent" : "Mark Present"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Config form to start new QR session */
        <div className="dashboard-card" style={{
          background: "rgba(30, 41, 59, 0.25)",
          border: "1px solid var(--card-border)",
          borderRadius: "24px",
          padding: "2.5rem",
          maxWidth: "440px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>
          <h3 style={{ margin: 0, fontSize: "1.4rem", color: "#fff", fontWeight: "800", textAlign: "center" }}>
            📱 Launch QR Code Session
          </h3>

          <form onSubmit={handleStartSession} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="form-group">
              <label>Select Subject</label>
              <select
                className="input-field"
                style={{ 
                  height: "44px", 
                  minHeight: "44px", 
                  padding: "0 12px", 
                  fontSize: "0.88rem", 
                  lineHeight: "normal", 
                  color: "var(--text-main)", 
                  backgroundColor: "var(--bg-card, #ffffff)", 
                  border: "1px solid var(--card-border, #cbd5e1)", 
                  borderRadius: "8px", 
                  cursor: "pointer" 
                }}
                value={sessionSubject}
                onChange={(e) => setSessionSubject(e.target.value)}
                required
              >
                <option value="">-- Choose Subject --</option>
                {facultySubjects.map(sub => (
                  <option key={sub.id || sub.subjectCode} value={sub.subjectCode}>
                    {sub.subjectCode} - {sub.subjectName} {sub.department ? `(${sub.department.replace("Department of ", "")} · Sem ${sub.semester || 1}${sub.section ? ` ${sub.section}` : ""})` : ""}
                  </option>
                ))}
                {isAdvisor && (
                  <option value="CUSTOM">-- Enter Custom Code --</option>
                )}
              </select>
            </div>

            {sessionSubject === "CUSTOM" && (
              <div className="form-group">
                <label>Custom Subject Code</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. CS101"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Session Duration (Minutes): {sessionDuration}</label>
              <input
                type="range"
                min="1"
                max="30"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                style={{ width: "100%", accentColor: "#f43f5e", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <span>1 min</span>
                <span>30 mins</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={sessionLoading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
                border: "none", color: "#fff", padding: "12px", borderRadius: "10px",
                fontWeight: "700", cursor: "pointer", fontSize: "0.9rem",
                boxShadow: "0 4px 12px rgba(244,63,94,0.3)"
              }}
            >
              {sessionLoading ? "Launching..." : "⚡ Generate Live QR"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default FacultyQrSessionView;
