import React, { useState, useEffect } from "react";
import { getStudentTimetable, getCurrentClassStatus } from "../../services/timetableService";
import SimulationControl from "../../components/SimulationControl";

const PERIOD_DETAILS = [
  { num: 1, label: "Period 1", time: "08:45 - 09:40" },
  { num: 2, label: "Period 2", time: "09:40 - 10:35" },
  { num: 3, label: "Period 3", time: "10:50 - 11:45" },
  { num: 4, label: "Period 4", time: "11:45 - 12:40" },
  { num: 5, label: "Period 5", time: "13:40 - 14:35" },
  { num: 6, label: "Period 6", time: "14:35 - 15:30" },
  { num: 7, label: "Period 7", time: "15:30 - 16:25" },
  { num: 8, label: "Period 8", time: "16:25 - 17:20" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function TimetablePage() {
  const token = localStorage.getItem("token");
  const [timetableData, setTimetableData] = useState([]);
  const [currentClassStatus, setCurrentClassStatus] = useState(null);
  const [simParams, setSimParams] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTimetableAndStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const timetableRes = await getStudentTimetable(token);
      setTimetableData(timetableRes.data || []);

      const statusRes = await getCurrentClassStatus(simParams, token);
      setCurrentClassStatus(statusRes.data);
    } catch (err) {
      console.error("Error fetching student timetable/status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableAndStatus();
    if (!simParams && token) {
      const interval = setInterval(() => {
        getCurrentClassStatus(null, token)
          .then((res) => setCurrentClassStatus(res.data))
          .catch((err) => console.error(err));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token, simParams]);

  const renderGridCell = (day, periodNum) => {
    const entry = timetableData.find(
      (e) => e.dayOfWeek?.toLowerCase() === day.toLowerCase() && e.period === periodNum
    );

    // Check if this cell is active/live
    const isActive =
      currentClassStatus &&
      currentClassStatus.status === "CLASS" &&
      currentClassStatus.periodNumber === periodNum &&
      (simParams?.simulatedDay
        ? simParams.simulatedDay.toLowerCase() === day.toLowerCase()
        : new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day.toLowerCase());

    const hasClass = entry && entry.subject && entry.subject.trim() !== "";
    const subject = hasClass ? entry.subject : "Free Hour";
    const faculty = hasClass && entry.faculty ? entry.faculty.name : "";

    return (
      <td
        key={periodNum}
        className={`p-4 border border-slate-800 transition-all duration-300 relative ${
          isActive
            ? "bg-purple-500/10 border-purple-500/50 shadow-[inset_0_0_12px_rgba(168,85,247,0.15)]"
            : hasClass
            ? "bg-slate-900/30 hover:bg-slate-800/20 text-slate-200"
            : "bg-slate-950/40 text-slate-500 italic"
        }`}
      >
        {isActive && (
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
        )}
        <div className={`font-semibold text-sm ${isActive ? "text-purple-400" : hasClass ? "text-white" : "text-slate-500"}`}>
          {subject}
        </div>
        {hasClass && (
          <div className="text-[11px] text-slate-400 mt-1 font-medium truncate max-w-[120px]" title={faculty}>
            👨‍🏫 {faculty}
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-full pb-8">
      {/* Top Card: Title & Simulator */}
      <div className="glass-card p-6 rounded-2xl flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Class Timetable</h2>
          <p className="text-slate-400 text-sm">View your weekly schedule and track currently active periods.</p>
        </div>
        <div className="xl:w-[400px]">
          <SimulationControl onChange={(params) => setSimParams(params)} />
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-800 w-[120px]">
                  Day / Period
                </th>
                {PERIOD_DETAILS.map((p) => (
                  <th key={p.num} className="p-4 border-r border-slate-800 last:border-r-0">
                    <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">{p.label}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const isToday =
                  new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() === day.toLowerCase();

                return (
                  <tr
                    key={day}
                    className={`border-b border-slate-800 last:border-0 ${
                      isToday ? "bg-purple-500/[0.02]" : ""
                    }`}
                  >
                    <td className={`p-4 font-bold text-sm border-r border-slate-800 ${
                      isToday ? "text-purple-400 border-l-4 border-l-purple-500" : "text-slate-300"
                    }`}>
                      {day}
                      {isToday && (
                        <span className="block text-[9px] uppercase font-bold text-purple-500/80 mt-0.5 tracking-wider">
                          Today
                        </span>
                      )}
                    </td>
                    {PERIOD_DETAILS.map((p) => renderGridCell(day, p.num))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TimetablePage;
