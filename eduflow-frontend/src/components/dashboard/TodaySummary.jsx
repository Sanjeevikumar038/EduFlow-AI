import React, { useState, useEffect } from "react";
import { getStudentAnalytics } from "../../services/attendanceService";
import { getStudentTimetable } from "../../services/timetableService";

function TodaySummary() {
  const [data, setData] = useState({ att: 0, classesToday: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      getStudentAnalytics(token).catch(() => ({ data: { classesAttended: 0, totalClasses: 0 }})),
      getStudentTimetable(token).catch(() => ({ data: [] }))
    ]).then(([attRes, ttRes]) => {
      const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const todaysClasses = ttRes.data.filter(t => t.dayOfWeek === currentDay);
      
      const percent = attRes.data.totalClasses > 0 ? (attRes.data.classesAttended / attRes.data.totalClasses) * 100 : 0;
      
      setData({
        att: percent,
        classesToday: todaysClasses.length
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="glass-card p-6 rounded-2xl animate-pulse h-[140px]"></div>;

  const dateString = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="glass-card p-6 rounded-2xl relative overflow-hidden h-[180px] flex flex-col justify-center">
      <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20">
          <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">👨‍🎓</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-purple-400 mb-1">{dateString}</p>
          <h2 className="text-xl font-bold text-white tracking-tight">Ready to learn?</h2>
          <p className="text-xs text-slate-400 mt-1">
            You have <strong className="text-white">{data.classesToday}</strong> classes today and your attendance is at <strong className={data.att >= 75 ? 'text-emerald-400' : 'text-amber-400'}>{data.att.toFixed(0)}%</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TodaySummary;
