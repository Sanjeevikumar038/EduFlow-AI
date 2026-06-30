import React from "react";
import { Link } from "react-router-dom";

function QuickActions() {
  const actions = [
    { label: "Mark Attendance", icon: "📷", path: "/student/attendance", color: "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:border-purple-400" },
    { label: "View Timetable", icon: "🗓", path: "/student/timetable", color: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:border-blue-400" },
    { label: "Solve Coding", icon: "💻", path: "/student/coding", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400" },
    { label: "Resume Analysis", icon: "📄", path: "/student/resume", color: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:border-amber-400" },
    { label: "Mock Interview", icon: "🎤", path: "/student/interview", color: "bg-pink-500/20 text-pink-400 border-pink-500/30 hover:border-pink-400" },
    { label: "Apply Leave", icon: "📝", path: "/student/leave", color: "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:border-orange-400" },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl w-full flex flex-col">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span className="text-purple-400">⚡</span> Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            to={action.path}
            className={`flex items-center gap-3.5 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${action.color}`}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center text-lg border border-slate-700/50 shrink-0">
              {action.icon}
            </div>
            <span className="text-xs font-bold leading-snug">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
