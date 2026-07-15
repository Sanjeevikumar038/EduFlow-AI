import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../../services/api";

function SettingsPage() {
  const navigate = useNavigate();

  // Load profile values from localStorage
  const [profile, setProfile] = useState({
    name: localStorage.getItem("name") || "Sanjeevikumar D",
    email: localStorage.getItem("email") || "727723euci045@skcet.ac.in",
    registerNumber: localStorage.getItem("registerNumber") || "727723EUCI045",
    department: localStorage.getItem("department") || "M.Tech CSE",
    batch: "2023 - 2028", // Standard academic batch
  });
  // Load theme preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("eduflow-theme");
    return saved ? saved === "dark" : false;
  });
  // Other state settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [passwordFeedback, setPasswordFeedback] = useState({ text: "", type: "" });
  const [profileFeedback, setProfileFeedback] = useState({ text: "", type: "" });

  const toggleThemeSetting = () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    
    // Save to local storage
    localStorage.setItem("eduflow-theme", newTheme);
    
    // Apply changes to documentElement
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", "light");
    }
    
    // Dispatch custom event to notify parent StudentPortalLayout
    window.dispatchEvent(new CustomEvent("eduflow-theme-changed", { detail: newTheme }));
  };

  // Sync isDark when parent layout updates theme
  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsDark(e.detail === "dark");
    };
    window.addEventListener("eduflow-theme-changed", handleThemeChange);
    return () => window.removeEventListener("eduflow-theme-changed", handleThemeChange);
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ text: "", type: "" });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({ text: "⚠️ Please fill in all password fields.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ text: "❌ New passwords do not match.", type: "error" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({ text: "❌ Password must be at least 6 characters long.", type: "error" });
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE}/api/students/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setPasswordFeedback({ text: "🎉 Password updated successfully! Next login requires new credentials.", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const errorText = await response.text();
        setPasswordFeedback({ text: `❌ ${errorText || "Failed to update password."}`, type: "error" });
      }
    } catch (err) {
      console.error("Password update error:", err);
      setPasswordFeedback({ text: "❌ Connection error. Please try again.", type: "error" });
    }
  };

  const handleDeactivate = () => {
    const confirm = window.confirm("⚠️ WARNING: Deactivating your student account will revoke accesses. Are you sure you want to proceed?");
    if (confirm) {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }} className="animate-fade-in pb-8">
      
      {/* Title Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          ⚙️ Settings & System Preferences
        </h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.95rem" }}>
          Configure user profile details, system display themes, alerts, and security options.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", width: "100%" }}>
        
        {/* Card 1: Profile Details */}
        <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>👤</span> Profile Information
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Student Photo */}
            {(() => {
              const regNum = profile.registerNumber;
              const photoUrl = regNum ? `/students_photos/${regNum.toLowerCase()}.jpg` : null;
              return (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={photoUrl || ""}
                      alt={profile.name}
                      id="student-settings-photo"
                      onError={(e) => {
                        e.target.style.display = "none";
                        document.getElementById("student-settings-fallback").style.display = "flex";
                      }}
                      style={{
                        width: 100, height: 100, borderRadius: "50%",
                        objectFit: "cover", objectPosition: "top",
                        border: "3px solid var(--primary)",
                        boxShadow: "0 0 24px rgba(99,102,241,0.45)",
                        display: photoUrl ? "block" : "none"
                      }}
                    />
                    <div
                      id="student-settings-fallback"
                      style={{
                        width: 100, height: 100, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                        display: photoUrl ? "none" : "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "2.5rem", fontWeight: "800", color: "#fff",
                        border: "3px solid var(--primary)",
                        boxShadow: "0 0 24px rgba(99,102,241,0.45)"
                      }}
                    >
                      {profile.name?.charAt(0) || "S"}
                    </div>
                    <div style={{
                      position: "absolute", bottom: 4, right: 4,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "var(--success)", border: "2px solid var(--bg-primary)"
                    }} title="Active" />
                  </div>
                </div>
              );
            })()}


            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Full Name</span>
              <input
                type="text"
                value={profile.name}
                readOnly
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  opacity: 0.7,
                  cursor: "not-allowed",
                  outline: "none"
                }}
              />
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Email Address</span>
              <input
                type="text"
                value={profile.email}
                readOnly
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  opacity: 0.7,
                  cursor: "not-allowed",
                  outline: "none"
                }}
              />
            </div>

            {/* Reg No / Roll No */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Registration Number</span>
              <input
                type="text"
                value={profile.registerNumber}
                readOnly
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  opacity: 0.7,
                  cursor: "not-allowed",
                  outline: "none"
                }}
              />
            </div>

            {/* Department */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Academic Department</span>
              <input
                type="text"
                value={profile.department}
                readOnly
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  opacity: 0.7,
                  cursor: "not-allowed",
                  outline: "none"
                }}
              />
            </div>

            {/* Academic Batch */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Academic Batch</span>
              <input
                type="text"
                value={profile.batch}
                readOnly
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  opacity: 0.7,
                  cursor: "not-allowed",
                  outline: "none"
                }}
              />
            </div>

          </div>
        </div>

        {/* Card 2: App Preferences & Toggles */}
        <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🎨</span> App Preferences
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Theme Toggle row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-main)" }}>System Display Color</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Toggle light or dark theme mode.</span>
              </div>
              <button 
                onClick={toggleThemeSetting}
                style={{
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  border: "1px solid var(--card-border)",
                  color: "var(--text-main)",
                  fontWeight: "600",
                  fontSize: "0.8rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {isDark ? <><i className="fa-solid fa-moon"></i> Dark Mode</> : <><i className="fa-solid fa-sun"></i> Light Mode</>}
              </button>
            </div>

            {/* Email notifications row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-main)" }}>Email Notifications</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Get daily schedule & test results in inbox.</span>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  accentColor: "var(--primary)"
                }}
              />
            </div>

            {/* SMS notifications row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-main)" }}>Urgent SMS Alerts</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Receive attendance warnings & leaves via SMS.</span>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                style={{
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  accentColor: "var(--primary)"
                }}
              />
            </div>

          </div>
        </div>

        {/* Card 3: Security & Password */}
        <form onSubmit={handleUpdatePassword} className="glass-card" style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", borderBottom: "1px solid var(--card-border)", paddingBottom: "12px", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🔒</span> Security Settings
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Current password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Current Password</span>
              <input
                type="password"
                placeholder="Enter current password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            {/* New password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>New Password</span>
              <input
                type="password"
                placeholder="Enter new password..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            {/* Confirm password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Confirm New Password</span>
              <input
                type="password"
                placeholder="Verify new password..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  padding: "0.6rem 1rem",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "8px",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none"
                }}
              />
            </div>

            {passwordFeedback.text && (
              <div style={{
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "600",
                background: passwordFeedback.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                color: passwordFeedback.type === "success" ? "#10b981" : "#f43f5e",
                border: passwordFeedback.type === "success" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)"
              }}>
                {passwordFeedback.text}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.65rem 1.2rem",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "0.85rem",
                cursor: "pointer",
                marginTop: "4px",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              Update Password
            </button>

          </div>
        </form>

      </div>

      {/* Danger Zone Account card */}
      <div className="glass-card" style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(244, 63, 94, 0.25)", background: "rgba(244, 63, 94, 0.03)" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f43f5e", margin: "0 0 8px 0" }}>
          ⚠️ System Danger Zone
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 20px 0", lineHeight: "1.5" }}>
          Actions performed here are highly destructive. Please double check before executing.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            style={{
              padding: "0.65rem 1.25rem",
              background: "transparent",
              border: "1px solid rgba(244, 63, 94, 0.4)",
              color: "#f43f5e",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.08)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Logout From All Devices
          </button>
          <button
            onClick={handleDeactivate}
            style={{
              padding: "0.65rem 1.25rem",
              background: "#f43f5e",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            Deactivate Account
          </button>
        </div>
      </div>

    </div>
  );
}

export default SettingsPage;
