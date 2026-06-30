import React, { useState, useEffect } from "react";
import { getActiveSession, markAttendance } from "../../services/attendanceService";
import { Html5QrcodeScanner } from "html5-qrcode";

function AttendancePage() {
  const token = localStorage.getItem("token");
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerRef, setScannerRef] = useState(null);

  const fetchActiveSession = async () => {
    if (!token) return;
    setAttendanceLoading(true);
    try {
      const res = await getActiveSession(token);
      setActiveSession(res.data);
    } catch (err) {
      console.error("Error fetching active session:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, [token]);

  const handleManualMark = async () => {
    if (!activeSession) return;
    try {
      await markAttendance({ sessionId: activeSession.id }, token);
      setScanResult({ success: true, message: "Attendance marked manually!" });
      setTimeout(() => setScanResult(null), 3000);
      fetchActiveSession();
    } catch (err) {
      setScanResult({ success: false, message: err.response?.data || "Failed to mark attendance" });
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const startScanner = () => {
    if (!activeSession) return;
    setScannerActive(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: { width: 250, height: 250 },
        fps: 5,
      });
      setScannerRef(scanner);
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setScannerActive(false);
          try {
            await markAttendance({ sessionId: activeSession.id, qrToken: decodedText }, token);
            setScanResult({ success: true, message: "Attendance marked successfully!" });
            fetchActiveSession();
          } catch (err) {
            setScanResult({ success: false, message: err.response?.data || "Invalid QR Code or already marked" });
          }
          setTimeout(() => setScanResult(null), 4000);
        },
        (err) => {
          // ignore scan errors
        }
      );
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef) {
      scannerRef.clear();
      setScannerRef(null);
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef) {
        scannerRef.clear();
      }
    };
  }, [scannerRef]);

  return (
    <div className="animate-fade-in flex flex-col items-center max-w-2xl mx-auto space-y-6">
      <div className="glass-card p-8 rounded-3xl w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Smart Attendance</h2>
        <p className="text-slate-400 mb-6">Scan the QR code displayed by your faculty to mark your attendance.</p>
        
        {scanResult && (
          <div className={`mb-6 p-4 rounded-xl border ${scanResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <span className="font-semibold">{scanResult.success ? '✅ ' : '❌ '}{scanResult.message}</span>
          </div>
        )}

        {attendanceLoading ? (
          <div className="p-12 text-slate-400 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Checking active sessions...
          </div>
        ) : activeSession ? (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-purple-500/30 p-6 rounded-2xl inline-block text-left w-full max-w-md">
              <h3 className="text-purple-400 font-bold mb-1 text-sm uppercase tracking-wider">Active Session</h3>
              <p className="text-xl text-white font-semibold">{activeSession.subject}</p>
              <p className="text-slate-400 mt-1">Faculty: {activeSession.faculty.name}</p>
              <p className="text-slate-400">Class: {activeSession.targetClass}</p>
            </div>
            
            {!scannerActive ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={startScanner}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-xl">📷</span> Scan QR
                </button>
                <button 
                  onClick={handleManualMark}
                  className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
                >
                  Manual Mark
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="scanner-container">
                  <div id="reader" style={{ width: "350px", border: "none" }}></div>
                  <div className="scanner-laser"></div>
                </div>
                <button 
                  onClick={stopScanner}
                  className="px-6 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 font-semibold rounded-xl transition-all"
                >
                  Cancel Scanner
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex flex-col items-center">
            <span className="text-4xl mb-4 opacity-50">😴</span>
            <p className="text-slate-400 text-lg font-medium">No active sessions found.</p>
            <p className="text-slate-500 text-sm mt-1">Your faculty hasn't started a session yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancePage;
