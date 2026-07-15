import React, { useState, useEffect } from 'react';
import API_BASE from '../../services/api';

const CareerDashboardFaculty = () => {
    const [data, setData] = useState(null);
    const department = localStorage.getItem('department') || 'CSE';

    useEffect(() => {
        fetchFacultyData();
    }, []);

    const fetchFacultyData = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/career/faculty?department=${department}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setData(await res.json());
        }
    };

    if (!data) return <div className="p-8 text-slate-400">Loading faculty insights...</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                Department Career Readiness ({department})
            </h2>
            
            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>Overall Readiness</h3>
                    <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Average career score of students in {department}
                    </p>
                </div>
                <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)" }}>
                    {Math.round(data.averageReadiness)}%
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--success)" }}>
                        🏆 Top Career Ready Students
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {data.topStudents.length > 0 ? data.topStudents.map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--input-bg)", border: "1px solid var(--card-border)", borderRadius: "12px" }}>
                                <div>
                                    <div style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.9rem" }}>{s.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{s.registerNumber}</div>
                                </div>
                                <div style={{ color: "var(--success)", fontWeight: "800", fontSize: "1.1rem" }}>{s.overallScore}</div>
                            </div>
                        )) : <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No data available.</div>}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--warning)" }}>
                        ⚠️ Needs Mentoring
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
                        {data.needsImprovement.length > 0 ? data.needsImprovement.map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--input-bg)", border: "1px solid var(--card-border)", borderRadius: "12px" }}>
                                <div>
                                    <div style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.9rem" }}>{s.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{s.registerNumber}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ color: "var(--warning)", fontWeight: "800", fontSize: "1.1rem" }}>{s.overallScore}</div>
                                    <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", marginTop: "4px" }}>
                                        {s.resumeScore < 15 && <span title="Low Resume" style={{ fontSize: "0.85rem" }}>📄</span>}
                                        {s.codingScore < 15 && <span title="Low Coding" style={{ fontSize: "0.85rem" }}>💻</span>}
                                        {s.interviewScore < 15 && <span title="Low Interview" style={{ fontSize: "0.85rem" }}>🎤</span>}
                                    </div>
                                </div>
                            </div>
                        )) : <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>All students are doing well!</div>}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", gridColumn: "1 / -1" }}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "700", color: "var(--primary)" }}>
                        📊 Student Detailed Readiness
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
                            <thead>
                                <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>
                                    <th style={{ padding: "0.75rem" }}>Student</th>
                                    <th style={{ padding: "0.75rem" }}>Overall (100)</th>
                                    <th style={{ padding: "0.75rem" }}>Resume (25)</th>
                                    <th style={{ padding: "0.75rem" }}>Coding (25)</th>
                                    <th style={{ padding: "0.75rem" }}>Interview (25)</th>
                                    <th style={{ padding: "0.75rem" }}>Attendance (25)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.allStudents && data.allStudents.map((s, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                                        <td style={{ padding: "0.75rem" }}>
                                            <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{s.name}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.registerNumber}</div>
                                        </td>
                                        <td style={{ padding: "0.75rem", fontWeight: "800", color: s.overallScore >= 70 ? "var(--success)" : "var(--warning)" }}>{s.overallScore}</td>
                                        <td style={{ padding: "0.75rem" }}>
                                            {s.resumeScore > 0 ? <span style={{ color: "var(--success)" }}>{s.resumeScore}</span> : <span style={{ color: "var(--text-muted)" }}>No Resume</span>}
                                        </td>
                                        <td style={{ padding: "0.75rem" }}>{s.codingScore}</td>
                                        <td style={{ padding: "0.75rem" }}>{s.interviewScore}</td>
                                        <td style={{ padding: "0.75rem" }}>{s.attendanceScore}</td>
                                    </tr>
                                ))}
                                {(!data.allStudents || data.allStudents.length === 0) && (
                                    <tr><td colSpan="6" style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)" }}>No students found in {department}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerDashboardFaculty;
