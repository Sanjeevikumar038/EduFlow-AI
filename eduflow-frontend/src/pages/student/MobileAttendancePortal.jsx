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

  // Active Session & Scanner states
  const [activeSession, setActiveSession] = useState(null);
  const [targetScanSession, setTargetScanSession] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [qrInstance, setQrInstance] = useState(null);
  const [markingLoading, setMarkingLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // GPS states
  const [coords, setCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Analytics & Enrolled Subjects states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const showResult = (success, message) => {
    setScanResult({ success, message });
    setTimeout(() => setScanResult(null), 5000);
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
      if (res.data?.subjectWiseAttendance) {
        const liveSub = res.data.subjectWiseAttendance.find(s => s.hasActiveSession);
        if (liveSub && liveSub.activeSessionId) {
          setActiveSession({
            id: liveSub.activeSessionId,
            subject: liveSub.subject,
            facultyName: liveSub.facultyName,
            currentOtp: liveSub.currentOtp,
            expiryTime: liveSub.expiryTime
          });
          if (liveSub.timeLeftSeconds) {
            setTimeLeft(liveSub.timeLeftSeconds);
          }
        }
      }
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
          1: "GPS permission denied. Please allow location access in your browser settings.",
          2: "GPS position unavailable. Try stepping near a window or outdoors.",
          3: "GPS request timed out. Please tap retry.",
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

  // Auto-poll every 8 seconds to detect live sessions in real time
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchAnalytics();
      fetchActiveSession();
    }, 8000);
    return () => clearInterval(pollInterval);
  }, [token]);

  // Countdown timer for active session
  useEffect(() => {
    if (!activeSession && timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          fetchActiveSession();
          fetchAnalytics();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, timeLeft]);

  const formatTimeLeft = (seconds) => {
    if (!seconds || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const parseQrPayload = (decodedText) => {
    if (!decodedText) return null;
    const text = String(decodedText).trim();

    // 1. Check JSON format
    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const data = JSON.parse(text);
        const sessionId = data.sessionId || data.id || data.session_id;
        const otp = data.otp || data.currentOtp || data.code;
        if (otp) {
          return { sessionId: sessionId ? parseInt(sessionId, 10) : undefined, otp: String(otp).trim(), subject: data.subject };
        }
      } catch (e) {}
    }

    // 2. Check standard eduflow colon format
    if (text.startsWith("eduflow:session:")) {
      const parts = text.split(":");
      if (parts.length >= 4) {
        return {
          sessionId: parseInt(parts[2], 10),
          otp: String(parts[3]).trim(),
          subject: parts[4] ? decodeURIComponent(parts[4]) : undefined
        };
      }
    }

    // 3. Check generic colon formats
    const colonParts = text.split(":");
    if (colonParts.length === 2 && !isNaN(colonParts[0])) {
      return { sessionId: parseInt(colonParts[0], 10), otp: String(colonParts[1]).trim() };
    }
    if (colonParts.length === 3 && colonParts[0].toLowerCase() === "session" && !isNaN(colonParts[1])) {
      return { sessionId: parseInt(colonParts[1], 10), otp: String(colonParts[2]).trim() };
    }

    // 4. Check URL parameter format
    if (text.includes("sessionId=") || text.includes("session_id=") || text.includes("otp=")) {
      try {
        const url = new URL(text.startsWith("http") ? text : `http://localhost/${text}`);
        const sId = url.searchParams.get("sessionId") || url.searchParams.get("session_id");
        const otp = url.searchParams.get("otp") || url.searchParams.get("code");
        if (otp) {
          return {
            sessionId: sId ? parseInt(sId, 10) : undefined,
            otp: String(otp).trim(),
            subject: url.searchParams.get("subject") || undefined
          };
        }
      } catch (e) {}
    }

    // 5. Raw OTP fallback
    if (/^\d{4,8}$/.test(text)) {
      return { otp: text.trim() };
    }

    return null;
  };

  const submitAttendance = async (otp, parsedSessionId = null) => {
    const targetSessionId = parsedSessionId || targetScanSession?.activeSessionId || activeSession?.id;
    if (!targetSessionId) {
      showResult(false, "No active class session identified.");
      return;
    }
    if (!coords) {
      showResult(false, "GPS location is required. Please authorize location permission.");
      requestLocation();
      return;
    }
    setMarkingLoading(true);
    try {
      const res = await markAttendance(
        {
          sessionId: targetSessionId,
          otp: otp,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        token
      );
      showResult(true, res.data || "Attendance marked successfully as PRESENT! 🎉");
      setTargetScanSession(null);
      fetchAnalytics();
      fetchActiveSession();
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

    const parsed = parseQrPayload(decodedText);
    if (parsed && parsed.otp) {
      const expectedId = targetScanSession?.activeSessionId || activeSession?.id;
      if (parsed.sessionId && expectedId && parsed.sessionId !== expectedId) {
        showResult(false, "Scanned QR code is for a different class session!");
        return;
      }
      submitAttendance(parsed.otp, parsed.sessionId || expectedId);
    } else {
      showResult(false, "Invalid QR code format. Please scan the official class QR code.");
    }
  };

  const startScanner = (subItem = null) => {
    setTargetScanSession(subItem);
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
          console.error("Scanner start failed:", err);
          showResult(false, "Camera access blocked. Please allow camera permissions in browser.");
          setScannerActive(false);
          setQrInstance(null);
        });
    }, 120);
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

  const subjectsList = analytics?.subjectWiseAttendance || [];
  const activeSubjectItem = subjectsList.find(s => s.hasActiveSession) || (activeSession ? {
    subject: activeSession.subject,
    subjectName: activeSession.subject,
    facultyName: activeSession.facultyName,
    hasActiveSession: true,
    activeSessionId: activeSession.id,
    timeLeftSeconds: timeLeft
  } : null);

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
      color: "#1e293b",
    }}>
      {/* Top Header Card */}
      <div style={{
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        padding: "20px 20px 42px 20px",
        borderBottomLeftRadius: "28px",
        borderBottomRightRadius: "28px",
        boxShadow: "0 8px 25px rgba(29, 78, 216, 0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff" }}>E</div>
            <h1 style={{ color: "#ffffff", fontSize: "1.15rem", fontWeight: "700", margin: 0 }}>EduFlow Attendance</h1>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(255, 255, 255, 0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>

        {/* Student Identification */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1d4ed8",
            fontWeight: "800",
            fontSize: "1.15rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
            border: "2px solid rgba(255,255,255,0.6)"
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: "#ffffff", fontSize: "1.15rem", fontWeight: "700", margin: "0 0 2px 0" }}>{name}</h2>
            <p style={{ color: "rgba(255, 255, 255, 0.85)", margin: 0, fontSize: "0.8rem", fontWeight: "500" }}>{registerNumber}</p>
            <p style={{ color: "rgba(255, 255, 255, 0.75)", margin: "2px 0 0 0", fontSize: "0.75rem" }}>{department}</p>
          </div>
        </div>

        {/* GPS Indicator Banner */}
        <div style={{
          marginTop: "14px",
          background: "rgba(255, 255, 255, 0.15)",
          borderRadius: "12px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#ffffff",
          fontSize: "0.78rem",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="fa-solid fa-location-dot" style={{ color: coords ? "#86efac" : "#fca5a5" }}></i>
            <span>{gpsLoading ? "Acquiring GPS location..." : coords ? "GPS Verified (Ready to Mark)" : "GPS Required"}</span>
          </div>
          {!coords && (
            <button onClick={requestLocation} style={{ background: "rgba(255,255,255,0.25)", border: "none", color: "#fff", borderRadius: "6px", padding: "3px 8px", fontSize: "0.72rem", cursor: "pointer", fontWeight: "600" }}>
              Enable GPS
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div style={{ padding: "0 16px", marginTop: "-20px", flex: 1, display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "36px" }}>

        {/* Result Toast Notification */}
        {scanResult && (
          <div style={{
            padding: "14px 16px",
            borderRadius: "16px",
            backgroundColor: scanResult.success ? "#dcfce7" : "#fee2e2",
            color: scanResult.success ? "#166534" : "#991b1b",
            border: `1px solid ${scanResult.success ? "#bbf7d0" : "#fecaca"}`,
            fontWeight: "600",
            fontSize: "0.9rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            animation: "fadeIn 0.3s ease"
          }}>
            {scanResult.success ? "✅ " : "❌ "}
            {scanResult.message}
          </div>
        )}

        {/* 1. TOP HIGHLIGHT: Active QR Session Banner (If Any Live) */}
        {activeSubjectItem ? (
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            border: "2px solid #86efac",
            borderRadius: "20px",
            padding: "18px",
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  display: "inline-block",
                  boxShadow: "0 0 10px #10b981",
                  animation: "pulse 1.5s infinite"
                }} />
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  LIVE CLASS QR OPEN
                </span>
              </div>
              <div style={{
                background: timeLeft < 60 ? "#fee2e2" : "#dcfce7",
                color: timeLeft < 60 ? "#dc2626" : "#166534",
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: "800"
              }}>
                ⏳ {formatTimeLeft(timeLeft || activeSubjectItem.timeLeftSeconds)}
              </div>
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "800", color: "#0f172a" }}>
                {activeSubjectItem.subject}
              </h3>
              {activeSubjectItem.subjectName && activeSubjectItem.subjectName !== activeSubjectItem.subject && (
                <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#334155", fontWeight: "600" }}>
                  {activeSubjectItem.subjectName}
                </p>
              )}
              <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                Faculty: <strong style={{ color: "#334155" }}>{activeSubjectItem.facultyName || "Course Instructor"}</strong>
              </p>
            </div>

            <button
              onClick={() => startScanner(activeSubjectItem)}
              disabled={markingLoading || !coords}
              style={{
                width: "100%",
                padding: "14px",
                background: (markingLoading || !coords) ? "#94a3b8" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                fontSize: "1rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: (markingLoading || !coords) ? "not-allowed" : "pointer",
                boxShadow: (markingLoading || !coords) ? "none" : "0 6px 18px rgba(16, 185, 129, 0.35)"
              }}
            >
              <i className="fa-solid fa-qrcode" style={{ fontSize: "1.2rem" }}></i>
              {markingLoading ? "Marking Attendance..." : "📷 Scan QR Code to Mark Present"}
            </button>
          </div>
        ) : (
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                ⏳
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#334155" }}>No Active QR Session</h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#64748b" }}>Waiting for faculty to open live class QR</p>
              </div>
            </div>
            <button
              onClick={() => { fetchAnalytics(); fetchActiveSession(); }}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "8px 12px",
                fontSize: "0.78rem",
                fontWeight: "700",
                color: "#475569",
                cursor: "pointer"
              }}
            >
              🔄 Refresh
            </button>
          </div>
        )}

        {/* 2. OVERALL ATTENDANCE PROGRESS CARD */}
        {analytics && (
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            padding: "16px 18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: `4px solid ${analytics.overallAttendancePercentage >= 75 ? "#10b981" : "#ef4444"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                fontWeight: "800",
                color: "#0f172a"
              }}>
                {Math.round(analytics.overallAttendancePercentage)}%
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#0f172a" }}>{analytics.attendanceStatus}</h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#64748b", display: "flex", gap: "8px" }}>
                  <span><strong style={{ color: "#10b981" }}>{analytics.presentClasses}</strong> Present</span>
                  <span>•</span>
                  <span><strong style={{ color: "#ef4444" }}>{analytics.absentClasses}</strong> Absent</span>
                </p>
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "600" }}>
              Goal: 75%+
            </div>
          </div>
        )}

        {/* 3. ALL ENROLLED SUBJECTS LIST */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", padding: "0 4px" }}>
            <h3 style={{ fontSize: "0.9rem", color: "#475569", textTransform: "uppercase", fontWeight: "800", letterSpacing: "0.5px", margin: 0 }}>
              📚 My Enrolled Subjects ({subjectsList.length})
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Tap active subject to scan</span>
          </div>

          {analyticsLoading ? (
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", textAlign: "center", color: "#94a3b8" }}>
              Loading enrolled subjects...
            </div>
          ) : subjectsList.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", textAlign: "center", border: "1px dashed #cbd5e1" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>No curriculum subjects registered yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {subjectsList.map((sub, idx) => {
                const isLive = sub.hasActiveSession;
                const pct = Math.round(sub.attendancePercentage || 0);
                const total = (sub.presentClasses || 0) + (sub.absentClasses || 0);

                return (
                  <div
                    key={sub.subject || idx}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: isLive ? "0 8px 20px rgba(16, 185, 129, 0.15)" : "0 2px 6px rgba(0, 0, 0, 0.03)",
                      border: isLive ? "2px solid #86efac" : "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      position: "relative",
                      overflow: "hidden"
                    }}
                  >
                    {/* Top row: Subject code and Live beacon / percentage */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>
                            {sub.subject}
                          </span>
                          {isLive && (
                            <span style={{
                              background: "#dcfce7",
                              color: "#166534",
                              fontSize: "0.68rem",
                              fontWeight: "800",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" }} />
                              QR ACTIVE
                            </span>
                          )}
                        </div>
                        {sub.subjectName && sub.subjectName !== sub.subject && (
                          <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#475569", fontWeight: "500" }}>
                            {sub.subjectName}
                          </p>
                        )}
                        <p style={{ margin: "3px 0 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>
                          Faculty: <strong style={{ color: "#64748b" }}>{sub.facultyName || "Department Faculty"}</strong>
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: "800", color: pct >= 75 ? "#10b981" : "#ef4444" }}>
                          {pct}%
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          {sub.presentClasses || 0}/{total} Classes
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.min(100, Math.max(0, pct))}%`,
                        height: "100%",
                        background: pct >= 75 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #ef4444, #dc2626)",
                        borderRadius: "10px"
                      }} />
                    </div>

                    {/* Action Row */}
                    {isLive ? (
                      <button
                        onClick={() => startScanner(sub)}
                        disabled={markingLoading || !coords}
                        style={{
                          marginTop: "2px",
                          width: "100%",
                          padding: "10px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "0.85rem",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          cursor: "pointer"
                        }}
                      >
                        <i className="fa-solid fa-camera"></i>
                        Open Camera & Scan QR ({formatTimeLeft(timeLeft || sub.timeLeftSeconds)})
                      </button>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.72rem", color: "#94a3b8", paddingTop: "2px" }}>
                        <span>Status: ⚪ No live QR session</span>
                        <span>{sub.absentClasses > 0 ? `${sub.absentClasses} Absent` : "0 Absent"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Fullscreen Camera Scanner Modal */}
      {scannerActive && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.92)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 16px",
          color: "#ffffff"
        }}>
          {/* Top Bar */}
          <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "360px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#fff" }}>
                Scan Class QR Code
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                {targetScanSession?.subject || activeSession?.subject || "Active Session"}
              </p>
            </div>
            <button
              onClick={stopScanner}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "36px", height: "36px", color: "#fff", cursor: "pointer", fontSize: "1rem" }}
            >
              ✕
            </button>
          </div>

          {/* Scanner Viewport */}
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "320px",
            aspectRatio: "1/1",
            borderRadius: "20px",
            overflow: "hidden",
            border: "3px solid #3b82f6",
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
            background: "#000"
          }}>
            <div id="reader" style={{ width: "100%", height: "100%" }}></div>
            {/* Animated Laser Scan Line */}
            <div style={{
              position: "absolute",
              left: "10%",
              right: "10%",
              top: "50%",
              height: "2px",
              background: "#38bdf8",
              boxShadow: "0 0 12px #38bdf8",
              animation: "pulse 1.5s infinite"
            }} />
          </div>

          {/* Instructions & Cancel Button */}
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#cbd5e1", textAlign: "center" }}>
              Point camera at the QR code displayed on your faculty's screen.
            </p>
            <button
              onClick={stopScanner}
              style={{
                width: "100%",
                padding: "12px",
                background: "#fee2e2",
                color: "#dc2626",
                border: "none",
                borderRadius: "14px",
                fontWeight: "700",
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              Cancel Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileAttendancePortal;
