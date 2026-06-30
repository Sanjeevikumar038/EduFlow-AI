import React, { useState, useEffect } from "react";
import { getStudentAnalytics } from "../../services/attendanceService";
import { Link } from "react-router-dom";

const SUBJECT_NAME_MAP = {
  "OS": "Operating Systems",
  "DCN": "Data Communication Networks",
  "PCD": "Parallel and Cloud Computing",
  "AIES": "AI Expert Systems",
  "AGAI": "Agentic AI",
  "SE": "Software Engineering",
  "CC LAB": "Cloud Computing Lab",
  "AI LAB": "Artificial Intelligence Lab",
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

function SubjectAttendanceCard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    getStudentAnalytics(token)
      .then(res => {
        const list = res.data?.subjectWiseAttendance || [];
        setSubjects(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="glass-card p-6 rounded-2xl animate-pulse h-[400px]"></div>;

  const getBarColor = (percentage) => {
    if (percentage >= 85) return "bg-emerald-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 65) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getSubjectIcon = (subCode) => {
    const code = subCode.toUpperCase();
    if (code.includes("LAB")) return "💻";
    if (code.includes("OS") || code.includes("SYS")) return "⚙️";
    if (code.includes("NET") || code.includes("DCN")) return "🌐";
    if (code.includes("AI") || code.includes("AGAI")) return "🧠";
    if (code.includes("DB") || code.includes("DBMS")) return "🗄️";
    if (code.includes("CLOUD") || code.includes("PCD")) return "☁️";
    return "📝";
  };

  return (
    <div className="glass-card p-6 rounded-2xl h-full flex flex-col">
      <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span className="text-purple-400">📊</span> Attendance Percentage by Subject
      </h2>

      {subjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60 py-8">
          <p className="font-semibold px-4 text-center">No attendance has been recorded yet.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4.5 overflow-y-auto max-h-[450px] custom-scrollbar pr-1">
          {subjects.map((item, idx) => {
            const subCode = item.subject || "";
            const displayName = SUBJECT_NAME_MAP[subCode] || subCode;
            const percent = item.attendancePercentage || 0;
            const total = item.presentClasses + item.absentClasses;

            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-sm shrink-0">
                    {getSubjectIcon(subCode)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-200 truncate" title={displayName}>
                      {displayName}
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(percent)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-white">{percent.toFixed(0)}%</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {item.presentClasses} / {total} classes
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Detailed Attendance */}
      <Link
        to="/student/attendance"
        className="mt-5 text-sm text-purple-400 hover:text-purple-300 font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        View Detailed Attendance <span>→</span>
      </Link>
    </div>
  );
}

export default SubjectAttendanceCard;
