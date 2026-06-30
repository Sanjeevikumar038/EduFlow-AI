import React, { useState, useEffect } from "react";
import AttendanceCard from "../../components/dashboard/AttendanceCard";
import CodingCard from "../../components/dashboard/CodingCard";
import InterviewCard from "../../components/dashboard/InterviewCard";
import CareerCard from "../../components/dashboard/CareerCard";
import ScheduleCard from "../../components/dashboard/ScheduleCard";
import SubjectAttendanceCard from "../../components/dashboard/SubjectAttendanceCard";
import QuickActions from "../../components/dashboard/QuickActions";
import { getCurrentClassStatus } from "../../services/timetableService";

function StudentDashboardHome() {
  const name = localStorage.getItem("name") || "Sanju";
  let email = localStorage.getItem("email") || "sanju@gmail.com";
  if (!email.includes("@")) {
    email = "sanju@gmail.com";
  }
  const registerNumber = localStorage.getItem("registerNumber") || "727723EUC1001";
  const department = localStorage.getItem("department") || "M.Tech CSE";
  const [currentClass, setCurrentClass] = useState("Checking...");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentClassStatus(null, token)
        .then(res => {
          if (res.data?.status === "WEEKEND") {
            setCurrentClass("Weekend");
          } else {
            setCurrentClass(res.data?.currentClass?.subject || "Free Hour");
          }
        })
        .catch(() => setCurrentClass("Free Hour"));
    }
  }, []);

  return (
    <div className="animate-fade-in space-y-6 w-full pb-6">
      
      {/* Welcome & Info Banner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {name}! 👋</h1>
            <p className="text-slate-400 text-sm mt-0.5">Stay consistent and keep learning every day.</p>
          </div>
          
          <div className="shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/50">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Current Class</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {currentClass}
            </span>
          </div>
        </div>

        {/* Horizontal Info Bar */}
        <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-y-4 gap-x-8 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-slate-700/50 shrink-0">✉️</div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Email ID</div>
              <div className="font-bold text-slate-200 mt-0.5" title={email}>{email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-slate-700/50 shrink-0">🆔</div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Reg No.</div>
              <div className="font-bold text-slate-200 mt-0.5">{registerNumber}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-slate-700/50 shrink-0">🏫</div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Department</div>
              <div className="font-bold text-slate-200 mt-0.5">{department}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-slate-700/50 shrink-0">🎓</div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Semester</div>
              <div className="font-bold text-slate-200 mt-0.5">10</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm border border-slate-700/50 shrink-0">📅</div>
            <div>
              <div className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Batch</div>
              <div className="font-bold text-slate-200 mt-0.5">2023 - 2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: 4 Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AttendanceCard />
        <CodingCard />
        <InterviewCard />
        <CareerCard />
      </div>

      {/* Row 2: Today's Schedule + Subject Wise Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ScheduleCard />
        </div>
        <div className="lg:col-span-2">
          <SubjectAttendanceCard />
        </div>
      </div>

      {/* Row 3: Quick Actions */}
      <div>
        <QuickActions />
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pt-6 pb-2 border-t border-slate-800/50">
        © {new Date().getFullYear()} EduFlow. All rights reserved.
      </footer>

    </div>
  );
}

export default StudentDashboardHome;

