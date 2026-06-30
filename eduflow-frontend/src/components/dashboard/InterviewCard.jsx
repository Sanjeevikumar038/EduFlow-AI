import React, { useState, useEffect } from "react";
import { getCareerDashboard } from "../../services/careerService";

function InterviewCard() {
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

  const score = data?.interviewScore ? data.interviewScore * 4 : 0; // Convert 0-25 to 0-100

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] transition-all duration-300 border border-white/5 hover:border-blue-500/30">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>

      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg border border-blue-500/30">🎤</div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Interview Score</h3>
          <p className="text-2xl font-bold text-white mt-0.5">{score.toFixed(1)}%</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 relative z-10">
        {data?.totalMockSessions ? `${data.totalMockSessions} mock sessions` : "No interviews attempted"}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden relative z-10">
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default InterviewCard;
