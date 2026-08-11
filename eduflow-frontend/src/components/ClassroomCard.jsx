import React from "react";
import { useNavigate } from "react-router-dom";

const getFullDepartmentName = (dept) => {
  if (!dept) return "General Department";
  const d = dept.trim().toUpperCase();
  if (d.includes("MTECH") || d.includes("M.TECH")) return "Department of MTech Computer Science and Engineering";
  if (d.includes("ARTIFICIAL") || d.includes("AI &") || d.includes("AIDS") || d.includes("AI AND")) return "Department of Artificial Intelligence and Data Science";
  if (d.includes("BUSINESS") || d === "CSBS") return "Department of Computer Science and Business Systems";
  if (d === "CSE" || d.includes("COMPUTER SCIENCE")) return "Department of Computer Science and Engineering";
  if (d === "IT" || d.includes("INFORMATION")) return "Department of Information Technology";
  if (d === "ECE" || d.includes("ELECTRONICS AND COMM") || d.includes("ELECTRONICS & COMM")) return "Department of Electronics and Communication Engineering";
  if (d === "EEE" || d.includes("ELECTRICAL")) return "Department of Electrical and Electronics Engineering";
  if (d.includes("MECHATRONICS")) return "Department of Mechatronics Engineering";
  if (d.includes("MECH")) return "Department of Mechanical Engineering";
  if (d.includes("CIVIL")) return "Department of Civil Engineering";
  if (d.includes("SCIENCE") || d.includes("HUMANITIES")) return "Department of Science and Humanities";
  if (!dept.startsWith("Department of")) return `Department of ${dept}`;
  return dept.trim();
};

const ClassroomCard = ({ classroom }) => {
  const navigate = useNavigate();

  const {
    id,
    subjectCode,
    subjectName,
    facultyName,
    facultyEmail,
    department,
    semester,
    section,
    studentCount,
    announcementCount,
  } = classroom;

  const userRole = localStorage.getItem("role") || "STUDENT";
  const targetPath = userRole === "FACULTY" || userRole === "ADMIN" ? `/classroom/${id}` : `/student/classroom/${id}`;

  return (
    <div
      onClick={() => navigate(targetPath)}
      className="premium-card group cursor-pointer flex flex-col justify-between transition-all duration-200"
      style={{ minHeight: "240px" }}
    >
      {/* Top Header Row: Subject Code & Meta Pills */}
      <div>
        <div className="flex justify-between items-center gap-2 mb-3">
          <span className="custom-badge custom-badge-indigo">
            {subjectCode || "COURSE"}
          </span>
          <span className="custom-badge custom-badge-gray" title={getFullDepartmentName(department)}>
            {getFullDepartmentName(department)} · Sem {semester} {section ? `(${section})` : ""}
          </span>
        </div>

        {/* Subject Title */}
        <h3
          className="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}
        >
          {subjectName}
        </h3>
      </div>

      {/* Faculty Info Section */}
      <div className="my-4 pt-3 flex items-center gap-3 border-t" style={{ borderColor: "var(--divider)" }}>
        <div className="icon-tile icon-tile-indigo">
          <span className="font-bold text-base">
            {facultyName ? facultyName.charAt(0).toUpperCase() : "F"}
          </span>
        </div>
        <div className="overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Course Instructor
          </p>
          <p className="text-xs font-semibold truncate" style={{ color: "var(--text-main)" }}>
            {facultyName || "Faculty Member"}
          </p>
          <p className="text-[11px] truncate opacity-80" style={{ color: "var(--text-muted)" }}>
            {facultyEmail || "faculty@skcet.ac.in"}
          </p>
        </div>
      </div>

      {/* Footer Stats & Arrow Link */}
      <div className="pt-3 flex items-center justify-between border-t text-xs font-semibold" style={{ borderColor: "var(--divider)", color: "var(--text-muted)" }}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5" title="Enrolled Students">
            <i className="fa-solid fa-user-graduate text-indigo-500" />
            <strong style={{ color: "var(--text-main)" }}>{studentCount || 0}</strong> Students
          </span>
          <span className="flex items-center gap-1.5" title="Stream Announcements">
            <i className="fa-solid fa-bullhorn text-amber-500" />
            <strong style={{ color: "var(--text-main)" }}>{announcementCount || 0}</strong> Posts
          </span>
        </div>

        <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
          Enter →
        </span>
      </div>
    </div>
  );
};

export default ClassroomCard;
