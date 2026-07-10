import React, { useState, useEffect } from 'react';
import CareerAnalytics from './CareerAnalytics';
import API_BASE from '../../services/api';

const CareerDashboard = () => {
    const [data, setData] = useState(null);
    const [aiMentorPlan, setAiMentorPlan] = useState(null);
    const [loadingMentor, setLoadingMentor] = useState(true);

    useEffect(() => {
        fetchCareerData();
        fetchAiMentorPlan();
    }, []);

    const fetchCareerData = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/career/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setData(await res.json());
        }
    };

    const fetchAiMentorPlan = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/career/recommendations`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (res.ok) {
            setAiMentorPlan(await res.json());
        }
        setLoadingMentor(false);
    };

    if (!data) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                <div style={{ width: "32px", height: "32px", border: "4px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s infinite linear", margin: "0 auto" }} />
                <span>Loading career dashboard analytics...</span>
            </div>
        );
    }

    const Gauge = ({ score, label, color }) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (score / 25) * circumference;
        return (
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", borderRadius: "16px", transition: "all 0.2s" }}>
                <div style={{ position: "relative", width: "96px", height: "96px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                        <circle cx="48" cy="48" r="40" fill="none" stroke="var(--card-border)" strokeWidth="6" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
                    </svg>
                    <span style={{ color: "var(--text-main)", fontSize: "1.3rem", fontWeight: "800", zIndex: 10 }}>{score}</span>
                </div>
                <span style={{ color: "var(--text-main)", marginTop: "12px", fontSize: "0.85rem", fontWeight: "700" }}>{label}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "2px" }}>out of 25</span>
            </div>
        );
    };

    let statusColor = "var(--error)";
    if (data.status === "Excellent") statusColor = "var(--success)";
    else if (data.status === "Good") statusColor = "var(--primary)";
    else if (data.status === "Average") statusColor = "var(--warning)";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease-out" }}>
            
            {/* Top Readiness Score Card */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
                    <div style={{ flex: 1, minWidth: "260px" }}>
                        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)" }}>Career Readiness Score</h2>
                        <div style={{ fontSize: "1.1rem", fontWeight: "800", color: statusColor, marginTop: "4px" }}>{data.status}</div>
                        <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "0.85rem", lineHeight: "1.5", maxWidth: "550px", margin: "12px 0 0 0" }}>
                            Your career readiness score aggregates metrics across attendance, resume strength, coding progress, and mock interview performance.
                        </p>
                    </div>
                    <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg style={{ position: "absolute", width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                            <circle cx="80" cy="80" r="68" fill="none" stroke="var(--card-border)" strokeWidth="10" />
                            <circle cx="80" cy="80" r="68" fill="none" stroke="url(#careerGradient)" strokeWidth="10" strokeDasharray={2 * Math.PI * 68} strokeDashoffset={2 * Math.PI * 68 - (data.overallCareerScore / 100) * (2 * Math.PI * 68)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
                            <defs>
                                <linearGradient id="careerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--success)" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style={{ textAlign: "center", zIndex: 10 }}>
                            <div style={{ fontSize: "2.8rem", fontWeight: "900", color: "var(--text-main)", lineHeight: "1" }}>{data.overallCareerScore}</div>
                            <div style={{ fontSize: "0.72rem", fontWeight: "600", color: "var(--text-muted)", marginTop: "4px" }}>out of 100</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gauge Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
                <Gauge score={data.attendanceScore} label="Attendance" color="var(--primary)" />
                <Gauge score={data.resumeScore} label="Resume" color="#3b82f6" />
                <Gauge score={data.codingScore} label="Coding" color="var(--warning)" />
                <Gauge score={data.interviewScore} label="Interview" color="var(--success)" />
            </div>

            {/* Performance Insights */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>📈</span> Interview Performance Insights
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", padding: "16px", borderRadius: "12px" }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Last Score</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>{data.lastInterviewScore || 0}%</div>
                    </div>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", padding: "16px", borderRadius: "12px" }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Best Score</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--success)", marginTop: "4px" }}>{data.bestInterviewScore || 0}%</div>
                    </div>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", padding: "16px", borderRadius: "12px" }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Streak (≥70%)</div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--warning)", marginTop: "4px" }}>{data.interviewStreak || 0} 🔥</div>
                    </div>
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", padding: "16px", borderRadius: "12px" }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Strongest Domain</div>
                        <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#3b82f6", marginTop: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={data.strongestDomain || 'N/A'}>
                            {data.strongestDomain || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Career Mentor Section */}
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(59, 130, 246, 0.3)", position: "relative", overflow: "hidden" }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", fontWeight: "800", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🤖</span> AI Placement Recommendations
                </h3>
                
                {loadingMentor ? (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "16px", height: "16px", border: "2px solid var(--primary)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s infinite linear" }} />
                        Analyzing career metrics to build strategy plan...
                    </div>
                ) : aiMentorPlan ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                        
                        {/* Left recommendations panel */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <h4 style={{ margin: "0 0 6px 0", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overall Recommendation</h4>
                                <p style={{ margin: 0, color: "var(--text-main)", fontSize: "0.95rem", lineHeight: "1.6" }}>{aiMentorPlan.overallRecommendation}</p>
                            </div>
                            
                            <div>
                                <h4 style={{ margin: "0 0 6px 0", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Weekly Plan</h4>
                                <p style={{ margin: 0, background: "var(--bg-secondary)", border: "1px solid var(--card-border)", padding: "16px", borderRadius: "10px", color: "var(--text-main)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                                    {aiMentorPlan.weeklyLearningPlan}
                                </p>
                            </div>

                            <div>
                                <h4 style={{ margin: "0 0 6px 0", color: "var(--primary)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Monthly Goal</h4>
                                <p style={{ margin: 0, background: "var(--bg-secondary)", border: "1px solid var(--card-border)", padding: "16px", borderRadius: "10px", color: "var(--text-main)", fontSize: "0.85rem", lineHeight: "1.5" }}>
                                    {aiMentorPlan.monthlyGoal}
                                </p>
                            </div>
                        </div>

                        {/* Right improvements panel */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <h4 style={{ margin: "0 0 10px 0", color: "var(--warning)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Immediate Action Items</h4>
                                <ul style={{ display: "flex", flexDirection: "column", gap: "8px", padding: 0, margin: 0, listStyle: "none" }}>
                                    {(aiMentorPlan.immediateImprovements || []).map((item, i) => (
                                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", color: "var(--text-main)" }}>
                                            <span style={{ color: "var(--warning)" }}>⚡</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div style={{ background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "16px", borderRadius: "12px" }}>
                                    <div style={{ color: "var(--success)", fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase" }}>Placement Readiness</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>{aiMentorPlan.placementReadiness}</div>
                                </div>
                                <div style={{ background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.15)", padding: "16px", borderRadius: "12px" }}>
                                    <div style={{ color: "var(--secondary)", fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase" }}>Confidence Level</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>{aiMentorPlan.confidenceLevel}</div>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ margin: "0 0 10px 0", color: "#3b82f6", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Recommended Tech Stack</h4>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {(aiMentorPlan.recommendedTechnologies || []).map((tech, i) => (
                                        <span key={i} style={{
                                            padding: "4px 10px",
                                            background: "rgba(59, 130, 246, 0.08)",
                                            color: "#60a5fa",
                                            fontSize: "0.75rem",
                                            borderRadius: "20px",
                                            border: "1px solid rgba(59, 130, 246, 0.2)",
                                            fontWeight: "600"
                                        }}>{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div style={{ color: "var(--error)", fontSize: "0.85rem" }}>Failed to generate AI recommendations.</div>
                )}
            </div>

            {/* Embed the Career Analytics Chart */}
            <CareerAnalytics />
        </div>
    );
};

export default CareerDashboard;
