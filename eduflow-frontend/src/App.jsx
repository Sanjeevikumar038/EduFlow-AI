import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PortalLogin from "./pages/PortalLogin";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentPortalLayout from "./components/layout/StudentPortalLayout";
import StudentDashboardHome from "./pages/student/StudentDashboardHome";
import AttendancePage from "./pages/student/AttendancePage";
import TimetablePage from "./pages/student/TimetablePage";
import LeavePage from "./pages/student/LeavePage";
import SettingsPage from "./pages/student/SettingsPage";
import ResumeManagement from "./components/career/ResumeManagement";
import CodingDashboard from "./components/career/CodingDashboard";
import InterviewDashboard from "./components/career/InterviewDashboard";
import CareerDashboard from "./components/career/CareerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/portal" element={<PortalLogin />} />
        <Route path="/student" element={<StudentPortalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardHome />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="coding" element={<CodingDashboard />} />
          <Route path="resume" element={<ResumeManagement />} />
          <Route path="interview" element={<InterviewDashboard />} />
          <Route path="career" element={<CareerDashboard />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
