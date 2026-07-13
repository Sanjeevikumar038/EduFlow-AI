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
import CodingWorkspacePage from "./pages/student/CodingWorkspacePage";

// Route guard — redirects to login if no token found in localStorage
function PrivateRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) {
    // Clear unauthorized session
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
  return children;
}

// Admin route handler: renders dashboard if authenticated, else shows login form
function AdminRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (token) {
    if (role === "ADMIN") {
      return <AdminDashboard />;
    } else {
      // Clear unauthorized student/faculty session trying to access admin route
      localStorage.clear();
      return <Navigate to="/" replace />;
    }
  }
  return <Login />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortalLogin />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/register" element={<Register />} />
        <Route path="/portal" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        <Route path="/student/coding-workspace" element={<PrivateRoute allowedRole="STUDENT"><CodingWorkspacePage /></PrivateRoute>} />
        <Route path="/student" element={<PrivateRoute allowedRole="STUDENT"><StudentPortalLayout /></PrivateRoute>}>
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
        <Route path="/faculty" element={<PrivateRoute allowedRole="FACULTY"><FacultyDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
