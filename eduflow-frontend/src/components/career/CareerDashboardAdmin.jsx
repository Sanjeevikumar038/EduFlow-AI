import React, { useState, useEffect } from 'react';

const CareerDashboardAdmin = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/career/admin', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setData(await res.json());
        }
    };

    if (!data) return <div className="p-8 text-slate-400">Loading admin insights...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">College Career Readiness Insights</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center border border-blue-500/20">
                    <div className="text-sm text-slate-400 mb-2 text-center">Avg Career Score</div>
                    <div className="text-4xl font-bold text-blue-400">{Math.round(data.averageCareerScore)}</div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
                    <div className="text-sm text-slate-400 mb-2">Avg Resume</div>
                    <div className="text-3xl font-bold text-emerald-400">{Math.round(data.averageResumeScore * 4)}/100</div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
                    <div className="text-sm text-slate-400 mb-2">Avg Coding</div>
                    <div className="text-3xl font-bold text-amber-400">{Math.round(data.averageCodingScore * 4)}/100</div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center">
                    <div className="text-sm text-slate-400 mb-2">Avg Interview</div>
                    <div className="text-3xl font-bold text-purple-400">{Math.round(data.averageInterviewScore * 4)}/100</div>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl mt-8">
                <h3 className="text-xl font-semibold mb-6 text-white">Department Comparison</h3>
                <div className="space-y-4">
                    {data.departmentComparison.map((dept, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-24 text-slate-300 text-sm">{dept.department || 'N/A'}</div>
                            <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden flex items-center">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-end px-2 text-xs text-white font-bold"
                                    style={{ width: `${Math.max(10, dept.averageScore)}%` }}
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
