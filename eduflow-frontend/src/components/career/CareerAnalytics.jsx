import React, { useState, useEffect } from 'react';

const CareerAnalytics = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/career/history', {
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
        <div className="glass-card p-6 rounded-2xl mt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Overall Career Score Trend</h3>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isPositive ? '+' : ''}{scoreDiff} pts from last update
                </div>
            </div>
            
            <div className="relative w-full h-48 mt-8">
                <svg viewBox={`0 -10 ${width} ${height + 20}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)"/>
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.0)"/>
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4"/>
                    <line x1="0" y1="0" x2={width} y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4"/>
                    
                    {/* Area fill */}
                    <path d={fillPathD} fill="url(#chartGradient)" />
                    
                    {/* Line */}
                    <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    
                    {/* Points & Labels */}
                    {chartData.map((val, index) => {
                        const x = (index / (chartData.length - 1)) * width;
                        const y = height - (val / maxVal) * height;
                        // Avoid overlapping text labels if there are too many data points
                        const showLabel = chartData.length <= 10 || index % Math.ceil(chartData.length / 10) === 0 || index === chartData.length - 1;
                        return (
                            <g key={index}>
                                <circle cx={x} cy={y} r="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="2" className="hover:r-6 transition-all cursor-pointer"/>
                                {showLabel && <text x={x} y={height + 15} fill="#94a3b8" fontSize="10" textAnchor="middle">{chartLabels[index]}</text>}
                            </g>
                        );
                    })}
                </svg>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/5 p-4 rounded-xl border border-emerald-500/20">
                    <div className="text-sm text-emerald-400 mb-1">Total History Records</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        {history.length} <span className="text-xs font-normal text-slate-400">updates</span>
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-blue-500/20">
                    <div className="text-sm text-blue-400 mb-1">Latest Score</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        {latestScore}/100
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-amber-500/20">
                    <div className="text-sm text-amber-400 mb-1">First Score</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        {history.length > 0 ? history[0].careerScore : 0}/100
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-purple-500/20">
                    <div className="text-sm text-purple-400 mb-1">Overall Growth</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">
                        +{history.length > 0 ? latestScore - history[0].careerScore : 0} <span className="text-xs font-normal text-slate-400">pts</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerAnalytics;
