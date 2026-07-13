# EduFlow
### AI-Powered Smart Academic ERP for Modern Universities

![React](https://img.shields.io/badge/React-19-blue)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Groq AI](https://img.shields.io/badge/Groq-AI-purple)
![License](https://img.shields.io/badge/License-MIT-success)

EduFlow is an advanced, AI-powered smart academic ERP and college portal system. It bridges the gap between daily campus administration and practical learning by integrating role-based user management, geolocated QR attendance checks, an automated AI resume scanner, and a sandbox-based coding workspace where students solve daily challenges to secure class attendance.

---

## 📊 Project Statistics

| Metric | Value |
| :--- | :--- |
| User Roles | 3 (Student, Faculty, Admin) |
| Departments | 11 |
| Coding Questions | 100+ Curated Problems |
| REST APIs | 15+ Secured Endpoints |
| Authentication | JWT + BCrypt |
| Attendance | QR + GPS + Department Validated |
| AI Modules | Resume Analyzer, Code Review |

---

## 🏛 Architecture

```
                  React + Vite
                       │
          Axios + JWT Authentication
                       │
               Spring Boot REST API
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   PostgreSQL       Groq AI      Code Executor
        │              │              │
   Attendance     Resume AI     Java/C/Python/C++
   Coding         Code Review
   Users
   Resume
```

---

## 🤖 AI Integration

Groq AI powers:

* **ATS Resume Analysis** — Extracts PDF text and generates detailed ATS scorecards with category breakdowns and actionable career suggestions.
* **AI Code Review & Suggestions** — Reviews submitted code for optimizations, best practices, and performance improvements.

---

## 🔐 Authentication Flow

```
        User Login
             ↓
  Spring Boot Authentication
             ↓
     JWT Token Generated
             ↓
   Stored in Browser (localStorage)
             ↓
      Protected API Calls
             ↓
   Role Based Authorization
```

---

## 🛠 Tech Stack

* **Frontend**: React.js 19 (Vite), Axios, Vanilla CSS (Premium Glassmorphic layouts, responsive card splits, fluid animations)
* **Backend**: Spring Boot 3.x, Spring Security, Hibernate JPA
* **Database**: PostgreSQL
* **AI Integration**: Groq AI API (Llama models) for resume parsing and code review
* **Authentication**: Stateless JWT (JSON Web Tokens) with BCrypt hashing
* **Code Execution Sandbox**:
  * Java
  * Python
  * C
  * C++
* **Network**: Served over HTTPS (Vite SSL) to allow mobile Geolocation and Camera Web APIs

---

## 🏛 Supported Departments & Academic Codes

EduFlow registers and manages academic records across 11 departments using sequential register numbers starting from `001`:

| Department Name | Short Code | Register Number Format |
| :--- | :---: | :--- |
| **Civil Engineering** | `CE` | `727723EUCE001` |
| **Computer Science & Engineering** | `CS` | `727723EUCS001` |
| **CSE (AI & ML / Cyber Security)** | `CC` | `727723EUCC001` |
| **Electrical & Electronics Engineering** | `EE` | `727723EUEE001` |
| **Electronics & Communication Engineering** | `EC` | `727723EUEC001` |
| **Mechanical Engineering** | `ME` | `727723EUME001` |
| **Mechatronics Engineering** | `MT` | `727723EUMT001` |
| **Information Technology** | `IT` | `727723EUIT001` |
| **Artificial Intelligence & Data Science** | `AD` | `727723EUAD001` |
| **CS & Business Systems** | `CB` | `727723EUCB001` |
| **M.Tech Computer Science (5 Years)** | `CI` | `727723EUCI001` |

---

## 👥 Role Permissions & Access Boundaries

* **STUDENT**: Self-registration with auto-register generation. Accesses geolocated QR attendance, ATS resume analyzer, and daily coding workspace.
* **FACULTY**: Created exclusively by Administrators. Hosts attendance sessions, reviews real-time department roll-calls, manages student records, and overrides coding attendance.
* **ADMIN**: Pre-seeded account (`admin` / `admin@123`). Full CRUD controls over students and faculty across all departments.

---

## ✨ Key Features

| Module | Status |
| :--- | :---: |
| Authentication (JWT) | ✅ |
| Smart Attendance (QR + GPS) | ✅ |
| Department Validation | ✅ |
| Student Dashboard | ✅ |
| Faculty Dashboard | ✅ |
| Admin Dashboard | ✅ |
| AI Resume Analyzer | ✅ |
| Coding Workspace | ✅ |
| AI Code Review | ✅ |
| Daily Coding Challenge | ✅ |
| Coding History & Progress | ✅ |
| Performance Dashboard | ✅ |
| Automatic Coding Attendance | ✅ |
| Faculty Attendance Override | ✅ |

---

## 🚀 Feature Breakdown

### 1. Modern Login Experience
* **Unified Portal (`/`)**: Single login card for both Students and Faculty. System auto-detects roles and redirects to respective dashboards.
* **Hidden Admin Portal (`/admin`)**: Dedicated login route reserved exclusively for Administrators.
* **Premium Design**: ERP-inspired split-screen interface with full-bleed illustration panel and responsive layout.

### 2. Smart Attendance Verification
Attendance is verified using multiple layers:
* **Dynamic QR Codes** — Sessions rendered as QR images with transient session IDs.
* **GPS Location Verification** — Compares student coordinates against faculty starting location within a ~100m radius.
* **Department Validation** — Rejects scans from mismatched departments.
* **Active Session Validation** — Ensures the session is currently live before accepting check-ins.
* **Coding Assessment Verification** — Automatic attendance during Free Activity Period based on coding performance.

### 3. AI Coding Practice Workspace
Students write, compile, and execute code in a focused full-screen sandbox:
* **100+ Curated Coding Problems** across multiple difficulty levels and topics.
* **Automatic Daily Rotation** — A new challenge is assigned each day.
* **Faculty Override Support** — Faculty can manually assign specific problems.
* **Unlimited Run Code** — Test against sample inputs as many times as needed.
* **Hidden Test Cases** — Submit solution to validate against hidden inputs.
* **75% Passing Rule** — Attendance awarded when ≥75% of hidden test cases pass.
* **AI Code Review** — Get AI-powered review and optimization suggestions.
* **Coding History** — Track all past submissions and attempts.
* **Progress Dashboard** — View scores, streaks, and performance metrics.

### 4. Smart Free Activity Period
EduFlow introduces an innovative Free Activity Period dedicated entirely to coding practice.
* Students receive one coding challenge every day.
* Attendance is automatically awarded when the student successfully solves at least **75% of the hidden test cases**.
* This transforms attendance into a measure of practical learning rather than passive classroom presence.

### 5. Coding Performance Hub
Students can view:
* **Coding History** — All past submissions with timestamps.
* **Attempts** — Number of tries per problem.
* **Scores** — Best score achieved per problem.
* **Pass Percentage** — Overall success rate.
* **AI Feedback** — Saved AI code reviews and suggestions.
* **Success Rate** — Problems solved vs attempted ratio.
* **Streak** — Consecutive days of successful submissions.

### 6. AI-Powered ATS Resume Hub
* **ATS Scorecard** — Generates an overall score out of 100 from uploaded PDF resumes.
* **Multi-Category Breakdown** — Formatting & Layout, Grammar & Tone, Projects & Experience, Skills Match Rate, Achievements & Impact, Keywords Coverage.
* **Mentorship Reports** — Personalized Strengths, Weaknesses, and actionable improvement suggestions.

---

## 🔒 Secured API Routing (Spring Security)

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Student self-registration | Public |
| `POST` | `/api/auth/login` | Login and return JWT token | Public |
| `GET` | `/api/admin/students` | Fetch students (dept-filtered for faculty) | `ADMIN` / `FACULTY` |
| `POST` | `/api/admin/create-student` | Admin-created student accounts | `ADMIN` |
| `DELETE` | `/api/admin/students/{id}` | Remove student | `ADMIN` |
| `GET` | `/api/admin/faculty` | Fetch all faculty profiles | `ADMIN` |
| `POST` | `/api/admin/create-faculty` | Create faculty account | `ADMIN` |
| `DELETE` | `/api/admin/faculty/{id}` | Remove faculty | `ADMIN` |
| `POST` | `/api/attendance/session/start` | Host a class session | `FACULTY` |
| `POST` | `/api/attendance/mark` | Mark attendance (GPS + Dept) | `STUDENT` |
| `GET` | `/api/attendance/session/{id}/records` | Live check-in list | `FACULTY` |
| `GET` | `/api/attendance/session/{id}/report` | Attendance report | `FACULTY` / `ADMIN` |
| `POST` | `/api/resume/upload` | Upload PDF for AI ATS analysis | `STUDENT` |
| `GET` | `/api/coding/challenge` | Fetch daily coding challenge | `STUDENT` |
| `GET` | `/api/coding/problems` | List all coding problems | `STUDENT` |
| `POST` | `/api/coding/run` | Compile and run test cases | `STUDENT` |
| `POST` | `/api/coding/submit` | Submit solution against hidden tests | `STUDENT` |
| `GET` | `/api/coding/history` | Fetch coding submission history | `STUDENT` |
| `POST` | `/api/coding/override-attendance` | Faculty override coding attendance | `FACULTY` |

---

## ⚙️ Setup & Installation

### 1. Database Setup
Configure your database connection inside `eduflow-backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/EduFlow
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### 2. AI Integration
Add your Groq API key:
```properties
groq.api.key=YOUR_GROQ_API_KEY
```

### 3. Backend Server
```bash
cd eduflow-backend
mvn clean compile
mvn spring-boot:run
```

### 4. Frontend Web Server
```bash
cd eduflow-frontend
npm install
npm run dev
```

---

## 🖼 Screenshots

### Login Portal
![Login](screenshots/login.png)

### Student Dashboard
![Student](screenshots/student-dashboard.png)

### Faculty Dashboard
![Faculty](screenshots/faculty-dashboard.png)

### Admin Dashboard
![Admin](screenshots/admin-dashboard.png)

### QR Attendance
![QR](screenshots/attendance.png)

### Coding Workspace
![Coding](screenshots/coding.png)

### Resume Analyzer
![Resume](screenshots/resume.png)

---

## 🔮 Future Enhancements

* **Online Judge System** — Competitive compiler infrastructure
* **Contest Mode** — Host real-time hackathons and coding rounds
* **Leaderboard** — Global ranks and scoring parameters
* **Coding Badges** — Gamified achievements based on streaks and performance
* **AI Interview Simulator** — Speech-to-text interactive mock interviews
* **Placement Analytics** — Campus hiring predictions and insights
* **Email Notifications** — Real-time push updates for sessions and results
* **Mobile Application** — Native Android/iOS builds

---

## 📜 License

This project is released under the **MIT License**.

---

## 👨‍💻 Author

**Sanjeevi Kumar**  
Integrated M.Tech Computer Science & Engineering  
Sri Krishna College of Engineering & Technology

* GitHub: [github.com/Sanjeevikumar038](https://github.com/Sanjeevikumar038)
* LinkedIn: [linkedin.com/in/sanjeevikumar038](https://linkedin.com/in/sanjeevikumar038)
