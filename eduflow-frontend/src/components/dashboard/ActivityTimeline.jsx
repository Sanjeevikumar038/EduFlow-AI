import React from "react";
import { Link } from "react-router-dom";

function ActivityTimeline() {
  // Recent activity feed — in a production system this would come from an activity API.
  // For now we show contextual entries matching real features.
  const activities = [
    { id: 1, type: "ATTENDANCE", text: "Marked attendance for Computer Networks", time: "2 hours ago", color: "text-purple-400 bg-purple-500/20 border-purple-500/30" },
    { id: 2, type: "CODING", text: "Solved 'Two Sum' in Coding Challenge", time: "5 hours ago", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" },
    { id: 3, type: "INTERVIEW", text: "Completed Mock Interview (Score: 82%)", time: "1 day ago", color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
    { id: 4, type: "RESUME", text: "Uploaded updated Resume", time: "2 days ago", color: "text-amber-400 bg-amber-500/20 border-amber-500/30" },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span className="text-amber-400">⭐</span> Recent Activity
      </h2>

      <div className="flex-1 space-y-4">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${act.color}`}>
              {act.type.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold uppercase tracking-wider ${act.color.split(" ")[0]}`}>{act.type}</span>
                <span className="text-xs text-slate-500">• {act.time}</span>
              </div>
              <p className="text-sm text-slate-300 leading-snug">{act.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/student/dashboard"
        className="mt-4 text-sm text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        View All Activity <span>→</span>
      </Link>
    </div>
  );
}

export default ActivityTimeline;
