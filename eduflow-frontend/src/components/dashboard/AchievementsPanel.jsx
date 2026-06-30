import React from "react";

function AchievementsPanel() {
  const achievements = [
    { id: 1, icon: "🎯", title: "Problem Solver", desc: "10+ Coding challenges", color: "emerald" },
    { id: 2, icon: "🔥", title: "3 Day Streak", desc: "Consistent learning", color: "orange" },
    { id: 3, icon: "⭐", title: "Top 10%", desc: "In Mock Interviews", color: "blue" }
  ];

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-pink-400">🏆</span> Achievements
        </h2>
      </div>
      
      <div className="flex-1 space-y-4">
        {achievements.map(ach => (
          <div key={ach.id} className="flex gap-4 items-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-slate-600 transition-colors group cursor-default">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-${ach.color}-500/10 border border-${ach.color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
              {ach.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{ach.title}</h4>
              <p className="text-xs text-slate-500">{ach.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AchievementsPanel;
