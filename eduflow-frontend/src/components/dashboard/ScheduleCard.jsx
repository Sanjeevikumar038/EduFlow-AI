import React, { useState, useEffect } from "react";
import { getCurrentClassStatus } from "../../services/timetableService";
import { Link } from "react-router-dom";

// Period times defined in the backend
const PERIOD_TIMES = [
  { period: 1, start: "08:45", end: "09:40" },
  { period: 2, start: "09:40", end: "10:35" },
  { period: 3, start: "10:50", end: "11:45" },
  { period: 4, start: "11:45", end: "12:40" },
  { period: 5, start: "13:40", end: "14:35" },
  { period: 6, start: "14:35", end: "15:30" },
  { period: 7, start: "15:30", end: "16:25" },
  { period: 8, start: "16:25", end: "17:20" },
];

const SUBJECT_NAME_MAP = {
  "OS": "Operating Systems",
  "DCN": "Data Communication Networks",
  "PCD": "Professional Communication Development",
  "AIES": "AI Expert Systems",
  "AGAI": "Agentic AI",
  "SE": "Software Engineering",
  "CC LAB": "Cloud Computing Lab",
  "AI LAB": "AI LAB",
  "DSA": "Data Structures & Algorithms",
  "COA": "Computer Organization & Architecture",
  "DBMS": "Database Management Systems",
  "TOC": "Theory of Computation",
  "Java Lab": "Java Programming Lab",
  "OOPs": "Object Oriented Programming",
  "WebTech": "Web Technologies",
  "Cloud": "Cloud Computing",
  "Web Lab": "Web Development Lab",
  "EDC": "Electronic Devices & Circuits",
  "DSP": "Digital Signal Processing",
  "VLSI": "VLSI Design",
  "Embedded Lab": "Embedded Systems Lab"
};

const ROOM_MAP = {
  "OS": "Room 402",
  "DCN": "Room 305",
  "PCD": "Room 305",
  "AIES": "Room 402",
  "AGAI": "Room 402",
  "SE": "Room 402",
  "CC LAB": "Lab 1",
  "AI LAB": "Lab 1",
  "DSA": "Room 101",
  "COA": "Room 102",
  "DBMS": "Room 101",
  "TOC": "Room 102",
  "Java Lab": "Lab 2",
  "OOPs": "Room 101",
  "WebTech": "Room 101",
  "Cloud": "Room 102",
  "Web Lab": "IT Lab",
  "EDC": "ECE Room 1",
  "DSP": "ECE Room 2",
  "VLSI": "VLSI Lab",
  "Embedded Lab": "Embedded Lab"
};

function ScheduleCard() {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getCurrentClassStatus(null, token)
      .then(res => {
        const tl = res.data?.todayTimeline || [];
        const classes = tl.filter(p => p.period > 0 && p.subject && p.subject !== "Free Hour");
        setTimeline(classes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-6 rounded-2xl animate-pulse h-[400px]"></div>;

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">📅</span> Today's Schedule
        </h2>
        {timeline.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {timeline.length} Classes
          </span>
        )}
      </div>

      {timeline.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60 py-8">
          <span className="text-4xl mb-3">🎉</span>
          <p className="font-semibold">No classes scheduled today.</p>
          <p className="text-sm">Enjoy your day off!</p>
        </div>
      ) : (
        <div className="flex-1 space-y-0 overflow-y-auto max-h-[450px] custom-scrollbar pr-1">
          {timeline.map((item, idx) => {
            const isLive = item.active;
            const isDone = item.completed;

            const dotColor = isLive ? "bg-emerald-500" : isDone ? "bg-slate-500" : "bg-slate-600";
            const dotGlow = isLive ? "shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "";
            
            const subCode = item.subject || "";
            const displayName = SUBJECT_NAME_MAP[subCode] || subCode;
            const roomCode = ROOM_MAP[subCode] || "Room 402";

            return (
              <div key={idx} className="flex items-start gap-4 py-3 border-b border-slate-800/50 last:border-0">
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className={`w-3 h-3 rounded-full ${dotColor} ${dotGlow} shrink-0`} />
                  {idx < timeline.length - 1 && <div className="w-px h-full bg-slate-700/50 mt-1 min-h-[40px]" />}
                </div>

                {/* Time column */}
                <div className="w-[130px] shrink-0 text-xs text-slate-400 font-mono pt-0.5">
                  <div>{item.startTime} -</div>
                  <div>{item.endTime}</div>
                </div>

                {/* Period badge */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isLive
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-slate-800 text-slate-300 border border-slate-700"
                }`}>
                  P{item.period}
                </div>

                {/* Class info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${isLive ? "text-white" : "text-slate-200"}`}>
                    {displayName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.facultyName ? `Dr. ${item.facultyName}` : "Faculty TBA"} • {roomCode}
                  </p>
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  {isLive ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live Now
                    </span>
                  ) : isDone ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-slate-700/50 text-slate-500 border border-slate-600/30">
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Full Timetable */}
      <Link
        to="/student/timetable"
        className="mt-4 text-sm text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        View Full Timetable <span>→</span>
      </Link>
    </div>
  );
}

export default ScheduleCard;
