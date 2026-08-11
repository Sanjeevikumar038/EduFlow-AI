import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import StudentPortalLayout from "./StudentPortalLayout";
import FacultySidebar from "../faculty/FacultySidebar";
import FacultyTopbar from "../faculty/FacultyTopbar";

const ClassroomPortalLayout = () => {
  const userRole = localStorage.getItem("role") || "STUDENT";
  const name = localStorage.getItem("name") || "Faculty";
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("classroom");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("eduflow-theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.setAttribute("data-theme", "light");
    }
    localStorage.setItem("eduflow-theme", isDark ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("eduflow-theme-changed", { detail: isDark ? "dark" : "light" }));
  }, [isDark]);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setIsDark(e.detail === "dark");
    };
    window.addEventListener("eduflow-theme-changed", handleThemeChange);
    return () => window.removeEventListener("eduflow-theme-changed", handleThemeChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // If Student, use StudentPortalLayout
  if (userRole === "STUDENT") {
    return <StudentPortalLayout />;
  }

  // If Faculty / Admin, render Faculty Sidebar & Topbar around Outlet
  return (
    <div className="portal-layout" style={{
      display: "flex", width: "100vw", minHeight: "100vh",
      backgroundColor: "var(--bg-primary)", color: "var(--text-main)", overflow: "hidden",
    }}>
      {/* Faculty Sidebar */}
      <FacultySidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "classroom") navigate("/faculty");
        }}
        handleLogout={handleLogout}
        name={name}
        subtitle="Faculty Portal"
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        paddingLeft: "260px",
      }} className="w-full pl-0 lg:pl-[260px]">

        {/* Topbar */}
        <FacultyTopbar
          title="Mini Classroom"
          subtitle="ERP Integrated Course Management"
          name={name}
          handleLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          isDark={isDark}
          setIsDark={setIsDark}
        />

        {/* Scrollable Page Outlet */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "2rem" }} className="custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ClassroomPortalLayout;
