import React from "react";

function AdminSidebar({ activeTab, setActiveTab, handleLogout }) {
  const adminMenuItems = [
    { id: "analytics", label: "Analytics Control", icon: <i className="fa-solid fa-chart-pie"></i> },
    { id: "faculty", label: "Faculty Management", icon: <i className="fa-solid fa-user"></i> },
    { id: "students", label: "Student Management", icon: <i className="fa-solid fa-user-graduate"></i> },
    { id: "timetable", label: "Timetable Manager", icon: <i className="fa-solid fa-calendar-days"></i> },
    { id: "subjects", label: "Subject Master", icon: <i className="fa-solid fa-book"></i> },
    { id: "expertise", label: "Faculty Expertise", icon: <i className="fa-solid fa-bullseye"></i> },
    { id: "leaves", label: "Faculty Leaves", icon: <i className="fa-solid fa-umbrella-beach"></i> },
    { id: "leave", label: "Student Leaves/OD", icon: <i className="fa-solid fa-file-invoice"></i> },
    { id: "workload", label: "Workload", icon: <i className="fa-solid fa-stopwatch"></i> },
    { id: "career", label: "Career", icon: <i className="fa-solid fa-star"></i> },
  ];

  return (
    <aside 
      className="portal-sidebar"
      style={{
        width: "260px",
        backgroundColor: "var(--bg-sidebar)",
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
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#fff", flexShrink: 0 }}>E</div>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: "700", color: "var(--text-main)", margin: 0, lineHeight: 1 }}>EduFlow</h2>
          <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "1px", marginTop: "2px" }}>Admin Portal</p>
        </div>
      </div>

      {/* Main Menu Label */}
      <div style={{ padding: "1.25rem 1.5rem 0.5rem 1.5rem", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
        MAIN MENU
      </div>

      {/* Navigation list */}
      <nav style={{ flex: 1, padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", overflowY: "auto" }} className="custom-scrollbar">
        {adminMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                border: "none",
                borderRadius: "10px",
                backgroundColor: isActive ? "var(--primary)" : "transparent",
                background: isActive ? "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)" : "transparent",
                color: isActive ? "#ffffff" : "var(--text-muted)",
                fontWeight: isActive ? "600" : "500",
                fontSize: "0.875rem",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-main)";
                  e.currentTarget.style.backgroundColor = "var(--nav-hover-bg)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default AdminSidebar;
