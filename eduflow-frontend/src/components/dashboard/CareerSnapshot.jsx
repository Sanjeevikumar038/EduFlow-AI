import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";
import { Link } from "react-router-dom";

function CareerSnapshot() {
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

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] border border-white/5 hover:border-orange-500/30">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-orange-400">⭐</span> Career Snapshot
        </h2>
      </div>
      
      {data ? (
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/30 border border-slate-700/30">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Placement Readiness</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${data.overallCareerScore > 18 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                {data.placementStatus}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/30 border border-slate-700/30">
              <span className="text-xs text-slate-400 uppercase tracking-wider">AI Mentor Status</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active</span>
            </div>
            
            <div className="flex justify-between items-center p-2 rounded bg-slate-800/30 border border-slate-700/30">
              <span className="text-xs text-slate-400 uppercase tracking-wider">Focus Area</span>
              <span className="text-xs font-semibold text-orange-400">{data.strongestDomain || 'General'}</span>
            </div>
          </div>
          
          <Link to="/student/career" className="w-full py-2.5 bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/30 rounded-xl text-center font-semibold text-sm transition-colors">
            View Career Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 relative z-10">
          <p className="mb-4 text-center text-sm">No career data available.</p>
        </div>
      )}
    </div>
  );
}

export default CareerSnapshot;
