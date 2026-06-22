import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "Student";
  const registerNumber = localStorage.getItem("registerNumber") || "";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Student Portal</h1>
          <p>Welcome back, {name}! {registerNumber && `(Reg No: ${registerNumber})`}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>📅 Smart Attendance</h3>
          <p>Mark your daily class attendance instantly using QR code scanning and secure GPS location verification.</p>
        </div>

        <div className="dashboard-card">
          <h3>💬 AI Mock Interview</h3>
          <p>Practice mock interviews with automated speech-to-text response evaluations and targeted review feedback.</p>
        </div>

        <div className="dashboard-card">
          <h3>💻 Coding Assessment</h3>
          <p>Solve algorithm challenges and receive AI generated reviews regarding correctness, complexity, and styling.</p>
        </div>

        <div className="dashboard-card">
          <h3>📈 Career Readiness</h3>
          <p>Track your score based on academic attendance, resume metrics, coding challenges, and mock interview performance.</p>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
