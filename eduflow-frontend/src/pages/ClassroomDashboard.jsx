import React, { useState, useEffect } from "react";
import { getMyClassrooms, syncClassrooms } from "../services/classroomService";
import ClassroomCard from "../components/ClassroomCard";

const ClassroomDashboard = () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role") || "STUDENT";
  const userName = localStorage.getItem("name") || "Student";

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await getMyClassrooms(token);
      setClassrooms(res.data || []);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncERP = async () => {
    try {
      setSyncing(true);
      await syncClassrooms(token);
      await fetchClassrooms();
      alert("Virtual Classrooms synchronized from ERP Timetable & Subject Allocation!");
    } catch (err) {
      console.error("Failed to sync classrooms:", err);
    } finally {
      setSyncing(false);
    }
  };

  const getDeptShortName = (dept) => {
    if (!dept) return "General";
    const d = dept.trim().toUpperCase();
    if (d.includes("MTECH") || d.includes("M.TECH")) return "M.Tech CSE";
    if (d.includes("ARTIFICIAL") || d.includes("AI &") || d.includes("AIDS") || d.includes("AI AND")) return "AI&DS";
    if (d.includes("BUSINESS") || d === "CSBS") return "CSBS";
    if (d === "CSE" || d.includes("COMPUTER SCIENCE")) return "CSE";
    if (d === "IT" || d.includes("INFORMATION")) return "IT";
    if (d === "ECE" || d.includes("ELECTRONICS AND COMM") || d.includes("ELECTRONICS & COMM")) return "ECE";
    if (d === "EEE" || d.includes("ELECTRICAL")) return "EEE";
    if (d.includes("MECHATRONICS")) return "Mechatronics";
    if (d.includes("MECH")) return "Mech";
    if (d.includes("CIVIL")) return "Civil";
    if (d.includes("SCIENCE") || d.includes("HUMANITIES")) return "S&H";
    return dept.replace(/Department of\s*/i, "").trim();
  };

  const uniqueClassrooms = React.useMemo(() => {
    const map = new Map();
    (classrooms || []).forEach((c) => {
      const shortDept = getDeptShortName(c.department);
      const sem = c.semester || 1;
      const sec = c.section ? c.section.trim().toUpperCase() : "A";
      const code = c.subjectCode ? c.subjectCode.trim().toUpperCase() : "";
      const key = `${code}|${shortDept}|${sem}|${sec}`;
      if (!map.has(key)) {
        map.set(key, c);
      }
    });
    return Array.from(map.values());
  }, [classrooms]);

  const filteredClassrooms = uniqueClassrooms.filter((c) => {
    const shortDept = getDeptShortName(c.department);
    const matchesSearch =
      c.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.facultyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortDept.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === "ALL") return matchesSearch;
    return matchesSearch && shortDept === activeFilter;
  });

  const uniqueDeptPills = Array.from(
    new Set(uniqueClassrooms.map((c) => getDeptShortName(c.department)).filter(Boolean))
  );

  return (
    <div className="w-full pb-8 space-y-6 flex flex-col gap-6">
      
      {/* ── Welcome Hero Banner (Matching Student Dashboard Style) ── */}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="custom-badge custom-badge-indigo">Mini Classroom</span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                ERP Virtual Classrooms
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2rem",
                fontWeight: "700",
                color: "var(--text-main)",
                margin: 0,
              }}
            >
              Virtual Classrooms & Courses <i className="fa-solid fa-chalkboard-user" style={{ color: "#4f46e5" }}></i>
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Welcome back, <strong style={{ color: "var(--text-main)" }}>{userName}</strong> ({userRole}). Access announcements, materials, assignments, assessments, and AI insights.
            </p>
          </div>

          <button
            onClick={handleSyncERP}
            disabled={syncing}
            style={{
              padding: "0.75rem 1.25rem",
              background: "#4f46e5",
              color: "#ffffff",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "0.85rem",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
              transition: "all 0.2s ease"
            }}
          >
            <i className={`fa-solid fa-rotate ${syncing ? "fa-spin" : ""}`}></i>
            <span>{syncing ? "Syncing ERP..." : "Sync ERP Classrooms"}</span>
          </button>
        </div>

        {/* Filter Pills Strip */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(99, 102, 241, 0.12)",
            alignItems: "center"
          }}
        >
          <span style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
            Filter Courses:
          </span>
          <button
            onClick={() => setActiveFilter("ALL")}
            className={activeFilter === "ALL" ? "custom-badge custom-badge-indigo" : "custom-badge custom-badge-gray"}
            style={{ cursor: "pointer", padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            All Allocated Courses
          </button>
          {uniqueDeptPills.map((deptName) => (
            <button
              key={deptName}
              onClick={() => setActiveFilter(deptName)}
              className={activeFilter === deptName ? "custom-badge custom-badge-indigo" : "custom-badge custom-badge-gray"}
              style={{ cursor: "pointer", padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
            >
              {deptName}
            </button>
          ))}
        </div>
      </div>

      {/* Search Container & Course Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="search-container-input" style={{ maxWidth: "380px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search course title, subject code, faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)" }}>
          Showing <strong style={{ color: "var(--primary)" }}>{filteredClassrooms.length}</strong> of {uniqueClassrooms.length} Allocated Courses
        </div>
      </div>

      {/* Classroom Cards Grid */}
      {loading ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your virtual classrooms...
        </div>
      ) : filteredClassrooms.length === 0 ? (
        <div className="premium-card text-center py-16 text-slate-400 space-y-3">
          <i className="fa-solid fa-book-open text-4xl text-indigo-500 mb-2 block" />
          <h3 className="text-lg font-bold" style={{ color: "var(--text-main)" }}>No Virtual Classrooms Found</h3>
          <p className="text-xs max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            No virtual classrooms match your search or filter options. Click "Sync ERP Classrooms" to pull live allocations from Timetable and Subject Master.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassroomDashboard;
