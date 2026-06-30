import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";
import { Link } from "react-router-dom";

function ResumeSnapshot() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getCareerDashboard(token).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-6 rounded-2xl animate-pulse h-[250px]"></div>;

  const score = data?.resumeScore ? data.resumeScore * 4 : 0;
  const health = score > 80 ? "Excellent" : score > 60 ? "Good" : "Optimization Needed";
  const badgeColor = score > 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(234,179,8,0.1)] border border-white/5 hover:border-amber-500/30">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-amber-400">📄</span> Resume Snapshot
        </h2>
      </div>
      
      {score > 0 ? (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <div className="flex items-center gap-5 mb-4">
            <div className="relative w-16 h-16 flex items-center justify-center bg-slate-800 rounded-full border border-slate-700 shadow-inner">
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={(2 * Math.PI * 28) - (score / 100) * (2 * Math.PI * 28)} strokeLinecap="round" className="text-amber-500 transition-all duration-1000 ease-out" />
              </svg>
              <span className="text-lg font-bold text-white relative z-10">{score.toFixed(0)}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">ATS Score</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                {health}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 mb-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Last updated</span>
            <span className="text-xs font-semibold text-slate-200">2 Days Ago</span>
          </div>
          
          <Link to="/student/resume" className="w-full py-2.5 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/30 rounded-xl text-center font-semibold text-sm transition-colors">
            Analyze Resume
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 relative z-10">
          <p className="mb-4 text-center text-sm">No resume uploaded<br/>Upload to get ATS score.</p>
          <Link to="/student/resume" className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-center font-semibold text-sm transition-colors shadow-[0_4px_15px_rgba(245,158,11,0.3)]">
            Upload Resume
          </Link>
        </div>
      )}
    </div>
  );
}

export default ResumeSnapshot;
