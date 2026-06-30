import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";

function CodingCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getCareerDashboard(token)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-5 rounded-2xl animate-pulse h-[160px]"></div>;

  const solved = data?.totalCodingSolved || 0;
  const target = 50;
  const percent = Math.min((solved / target) * 100, 100);

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] transition-all duration-300 border border-white/5 hover:border-emerald-500/30">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>

      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30">&lt;/&gt;</div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Coding Solved</h3>
          <p className="text-2xl font-bold text-white mt-0.5">{solved}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 relative z-10">
        {solved === 0 ? "No coding submissions" : `Target: ${target}`}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden relative z-10">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default CodingCard;
