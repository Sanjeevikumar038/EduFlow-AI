# EduFlow - Smart College Portal & Attendance Management System

EduFlow is an advanced college portal web application designed to manage student registration, department-specific academic tracking, faculty accounts, a secure smart attendance verification system using real-time GPS proximity and dynamic QR codes, a Groq AI-powered ATS Resume Analyzer, and a full-screen daily Coding Assessment Workspace.

---

## 🛠 Tech Stack

* **Frontend**: React.js (Vite), Axios, Vanilla CSS (Premium Glassmorphic layouts, responsive 50/50 card splits, dynamic animations)
* **Backend**: Spring Boot 3.x, Spring Security, Hibernate JPA
* **Database**: PostgreSQL
* **AI Model Integration**: Groq AI API (using Llama models) for ATS resume parsing and mentorship analysis
* **Authentication**: Stateless JWT (JSON Web Tokens) with BCrypt password hashing
* **Network & Security**: Served over HTTPS (using self-signed certificates via Vite SSL) to support secure-context Web APIs (Geolocation and Camera/MediaDevices) on mobile devices.

---

## 🏛 Supported Departments & Academic Codes

EduFlow tracks students and faculty across 11 specific departments. Each department is associated with a distinct two-character short code used for generating register numbers:

| Department Name | Short Code | Register Number Format (Start) |
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

## 👥 Role Permissions & Architecture

The portal divides users into three distinct roles with strict permission boundaries:

### 1. STUDENT
* **Self-Registration**: Can register by providing Name, Email, Password, and choosing their Department from a dropdown list.
* **Auto-Generated Register Numbers**: Register numbers are automatically generated per department, running sequentially from `001` (e.g., `727723EUCI001`, `727723EUCI002`).
* **Smart Attendance**: Can check in to an active class session by authorizing GPS Geolocation access and scanning the teacher's dynamic class session QR code via mobile/webcam scanner.
* **ATS Resume Analyzer**: Can upload PDF resumes to receive an instant ATS score and detailed career feedback.
* **Daily Coding Challenge**: Participate in daily sequential programming assessments in a focused coding sandbox.

### 2. FACULTY
* **Creation**: Accounts are created exclusively by the Administrator (no self-registration allowed).
* **Attendance Session Host**: Can start and stop class sessions, rendering a dynamic QR code containing the session ID and server coordinates.
* **Live Feed**: Has a live check-in feed updating in real-time, showing only checked-in students from their own department.
* **Student Directory**: Accesses a view-only list of students, filtered strictly to their own department.
* **Class Reports**: Compiles and views attendance roll-call reports showing present and absent status, filtered strictly to their own department.

### 3. ADMIN
* **Startup Account**: Pre-seeded in the database on application startup (`admin` / `admin@123`).
* **Full CRUD Management**: Create and delete student and faculty profiles; search, sort, and filter the global directory.

---

## 🚀 Key Features Implemented

### 1. Modern SaaS ERP Split-Screen Login
* **Unified Portal (`/`)**: A single unified card layout for Student and Faculty logins. System automatically detects user role upon successful authentication and routes them to their dashboard.
* **Admin Portal (`/admin`)**: Restricted separate login area for Administrators only.
* **Premium Design**: Clean card container (95% width, 1550px max-width, 750px height) with full-bleed royal blue illustration panels, same-line checkbox & forgot password row, and compact layouts.

### 2. Smart Proximity Geolocation & Department Verification
* **GPS Proximity**: Captures student latitude/longitude during scanning and validates it against the faculty's starting coordinates. Student must be within a safe radius (~100m) to check in.
* **Department-Matching Validation**: Prevents students from checking in to sessions hosted by faculty members of a different department.

### 3. Groq AI-Powered ATS Resume Hub
* **AI Analysis**: Extracts PDF resume text and requests an ATS scorecard JSON payload from Groq AI.
* **Metrics Breakdown**: Scores are normalized to percentages representing Formatting & Layout, Grammar & Tone, Projects & Experience, Skills Match Rate, Achievements & Impact, and Keywords Coverage.
* **Actionable Feedback**: Lists categorized Strengths, Weaknesses, and direct suggestions for improvement.

### 4. Rotating Daily Coding Assessment Workspace
* **Sequential Rotation**: Dynamically schedules a rotating coding challenge from a 7-question bank (Factorial, Two Sum, Palindrome Number, Reverse a String, Fizz Buzz, Valid Parentheses, Merge Sorted Arrays).
* **Focused Environment**: Starts a full-screen coding workspace with a multi-language compiler sandbox (Java, Python, C++, C support) and real-time test case validation.

### 5. Multi-Theme Capability
* **Light Theme Default**: Application defaults to a light theme for optimal readability across all student, faculty, and administrator dashboard layouts.
* **Toggled Dark Theme**: Users can easily toggle a premium dark theme layout from their Settings page.

---

## 🔒 Secured API Routing (Spring Security)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Student self-registration with auto-register number | Permitted to all |
| `POST` | `/api/auth/login` | Login and return JWT token + role/department | Permitted to all |
| `GET` | `/api/admin/students` | Fetch students (filters by department if called by FACULTY) | `ADMIN` / `FACULTY` |
| `POST` | `/api/admin/create-student` | Admin-created student accounts | `ADMIN` |
| `DELETE` | `/api/admin/students/{id}` | Admin-only student removal | `ADMIN` |
| `GET` | `/api/admin/faculty` | Fetch list of all faculty profiles | `ADMIN` |
| `POST` | `/api/admin/create-faculty` | Admin-only faculty creation | `ADMIN` |
| `DELETE` | `/api/admin/faculty/{id}` | Admin-only faculty removal | `ADMIN` |
| `POST` | `/api/attendance/session/start` | Host a class session | `FACULTY` |
| `POST` | `/api/attendance/mark` | Mark student attendance (GPS & Dept matches) | `STUDENT` |
| `GET` | `/api/attendance/session/{id}/records` | Live check-in list (department-filtered) | `FACULTY` |
| `GET` | `/api/attendance/session/{id}/report` | Attendance report sheets (department-filtered) | `FACULTY` / `ADMIN` |
| `POST` | `/api/resume/upload` | Upload PDF and parse ATS resume metrics via Groq AI | `STUDENT` |
| `GET` | `/api/coding/challenge` | Fetch sequential daily rotating coding challenge | `STUDENT` |
| `POST` | `/api/coding/run` | Compile code and run test cases inside sandbox | `STUDENT` |

---

## ⚙️ Setup & Installation

### 1. Database Setup
Configure your database connection inside `eduflow-backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/EduFlow
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### 2. Groq AI Integration
Add your Groq API key to activate the ATS resume analyzer:
```properties
groq.api.key=YOUR_GROQ_API_KEY
```

### 3. Backend Server
Build and run the Spring Boot application:
```bash
cd eduflow-backend
mvn clean compile
mvn spring-boot:run
```

### 4. Frontend Web Server
Install dependencies and run the HTTPS development server:
```bash
cd eduflow-frontend
npm install
npm run dev
```

The Vite dev server will print local network URLs, e.g.:
```
  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.1.100:5173/
```
Open the network URL on your mobile phone connected to the same Wi-Fi. (Note: Accept the browser self-signed certificate warning to proceed).
