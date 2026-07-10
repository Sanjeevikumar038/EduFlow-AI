import React, { useState, useEffect } from "react";
import { getActiveSession, markAttendance, getStudentAnalytics } from "../../services/attendanceService";
import { Html5Qrcode } from "html5-qrcode";
import API_BASE from "../../services/api";

function AttendancePage() {
  const token = localStorage.getItem("token");

  // Scanner & Active Session states
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [qrInstance, setQrInstance] = useState(null);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // GPS states
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const showResult = (success, message) => {
    setScanResult({ success, message });
    setTimeout(() => setScanResult(null), 4000);
  };

  const parseLocalDateTime = (str) => {
    if (!str) return 0;
    const normalized = str.replace(" ", "T");
    const parts = normalized.split(/[T.:-]/);
    if (parts.length < 5) return new Date(normalized).getTime();
    return new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      parseInt(parts[3], 10),
      parseInt(parts[4], 10),
      parts[5] ? parseInt(parts[5], 10) : 0
    ).getTime();
  };

  const fetchActiveSession = async () => {
    if (!token) return;
    setAttendanceLoading(true);
    try {
      const res = await getActiveSession(token);
      if (res.data) {
        setActiveSession(res.data);
        const expiry = parseLocalDateTime(res.data.expiryTime);
        const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
        setTimeLeft(diff);
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error("Error fetching active session:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!token) return;
    setAnalyticsLoading(true);
    try {
      const res = await getStudentAnalytics(token);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching student analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      showResult(false, "Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setCoords(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        const msgs = {
          1: "GPS permission denied. Please allow location access.",
          2: "GPS position unavailable. Try outdoors.",
          3: "GPS request timed out. Please try again.",
        };
        showResult(false, msgs[error.code] || "GPS error. Please check permissions.");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    fetchActiveSession();
    requestLocation();
    fetchAnalytics();
  }, [token]);

  // Countdown timer for active session
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const expiry = parseLocalDateTime(activeSession.expiryTime);
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        setActiveSession(null);
        stopScanner();
        showResult(false, "Attendance session has expired.");
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const submitAttendance = async (otp) => {
    if (!coords) {
      showResult(false, "GPS location is required. Please authorize location access first.");
      requestLocation();
      return;
    }
    setMarkingLoading(true);
    try {
      const res = await markAttendance(
        {
          sessionId: activeSession.id,
          otp: otp,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        token
      );
      showResult(true, res.data || "Attendance marked successfully as PRESENT!");
      // Re-fetch analytics immediately to reflect attendance updates
      fetchAnalytics();
    } catch (err) {
      showResult(false, err.response?.data || "Failed to mark attendance.");
    } finally {
      setMarkingLoading(false);
    }
  };

  const processScannedPayload = async (decodedText, scannerInst) => {
    if (scannerInst && scannerInst.isScanning) {
      await scannerInst.stop().catch(() => {});
    }
    setScannerActive(false);
    setQrInstance(null);

    const parts = decodedText.trim().split(":");
    if (parts.length >= 4 && parts[0] === "eduflow" && parts[1] === "session") {
      const parsedId = parseInt(parts[2], 10);
      if (parsedId !== activeSession.id) {
        showResult(false, "Scanned QR code is for a different class session!");
        return;
      }
      submitAttendance(parts[3]);
    } else {
      showResult(false, "Invalid QR code format. Please scan the official class QR code.");
    }
  };

  const startScanner = () => {
    if (!activeSession) return;
    if (!coords) {
      showResult(false, "Please authorize GPS location access before scanning.");
      requestLocation();
      return;
    }
    setScannerActive(true);
    setTimeout(() => {
      const scanner = new Html5Qrcode("reader");
      setQrInstance(scanner);
      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => processScannedPayload(decodedText, scanner),
          () => {}
        )
        .catch((err) => {
          console.error("Scanner failed:", err);
          showResult(false, "Camera access blocked. Please check permissions.");
          setScannerActive(false);
          setQrInstance(null);
        });
    }, 100);
  };

  const stopScanner = () => {
    if (qrInstance && qrInstance.isScanning) {
      qrInstance.stop().then(() => {
        qrInstance.clear();
        setScannerActive(false);
        setQrInstance(null);
      }).catch(() => {});
    } else {
      setScannerActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (qrInstance && qrInstance.isScanning) {
        qrInstance.stop().catch(() => {});
      }
    };
  }, [qrInstance]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }} className="animate-fade-in pb-8">
      
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          📅 Smart Attendance Hub
        </h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.95rem" }}>
          Scan class QR codes to mark presence and track your subject wise attendance analytics in real-time.
        </p>
      </div>

      {scanResult && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            border: scanResult.success ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(239, 68, 68, 0.25)",
            backgroundColor: scanResult.success ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
            color: scanResult.success ? "#10b981" : "#f43f5e",
            fontWeight: "600",
            fontSize: "0.95rem",
            animation: "fadeIn 0.3s ease"
          }}
        >
          {scanResult.success ? "✅ " : "❌ "}
          {scanResult.message}
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{ display: "flex", gap: "24px", flexDirection: "row", flexWrap: "wrap", width: "100%", alignItems: "stretch" }}>
        
        {/* Left Column (~60%): Active Session & Subject Breakdown */}
        <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Active Session & Scanner Widget Card */}
          <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px", margin: 0 }}>
              <span>📷</span> Live Session Scan
            </h3>

            {attendanceLoading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px", color: "var(--text-muted)" }}>
                <div style={{ width: "32px", height: "32px", border: "4px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s infinite linear", marginBottom: "16px" }} />
                <span>Checking active class sessions...</span>
              </div>
            ) : activeSession ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Active Session Details */}
                <div style={{ background: "rgba(99, 102, 241, 0.04)", border: "1px solid rgba(99, 102, 241, 0.15)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Active Class Session
                  </span>
                  <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--text-main)" }}>{activeSession.subject}</span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    <span>👨‍🏫 Faculty: <b>{activeSession.facultyName || "Unknown"}</b></span>
                    <span>⌛ Time Left: <b style={{ color: timeLeft < 60 ? "#f43f5e" : "#10b981" }}>{formatTimeLeft(timeLeft)}</b></span>
                  </div>
                </div>

                {/* GPS Acquiring Box */}
                <div style={{ background: "rgba(30, 41, 59, 0.2)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>📍 GPS Location Verification</span>
                    {gpsLoading ? (
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Acquiring coordinates...</span>
                    ) : coords ? (
                      <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "600" }}>✓ Location acquired (~{coords.accuracy.toFixed(0)}m accuracy)</span>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#f43f5e" }}>Location unauthorized. Location access is mandatory.</span>
                    )}
                  </div>
                  {!coords && (
                    <button
                      onClick={requestLocation}
                      style={{
                        padding: "0.4rem 1rem",
                        background: "transparent",
                        border: "1px solid var(--card-border)",
                        color: "var(--text-main)",
                        fontWeight: "600",
                        fontSize: "0.8rem",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Authorize GPS
                    </button>
                  )}
                </div>

                {/* Camera / Scan Drawer */}
                {!scannerActive ? (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={startScanner}
                      disabled={markingLoading || !coords}
                      style={{
                        padding: "0.75rem 2rem",
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        opacity: (markingLoading || !coords) ? 0.5 : 1,
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.25)"
                      }}
                    >
                      {markingLoading ? "Registering Presence..." : "Scan Session QR Code 📷"}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <div style={{ position: "relative", width: "320px", height: "320px", border: "2px solid var(--primary)", borderRadius: "16px", overflow: "hidden", background: "#000" }}>
                      <div id="reader" style={{ width: "320px", height: "320px" }}></div>
                      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "2px", background: "#ef4444", boxShadow: "0 0 8px #ef4444", animation: "pulse 1.5s infinite" }} />
                    </div>
                    <button
                      onClick={stopScanner}
                      style={{
                        padding: "0.5rem 1.5rem",
                        background: "rgba(244, 63, 94, 0.12)",
                        border: "1px solid rgba(244, 63, 94, 0.3)",
                        color: "#f43f5e",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Dismiss Scanner
                    </button>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", border: "1px dashed var(--card-border)", borderRadius: "12px", background: "rgba(30, 41, 59, 0.05)" }}>
                <span style={{ fontSize: "2.5rem", marginBottom: "12px" }}>💤</span>
                <span style={{ color: "var(--text-main)", fontWeight: "700", fontSize: "1rem" }}>No active sessions conducting</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px", textAlign: "center" }}>
                  Your faculty has not launched an attendance session for this period.
                </span>
                <button
                  onClick={() => { fetchActiveSession(); fetchAnalytics(); }}
                  style={{
                    marginTop: "16px",
                    padding: "0.5rem 1.25rem",
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-main)",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  🔄 Refresh Status
                </button>
              </div>
            )}
          </div>

          {/* Subject Breakdown Card */}
          <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px", margin: 0 }}>
              <span>📚</span> Subject Wise Percentage
            </h3>

            {analyticsLoading ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>Loading analytics...</div>
            ) : !analytics || !analytics.subjectWiseAttendance || analytics.subjectWiseAttendance.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                No subject attendance data available yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {analytics.subjectWiseAttendance.map((sub, idx) => {
                  const percentage = Math.round(sub.attendancePercentage);
                  const isBelowThreshold = sub.attendancePercentage < 75.0;
                  
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      
                      {/* Name & Badge Row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "0.9rem" }}>{sub.subject}</span>
                          {isBelowThreshold && (
                            <span style={{
                              padding: "2px 8px",
                              background: "rgba(244, 63, 94, 0.12)",
                              border: "1px solid rgba(244, 63, 94, 0.3)",
                              color: "#f43f5e",
                              borderRadius: "4px",
                              fontSize: "0.65rem",
                              fontWeight: "800"
                            }}>
                              LOW ATTENDANCE
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                          <span style={{ fontSize: "1.1rem", fontWeight: "800", color: isBelowThreshold ? "#f43f5e" : "var(--text-main)" }}>
                            {percentage}%
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            ({sub.presentClasses} present / {sub.presentClasses + sub.absentClasses} total)
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ height: "6px", width: "100%", background: "var(--card-border)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${percentage}%`,
                          background: isBelowThreshold ? "#f43f5e" : "var(--primary)",
                          borderRadius: "999px",
                          transition: "width 1s ease-out"
                        }} />
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (~40%): Stats & Alerts */}
        <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Overall Attendance Card */}
          <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px", width: "100%", textAlign: "left", margin: 0 }}>
              📈 Analytics Summary
            </h3>

            {analyticsLoading ? (
              <div style={{ padding: "24px", color: "var(--text-muted)" }}>Loading...</div>
            ) : analytics ? (
              <>
                {/* Score Gauge Circle */}
                <div style={{ position: "relative", width: "130px", height: "130px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg style={{ transform: "rotate(-90deg)", width: "130px", height: "130px" }}>
                    <circle cx="65" cy="65" r="54" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                    <circle
                      cx="65"
                      cy="65"
                      r="54"
                      fill="none"
                      stroke={analytics.overallAttendancePercentage >= 75.0 ? "var(--primary)" : "#f43f5e"}
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 - (analytics.overallAttendancePercentage / 100) * (2 * Math.PI * 54)}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "1.85rem", fontWeight: "900", color: "var(--text-main)" }}>
                      {Math.round(analytics.overallAttendancePercentage)}%
                    </span>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      color: analytics.overallAttendancePercentage >= 75.0 ? "#10b981" : "#f43f5e",
                      textTransform: "uppercase",
                      marginTop: "2px"
                    }}>
                      {analytics.attendanceStatus}
                    </span>
                  </div>
                </div>

                {/* Counters Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", width: "100%", marginTop: "8px" }}>
                  
                  <div style={{ background: "rgba(30, 41, 59, 0.2)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Present Classes</span>
                    <h4 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#10b981", margin: "4px 0 0 0" }}>{analytics.presentClasses}</h4>
                  </div>

                  <div style={{ background: "rgba(30, 41, 59, 0.2)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Absent Classes</span>
                    <h4 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#f43f5e", margin: "4px 0 0 0" }}>{analytics.absentClasses}</h4>
                  </div>

                </div>

                <div style={{ width: "100%", borderTop: "1px solid var(--card-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>Excused Leaves / OD:</span>
                   <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{analytics.excusedClasses} records</span>
                </div>
              </>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>Failed to compile profile data.</span>
            )}
          </div>

          {/* Low Attendance Alert Panel */}
          {!analyticsLoading && analytics && analytics.lowAttendanceWarning && (
            <div style={{
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              background: "rgba(244, 63, 94, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <span style={{ fontSize: "1.1rem" }}>⚠️ Low Attendance Warning</span>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.5" }}>
                {analytics.alertMessage || `Your overall attendance is below the 75% threshold. Please attend classes regularly to avoid detention.`}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AttendancePage;
