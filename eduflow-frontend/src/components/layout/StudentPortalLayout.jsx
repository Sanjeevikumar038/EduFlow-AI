import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import NotificationBell from "../career/NotificationBell";
import { getCurrentClassStatus } from "../../services/timetableService";
import MobileAttendancePortal from "../../pages/student/MobileAttendancePortal";

const calendarOverrides = {
  "June-4": { wd: "W1", do: "I", act: "Reopening II, III, IV Years", isS: true },
  "June-5": { wd: "W2", do: "II" },
  "June-6": { wd: "W3", do: "III" },
  "June-8": { wd: "W4", do: "IV" },
  "June-9": { wd: "W5", do: "V" },
  "June-10": { wd: "W6", do: "I" },
  "June-11": { wd: "W7", do: "II" },
  "June-12": { wd: "W8", do: "III" },
  "June-13": { wd: "W9", do: "IV" },
  "June-15": { wd: "W10", do: "V" },
  "June-16": { wd: "W11", do: "I" },
  "June-17": { wd: "W12", do: "II" },
  "June-18": { wd: "W13", do: "III" },
  "June-19": { wd: "W14", do: "IV" },
  "June-20": { wd: "W15", do: "V" },
  "June-22": { wd: "W16", do: "I" },
  "June-23": { wd: "W17", do: "II" },
  "June-24": { wd: "W18", do: "III" },
  "June-25": { wd: "W19", do: "IV" },
  "June-26": { act: "Muharram (Holiday)", isH: true },
  "June-27": { act: "Holiday", isH: true },
  "June-28": { act: "Holiday", isH: true },
  "June-29": { wd: "W20", do: "V" },
  "June-30": { wd: "W21", do: "I" },

  "July-1": { wd: "W22", do: "II" },
  "July-2": { wd: "W23", do: "III" },
  "July-3": { wd: "W24", do: "IV" },
  "July-4": { wd: "W25", do: "V" },
  "July-6": { wd: "W26", do: "I" },
  "July-7": { wd: "W27", do: "II" },
  "July-8": { wd: "W28", do: "III" },
  "July-9": { wd: "W29", do: "IV" },
  "July-10": { wd: "W30", do: "V" },
  "July-11": { wd: "W31", do: "I" },
  "July-13": { wd: "W32", do: "II" },
  "July-14": { wd: "W33", do: "III" },
  "July-15": { wd: "W34", do: "IV" },
  "July-16": { wd: "W35", do: "V" },
  "July-17": { wd: "W36", do: "I" },
  "July-18": { act: "Holiday", isH: true },
  "July-19": { act: "Holiday", isH: true },
  "July-20": { wd: "W37", do: "II" },
  "July-21": { wd: "W38", do: "III" },
  "July-22": { wd: "W39", do: "IV" },
  "July-23": { wd: "W40", do: "V" },
  "July-24": { wd: "W41", do: "I" },
  "July-25": { wd: "W42", do: "II" },
  "July-26": { act: "Holiday", isH: true },
  "July-27": { wd: "W43", do: "III", act: "CIA-I for II Year*", isS: true },
  "July-28": { wd: "W44", do: "IV" },
  "July-29": { wd: "W45", do: "V" },
  "July-30": { wd: "W46", do: "I" },
  "July-31": { wd: "W47", do: "II" },

  "August-1": { wd: "W48", do: "III" },
  "August-3": { wd: "W49", do: "IV" },
  "August-4": { wd: "W50", do: "V" },
  "August-5": { wd: "W51", do: "I", act: "CIA-I for III Year*", isS: true },
  "August-6": { wd: "W52", do: "II" },
  "August-7": { wd: "W53", do: "III" },
  "August-8": { wd: "W54", do: "IV" },
  "August-10": { wd: "W55", do: "V" },
  "August-11": { wd: "W56", do: "I" },
  "August-12": { wd: "W57", do: "II" },
  "August-13": { wd: "W58", do: "III" },
  "August-14": { wd: "W59", do: "IV" },
  "August-15": { act: "Independence Day", isH: true },
  "August-17": { wd: "W60", do: "", act: "Classes Suspended", isH: true },
  "August-18": { wd: "W61", do: "I" },
  "August-19": { wd: "W62", do: "II" },
  "August-20": { wd: "W63", do: "III" },
  "August-21": { wd: "W64", do: "IV" },
  "August-22": { wd: "W65", do: "V" },
  "August-24": { wd: "W66", do: "I" },
  "August-25": { wd: "W67", do: "II" },
  "August-26": { act: "Milad-un-Nabi", isH: true },
  "August-27": { wd: "W68", do: "III" },
  "August-28": { wd: "W69", do: "IV" },
  "August-29": { wd: "W70", do: "V" },
  "August-31": { wd: "W71", do: "I" },

  "September-1": { wd: "W72", do: "II" },
  "September-2": { wd: "W73", do: "III" },
  "September-3": { wd: "W74", do: "IV" },
  "September-4": { act: "Krishna Jayanthi", isH: true },
  "September-5": { act: "Holiday", isH: true },
  "September-7": { wd: "W75", do: "V" },
  "September-8": { wd: "W76", do: "I" },
  "September-9": { wd: "W77", do: "II" },
  "September-10": { wd: "W78", do: "III" },
  "September-11": { wd: "W79", do: "IV" },
  "September-12": { wd: "W80", do: "V" },
  "September-14": { act: "Vinayakar Chathurthi", isH: true },
  "September-15": { wd: "W81", do: "I" },
  "September-16": { wd: "W82", do: "II" },
  "September-17": { wd: "W83", do: "III" },
  "September-18": { wd: "W84", do: "IV", act: "CIA-II (II & III Yr)*", isS: true },
  "September-19": { wd: "W85", do: "V" },
  "September-21": { wd: "W86", do: "I" },
  "September-22": { wd: "W87", do: "II" },
  "September-23": { wd: "W88", do: "III" },
  "September-24": { wd: "W89", do: "IV" },
  "September-25": { wd: "W90", do: "V", act: "Last Instruction Day", isS: true },
  "September-26": { act: "Holiday", isH: true },

  "October-2": { act: "Gandhi Jayanthi", isH: true },
  "October-3": { act: "ESE Theory Day-1 (II Yr)", isS: true },
  "October-5": { act: "ESE (III Yr Day-1 / II Yr Day-2)", isS: true },
  "October-6": { act: "ESE Theory Day-2 (III Yr)", isS: true },
  "October-7": { act: "ESE Theory Day-3 (II Yr)", isS: true },
  "October-8": { act: "ESE (III Yr Day-3 / II Yr Day-4)", isS: true },
  "October-9": { act: "ESE Theory Day-4 (III Yr)", isS: true },
  "October-12": { act: "ESE Day-5 (II & III Yr)", isS: true },
  "October-13": { act: "ESE Day-6 (II & III Yr)", isS: true },
  "October-14": { act: "ESE Day-6 (III Yr End)", isS: true },
  "October-19": { act: "Ayutha Pooja", isH: true },
  "October-20": { act: "Vijaya Dasami", isH: true }
};

