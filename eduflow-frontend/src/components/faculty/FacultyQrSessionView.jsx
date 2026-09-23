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
            background: "#09090b", // Deep sleek dark background
            border: "1px solid #27272a", // Subtle border
            borderRadius: "24px",
            padding: "2.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem",
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Ambient background glow */}
            <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>

            {/* Active status pulse badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", zIndex: 1 }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                backgroundColor: "#10b981", display: "inline-block",
                boxShadow: "0 0 10px #10b981",
                animation: "pulse 1.5s infinite"
              }} />
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#10b981", textTransform: "uppercase", letterSpacing: "1px" }}>
                LIVE ATTENDANCE
              </span>
            </div>

            <div style={{ zIndex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#f8fafc", fontWeight: "800", letterSpacing: "-0.5px" }}>
                {activeSession.subject}
              </h3>
              {activeSession.department && (
                <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "500" }}>
                  {activeSession.department} {activeSession.semester ? `· Sem ${activeSession.semester}` : ""} {activeSession.section ? `(${activeSession.section})` : ""}
                </p>
              )}
            </div>

            {/* QR Code with OTP */}
            <div style={{
              background: "#ffffff",
              padding: "1.5rem",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              position: "relative",
              zIndex: 1
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  `eduflow:session:${activeSession.id}:${activeSession.currentOtp}:${encodeURIComponent(activeSession.subject || "")}`
                )}`}
                alt="Session QR Code"
                style={{ width: "220px", height: "220px", display: "block" }}
              />
              <div style={{ 
                fontSize: "1rem", 
                color: "#0f172a", 
                fontWeight: "800", 
                background: "#f1f5f9", 
                padding: "8px 16px", 
                borderRadius: "10px", 
                letterSpacing: "2px",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <i className="fa-solid fa-key" style={{ color: "#64748b", fontSize: "0.8rem" }}></i>
                OTP: <span style={{ color: "#2563eb" }}>{activeSession.currentOtp || "123456"}</span>
              </div>
            </div>

            {/* Timer and Countdown */}
            <div style={{ zIndex: 1 }}>
              <div style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center", 
                padding: "8px 20px", 
                borderRadius: "12px", 
                background: timeLeft < 60 ? "rgba(239, 68, 68, 0.1)" : "rgba(37, 99, 235, 0.1)",
                border: `1px solid ${timeLeft < 60 ? "rgba(239, 68, 68, 0.3)" : "rgba(37, 99, 235, 0.3)"}` 
              }}>
                <i className="fa-solid fa-clock" style={{ color: timeLeft < 60 ? "#ef4444" : "#3b82f6", marginRight: "10px", fontSize: "1.2rem" }}></i>
                <span style={{ fontSize: "2rem", fontWeight: "800", color: timeLeft < 60 ? "#ef4444" : "#3b82f6", fontFamily: "'Fira Code', monospace", letterSpacing: "1px" }}>
                  {formatTimeLeft(timeLeft)}
                </span>
              </div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginTop: "8px", fontWeight: "600", textTransform: "uppercase" }}>
                Time remaining
              </span>
            </div>

            {/* Summary Counters */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              width: "100%",
              zIndex: 1
            }}>
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}><i className="fa-solid fa-user-check"></i> Signed In</div>
                <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#10b981" }}>
                  {presentList.length}
                </div>
              </div>
              <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "12px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" }}><i className="fa-solid fa-user-xmark"></i> Pending</div>
                <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#ef4444" }}>
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
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                border: "none", color: "#fff", padding: "14px", borderRadius: "14px",
                fontWeight: "700", cursor: "pointer", fontSize: "1rem",
                boxShadow: "0 8px 20px rgba(239, 68, 68, 0.25)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                zIndex: 1
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              {sessionLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : <><i className="fa-solid fa-power-off"></i> Stop Session</>}
            </button>
          </div>

          {/* Right Panel: Live Real-Time Students Present & Cohort Roster */}
          <div className="dashboard-card" style={{
            flex: "2 1 500px",
            background: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "24px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            {/* Header & Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.3rem", color: "#f8fafc", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className="fa-solid fa-users-viewfinder" style={{ color: "#3b82f6" }}></i> Live Roster
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "500" }}>
                  Real-time check-in stream ({presentList.length} / {sessionStudents.length} present)
                </p>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: "flex", gap: "6px", background: "#18181b", padding: "6px", borderRadius: "12px", border: "1px solid #27272a" }}>
                <button
                  type="button"
                  onClick={() => setFilterStatus("ALL")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: filterStatus === "ALL" ? "#3b82f6" : "transparent",
                    color: filterStatus === "ALL" ? "#fff" : "#94a3b8",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  All ({sessionStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("PRESENT")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: filterStatus === "PRESENT" ? "#10b981" : "transparent",
                    color: filterStatus === "PRESENT" ? "#fff" : "#94a3b8",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Present ({presentList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("PENDING")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: filterStatus === "PENDING" ? "#ef4444" : "transparent",
                    color: filterStatus === "PENDING" ? "#fff" : "#94a3b8",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Pending ({pendingList.length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}></i>
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 42px",
                  borderRadius: "12px",
                  border: "1px solid #27272a",
                  background: "#18181b",
                  color: "#f8fafc",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#3b82f6"}
                onBlur={e => e.currentTarget.style.borderColor = "#27272a"}
              />
            </div>

            {/* Student Roster List */}
            <div style={{
              flex: 1,
              maxHeight: "440px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingRight: "6px"
            }} className="custom-scrollbar">
              {filteredStudents.length === 0 ? (
                <div style={{ padding: "4rem 2rem", textAlign: "center", color: "#64748b", background: "#18181b", borderRadius: "16px", border: "1px dashed #27272a" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "12px", color: "#3f3f46" }}><i className="fa-solid fa-users-slash"></i></div>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#e4e4e7" }}>
                    {filterStatus === "PRESENT" ? "No students signed in yet" : "No students match your search filter"}
                  </p>
                  <p style={{ margin: "8px 0 0 0", fontSize: "0.85rem" }}>
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
                        padding: "16px",
                        borderRadius: "16px",
                        background: isPresent ? "rgba(16, 185, 129, 0.05)" : "#18181b",
                        border: isPresent ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid #27272a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={e => { if(!isPresent) e.currentTarget.style.borderColor = "#3f3f46"; }}
                      onMouseLeave={e => { if(!isPresent) e.currentTarget.style.borderColor = "#27272a"; }}
                    >
                      {/* Left: Avatar & Info */}
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: isPresent ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#27272a",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "1rem",
                          boxShadow: isPresent ? "0 4px 10px rgba(16, 185, 129, 0.3)" : "none"
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#f8fafc" }}>
                            {st.name}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#94a3b8", display: "flex", gap: "10px", alignItems: "center", marginTop: "4px", fontWeight: "500" }}>
                            <span style={{ background: "#27272a", padding: "2px 8px", borderRadius: "6px" }}>{st.registerNumber}</span>
                            {st.time && (
                              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><i className="fa-regular fa-clock"></i> {st.time}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status badge & Manual override action */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {isPresent ? (
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.2)",
                            fontSize: "0.8rem",
                            fontWeight: "800",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <i className="fa-solid fa-check"></i> {st.qrStatus || "PRESENT"}
                          </span>
                        ) : (
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background: "rgba(239, 68, 68, 0.05)",
                            color: "#ef4444",
                            border: "1px solid rgba(239, 68, 68, 0.1)",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <i className="fa-regular fa-circle"></i> PENDING
                          </span>
                        )}

                        {/* Quick Manual Override button if faculty wants to mark manually */}
                        {handleManualOverride && (
                          <button
                            type="button"
                            onClick={() => handleManualOverride(st.studentId, isPresent ? "ABSENT" : "PRESENT")}
                            style={{
                              padding: "6px 12px",
                              background: isPresent ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)",
                              border: `1px solid ${isPresent ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
                              borderRadius: "8px",
                              color: isPresent ? "#ef4444" : "#10b981",
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            title={isPresent ? "Mark student absent" : "Manually mark student present"}
                            onMouseEnter={e => e.currentTarget.style.background = isPresent ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}
                            onMouseLeave={e => e.currentTarget.style.background = isPresent ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)"}
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
          background: "linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "3rem 2.5rem",
          maxWidth: "480px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(16px)"
        }}>
          {/* Decorative background elements */}
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(244,63,94,0.15) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: "-50px", left: "-50px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%" }}></div>

          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div style={{ 
              width: "64px", 
              height: "64px", 
              background: "linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(225,29,72,0.1) 100%)", 
              borderRadius: "16px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 1.5rem auto",
              border: "1px solid rgba(244,63,94,0.3)",
              boxShadow: "0 0 20px rgba(244,63,94,0.15)"
            }}>
              <span style={{ fontSize: "2rem" }}>📱</span>
            </div>
            <h3 style={{ margin: 0, fontSize: "1.6rem", color: "#fff", fontWeight: "800", letterSpacing: "-0.5px" }}>
              Launch QR Code Session
            </h3>
            <p style={{ margin: "8px 0 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Generate a live, time-limited QR code for instant student check-ins.
            </p>
          </div>

          <form onSubmit={handleStartSession} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", zIndex: 1 }}>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Select Subject</label>
              <select
                className="input-field"
                style={{ 
                  height: "50px", 
                  padding: "0 16px", 
                  fontSize: "0.95rem", 
                  color: "#fff", 
                  backgroundColor: "rgba(15, 23, 42, 0.6)", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: "12px", 
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  outline: "none",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                value={sessionSubject}
                onChange={(e) => setSessionSubject(e.target.value)}
                required
              >
                <option value="" style={{ background: "#0f172a" }}>-- Choose Subject --</option>
                {facultySubjects.map(sub => (
                  <option key={sub.id || sub.subjectCode} value={sub.subjectCode} style={{ background: "#0f172a" }}>
                    {sub.subjectCode} - {sub.subjectName} {sub.department ? `(${sub.department.replace("Department of ", "")} · Sem ${sub.semester || 1}${sub.section ? ` ${sub.section}` : ""})` : ""}
                  </option>
                ))}
                {isAdvisor && (
                  <option value="CUSTOM" style={{ background: "#0f172a" }}>-- Enter Custom Code --</option>
                )}
              </select>
            </div>

            {sessionSubject === "CUSTOM" && (
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "8px", animation: "fadeIn 0.3s ease" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Custom Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS101"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  style={{ 
                    height: "50px", 
                    padding: "0 16px", 
                    fontSize: "0.95rem", 
                    color: "#fff", 
                    backgroundColor: "rgba(15, 23, 42, 0.6)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    borderRadius: "12px",
                    outline: "none",
                    transition: "all 0.2s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  required
                />
              </div>
            )}

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Session Duration</label>
                <span style={{ 
                  background: "rgba(244,63,94,0.15)", 
                  color: "#f43f5e", 
                  padding: "4px 10px", 
                  borderRadius: "20px", 
                  fontSize: "0.8rem", 
                  fontWeight: "800" 
                }}>
                  {sessionDuration} Minutes
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                style={{ 
                  width: "100%", 
                  accentColor: "#f43f5e", 
                  cursor: "pointer",
                  height: "6px",
                  borderRadius: "10px",
                  appearance: "none",
                  background: "rgba(255,255,255,0.1)"
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
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
                border: "none", 
                color: "#fff", 
                padding: "16px", 
                borderRadius: "14px",
                fontWeight: "800", 
                cursor: sessionLoading ? "not-allowed" : "pointer", 
                fontSize: "1rem",
                boxShadow: "0 8px 20px rgba(244,63,94,0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                opacity: sessionLoading ? 0.7 : 1,
                transform: sessionLoading ? "scale(0.98)" : "scale(1)"
              }}
              onMouseEnter={(e) => !sessionLoading && (e.currentTarget.style.transform = "translateY(-2px)", e.currentTarget.style.boxShadow = "0 12px 25px rgba(244,63,94,0.4)")}
              onMouseLeave={(e) => !sessionLoading && (e.currentTarget.style.transform = "translateY(0)", e.currentTarget.style.boxShadow = "0 8px 20px rgba(244,63,94,0.3)")}
              onMouseDown={(e) => !sessionLoading && (e.currentTarget.style.transform = "translateY(1px)")}
            >
              {sessionLoading ? (
                <>
                  <span style={{ 
                    width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" 
                  }}></span>
                  Generating...
                </>
              ) : (
                <>⚡ Generate Live QR</>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default FacultyQrSessionView;
