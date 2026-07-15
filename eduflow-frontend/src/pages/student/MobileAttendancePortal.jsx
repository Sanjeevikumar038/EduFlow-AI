import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveSession, markAttendance, getStudentAnalytics } from "../../services/attendanceService";
import { Html5Qrcode } from "html5-qrcode";

function MobileAttendancePortal() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name") || "Student";
  const registerNumber = localStorage.getItem("registerNumber") || "N/A";
  const department = localStorage.getItem("department") || "N/A";

  const initials = name
    ? name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "ST";

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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
    <div style={{
      width: "100%",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-sans)",
      color: "#1e293b",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
        padding: "24px 20px 48px 20px",
        borderBottomLeftRadius: "24px",
        borderBottomRightRadius: "24px",
        boxShadow: "0 4px 20px rgba(79, 70, 229, 0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff" }}>E</div>
            <h1 style={{ color: "#ffffff", fontSize: "1.2rem", fontWeight: "700", margin: 0, fontFamily: "var(--font-heading)" }}>EduFlow</h1>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4f46e5",
            fontWeight: "800",
            fontSize: "1.2rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            border: "2px solid rgba(255,255,255,0.5)"
          }}>
            {initials}
          </div>
          <div>
            <h2 style={{ color: "#ffffff", fontSize: "1.2rem", fontWeight: "700", margin: "0 0 4px 0" }}>{name}</h2>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0, fontSize: "0.85rem", fontWeight: "500" }}>{registerNumber} • {department}</p>
          </div>
        </div>
      </div>

      {/* Main Content Card (Overlapping header) */}
      <div style={{ padding: "0 16px", marginTop: "-24px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Scan Results Overlay/Message */}
        {scanResult && (
          <div style={{
            padding: "16px",
            borderRadius: "16px",
            backgroundColor: scanResult.success ? "#dcfce7" : "#fee2e2",
            color: scanResult.success ? "#166534" : "#991b1b",
            border: `1px solid ${scanResult.success ? "#bbf7d0" : "#fecaca"}`,
            fontWeight: "600",
            fontSize: "0.95rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            animation: "fadeIn 0.3s ease"
          }}>
            {scanResult.success ? "✅ " : "❌ "}
            {scanResult.message}
          </div>
        )}

        {/* Main Attendance Card */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          
          {/* Active Session Area */}
          <div>
            <h3 style={{ fontSize: "0.9rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 12px 0" }}>Current Session</h3>
            
            {attendanceLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Checking live sessions...</div>
            ) : activeSession ? (
              <div style={{
                background: "#f1f5f9",
                borderRadius: "16px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "700", color: "#0f172a" }}>{activeSession.subject}</h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#475569" }}>{activeSession.facultyName || "Faculty"}</p>
                  </div>
                  <div style={{ 
                    background: timeLeft < 60 ? "#fee2e2" : "#e0e7ff", 
                    color: timeLeft < 60 ? "#ef4444" : "#4f46e5", 
                    padding: "4px 10px", 
                    borderRadius: "20px", 
                    fontSize: "0.8rem", 
                    fontWeight: "700" 
                  }}>
                    {formatTimeLeft(timeLeft)}
                  </div>
                </div>

                {/* GPS Status */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: "600" }}>
                    <i className="fa-solid fa-location-dot" style={{ color: coords ? "#10b981" : "#ef4444" }}></i>
                    <span style={{ color: coords ? "#10b981" : "#ef4444" }}>
                      {gpsLoading ? "Acquiring GPS..." : coords ? "GPS Verified" : "GPS Required"}
                    </span>
                  </div>
                  {!coords && (
                    <button onClick={requestLocation} style={{ background: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "4px 10px", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", color: "#475569" }}>Retry</button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "24px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💤</div>
                <h4 style={{ margin: 0, color: "#334155", fontSize: "1rem", fontWeight: "600" }}>No Active Session</h4>
                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>Faculty has not started attendance.</p>
                <button onClick={() => { fetchActiveSession(); fetchAnalytics(); }} style={{ marginTop: "12px", background: "#e2e8f0", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600", color: "#475569", cursor: "pointer" }}>Refresh</button>
              </div>
            )}
          </div>

          {/* QR Scanner Area */}
          {activeSession && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {!scannerActive ? (
                <button
                  onClick={startScanner}
                  disabled={markingLoading || !coords}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: (markingLoading || !coords) ? "#94a3b8" : "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "16px",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    cursor: (markingLoading || !coords) ? "not-allowed" : "pointer",
                    boxShadow: (markingLoading || !coords) ? "none" : "0 6px 15px rgba(79, 70, 229, 0.3)"
                  }}
                >
                  <i className="fa-solid fa-qrcode" style={{ fontSize: "1.3rem" }}></i>
                  {markingLoading ? "Marking..." : "Scan QR Code"}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                  <div style={{ position: "relative", width: "100%", maxWidth: "320px", aspectRatio: "1/1", borderRadius: "16px", overflow: "hidden", border: "3px solid #4f46e5", background: "#000" }}>
                    <div id="reader" style={{ width: "100%", height: "100%" }}></div>
                    <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "2px", background: "#ef4444", boxShadow: "0 0 10px #ef4444", animation: "pulse 1.5s infinite" }} />
                  </div>
                  <button onClick={stopScanner} style={{ padding: "10px 20px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "12px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", width: "100%", maxWidth: "320px" }}>
                    Cancel Scan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analytics Card (Today's Attendance summary) */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          marginBottom: "32px" // Padding for bottom of scroll
        }}>
          <h3 style={{ fontSize: "0.9rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px", margin: "0 0 16px 0" }}>Overall Status</h3>
          
          {analyticsLoading ? (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "12px" }}>Loading stats...</div>
          ) : analytics ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: `4px solid ${analytics.overallAttendancePercentage >= 75 ? "#10b981" : "#ef4444"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  fontWeight: "800",
                  color: "#0f172a"
                }}>
                  {Math.round(analytics.overallAttendancePercentage)}%
                </div>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", color: "#0f172a", fontWeight: "700" }}>{analytics.attendanceStatus}</h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", display: "flex", gap: "12px" }}>
                    <span><strong style={{ color: "#10b981" }}>{analytics.presentClasses}</strong> Present</span>
                    <span><strong style={{ color: "#ef4444" }}>{analytics.absentClasses}</strong> Absent</span>
                  </p>
                </div>
              </div>
              
              {/* Subject Wise List replacing Recent History for now since we have no History API */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "4px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>Subject Wise</h4>
                {analytics.subjectWiseAttendance && analytics.subjectWiseAttendance.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {analytics.subjectWiseAttendance.map((sub, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: idx < analytics.subjectWiseAttendance.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, paddingRight: "16px" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.subject}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                          <span style={{ fontSize: "1rem", fontWeight: "700", color: sub.attendancePercentage >= 75 ? "#10b981" : "#ef4444" }}>{Math.round(sub.attendancePercentage)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: "12px" }}>No subjects found.</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "12px" }}>Stats unavailable.</div>
          )}
        </div>

      </div>
    </div>
  );
}

export default MobileAttendancePortal;
