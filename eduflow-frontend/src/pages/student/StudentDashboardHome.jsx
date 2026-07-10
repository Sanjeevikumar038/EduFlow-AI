import React, { useState, useEffect } from "react";
import "../../styles/dashboard-tweaks.css";
import AttendanceCard from "../../components/dashboard/AttendanceCard";
import CodingCard from "../../components/dashboard/CodingCard";
import InterviewCard from "../../components/dashboard/InterviewCard";
import CareerCard from "../../components/dashboard/CareerCard";
import ScheduleCard from "../../components/dashboard/ScheduleCard";
import SubjectAttendanceCard from "../../components/dashboard/SubjectAttendanceCard";
import QuickActions from "../../components/dashboard/QuickActions";
import { getCurrentClassStatus } from "../../services/timetableService";

function StudentDashboardHome() {
  const name = localStorage.getItem("name") || "Student";
  const email = localStorage.getItem("email") || "";
  const registerNumber = localStorage.getItem("registerNumber") || "—";
  const department = localStorage.getItem("department") || "—";

  const [currentClass, setCurrentClass] = useState(null);
  const [classStatus, setClassStatus] = useState("checking");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getCurrentClassStatus(null, token)
      .then(res => {
        const d = res.data;
        if (d?.status === "WEEKEND") {
          setClassStatus("weekend");
          setCurrentClass(null);
        } else if (d?.status === "CLASS" && d?.currentClass?.subject) {
          setClassStatus("class");
          setCurrentClass(d.currentClass.subject);
        } else if (d?.status === "LUNCH") {
          setClassStatus("break");
          setCurrentClass("Lunch Break");
        } else if (d?.status === "BREAK") {
          setClassStatus("break");
          setCurrentClass("Short Break");
        } else if (d?.status === "ENDED") {
          setClassStatus("ended");
          setCurrentClass("Classes Ended");
        } else if (d?.status === "BEFORE_COLLEGE") {
          setClassStatus("before");
          setCurrentClass("Before College Hours");
        } else {
          setClassStatus("free");
          setCurrentClass("Free Hour");
        }
      })
      .catch(() => {
        setClassStatus("free");
        setCurrentClass("Free Hour");
      });
  }, []);

  const statusConfig = {
    class:   { dot: "bg-emerald-500", text: "text-emerald-400", label: "In Progress" },
    free:    { dot: "bg-amber-500",   text: "text-amber-400",   label: "Free Hour"   },
    break:   { dot: "bg-blue-500",    text: "text-blue-400",    label: "Break"       },
    ended:   { dot: "bg-slate-500",   text: "text-slate-400",   label: "Ended"       },
    weekend: { dot: "bg-slate-500",   text: "text-slate-400",   label: "Weekend"     },
    before:  { dot: "bg-slate-500",   text: "text-slate-400",   label: "Not Started" },
    checking:{ dot: "bg-slate-600 animate-pulse", text: "text-slate-500", label: "Checking..." },
  };
  const sc = statusConfig[classStatus] || statusConfig.checking;

  // Dynamically parse first name and initials from the logged-in student's name
  const firstName = name ? name.split(" ")[0] : "Student";
  const initials = name
    ? name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "ST";

  return (
    <div className="w-full pb-8 space-y-6" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Welcome Section ── */}
      <div 
        className="premium-card" 
        style={{ 
          background: "linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, var(--bg-card) 100%)",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
            Welcome back, {firstName}! 👋
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Stay consistent and keep learning every day.
          </p>
        </div>

        {/* Horizontal Info Strip */}
        <div 
          style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "1.5rem 3rem", 
            paddingTop: "1.25rem", 
            borderTop: "1px solid rgba(99, 102, 241, 0.12)" 
          }}
        >
          {[
            { label: "Email ID", value: email || "727723euci045@skcet.ac.in" },
            { label: "Reg No.", value: registerNumber || "727723EUCI045" },
            { label: "Department", value: department || "M.Tech CSE" },
            { label: "Semester", value: "8" },
            { label: "Batch", value: "2023 – 2028" },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
                {item.label}
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text-main)" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat Cards Row (4 cards responsive grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AttendanceCard />
        <CodingCard />
        <InterviewCard />
        <CareerCard />
      </div>

      {/* ── Two-Column Row (Schedule + Subject Attendance) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ScheduleCard />
        </div>
        <div className="lg:col-span-2">
          <SubjectAttendanceCard />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <QuickActions />

    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

export default StudentDashboardHome;

