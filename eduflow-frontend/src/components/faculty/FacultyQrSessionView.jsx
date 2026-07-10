import React from "react";

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
  checkedInStudents,
  sessionStudents,
  handleStartSession,
  handleEndSession,
  formatTimeLeft,
  handleManualOverride
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", width: "100%", animation: "fadeIn 0.5s ease" }}>
      
      {/* Active Session vs Config Form */}
      {activeSession ? (
        <div className="dashboard-card" style={{
          background: "rgba(30, 41, 59, 0.25)",
          border: "1px solid var(--card-border)",
          borderRadius: "24px",
          padding: "2.5rem",
          maxWidth: "480px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
          textAlign: "center"
        }}>
          {/* Active status pulse badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              backgroundColor: "var(--success)", display: "inline-block",
              animation: "pulse 1.5s infinite"
            }} />
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--success)", textTransform: "uppercase", letterSpacing: "1px" }}>
              ACTIVE ATTENDANCE SESSION
            </span>
          </div>

          <h3 style={{ margin: 0, fontSize: "1.8rem", color: "#fff", fontWeight: "800" }}>
            {activeSession.subject}
          </h3>

          {/* QR Code Placeholder with cyclic OTP overlay */}
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
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                JSON.stringify({
                  sessionId: activeSession.id,
                  otp: activeSession.currentOtp,
                  subject: activeSession.subject
                })
              )}`}
              alt="Session QR Code"
              style={{ width: "200px", height: "200px" }}
            />
            <div style={{ fontSize: "0.8rem", color: "#000", fontWeight: "700", background: "rgba(244, 63, 94, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
              OTP: {activeSession.currentOtp || "123456"}
            </div>
          </div>

          {/* Timer and Countdown */}
          <div>
            <span style={{ fontSize: "2rem", fontWeight: "800", color: "#f43f5e", fontFamily: "var(--font-heading)" }}>
              {formatTimeLeft(timeLeft)}
            </span>
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Time remaining in this session
            </span>
          </div>

          {/* Checked-in counter */}
          <div style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "12px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>STUDENTS SIGNED IN</div>
            <div style={{ fontSize: "2.25rem", fontWeight: "800", color: "#fff" }}>
              {checkedInStudents.length}
            </div>
          </div>

          {/* Stop control button */}
          <button
            onClick={handleEndSession}
            disabled={sessionLoading}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
              border: "none", color: "#fff", padding: "12px", borderRadius: "10px",
              fontWeight: "700", cursor: "pointer", fontSize: "0.9rem",
              transition: "opacity 0.2s"
            }}
          >
            {sessionLoading ? "Processing..." : "🛑 Stop Session"}
          </button>
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
                value={sessionSubject}
                onChange={(e) => setSessionSubject(e.target.value)}
                required
              >
                <option value="">-- Choose Subject --</option>
                {facultySubjects.map(sub => (
                  <option key={sub.id} value={sub.subjectCode}>
                    {sub.subjectCode} - {sub.subjectName}
                  </option>
                ))}
                <option value="CUSTOM">-- Enter Custom Code --</option>
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
