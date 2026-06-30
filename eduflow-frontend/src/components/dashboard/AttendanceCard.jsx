import React, { useState, useEffect } from "react";
import { getStudentAnalytics } from "../../services/attendanceService";

function AttendanceCard() {
  const [data, setData] = useState({ attended: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getStudentAnalytics(token)
      .then(res => {
        const present = res.data.presentClasses || 0;
        const absent = res.data.absentClasses || 0;
        const overall = res.data.overallAttendancePercentage || 0;
        setData({
          attended: present,
          total: present + absent,
          percent: overall
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const percent = data.percent !== undefined ? data.percent : (data.total > 0 ? (data.attended / data.total) * 100 : 0);

  if (loading) return <div className="glass-card p-5 rounded-2xl animate-pulse h-[160px]"></div>;

  return (
    <div className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)] transition-all duration-300 border border-white/5 hover:border-purple-500/30">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>

      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg border border-purple-500/30">📅</div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Attendance</h3>
          <p className="text-2xl font-bold text-white mt-0.5">{percent.toFixed(0)}%</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 relative z-10">
        {data.total === 0 ? "No attendance recorded" : `${data.attended} / ${data.total} classes attended`}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden relative z-10">
        <div
          className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default AttendanceCard;
