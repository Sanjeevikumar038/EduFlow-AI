import React, { useState } from "react";
import { createPortal } from "react-dom";

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
  "August-23": { act: "Holiday", isH: true },
  "August-24": { wd: "W66", do: "I" },
  "August-25": { wd: "W67", do: "II" },
  "August-26": { act: "Milad-un-Nabi", isH: true },
  "August-27": { wd: "W68", do: "III" },
  "August-28": { wd: "W69", do: "IV" },
  "August-29": { wd: "W70", do: "V" },
  "August-30": { act: "Holiday", isH: true },
  "August-31": { wd: "W71", do: "I" },

  "September-1": { wd: "W72", do: "II" },
  "September-2": { wd: "W73", do: "III" },
  "September-3": { wd: "W74", do: "IV" },
  "September-4": { act: "Krishna Jayanthi", isH: true },
  "September-5": { act: "Holiday", isH: true },
  "September-6": { act: "Holiday", isH: true },
  "September-7": { wd: "W75", do: "V" },
  "September-8": { wd: "W76", do: "I" },
  "September-9": { wd: "W77", do: "II" },
  "September-10": { wd: "W78", do: "III" },
  "September-11": { wd: "W79", do: "IV" },
  "September-12": { wd: "W80", do: "V" },
  "September-13": { act: "Holiday", isH: true },
  "September-14": { act: "Vinayakar Chathurthi", isH: true },
  "September-15": { wd: "W81", do: "I" },
  "September-16": { wd: "W82", do: "II" },
  "September-17": { wd: "W83", do: "III" },
  "September-18": { wd: "W84", do: "IV", act: "CIA-II (II & III Yr)*", isS: true },
  "September-19": { wd: "W85", do: "V" },
  "September-20": { act: "Holiday", isH: true },
  "September-21": { wd: "W86", do: "I" },
  "September-22": { wd: "W87", do: "II" },
  "September-23": { wd: "W88", do: "III" },
  "September-24": { wd: "W89", do: "IV" },
  "September-25": { wd: "W90", do: "V", act: "Last Instruction Day", isS: true },
  "September-26": { act: "Holiday", isH: true },
  "September-27": { act: "Holiday", isH: true },

  "October-2": { act: "Gandhi Jayanthi", isH: true },
  "October-3": { act: "ESE Theory Day-1 (II Yr)", isS: true },
  "October-4": { act: "Holiday", isH: true },
  "October-5": { act: "ESE (III Yr Day-1 / II Yr Day-2)", isS: true },
  "October-6": { act: "ESE Theory Day-2 (III Yr)", isS: true },
  "October-7": { act: "ESE Theory Day-3 (II Yr)", isS: true },
  "October-8": { act: "ESE (III Yr Day-3 / II Yr Day-4)", isS: true },
  "October-9": { act: "ESE Theory Day-4 (III Yr)", isS: true },
  "October-11": { act: "Holiday", isH: true },
  "October-12": { act: "ESE Day-5 (II & III Yr)", isS: true },
  "October-13": { act: "ESE Day-6 (II & III Yr)", isS: true },
  "October-14": { act: "ESE Day-6 (III Yr End)", isS: true },
  "October-18": { act: "Holiday", isH: true },
  "October-19": { act: "Ayutha Pooja", isH: true },
  "October-20": { act: "Vijaya Dasami", isH: true },
  "October-25": { act: "Holiday", isH: true }
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

function AdminTopbar({ searchTerm, setSearchTerm, setMobileMenuOpen, isDark, setIsDark, handleLogout }) {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState("ALL");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
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
          <i className="fa-solid fa-bars"></i>
        </button>

        {/* Search Input Row with Magnifying-Glass */}
        <div className="search-container-input hidden sm:block">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search students, faculty, departments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Right: Icons row + Profile chip */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        
        {/* Icons list */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Calendar Icon */}
          <button 
            onClick={() => setShowCalendarModal(true)}
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--box-bg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.05rem" }} 
            title="Academic Calendar"
          >
            <i className="fa-solid fa-calendar-day"></i>
          </button>

          {/* Globe Icon */}
          <button 
            onClick={() => window.open("https://placement.skcet.ac.in", "_blank")}
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--box-bg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.05rem" }} 
            title="SKCET Placement Portal"
          >
            <i className="fa-solid fa-globe"></i>
          </button>

          {/* Theme switcher */}
          <button
            onClick={() => setIsDark(d => !d)}
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--box-bg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.05rem", color: isDark ? "#fbbf24" : "var(--text-muted)" }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
          </button>

          {/* Notification Bell Icon with Badge */}
          <div style={{ position: "relative" }}>
            <button 
              style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--box-bg)", border: "1px solid var(--divider)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.05rem" }} 
              title="Notifications"
            >
              <i className="fa-solid fa-bell"></i>
              <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "8px", height: "8px", backgroundColor: "#f43f5e", borderRadius: "50%" }} />
            </button>
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
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff", fontSize: "0.9rem" }}>
              SA
            </div>
            <div className="hidden md:block">
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.875rem" }}>System Admin</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}><i className="fa-solid fa-chevron-down"></i></span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>ADMIN</div>
            </div>
          </div>

          {profileDropdownOpen && (
            <div 
              style={{
                position: "absolute",
                top: "45px",
                right: 0,
                width: "150px",
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
                <i className="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Academic Calendar Modal Overlay */}
      {showCalendarModal && createPortal(
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
          zIndex: 99999,
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
                <span style={{ fontSize: "1.5rem", color: "var(--primary)" }}><i className="fa-solid fa-calendar-day"></i></span>
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
                    const el = document.getElementById(`admin-month-column-${month}`);
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
                  <i className="fa-solid fa-location-dot" style={{ color: "var(--primary)" }}></i> {month}
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
                    id={`admin-month-column-${monthNameOnly}`}
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
                          rowBg = "rgba(245, 158, 11, 0.12)";
                          borderLeft = "3px solid #f59e0b";
                          textColor = "var(--warning)";
                          fontWeight = "600";
                        } else if (day.isS) {
                          rowBg = "rgba(99, 102, 241, 0.15)";
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
        </div>,
        document.body
      )}
    </header>
  );
}

export default AdminTopbar;
