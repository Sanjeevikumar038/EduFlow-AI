import React, { useState, useEffect } from 'react';
import CareerAnalytics from './CareerAnalytics';

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
        const res = await fetch('http://localhost:8080/api/career/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setData(await res.json());
        }
    };

    const fetchAiMentorPlan = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/career/recommendations', {
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

    if (!data) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-40 bg-slate-700 rounded"></div></div></div>;

    const Gauge = ({ score, label, color }) => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (score / 25) * circumference;
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                        <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
                    </svg>
                    <span className="text-2xl font-bold text-white z-10">{score}</span>
                </div>
                <span className="mt-3 text-sm font-medium text-slate-300">{label}</span>
                <span className="text-xs text-slate-500 mt-1">out of 25</span>
            </div>
        );
    };

    let statusColor = "text-red-400";
    if (data.status === "Excellent") statusColor = "text-emerald-400";
    else if (data.status === "Good") statusColor = "text-blue-400";
    else if (data.status === "Average") statusColor = "text-amber-400";

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-white mb-2">Career Readiness Score</h2>
                        <div className={`text-2xl font-semibold ${statusColor}`}>{data.status}</div>
                        <p className="text-slate-400 mt-4 max-w-lg">
                            Your career readiness score is calculated based on your attendance, resume strength, coding progress, and mock interview performance.
                        </p>
                    </div>
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="absolute w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                            <circle cx="96" cy="96" r="80" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeDasharray={2 * Math.PI * 80} strokeDashoffset={2 * Math.PI * 80 - (data.overallCareerScore / 100) * (2 * Math.PI * 80)} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="text-center z-10">
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{data.overallCareerScore}</div>
                            <div className="text-sm font-medium text-slate-400 mt-1">out of 100</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Gauge score={data.attendanceScore} label="Attendance" color="#8b5cf6" />
                <Gauge score={data.resumeScore} label="Resume" color="#3b82f6" />
                <Gauge score={data.codingScore} label="Coding" color="#f59e0b" />
                <Gauge score={data.interviewScore} label="Interview" color="#10b981" />
            </div>

            {/* Interview Performance Insights */}
            <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    Interview Performance Insights
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Last Score</div>
                        <div className="text-2xl font-black text-white">{data.lastInterviewScore || 0}%</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Best Score</div>
                        <div className="text-2xl font-black text-emerald-400">{data.bestInterviewScore || 0}%</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Streak (≥70%)</div>
                        <div className="text-2xl font-black text-amber-400">{data.interviewStreak || 0} 🔥</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Strongest Domain</div>
                        <div className="text-xl font-bold text-blue-400 truncate" title={data.strongestDomain || 'N/A'}>{data.strongestDomain || 'N/A'}</div>
                    </div>
                </div>
            </div>

            {/* AI Career Mentor Section */}
            <div className="glass-card p-6 rounded-2xl border border-blue-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3 relative z-10">
                    <span className="text-blue-400">🤖</span> Today's AI Recommendation
                </h3>
                
                {loadingMentor ? (
                    <div className="text-slate-400 animate-pulse relative z-10">Groq AI is analyzing your career profile...</div>
                ) : aiMentorPlan ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-blue-400 font-medium text-sm uppercase tracking-wider mb-2">Overall Recommendation</h4>
                                <p className="text-slate-200 text-lg leading-relaxed">{aiMentorPlan.overallRecommendation}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-blue-400 font-medium text-sm uppercase tracking-wider mb-2">Weekly Plan</h4>
                                <p className="text-slate-300 bg-white/5 p-4 rounded-xl border border-white/10">{aiMentorPlan.weeklyLearningPlan}</p>
                            </div>

                            <div>
                                <h4 className="text-blue-400 font-medium text-sm uppercase tracking-wider mb-2">Monthly Goal</h4>
                                <p className="text-slate-300 bg-white/5 p-4 rounded-xl border border-white/10">{aiMentorPlan.monthlyGoal}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-amber-400 font-medium text-sm uppercase tracking-wider mb-2">Immediate Improvements</h4>
                                <ul className="space-y-2">
                                    {(aiMentorPlan.immediateImprovements || []).map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-slate-300">
                                            <span className="text-amber-500">⚡</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                    <div className="text-emerald-400 text-xs font-bold uppercase mb-1">Placement Readiness</div>
                                    <div className="text-xl text-white">{aiMentorPlan.placementReadiness}</div>
                                </div>
                                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                                    <div className="text-purple-400 text-xs font-bold uppercase mb-1">Confidence Level</div>
                                    <div className="text-xl text-white">{aiMentorPlan.confidenceLevel}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-cyan-400 font-medium text-sm uppercase tracking-wider mb-2">Recommended Tech</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(aiMentorPlan.recommendedTechnologies || []).map((tech, i) => (
                                        <span key={i} className="px-3 py-1 bg-cyan-500/10 text-cyan-300 text-sm rounded-full border border-cyan-500/20">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-red-400 relative z-10">Failed to load AI recommendations.</div>
                )}
            </div>

            {/* Embed the Career Analytics Chart */}
            <CareerAnalytics />
        </div>
    );
};

export default CareerDashboard;
