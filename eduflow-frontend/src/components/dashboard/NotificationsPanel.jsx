import React from "react";
import { Link } from "react-router-dom";

function NotificationsPanel() {
  const notifications = [
    { id: 1, title: "New Coding Challenge", time: "1 hour ago", icon: "💻", color: "emerald", isNew: true },
    { id: 2, title: "Resume AI Feedback", time: "3 hours ago", icon: "📄", color: "amber", isNew: true },
    { id: 3, title: "System Maintenance", time: "Yesterday", icon: "⚙️", color: "blue", isNew: false }
  ];

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-blue-400">🔔</span> Updates
        </h2>
        <span className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">View All</span>
      </div>
      
      <div className="flex-1 space-y-4">
        {notifications.map(notif => (
          <div key={notif.id} className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 group cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-${notif.color}-500/10 text-${notif.color}-400 border border-${notif.color}-500/20 group-hover:bg-${notif.color}-500/20 transition-colors shrink-0`}>
              {notif.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{notif.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
            </div>
            {notif.isNew && (
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPanel;
