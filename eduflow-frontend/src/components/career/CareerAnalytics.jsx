import React, { useState, useEffect } from 'react';
import API_BASE from '../../services/api';

const CareerAnalytics = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/career/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setHistory(await res.json());
        }
    };

    const dataPoints = history.length > 0 ? history.map(h => h.careerScore) : [0];
    const labels = history.length > 0 ? history.map(h => new Date(h.careerScoreDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })) : ['No Data'];
    
    // Ensure we have at least two points to draw a line, if only 1, duplicate it visually
    const chartData = dataPoints.length === 1 ? [dataPoints[0], dataPoints[0]] : dataPoints;
    const chartLabels = labels.length === 1 ? [labels[0], labels[0]] : labels;

    const maxVal = 100;
    const height = 150;
    const width = 400; // viewbox width
    
    // Create path for SVG line chart
    const points = chartData.map((val, index) => {
        const x = (index / (chartData.length - 1)) * width;
        const y = height - (val / maxVal) * height;
        return `${x},${y}`;
    }).join(' L ');
    
    const pathD = `M ${points}`;
    const fillPathD = `M 0,${height} L ${points} L ${width},${height} Z`;

    const latestScore = dataPoints[dataPoints.length - 1];
    const prevScore = dataPoints.length > 1 ? dataPoints[dataPoints.length - 2] : dataPoints[0];
    const scoreDiff = latestScore - prevScore;
    const isPositive = scoreDiff >= 0;

    return (
        <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid var(--card-border)", marginTop: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)" }}>
                    📈 Overall Career Score Trend
                </h3>
                <div style={{
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: isPositive ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                    color: isPositive ? "var(--success)" : "var(--error)",
                    border: `1px solid ${isPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`
                }}>
                    {isPositive ? '+' : ''}{scoreDiff} pts from last update
                </div>
            </div>
            
            <div style={{ position: "relative", width: "100%", height: "192px", marginTop: "24px" }}>
                <svg viewBox={`0 -10 ${width} ${height + 20}`} style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="var(--card-border)" strokeWidth="1"/>
                    <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="var(--card-border)" strokeWidth="1" strokeDasharray="4" style={{ opacity: 0.5 }}/>
                    <line x1="0" y1={0} x2={width} y2={0} stroke="var(--card-border)" strokeWidth="1" strokeDasharray="4" style={{ opacity: 0.5 }}/>
                    
                    {/* Area fill */}
                    <path d={fillPathD} fill="url(#chartGradient)" />
                    
                    {/* Line */}
                    <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    
                    {/* Points & Labels */}
                    {chartData.map((val, index) => {
                        const x = (index / (chartData.length - 1)) * width;
                        const y = height - (val / maxVal) * height;
                        const showLabel = chartData.length <= 10 || index % Math.ceil(chartData.length / 10) === 0 || index === chartData.length - 1;
                        return (
                            <g key={index}>
                                <circle cx={x} cy={y} r="4" fill="var(--bg-primary)" stroke="var(--primary)" strokeWidth="2" style={{ transition: "all 0.2s" }}/>
                                {showLabel && <text x={x} y={height + 15} fill="var(--text-muted)" fontSize="9" fontWeight="600" textAnchor="middle">{chartLabels[index]}</text>}
                            </g>
                        );
                    })}
                </svg>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginTop: "32px" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.04)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--success)", textTransform: "uppercase" }}>Total History Records</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
                        {history.length} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>updates</span>
                    </div>
                </div>
                <div style={{ background: "rgba(59, 130, 246, 0.04)", border: "1px solid rgba(59, 130, 246, 0.15)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "#60a5fa", textTransform: "uppercase" }}>Latest Score</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
                        {latestScore}/100
                    </div>
                </div>
                <div style={{ background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.15)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--warning)", textTransform: "uppercase" }}>First Score</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
                        {history.length > 0 ? history[0].careerScore : 0}/100
                    </div>
                </div>
                <div style={{ background: "rgba(168, 85, 247, 0.04)", border: "1px solid rgba(168, 85, 247, 0.15)", padding: "16px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--secondary)", textTransform: "uppercase" }}>Overall Growth</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
                        +{history.length > 0 ? latestScore - history[0].careerScore : 0} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "500" }}>pts</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerAnalytics;
