import React from "react";

function FacultySidebar({ activeTab, setActiveTab, handleLogout, name, subtitle, mobileMenuOpen, setMobileMenuOpen }) {
  const menuItems = [
    { id: "overview", label: "Dashboard Overview", icon: <i className="fa-solid fa-chart-pie"></i> },
    { id: "qr-session", label: "QR Session", icon: <i className="fa-solid fa-qrcode"></i> },
    { id: "register", label: "Manual Attendance", icon: <i className="fa-solid fa-pen-to-square"></i> },
    { id: "analytics", label: "Attendance Analytics", icon: <i className="fa-solid fa-chart-line"></i> },
    { id: "schedule", label: "My Schedule", icon: <i className="fa-solid fa-calendar-days"></i> },
    { id: "career", label: "Career", icon: <i className="fa-solid fa-rocket"></i> }
  ];

  const isAdvisor = localStorage.getItem("classAdvisor") === "true";
  if (isAdvisor) {
    menuItems.splice(5, 0, 
      { id: "students", label: "Manage Students", icon: <i className="fa-solid fa-user-graduate"></i> },
      { id: "leave", label: "Leave Requests", icon: <i className="fa-solid fa-clipboard-list"></i> }
    );
  }

  // Extract clean initials
  const cleanName = name ? name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Prof\.)\s+/i, "") : "";
  const avatarInitials = cleanName ? cleanName.substring(0, 1).toUpperCase() : (name ? name.substring(0, 1).toUpperCase() : "F");

  return (
    <aside style={{
      width: "260px",
      backgroundColor: "var(--bg-sidebar)",
      borderRight: "1px solid var(--card-border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      padding: "1.5rem 1rem",
      zIndex: 40,
      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }} className={`portal-sidebar ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>

      {/* Top: Logo & Main Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        
        {/* Logo block */}
        <div style={{ padding: "0 0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem", color: "var(--primary)" }}><i className="fa-solid fa-bolt"></i></span>
            <span style={{ fontWeight: "800", fontSize: "1.25rem", color: "var(--text-main)" }}>EduFlow</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "2.2rem" }}>
            Faculty Portal
          </span>
        </div>

        {/* Menu Section */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <div style={{
            fontSize: "0.7rem",
            fontWeight: "700",
            color: "var(--text-muted)",
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
            paddingLeft: "0.5rem"
          }}>
            MAIN MENU
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1, overflowY: "auto", paddingRight: "4px" }} className="custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); if (setMobileMenuOpen) setMobileMenuOpen(false); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: isActive ? "600" : "500",
                    transition: "all 0.2s ease",
                    background: isActive ? "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)" : "transparent",
                    color: isActive ? "#fff" : "var(--text-muted)",
                    boxShadow: isActive ? "0 4px 12px rgba(244, 63, 94, 0.2)" : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-main)";
                      e.currentTarget.style.background = "var(--nav-hover-bg)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

    </aside>
  );
}

export default FacultySidebar;
