import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../career/NotificationBell";
import { getCurrentClassStatus } from "../../services/timetableService";

function StudentPortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Student";
  const registerNumber = localStorage.getItem("registerNumber") || "";
  const department = localStorage.getItem("department") || "";
  
  const [currentClass, setCurrentClass] = useState("Checking...");
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentClassStatus(null, token)
        .then(res => setCurrentClass(res.data?.currentClass?.subject || "Free Hour"))
        .catch(() => setCurrentClass("Unknown"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { path: "/student/dashboard", icon: "🏠", label: "Dashboard" },
    { path: "/student/attendance", icon: "📅", label: "Attendance" },
    { path: "/student/timetable", icon: "🗓", label: "Timetable" },
    { path: "/student/coding", icon: "💻", label: "Coding" },
    { path: "/student/resume", icon: "📄", label: "Resume" },
    { path: "/student/interview", icon: "🎤", label: "AI Interview" },
    { path: "/student/career", icon: "⭐", label: "Career" },
    { path: "/student/leave", icon: "📝", label: "Leave / OD" },
    { path: "/student/settings", icon: "⚙", label: "Settings" },
  ];

  const today = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: "flex", width: "100vw", minHeight: "100vh", backgroundColor: "#0F172A", color: "#f3f4f6", overflow: "hidden" }}>
      {/* ERP Sidebar */}
      <aside style={{ width: "260px", backgroundColor: "#111827", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", zIndex: 20 }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #7C3AED, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>E</div>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: "700", background: "linear-gradient(135deg, #fff 40%, #9ca3af 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0, lineHeight: 1 }}>EduFlow</h2>
            <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: 0, textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>Student Portal</p>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: "1rem 0", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "0 1.5rem", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>Main Menu</div>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition-all duration-200 relative group ${isActive ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
                style={{ textDecoration: "none" }}
              >
                {/* Active Indicator (VS Code style) */}
                {isActive && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", backgroundColor: "#7C3AED", boxShadow: "0 0 10px #7C3AED" }}></div>}
                
                <span className={`text-lg transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(15, 23, 42, 0.3)" }}>
          <div style={{ padding: "0 0", fontSize: "0.75rem", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.75rem" }}>User</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-500/20">
              {name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{name}</div>
              <div className="text-[11px] text-slate-400 truncate">{department}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{registerNumber}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all font-semibold text-sm"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", position: "relative", overflow: "hidden" }}>
        
        {/* Header */}
        <header style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", backgroundColor: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)", zIndex: 10 }}>
          
          {/* Left Side: Hamburger & Search */}
          <div className="flex items-center gap-6 flex-1 max-w-xl">
            <button className="text-slate-400 hover:text-white text-lg focus:outline-none transition-colors" title="Toggle Sidebar">
              ☰
            </button>
            
            {/* Search */}
            <div className="relative w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="Search resources, tasks, courses..." 
                className="w-full py-2 pl-10 pr-4 bg-slate-800/40 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:bg-slate-800/60 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right Side: Tools & Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            
            {/* Icons */}
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-slate-800/40 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors" title="Calendar">📅</button>
              <button className="w-9 h-9 rounded-full bg-slate-800/40 hover:bg-slate-700 flex items-center justify-center text-emerald-400 transition-colors" title="Network Stable">🌐</button>
              <button className="w-9 h-9 rounded-full bg-slate-800/40 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors" title="Toggle Theme">🌓</button>
              <div className="relative flex items-center justify-center">
                <NotificationBell />
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700/50"></div>

            {/* Profile */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <div className="font-semibold text-white text-sm group-hover:text-purple-400 transition-colors">{name}</div>
                <div className="text-[11px] text-slate-400">{department} • Sem 10</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                {name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "1.5rem" }} className="custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StudentPortalLayout;
