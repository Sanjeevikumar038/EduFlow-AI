import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";
import { Link } from "react-router-dom";

function InterviewSnapshot() {
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

  const score = data?.interviewScore ? data.interviewScore * 4 : 0;

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] border border-white/5 hover:border-blue-500/30">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">🎤</span> Interview Snapshot
        </h2>
      </div>
      
      {data && data.totalMockSessions > 0 ? (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <div className="flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 mb-3 hover:bg-slate-800/60 transition-colors">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Latest Score</p>
              <p className="text-2xl font-bold text-white">{score.toFixed(0)}<span className="text-sm text-slate-400">%</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Best Domain</p>
              <p className="text-sm font-semibold text-emerald-400">Technical</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2 mb-4 text-xs text-slate-400">
            <span>Last Attempt: <strong>1 week ago</strong></span>
          </div>
          
          <Link to="/student/interview" className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-center font-semibold text-sm transition-colors">
            Start Mock Interview
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 relative z-10">
          <p className="mb-4 text-center text-sm">No interviews taken yet.<br/>Practice your first one today!</p>
          <Link to="/student/interview" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center font-semibold text-sm transition-colors shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
            Start First Interview
          </Link>
        </div>
      )}
    </div>
  );
}

export default InterviewSnapshot;
