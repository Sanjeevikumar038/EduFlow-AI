import { useState, useEffect } from "react";
import { getActiveSession, markAttendance } from "../services/attendanceService";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";

function StudentDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Student";
  const registerNumber = localStorage.getItem("registerNumber") || "";
  const token = localStorage.getItem("token");

  // Tab State: 'overview' or 'attendance'
  const [activeTab, setActiveTab] = useState("overview");

  // Attendance States
  const [activeSession, setActiveSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [sessionCheckLoading, setSessionCheckLoading] = useState(false);

  // Scanner States
  const [scannerActive, setScannerActive] = useState(false);
  const [qrInstance, setQrInstance] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => {
      setFeedback({ message: "", type: "" });
    }, 4000);
  };

  // Helper to parse local datetime safely from Java's LocalDateTime response format
  const parseLocalDateTime = (str) => {
    if (!str) return 0;
    const normalized = str.replace(" ", "T");
    const parts = normalized.split(/[T.:-]/);
    if (parts.length < 5) return new Date(normalized).getTime();
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);
    const second = parts[5] ? parseInt(parts[5], 10) : 0;
    return new Date(year, month, day, hour, minute, second).getTime();
  };

  // Check for active attendance session
  const checkActiveSession = async (silent = false) => {
    if (!token) return;
    if (!silent) setSessionCheckLoading(true);
    try {
      const res = await getActiveSession(token);
      if (res.data) {
        setActiveSession(res.data);
        const expiry = parseLocalDateTime(res.data.expiryTime);
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(diff);
      } else {
        setActiveSession(null);
        if (!silent) showFeedback("No active attendance session found.", "error");
      }
    } catch (error) {
      console.error("Error checking active session:", error);
      if (!silent) showFeedback("Failed to check active sessions.", "error");
    } finally {
      if (!silent) setSessionCheckLoading(false);
    }
  };

  // Get student GPS location coordinates strictly (No mock fallbacks allowed)
  const requestLocation = () => {
    if (!navigator.geolocation) {
      showFeedback("Geolocation is not supported by your browser.", "error");
      return;
    }
    setGpsLoading(true);
    setCoords(null); // Clear previous coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setGpsLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setCoords(null);
        setGpsLoading(false);
        showFeedback("GPS blocked. You must allow location access to mark attendance.", "error");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      checkActiveSession(true);
      requestLocation();
    } else {
      // If we exit tab, stop camera scanner
      stopCameraScanner();
    }
  }, [activeTab]);

  // Live timer for active session
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const expiry = parseLocalDateTime(activeSession.expiryTime);
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        setActiveSession(null);
        stopCameraScanner();
        showFeedback("Attendance session has expired.", "error");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Handle scanned data processing
  const processScannedPayload = async (decodedText, scannerInstance) => {
    // 1. Instantly stop scanner to avoid duplicate requests
    if (scannerInstance && scannerInstance.isScanning) {
      await scannerInstance.stop().catch(err => console.error("Error stopping scanner:", err));
    }
    setScannerActive(false);
    setQrInstance(null);

    // 2. Decode payload format: eduflow:session:id:otp
    const parts = decodedText.trim().split(":");
    if (parts.length >= 4 && parts[0] === "eduflow" && parts[1] === "session") {
      const parsedSessionId = parseInt(parts[2], 10);
      if (parsedSessionId !== activeSession.id) {
        showFeedback("Scanned QR code is for a different class session!", "error");
        return;
      }
      
      const otp = parts[3];
      submitAttendance(otp);
    } else {
      showFeedback("Invalid QR code format. Please scan the official class QR code.", "error");
    }
  };

  const submitAttendance = async (otp) => {
    if (!coords) {
      showFeedback("GPS location access is required. Please authorize location permission first.", "error");
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
          longitude: coords.longitude
        },
        token
      );
      showFeedback(res.data || "Attendance marked successfully as PRESENT!", "success");
      // Go back to overview after success
      setTimeout(() => {
        setActiveTab("overview");
      }, 2000);
    } catch (error) {
      showFeedback(error.response?.data || "Failed to mark attendance.", "error");
    } finally {
      setMarkingLoading(false);
    }
  };

  // Start HTML5 camera scanner
  const startCameraScanner = () => {
    if (!activeSession) return;
    if (!coords) {
      showFeedback("Please authorize location access before scanning.", "error");
      requestLocation();
      return;
    }
    setScannerActive(true);

    // Wait a tick for the #reader container to be mounted in the DOM
    setTimeout(() => {
      const scanner = new Html5Qrcode("reader");
      setQrInstance(scanner);

      const config = { fps: 10, qrbox: { width: 230, height: 230 } };

      scanner.start(
        { facingMode: "environment" }, // Rear camera on mobile
        config,
        (decodedText) => {
          processScannedPayload(decodedText, scanner);
        },
        (errorMessage) => {
          // Ignore scanning search ticks to prevent spamming logs
        }
      ).catch((err) => {
        console.error("Camera scanner failed to initialize:", err);
        showFeedback("Camera access blocked. Please check permissions.", "error");
        setScannerActive(false);
        setQrInstance(null);
      });
    }, 100);
  };

  // Stop camera scanner
  const stopCameraScanner = () => {
    if (qrInstance && qrInstance.isScanning) {
      qrInstance.stop().then(() => {
        qrInstance.clear();
        setScannerActive(false);
        setQrInstance(null);
      }).catch((err) => {
        console.error("Failed to stop camera scanner:", err);
      });
    } else {
      setScannerActive(false);
    }
  };

  // Cleanup camera scanning on unmount
  useEffect(() => {
    return () => {
      if (qrInstance && qrInstance.isScanning) {
        qrInstance.stop().catch(err => console.log(err));
      }
    };
  }, [qrInstance]);

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: "1100px", width: "100%" }}>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Student Portal</h1>
          <p>Welcome back, {name}! {registerNumber && `(Reg No: ${registerNumber})`}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Feedback banner */}
      {feedback.message && (
        <div
          style={{
            background: feedback.type === "error" ? "rgba(239, 68, 68, 0.2)" : feedback.type === "warning" ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)",
            border: `1px solid ${feedback.type === "error" ? "var(--error)" : feedback.type === "warning" ? "var(--warning)" : "var(--success)"}`,
            color: feedback.type === "error" ? "var(--error)" : feedback.type === "warning" ? "var(--warning)" : "var(--success)",
            borderRadius: "10px",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontWeight: "500",
            animation: "fadeIn 0.3s ease"
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--card-border)", paddingBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            background: activeTab === "overview" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "overview" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📊 Portal Overview
        </button>
        <button
          onClick={() => setActiveTab("attendance")}
          style={{
            background: activeTab === "attendance" ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "rgba(31, 41, 55, 0.4)",
            color: "#fff",
            border: activeTab === "attendance" ? "none" : "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-heading)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease"
          }}
        >
          📅 Smart Attendance
        </button>
      </div>

      {activeTab === "overview" ? (
        <div className="dashboard-grid">
          <div className="dashboard-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("attendance")}>
            <h3>📅 Smart Attendance</h3>
            <p>Mark your daily class attendance instantly using QR code scanning and secure GPS location verification.</p>
          </div>

          <div className="dashboard-card">
            <h3>💬 AI Mock Interview</h3>
            <p>Practice mock interviews with automated speech-to-text response evaluations and targeted review feedback.</p>
          </div>

          <div className="dashboard-card">
            <h3>💻 Coding Assessment</h3>
            <p>Solve algorithm challenges and receive AI generated reviews regarding correctness, complexity, and styling.</p>
          </div>

          <div className="dashboard-card">
            <h3>📈 Career Readiness</h3>
            <p>Track your score based on academic attendance, resume metrics, coding challenges, and mock interview performance.</p>
          </div>
        </div>
      ) : (
        /* Attendance Tab Layout */
        <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", width: "100%" }}>
          
          {/* Left Panel: Active Session Detail */}
          <div style={{ flex: "1 1 450px" }}>
            {activeSession ? (
              <div className="dashboard-card" style={{
                background: "rgba(30, 41, 59, 0.4)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "2.5rem"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <span className="status-dot" style={{
                      width: "8px",
                      height: "8px",
                      backgroundColor: "var(--success)",
                      borderRadius: "50%",
                      display: "inline-block",
                      boxShadow: "0 0 8px var(--success)"
                    }}></span>
                    <span style={{ color: "var(--success)", fontWeight: "600", fontSize: "0.8rem", textTransform: "uppercase" }}>
                      Class Session Active
                    </span>
                  </div>

                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.5rem" }}>
                    {activeSession.subject}
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                    Session ID: {activeSession.id}
                  </p>

                  {/* Timer Display */}
                  <div style={{
                    background: "rgba(31, 41, 55, 0.6)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: "2rem",
                    maxWidth: "240px"
                  }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.25rem" }}>
                      Time Remaining
                    </span>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "2rem",
                      fontWeight: "700",
                      color: timeLeft < 60 ? "var(--error)" : "var(--primary)",
                      textShadow: timeLeft < 60 ? "0 0 10px rgba(239, 68, 68, 0.2)" : "0 0 10px rgba(99, 102, 241, 0.2)"
                    }}>
                      {formatTimeLeft(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* GPS Location Status */}
                <div style={{
                  background: "rgba(30, 41, 59, 0.3)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  marginTop: "1rem"
                }}>
                  <h4 style={{ margin: "0 0 0.75rem 0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
                    📍 GPS Verification
                  </h4>
                  {gpsLoading ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>Locating coordinates...</p>
                  ) : coords ? (
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <p style={{ marginBottom: "0.25rem" }}>Latitude: <span style={{ color: "#fff", fontWeight: "500" }}>{coords.latitude.toFixed(6)}</span></p>
                      <p style={{ marginBottom: "0.25rem" }}>Longitude: <span style={{ color: "#fff", fontWeight: "500" }}>{coords.longitude.toFixed(6)}</span></p>
                      <p style={{ margin: 0 }}>Accuracy: <span style={{ color: "var(--success)" }}>~{coords.accuracy.toFixed(1)}m</span></p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: "var(--error)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                        GPS authorization required to mark attendance.
                      </p>
                      <button
                        onClick={requestLocation}
                        style={{
                          background: "transparent",
                          border: "1px solid var(--primary)",
                          color: "var(--primary)",
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontWeight: "600"
                        }}
                      >
                        Authorize GPS Location
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="dashboard-card" style={{
                background: "rgba(30, 41, 59, 0.2)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "3rem 2rem"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 2s infinite" }}>📡</div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>No Active Sessions</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "300px", marginBottom: "2rem" }}>
                  Please wait for your faculty instructor to begin the attendance session.
                </p>
                <button
                  onClick={() => checkActiveSession(false)}
                  disabled={sessionCheckLoading}
                  className="auth-btn"
                  style={{
                    maxWidth: "200px",
                    padding: "0.75rem 1.25rem",
                    fontSize: "0.9rem",
                    margin: 0
                  }}
                >
                  {sessionCheckLoading ? "Checking..." : "🔄 Refresh Status"}
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Camera Scanner */}
          <div className="dashboard-card" style={{
            flex: "1 1 450px",
            background: "rgba(30, 41, 59, 0.4)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "2.5rem",
            textAlign: "center"
          }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Scan Class QR Code
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "2rem" }}>
                Scan the dynamic QR code displayed on the professor's screen using your mobile or webcam camera.
              </p>

              {activeSession ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
                  {scannerActive ? (
                    <div className="scanner-container">
                      <div className="scanner-laser"></div>
                      <div id="reader" style={{ width: "100%", height: "100%", objectFit: "cover" }}></div>
                    </div>
                  ) : (
                    <div style={{
                      width: "100%",
                      maxWidth: "350px",
                      aspectRatio: "1",
                      borderRadius: "16px",
                      border: "2px dashed var(--card-border)",
                      background: "rgba(31, 41, 55, 0.3)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "1rem"
                    }}>
                      <div style={{ fontSize: "2.5rem" }}>📷</div>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Camera inactive</span>
                    </div>
                  )}

                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                    {scannerActive ? (
                      <button
                        onClick={stopCameraScanner}
                        className="logout-btn"
                        style={{ width: "100%", maxWidth: "250px", padding: "0.85rem", borderRadius: "10px" }}
                      >
                        ⏹ Stop Camera
                      </button>
                    ) : (
                      <button
                        onClick={startCameraScanner}
                        disabled={markingLoading || !coords}
                        className="auth-btn"
                        style={{
                          background: coords 
                            ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)"
                            : "rgba(255, 255, 255, 0.05)",
                          width: "100%",
                          maxWidth: "250px",
                          margin: 0,
                          cursor: coords ? "pointer" : "not-allowed",
                          border: coords ? "none" : "1px solid var(--card-border)",
                          color: coords ? "#fff" : "var(--text-muted)"
                        }}
                      >
                        🎥 Open Camera Scanner
                      </button>
                    )}

                    {!coords && (
                      <p style={{ color: "var(--error)", fontSize: "0.8rem", fontWeight: "500", marginTop: "0.25rem" }}>
                        ⚠️ You must authorize GPS location access to scan.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "3rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Awaiting active class session details...
                </div>
              )}
            </div>

            {activeSession && (
              <div style={{ textAlign: "center", padding: "1rem 0", color: "var(--text-muted)", fontSize: "0.8rem", borderTop: "1px solid var(--card-border)" }}>
                🛡️ Mock locations and bypass methods are strictly disabled.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