const SKCET_CALENDAR_DATA = (() => {
  const months = [
    { name: "June 2026", length: 30, startDay: 1 },
    { name: "July 2026", length: 31, startDay: 3 },
    { name: "August 2026", length: 31, startDay: 6 },
    { name: "September 2026", length: 30, startDay: 2 },
    { name: "October 2026", length: 31, startDay: 4 }
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return months.map(m => {
    const days = [];
    const monthNameOnly = m.name.split(" ")[0];
    for (let d = 1; d <= m.length; d++) {
      const dayIndex = (m.startDay + d - 1) % 7;
      const dy = dayNames[dayIndex];
      const key = `${monthNameOnly}-${d}`;
      const override = calendarOverrides[key] || {};
      
      const isSunday = dayIndex === 0;
      const isH = override.isH || isSunday;
      const act = override.act || (isSunday ? "Holiday" : "");
      
      days.push({
        d,
        dy,
        wd: override.wd || "",
        do: override.do || "",
        act,
        isH,
        isS: override.isS || false
      });
    }
    return { name: m.name, days };
  });
})();

function StudentPortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Retrieve user details from localStorage, fallback to spec real data
  const name = localStorage.getItem("name") || "Sanjeevikumar D";
  const registerNumber = localStorage.getItem("registerNumber") || "727723EUCI045";
  const department = localStorage.getItem("department") || "M.Tech CSE";
  const email = localStorage.getItem("email") || "727723euci045@skcet.ac.in";
  const roleLine = `${department} · Sem 8`;

  const [currentClass, setCurrentClass] = useState("Checking...");

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("eduflow-theme");
    return saved ? saved === "dark" : false;
  });

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState("ALL");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Apply theme to <html> on mount and whenever it changes
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", "light");
    }
    localStorage.setItem("eduflow-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsDark(e.detail === "dark");
    };
    window.addEventListener("eduflow-theme-changed", handleThemeChange);
    
    const checkTheme = () => {
      const current = localStorage.getItem("eduflow-theme");
      if (current) {
        setIsDark(current === "dark");
      }
    };
    window.addEventListener("storage", checkTheme);

    return () => {
      window.removeEventListener("eduflow-theme-changed", handleThemeChange);
      window.removeEventListener("storage", checkTheme);
    };
  }, []);

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
    navigate("/");
  };

  const menuItems = [
    { path: "/student/dashboard", icon: <i className="fa-solid fa-house"></i>, label: "Dashboard" },
    { path: "/student/attendance", icon: <i className="fa-solid fa-calendar-check"></i>, label: "Attendance" },
    { path: "/student/timetable", icon: <i className="fa-solid fa-calendar-days"></i>, label: "Timetable" },
    { path: "/student/coding", icon: <i className="fa-solid fa-laptop-code"></i>, label: "Coding" },
    { path: "/student/resume", icon: <i className="fa-solid fa-file-lines"></i>, label: "Resume" },
    { path: "/student/interview", icon: <i className="fa-solid fa-microphone"></i>, label: "AI Interview" },
    { path: "/student/career", icon: <i className="fa-solid fa-star"></i>, label: "Career" },
    { path: "/student/leave", icon: <i className="fa-solid fa-file-signature"></i>, label: "Leave / OD" },
    { path: "/student/settings", icon: <i className="fa-solid fa-gear"></i>, label: "Settings" },
  ];

  // Generate dynamic initials and first name from logged-in user name
  const initials = name
    ? name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "ST";
  const firstName = name ? name.split(" ")[0] : "Student";

  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobileScreen) {
    return <MobileAttendancePortal />;
  }

  return (
    <div className="portal-layout" style={{
      display: "flex", width: "100vw", minHeight: "100vh",
      backgroundColor: "var(--bg-primary)", color: "var(--text-main)", overflow: "hidden",
    }}>

      {/* Backdrop for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 30,
          }}
          className="lg:hidden"
        />
      )}

      {/* ── Sidebar (Fixed, Left) ────────────────────────────────────────── */}
      <aside 
        className={`portal-sidebar ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          width: "260px",
          backgroundColor: "var(--bg-sidebar)", /* Theme-aware background */
          borderRight: "1px solid var(--sidebar-border)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Top: Logo & Title */}
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--sidebar-border)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #4f46e5, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff", flexShrink: 0 }}>E</div>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: "700", color: "var(--text-main)", margin: 0, lineHeight: 1 }}>EduFlow</h2>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>Student Portal</p>
          </div>
        </div>

        {/* Main Menu Label */}
        <div style={{ padding: "1.25rem 1.5rem 0.5rem 1.5rem", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
          MAIN MENU
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }} className="custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  textDecoration: "none",
                  borderRadius: "10px",
                  backgroundColor: isActive ? "#4f46e5" : "transparent", /* Highlighted filled indigo background */
                  color: isActive ? "#ffffff" : "var(--text-muted)", /* White text if active, gray text if inactive */
                  fontWeight: isActive ? "600" : "500",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--nav-hover-bg)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span style={{ fontSize: "1.1rem", flexShrink: 0, filter: isActive ? "brightness(1.5)" : "grayscale(0.3)" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content Area (Spans right of Sidebar) ───────────────────── */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        paddingLeft: "260px", /* Sidebar width */
      }} className="w-full pl-0 lg:pl-[260px]">

        {/* Top bar */}
        <header className="portal-header" style={{
          borderBottom: "1px solid var(--header-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 2rem",
          backgroundColor: "var(--bg-header)",
          backdropFilter: "blur(12px)",
          height: "70px",
          zIndex: 10,
        }}>

          {/* Left: Mobile hamburger menu toggle + Search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-main)",
                fontSize: "1.5rem",
                cursor: "pointer",
                padding: "0.25rem",
              }}
              className="lg:hidden"
              title="Open Menu"
            >
              ☰
            </button>

            {/* Search Input Row with Magnifying-Glass */}
            <div className="search-container-input hidden sm:block">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search resources, tasks, courses..." />
            </div>
          </div>

          {/* Right: Icons row + Profile chip */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            
            {/* Icons list */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {/* Calendar Icon */}
              <button 
                onClick={() => setShowCalendarModal(true)}
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--box-bg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.05rem", color: "var(--text-muted)" }} 
                title="Academic Calendar"
              >
                <i className="fa-solid fa-calendar-day"></i>
              </button>

              {/* Globe Icon */}
              <button 
                onClick={() => window.open("https://placement.skcet.ac.in", "_blank")}
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--box-bg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.05rem", color: "var(--text-muted)" }} 
                title="SKCET Placement Portal"
              >
                <i className="fa-solid fa-globe"></i>
              </button>

              {/* Moon (Dark Mode toggler) */}
              <button
                onClick={() => setIsDark(d => !d)}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--box-bg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.05rem", color: isDark ? "#fbbf24" : "var(--text-muted)" }}
              >
                {isDark ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
              </button>

              {/* Notification Bell Icon with Badge */}
              <div style={{ position: "relative" }}>
                <NotificationBell />
              </div>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: "1px", height: "24px", backgroundColor: "var(--divider)" }} />

            {/* Profile chip wrapper */}
            <div style={{ position: "relative" }}>
              <div 
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                {(() => {
                  const photoUrl = registerNumber ? `/students_photos/${registerNumber.toLowerCase()}.jpg` : null;
                  return (
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", position: "relative", flexShrink: 0 }}>
                      <img
                        src={photoUrl || ""}
                        alt={name}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                        style={{
                          width: "100%", height: "100%", borderRadius: "50%",
                          objectFit: "cover", objectPosition: "top",
                          border: "2px solid var(--primary)",
                          display: photoUrl ? "block" : "none"
                        }}
                      />
                      <div style={{
                        width: "100%", height: "100%", borderRadius: "50%",
                        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                        display: photoUrl ? "none" : "flex",
                        alignItems: "center", justifyContent: "center",
                        fontWeight: "700", color: "#fff", fontSize: "0.9rem"
                      }}>
                        {initials}
                      </div>
                    </div>
                  );
                })()}
                <div className="hidden md:block">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.875rem" }}>{firstName}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>▼</span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{roleLine}</div>
                </div>
              </div>

              {profileDropdownOpen && (
                <div 
                  style={{
                    position: "absolute",
                    top: "45px",
                    right: 0,
                    width: "180px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    padding: "8px",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}
                >
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/student/settings");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--nav-hover-bg)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    ⚙️ Settings
                  </button>
                  
                  <div style={{ height: "1px", background: "var(--divider)", margin: "4px 0" }} />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "8px 12px",
                      background: "transparent",
                      border: "none",
                      color: "#f43f5e",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(244, 63, 94, 0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "2rem" }} className="custom-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* Academic Calendar Modal Overlay */}
      {showCalendarModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          animation: "fadeIn 0.25s ease-out"
        }}
        onClick={() => setShowCalendarModal(false)}
        >
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--card-border)",
            borderRadius: "20px",
            width: "96vw",
            maxWidth: "1400px",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
            overflow: "hidden"
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--card-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "rgba(30, 41, 59, 0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "1.5rem" }}>📅</span>
                <div>
                  <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.05rem", fontWeight: "800", letterSpacing: "0.5px" }}>
                    SRI KRISHNA COLLEGE OF ENGINEERING AND TECHNOLOGY
                  </h2>
                  <p style={{ margin: "2px 0 0 0", color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: "600" }}>
                    ACADEMIC YEAR 2026 - 2027 • II, III, IV, V YEAR ODD SEMESTER - ACADEMIC CALENDAR
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCalendarModal(false)}
                style={{
                  background: "var(--box-bg)",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-main)",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: "1"
                }}
              >
                ×
              </button>
            </div>

            {/* Quick Navigation Month Tabs */}
            <div style={{
              padding: "12px 24px",
              background: "rgba(30, 41, 59, 0.1)",
              borderBottom: "1px solid var(--card-border)",
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              whiteSpace: "nowrap"
            }} className="custom-scrollbar">
              {["June", "July", "August", "September", "October"].map((month) => (
                <button
                  key={month}
                  onClick={() => {
                    const el = document.getElementById(`month-column-${month}`);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
                    }
                  }}
                  style={{
                    padding: "6px 14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-main)",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  📍 {month}
                </button>
              ))}
            </div>

            {/* Modal Scrollable Columns */}
            <div style={{
              flex: 1,
              overflowX: "auto",
              display: "flex",
              gap: "12px",
              padding: "16px",
              background: "var(--bg-primary)"
            }} className="custom-scrollbar">
              {SKCET_CALENDAR_DATA.map((month, mIdx) => {
                const monthNameOnly = month.name.split(" ")[0];
                return (
                  <div 
                    key={mIdx} 
                    id={`month-column-${monthNameOnly}`}
                    style={{
                      flex: "0 0 255px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden"
                    }}
                  >
                    {/* Month header row */}
                    <div style={{
                      padding: "8px 12px",
                      background: "linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)",
                      color: "#fff",
                      textAlign: "center",
                      fontWeight: "700",
                      fontSize: "0.85rem"
                    }}>
                      {month.name}
                    </div>

                    {/* Calendar columns sub-header */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "28px 28px 32px 32px 1fr",
                      background: "rgba(30, 41, 59, 0.15)",
                      borderBottom: "1px solid var(--card-border)",
                      textAlign: "center",
                      padding: "4px 0",
                      fontSize: "0.6rem",
                      fontWeight: "800",
                      color: "var(--text-muted)",
                      textTransform: "uppercase"
                    }}>
                      <div>Date</div>
                      <div>Day</div>
                      <div>W.D.</div>
                      <div>D.O.</div>
                      <div style={{ textAlign: "left", paddingLeft: "4px" }}>Activities</div>
                    </div>

                    {/* Days list */}
                    <div style={{
                      flex: 1,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column"
                    }} className="custom-scrollbar">
                      {month.days.map((day, dIdx) => {
                        let rowBg = "transparent";
                        let borderLeft = "none";
                        let textColor = "var(--text-main)";
                        let fontWeight = "400";
                        
                        if (day.isH) {
                          rowBg = "rgba(245, 158, 11, 0.12)"; // Yellow/Orange tint for holidays
                          borderLeft = "3px solid #f59e0b";
                          textColor = "var(--warning)";
                          fontWeight = "600";
                        } else if (day.isS) {
                          rowBg = "rgba(99, 102, 241, 0.15)"; // Indigo tint for special/exams
                          borderLeft = "3px solid var(--primary)";
                          textColor = "var(--primary)";
                          fontWeight = "700";
                        }

                        return (
                          <div 
                            key={dIdx}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "28px 28px 32px 32px 1fr",
                              alignItems: "center",
                              background: rowBg,
                              borderLeft: borderLeft,
                              borderBottom: "1px solid var(--divider)",
                              padding: "3px 0",
                              fontSize: "0.68rem",
                              color: textColor,
                              minHeight: "25px",
                              textAlign: "center"
                            }}
                          >
                            <div style={{ fontWeight: "700" }}>{day.d}</div>
                            <div style={{ color: day.isH ? "var(--warning)" : "var(--text-muted)" }}>{day.dy}</div>
                            <div style={{ color: "var(--success)", fontWeight: "600" }}>{day.wd}</div>
                            <div style={{ color: "var(--primary)", fontWeight: "700" }}>{day.do}</div>
                            <div style={{ 
                              textAlign: "left", 
                              paddingLeft: "4px",
                              fontSize: "0.62rem", 
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              lineHeight: "1.1",
                              fontWeight: fontWeight,
                              paddingRight: "2px"
                            }}>
                              {day.act}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer disclaimer */}
            <div style={{
              padding: "10px 24px",
              borderTop: "1px solid var(--card-border)",
              background: "rgba(30, 41, 59, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.72rem",
              color: "var(--text-muted)"
            }}>
              <span>* AN Regular Classes during CIA Exams</span>
              <span style={{ fontWeight: "600" }}>Sri Krishna College of Engineering & Technology, Coimbatore</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPortalLayout;
