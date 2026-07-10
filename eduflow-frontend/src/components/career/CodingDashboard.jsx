import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../../services/api';

const CodingDashboard = () => {
  const navigate = useNavigate();

  // Analytics/Stats state
  const [progress, setProgress] = useState({
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalSolved: 0,
    totalAttempted: 0,
    bestScore: 0,
    averageScore: 0,
    successRate: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Daily challenge state
  const [challenge, setChallenge] = useState(null);
  const [challengeLoading, setChallengeLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      navigate('/student/coding-workspace');
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleStartClick = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => {
        console.log("Error attempting to enable full-screen mode:", err.message);
      });
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
    setCountdown(5);
  };

  useEffect(() => {
    fetchData();
    fetchChallenge();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Fetch stats summary
      const statsRes = await fetch(`${API_BASE}/api/coding/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setProgress(statsData);
      }

      // Fetch detailed list
      const listRes = await fetch(`${API_BASE}/api/coding/progress/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        setProgressList(listData || []);
      }
    } catch (err) {
      console.error("Error fetching coding progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChallenge = async () => {
    setChallengeLoading(true);
    const token = localStorage.getItem('token');
    const dept = localStorage.getItem('department') || 'M.Tech CSE';
    const dateStr = new Date().toISOString().split('T')[0];
    try {
      const res = await fetch(`${API_BASE}/api/coding/challenge?date=${dateStr}&department=${dept}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChallenge(data);
      }
    } catch (err) {
      console.error("Error fetching today's coding challenge:", err);
    } finally {
      setChallengeLoading(false);
    }
  };

  // Filter progresses
  const filteredProgressList = progressList.filter(item => {
    return item.questionBankId.toString().includes(searchQuery) ||
      item.attempts.toString().includes(searchQuery);
  });

  const formatRate = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.0';
    return Number(val).toFixed(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }} className="animate-fade-in">
      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            💻 Coding Performance Hub
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", fontSize: "0.95rem" }}>
            Monitor your coding stats, daily challenge streaks, and submission analytics in real-time.
          </p>
        </div>
        <button
          onClick={() => { fetchData(); fetchChallenge(); }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/5 font-semibold text-sm flex items-center gap-2"
        >
          🔄 Refresh Page
        </button>
      </div>

      {/* Split Screen Layout */}
      <div style={{ display: "flex", gap: "2rem", flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", width: "100%" }}>

        {/* Left Side: Stats and History */}
        <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* Performance metrics dashboard grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>

            {/* 1. Daily Coding Streak */}
            <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px", border: "1px solid rgba(239, 68, 68, 0.2)", background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(31, 41, 55, 0.2) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.05em" }}>Coding Streak</span>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#f87171", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
                    <span>{progress.currentStreak || 0}</span>
                    <span style={{ animation: "pulse 1.5s infinite", display: "inline-block" }}>🔥</span>
                  </div>
                </div>
                <div style={{ padding: "0.4rem", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", fontSize: "1.1rem" }}>📅</div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                <span>Longest Streak:</span>
                <span style={{ color: "var(--text-main)", fontWeight: "700" }}>🏆 {progress.longestStreak || 0} days</span>
              </div>
            </div>

            {/* 2. Success Rate */}
            <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px", border: "1px solid rgba(59, 130, 246, 0.2)", background: "linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(31, 41, 55, 0.2) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>Submission Success</span>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#60a5fa", marginTop: "0.25rem" }}>
                    {formatRate(progress.successRate)}<span style={{ fontSize: "1.2rem", fontWeight: "500" }}>%</span>
                  </div>
                </div>
                <div style={{ padding: "0.4rem", borderRadius: "10px", background: "rgba(59, 130, 246, 0.1)", fontSize: "1.1rem" }}>🎯</div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                <span>Total Attempts:</span>
                <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{progress.totalAttempted || 0} submissions</span>
              </div>
            </div>

            {/* 3. Average Score */}
            <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px", border: "1px solid rgba(168, 85, 247, 0.2)", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(31, 41, 55, 0.2) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>Average Score</span>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#c084fc", marginTop: "0.25rem" }}>
                    {formatRate(progress.averageScore)}<span style={{ fontSize: "1.2rem", fontWeight: "500" }}>%</span>
                  </div>
                </div>
                <div style={{ padding: "0.4rem", borderRadius: "10px", background: "rgba(168, 85, 247, 0.1)", fontSize: "1.1rem" }}>⚡</div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                <span>Highest Score:</span>
                <span style={{ color: "var(--text-main)", fontWeight: "700" }}>{progress.bestScore || 0}%</span>
              </div>
            </div>

            {/* 4. Solved Problems Summary */}
            <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "150px", border: "1px solid rgba(16, 185, 129, 0.2)", background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(31, 41, 55, 0.2) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.05em" }}>Problems Solved</span>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#34d399", marginTop: "0.25rem" }}>
                    {progress.totalSolved || 0}
                  </div>
                </div>
                <div style={{ padding: "0.4rem", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", fontSize: "1.1rem" }}>✅</div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", gap: "0.2rem" }}>
                <span>E: <b style={{ color: "#34d399" }}>{progress.easySolved || 0}</b></span>
                <span>M: <b style={{ color: "#fbbf24" }}>{progress.mediumSolved || 0}</b></span>
                <span>H: <b style={{ color: "#f87171" }}>{progress.hardSolved || 0}</b></span>
              </div>
            </div>

          </div>

          {/* Detailed Solved Problems List */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "24px", border: "1px solid var(--card-border)", background: "rgba(30, 41, 59, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", fontFamily: "var(--font-heading)" }}>
                📋 My Solving History (Per Question)
              </h3>
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--card-border)", color: "#fff", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.8rem", outline: "none", width: "160px" }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                ⌛ Loading solved history...
              </div>
            ) : filteredProgressList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)", fontStyle: "italic", background: "rgba(30, 41, 59, 0.15)", borderRadius: "16px", border: "1px dashed var(--card-border)", fontSize: "0.85rem" }}>
                No records found. Keep solving daily challenges to build your history!
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Problem ID</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Status</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Attempts</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Best Score</th>
                      <th style={{ padding: "0.75rem 0.5rem" }}>Solved Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProgressList.map((item, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)", transition: "all 0.2s" }} className="hover:bg-white/5">
                        <td style={{ padding: "0.75rem 0.5rem", fontWeight: "600", color: "var(--text-main)" }}>
                          Question #{item.questionBankId}
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem" }}>
                          <span style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            background: item.passed ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                            color: item.passed ? "#34d399" : "#fbbf24",
                            border: item.passed ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)"
                          }}>
                            {item.passed ? "SOLVED" : "ATTEMPTED"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>
                          {item.attempts} times
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", fontWeight: "700", color: item.bestScore >= 75 ? "#34d399" : "#fbbf24" }}>
                          {item.bestScore}%
                        </td>
                        <td style={{ padding: "0.75rem 0.5rem", color: "var(--text-muted)" }}>
                          {item.solvedDate ? new Date(item.solvedDate).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Daily Challenge Workspace Entry */}
        <div style={{ flex: "1 1 450px", minWidth: "320px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "2.5rem", borderRadius: "24px", border: "1px solid var(--card-border)", background: "rgba(15, 23, 42, 0.45)", textAlign: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <span style={{ background: "rgba(99, 102, 241, 0.15)", border: "1px solid rgba(99, 102, 241, 0.3)", borderRadius: "6px", padding: "0.3rem 0.8rem", fontSize: "0.75rem", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "1px" }}>
                🏁 Todays Coding Assessment
              </span>

              {challengeLoading ? (
                <h3 style={{ color: "var(--text-main)", margin: "1rem 0" }}>Locating challenge...</h3>
              ) : challenge ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <h3 style={{ margin: "0.5rem 0 0 0", fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", fontFamily: "var(--font-heading)" }}>
                    {challenge.title}
                  </h3>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <span style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      fontSize: "0.7rem",
                      fontWeight: "700",
                      background: challenge.difficulty === "Easy" ? "rgba(16, 185, 129, 0.15)" : challenge.difficulty === "Medium" ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: challenge.difficulty === "Easy" ? "#34d399" : challenge.difficulty === "Medium" ? "#fbbf24" : "#f87171"
                    }}>
                      {challenge.difficulty}
                    </span>
                    <span style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "0.25rem 0.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {challenge.category}
                    </span>
                  </div>
                </div>
              ) : (
                <h3 style={{ color: "var(--text-muted)", margin: "1rem 0" }}>No assessment scheduled for today</h3>
              )}
            </div>

            {challengeLoading ? (
              <div style={{ padding: "2rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>⌛ Preparing testing server environment...</div>
            ) : challenge ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {progressList.some(item => item.questionBankId === challenge.id && item.passed) ? (
                  /* Solved / Completed State */
                  <div style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    color: "#10b981",
                    fontWeight: "700",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}>
                    ✔️ Test Completed
                  </div>
                ) : (
                  /* Not Solved / Start vs Resume Test State */
                  <>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      ⚠️ <strong>Notice:</strong> Launching the workspace starts a full-screen, focused programming assessment environment. Please ensure you do not close or minimize the window during execution.
                    </div>

                    <button
                      onClick={handleStartClick}
                      style={{
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        padding: "1rem",
                        fontWeight: "700",
                        fontSize: "1.05rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                        transition: "all 0.3s"
                      }}
                      className="hover:scale-105"
                    >
                      {localStorage.getItem('coding_test_time_left') !== null || progressList.some(item => item.questionBankId === challenge.id && item.attempts > 0)
                        ? "💻 Resume Test"
                        : "💻 Start Test"
                      }
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "2rem 0" }}>
                Check back tomorrow for the next sequential coding challenge.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Countdown Fullscreen Overlay Overlay */}
      {countdown !== null && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "#030712",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif"
        }}>
          <div style={{
            fontSize: "7rem",
            fontWeight: "900",
            background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "pulse 1s infinite"
          }}>
            {countdown}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "1.5rem", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            Entering Focused Testing Environment...
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingDashboard;
