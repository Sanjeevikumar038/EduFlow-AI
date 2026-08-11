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
import ClassroomDashboard from "./pages/ClassroomDashboard";
import ClassroomDetail from "./pages/ClassroomDetail";
import ClassroomPortalLayout from "./components/layout/ClassroomPortalLayout";

// Public route handler: allows access to login pages at all times, no auto-redirects to avoid confusion
function PublicRoute({ children }) {
  return children;
}

// Route guard — redirects to login if no token found, or to correct dashboard if role mismatch
function PrivateRoute({ children, allowedRole, redirectTo = "/" }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  console.log(`[PrivateRoute] Checking route... allowedRole=${allowedRole}, currentRole=${role}, hasToken=${!!token}, path=${window.location.pathname}`);
  
  if (!token) {
    console.log(`[PrivateRoute] No token, redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }
  
  if (allowedRole && role !== allowedRole) {
    console.log(`[PrivateRoute] Role mismatch! allowedRole=${allowedRole}, currentRole=${role}. Redirecting to correct dashboard.`);
    // Redirect unauthorized session instead of clearing it
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
    if (role === "FACULTY") return <Navigate to="/faculty" replace />;
    
    // Fallback for corrupted sessions
    console.log(`[PrivateRoute] Corrupted role ${role}. Clearing localStorage and redirecting to /.`);
    localStorage.clear();
    return <Navigate to="/" replace />;
  }
  
  console.log(`[PrivateRoute] Access granted. Rendering children.`);
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicRoute><PortalLogin /></PublicRoute>} />
        <Route path="/admin" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRole="ADMIN" redirectTo="/admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/portal" element={<Navigate to="/" replace />} />
        <Route path="/admin-login" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<Navigate to="/admin" replace />} />
        
        {/* Classroom Routes wrapped in ClassroomPortalLayout */}
        <Route path="/classroom" element={<PrivateRoute><ClassroomPortalLayout /></PrivateRoute>}>
          <Route index element={<ClassroomDashboard />} />
          <Route path=":id" element={<ClassroomDetail />} />
        </Route>

        <Route path="/student/coding-workspace" element={<PrivateRoute allowedRole="STUDENT"><CodingWorkspacePage /></PrivateRoute>} />
        <Route path="/student" element={<PrivateRoute allowedRole="STUDENT"><StudentPortalLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardHome />} />
          <Route path="classroom" element={<ClassroomDashboard />} />
          <Route path="classroom/:id" element={<ClassroomDetail />} />
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
