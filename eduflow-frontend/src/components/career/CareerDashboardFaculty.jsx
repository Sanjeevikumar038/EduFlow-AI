import React, { useState, useEffect } from 'react';

const CareerDashboardFaculty = () => {
    const [data, setData] = useState(null);
    const department = localStorage.getItem('department') || 'CSE';

    useEffect(() => {
        fetchFacultyData();
    }, []);

    const fetchFacultyData = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8080/api/career/faculty?department=${department}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setData(await res.json());
        }
    };

    if (!data) return <div className="p-8 text-slate-400">Loading faculty insights...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Department Career Readiness ({department})</h2>
            
            <div className="glass-card p-8 rounded-3xl flex items-center justify-between mb-8 border border-white/5">
                <div>
                    <h3 className="text-lg text-slate-300">Overall Readiness</h3>
                    <p className="text-sm text-slate-500 mt-1">Average career score of students in {department}</p>
                </div>
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                    {Math.round(data.averageReadiness)}%
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-4 text-emerald-400">🏆 Top Career Ready Students</h3>
                    <div className="space-y-3">
                        {data.topStudents.length > 0 ? data.topStudents.map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                <div>
                                    <div className="text-white font-medium">{s.name}</div>
                                    <div className="text-xs text-slate-400">{s.registerNumber}</div>
                                </div>
                                <div className="text-emerald-400 font-bold">{s.overallScore}</div>
                            </div>
                        )) : <div className="text-slate-400">No data available.</div>}
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border-t-4 border-amber-500">
                    <h3 className="text-xl font-semibold mb-4 text-amber-400">⚠️ Needs Mentoring</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {data.needsImprovement.length > 0 ? data.needsImprovement.map((s, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-amber-500/10">
                                <div>
                                    <div className="text-white font-medium">{s.name}</div>
                                    <div className="text-xs text-slate-400">{s.registerNumber}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-amber-400 font-bold">{s.overallScore}</div>
                                    <div className="text-[10px] text-slate-500 flex gap-1">
                                        {s.resumeScore < 15 && <span title="Low Resume">📄</span>}
                                        {s.codingScore < 15 && <span title="Low Coding">💻</span>}
                                        {s.interviewScore < 15 && <span title="Low Interview">🎤</span>}
                                    </div>
                                </div>
                            </div>
                        )) : <div className="text-slate-400">All students are doing well!</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerDashboardFaculty;
