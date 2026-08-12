import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../../services/api";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState("ALL"); // "ALL" or "UNREAD"
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !(n.read ?? n.isRead));
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Mark all in local state immediately
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true, read: true }))
    );

    // Sync with backend in parallel
    for (const item of unreadItems) {
      fetch(`${API_BASE}/api/notifications/${item.id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  };

  const isUnread = (n) => !(n.read ?? n.isRead);
  const unreadCount = notifications.filter(isUnread).length;

  const displayedNotifications = notifications.filter((n) => {
    if (filterTab === "UNREAD") return isUnread(n);
    return true;
  });

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Recently";
    
    const now = new Date();
    const diffInSec = Math.floor((now - date) / 1000);

    if (diffInSec < 45) return "Just now";
    if (diffInSec < 3600) return `${Math.max(1, Math.floor(diffInSec / 60))}m ago`;
    if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
    if (diffInSec < 172800) return "Yesterday";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getCategoryMeta = (type, message = "") => {
    const upperType = (type || "").toUpperCase();
    const msgLower = (message || "").toLowerCase();

    if (upperType.includes("ASSESSMENT") || msgLower.includes("assessment") || msgLower.includes("quiz")) {
      return {
        label: "Assessment",
        icon: "📝",
        badgeClass: "custom-badge-indigo",
        accentColor: "#6366f1",
        route: "/student/classroom"
      };
    }
    if (upperType.includes("ASSIGNMENT") || msgLower.includes("assignment") || msgLower.includes("homework")) {
      return {
        label: "Assignment",
        icon: "📂",
        badgeClass: "custom-badge-amber",
        accentColor: "#f59e0b",
        route: "/student/classroom"
      };
    }
    if (upperType.includes("ANNOUNCEMENT") || upperType.includes("STREAM") || msgLower.includes("announcement")) {
      return {
        label: "Course Stream",
        icon: "📢",
        badgeClass: "custom-badge-blue",
        accentColor: "#3b82f6",
        route: "/student/classroom"
      };
    }
    if (upperType.includes("MATERIAL") || upperType.includes("RESOURCE") || msgLower.includes("material") || msgLower.includes("syllabus")) {
      return {
        label: "Learning Resource",
        icon: "📚",
        badgeClass: "custom-badge-green",
        accentColor: "#10b981",
        route: "/student/classroom"
      };
    }
    if (upperType.includes("ATTENDANCE") || msgLower.includes("attendance") || msgLower.includes("present") || msgLower.includes("absent")) {
      return {
        label: "Attendance",
        icon: "📍",
        badgeClass: "custom-badge-red",
        accentColor: "#ef4444",
        route: "/student/attendance"
      };
    }
    if (upperType.includes("RESUME") || msgLower.includes("resume") || msgLower.includes("ats")) {
      return {
        label: "Resume Hub",
        icon: "📄",
        badgeClass: "custom-badge-indigo",
        accentColor: "#8b5cf6",
        route: "/student/resume"
      };
    }
    if (upperType.includes("INTERVIEW") || msgLower.includes("interview")) {
      return {
        label: "Mock Interview",
        icon: "🎯",
        badgeClass: "custom-badge-blue",
        accentColor: "#06b6d4",
        route: "/student/interview"
      };
    }
    if (upperType.includes("CODING") || msgLower.includes("coding") || msgLower.includes("challenge")) {
      return {
        label: "Coding Arena",
        icon: "💻",
        badgeClass: "custom-badge-green",
        accentColor: "#10b981",
        route: "/student/coding"
      };
    }
    if (upperType.includes("TIMETABLE") || msgLower.includes("timetable") || msgLower.includes("class scheduled")) {
      return {
        label: "Timetable",
        icon: "⏱️",
        badgeClass: "custom-badge-indigo",
        accentColor: "#4f46e5",
        route: "/student/timetable"
      };
    }
    return {
      label: "Campus Update",
      icon: "🔔",
      badgeClass: "custom-badge-gray",
      accentColor: "#64748b",
      route: "/student"
    };
  };

  const handleNotificationClick = (item) => {
    if (isUnread(item)) {
      markAsRead(item.id);
    }
    const meta = getCategoryMeta(item.type, item.message);
    setIsOpen(false);
    if (meta.route) {
      navigate(meta.route);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Notification Bell Button with Glow Pulse Counter */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: isOpen ? "rgba(99, 102, 241, 0.15)" : "var(--box-bg)",
          border: isOpen ? "1px solid #6366f1" : "1px solid var(--divider)",
          color: isOpen ? "#818cf8" : "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          position: "relative"
        }}
        title="Notifications"
        aria-label="Notifications"
      >
        <i className="fa-solid fa-bell" style={{ fontSize: "1.1rem" }} />

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              minWidth: "19px",
              height: "19px",
              padding: "0 4px",
              borderRadius: "999px",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: "0.68rem",
              fontWeight: "900",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
              border: "2px solid var(--bg-card)",
              animation: "pulse 2s infinite"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 📋 Premium Dropdown Popup */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 10px)",
            width: "390px",
            maxWidth: "calc(100vw - 2rem)",
            backgroundColor: "var(--bg-modal, var(--bg-card))",
            border: "1px solid var(--card-border)",
            borderRadius: "20px",
            boxShadow: "0 20px 45px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--card-border)",
            zIndex: 99999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: "scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: "1rem 1.25rem 0.75rem 1.25rem",
              borderBottom: "1px solid var(--divider)",
              backgroundColor: "var(--bg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                  color: "#6366f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem"
                }}
              >
                🔔
              </div>
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  color: "var(--text-main)",
                  margin: 0,
                  fontFamily: "var(--font-heading)"
                }}
              >
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "800",
                    padding: "0.15rem 0.55rem",
                    borderRadius: "999px",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.3)"
                  }}
                >
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6366f1",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "6px",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                title="Mark all notifications as read"
              >
                ✓ Mark all read
              </button>
            )}
          </div>

          {/* Filter Sub-Bar */}
          <div
            style={{
              padding: "0.5rem 1.25rem",
              borderBottom: "1px solid var(--divider)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--bg-card)"
            }}
          >
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.76rem",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                backgroundColor: filterTab === "ALL" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: filterTab === "ALL" ? "#6366f1" : "var(--text-muted)",
                transition: "all 0.15s ease"
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("UNREAD")}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "8px",
                fontSize: "0.76rem",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                backgroundColor: filterTab === "UNREAD" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: filterTab === "UNREAD" ? "#6366f1" : "var(--text-muted)",
                transition: "all 0.15s ease"
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Scroll List */}
          <div
            className="custom-scrollbar"
            style={{
              maxHeight: "360px",
              overflowY: "auto",
              padding: "0.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem"
            }}
          >
            {displayedNotifications.length === 0 ? (
              <div
                style={{
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",
                    backgroundColor: "rgba(99, 102, 241, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem"
                  }}
                >
                  🎉
                </div>
                <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-main)" }}>
                  {filterTab === "UNREAD" ? "No unread notifications" : "All caught up!"}
                </div>
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0, maxWidth: "220px" }}>
                  {filterTab === "UNREAD"
                    ? "You have reviewed all your active notifications."
                    : "No new academic or campus notifications at this time."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((n) => {
                const unread = isUnread(n);
                const meta = getCategoryMeta(n.type, n.message);

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "14px",
                      backgroundColor: unread ? "rgba(99, 102, 241, 0.06)" : "transparent",
                      border: unread ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.85rem",
                      position: "relative",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!unread) e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      if (!unread) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Category Icon Badge */}
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--card-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.05rem",
                        flexShrink: 0,
                        marginTop: "2px"
                      }}
                    >
                      {meta.icon}
                    </div>

                    {/* Notification Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          marginBottom: "0.3rem"
                        }}
                      >
                        <span className={`custom-badge ${meta.badgeClass}`} style={{ fontSize: "0.65rem", fontWeight: "800" }}>
                          {meta.badgeText}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>
                          {formatTimeAgo(n.timestamp)}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: "0.84rem",
                          fontWeight: unread ? "700" : "500",
                          color: "var(--text-main)",
                          lineHeight: "1.45",
                          margin: "0 0 0.35rem 0",
                          wordBreak: "break-word"
                        }}
                      >
                        {n.message}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span
                          style={{
                            fontSize: "0.74rem",
                            color: "#6366f1",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          View Details →
                        </span>

                        {unread && (
                          <button
                            type="button"
                            onClick={(e) => markAsRead(n.id, e)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-muted)",
                              fontSize: "0.72rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              padding: "0.1rem 0.35rem",
                              borderRadius: "4px"
                            }}
                            title="Mark as read"
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                          >
                            ✓ Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Unread Glow Dot */}
                    {unread && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#6366f1",
                          boxShadow: "0 0 8px rgba(99, 102, 241, 0.8)",
                          flexShrink: 0,
                          marginTop: "6px"
                        }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div
            style={{
              padding: "0.6rem 1.25rem",
              borderTop: "1px solid var(--divider)",
              backgroundColor: "var(--bg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>
              EduFlow AI Campus Notifications
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
