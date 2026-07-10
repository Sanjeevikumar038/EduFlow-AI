import React, { useState, useEffect } from 'react';
import API_BASE from '../../services/api';

const CareerDashboardAdmin = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/career/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setData(await res.json());
        }
    };

    if (!data) return <div className="p-8 text-slate-400">Loading admin insights...</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-main)", margin: 0 }}>
                College Career Readiness Insights
            </h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid var(--card-border)", background: "var(--bg-secondary)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>Avg Career Score</div>
                    <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--primary)" }}>{Math.round(data.averageCareerScore)}</div>
                </div>
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid var(--card-border)", background: "var(--bg-secondary)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>Avg Resume</div>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--success)" }}>{Math.round(data.averageResumeScore * 4)}/100</div>
                </div>
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid var(--card-border)", background: "var(--bg-secondary)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>Avg Coding</div>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--warning)" }}>{Math.round(data.averageCodingScore * 4)}/100</div>
                </div>
                <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px solid var(--card-border)", background: "var(--bg-secondary)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600" }}>Avg Interview</div>
                    <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--secondary)" }}>{Math.round(data.averageInterviewScore * 4)}/100</div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)" }}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)" }}>Department Comparison</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {data.departmentComparison.map((dept, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ width: "100px", color: "var(--text-main)", fontSize: "0.85rem", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {dept.department || 'N/A'}
                            </div>
                            <div style={{ flex: 1, height: "24px", background: "var(--input-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center" }}>
                                <div 
                                    style={{ 
                                        width: `${Math.max(10, dept.averageScore)}%`,
                                        height: "100%",
                                        background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        paddingRight: "8px",
                                        color: "#fff",
                                        fontSize: "0.75rem",
                                        fontWeight: "700",
                                        transition: "width 0.5s ease-out"
                                    }}
                                >
                                    {Math.round(dept.averageScore)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareerDashboardAdmin;
