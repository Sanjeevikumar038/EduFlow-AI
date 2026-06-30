import React, { useState, useEffect } from "react";
import { getCurrentClassStatus } from "../../services/timetableService";
import { Link } from "react-router-dom";

function SmartFreeHourCard() {
  const [status, setStatus] = useState("Checking...");
  const [loading, setLoading] = useState(true);
  const [isFree, setIsFree] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getCurrentClassStatus(null, token)
      .then(res => {
        if (!res.data || !res.data.subject) {
          setStatus("Free Hour");
          setIsFree(true);
        } else {
          setStatus(res.data.subject);
          setIsFree(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setStatus("Free Hour");
        setIsFree(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="glass-card p-6 rounded-2xl animate-pulse h-full min-h-[200px]"></div>;

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span className="text-amber-400">⚡</span> Smart Free Hour
      </h2>

      {!isFree ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
            <span className="text-4xl opacity-60">🕒</span>
          </div>
          <p className="text-base font-semibold text-slate-200">No Free Period Currently</p>
          <p className="text-sm text-slate-400 mt-2 max-w-[250px]">
            You will be notified when you have a free hour.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="text-4xl">🎉</span>
            </div>
            <p className="text-base font-semibold text-emerald-400">You're Free Now!</p>
            <p className="text-sm text-slate-400 mt-2 max-w-[250px]">
              Use this time to practice coding or review your resume.
            </p>
          </div>

          <Link
            to="/student/coding"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-center font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
          >
            Start Coding Practice →
          </Link>
        </div>
      )}
    </div>
  );
}

export default SmartFreeHourCard;
