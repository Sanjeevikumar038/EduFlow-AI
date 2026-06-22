# EduFlow - College Portal Management System

EduFlow is a college portal web application designed to manage student registration, faculty accounts, and administrative control panels using a modern stack.

---

## 🛠 Tech Stack

* **Frontend**: React.js (Vite), Axios, Vanilla CSS (Glassmorphic dark-theme)
* **Backend**: Spring Boot 3.x, Spring Security, Hibernate JPA
* **Database**: PostgreSQL
* **Authentication**: Stateless JWT (JSON Web Tokens) with BCrypt password hashing

---

## 👥 Role Permissions & Architecture

The portal divides users into three distinct roles:

1. **STUDENT**
   * Can self-register (Sign Up) and Sign In.
   * Student signup is minimal: requires only Name, Email, and Password.
2. **FACULTY**
   * Cannot self-register (Sign Up option is hidden to prevent fake accounts).
   * Profiles are created exclusively by the Administrator.
   * Sign In using credentials assigned by the Admin.
3. **ADMIN**
   * Cannot self-register.
   * Pre-seeded in the database on application startup (`admin` / `admin@123`).
   * Has access to the **Admin Control Panel** to manage students and faculty.

---

## 🚀 Key Features Implemented

### 1. Minimal Student Self-Registration
* Registration form simplified to capture only **Name**, **Email**, and **Password**.
* Supports logging in using either a plain-text **Username** (name) or a standard **Email**.

### 2. Admin Control Panel (CRUD Management)
* **Tab-Based View**: An interactive switcher to toggle between **Faculty Management** and **Student Management** directories.
* **Side-by-Side Panel**: Interactive profile creation forms displayed directly alongside real-time search inputs and directory tables.
* **Inline Deletion Confirmation**: Stateful confirm buttons (`Delete` ➔ `Confirm Delete?`) that execute API calls only on double click, avoiding native browser alert blocks.
* **Notification Banner**: Glassmorphic top banner that slides down to show success/error feedback dynamically.

### 3. Secured API Endpoints
All administrator endpoints are mounted under `/api/admin/**`, protected by Spring Security, and require `ROLE_ADMIN` authentication headers:

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/students` | Fetch list of all student profiles | `ADMIN` |
| `POST` | `/api/admin/create-student` | Create a new student account | `ADMIN` |
| `DELETE` | `/api/admin/students/{id}` | Delete a student account | `ADMIN` |
| `GET` | `/api/admin/faculty` | Fetch list of all faculty profiles | `ADMIN` |
| `POST` | `/api/admin/create-faculty` | Create a new faculty account | `ADMIN` |
| `DELETE` | `/api/admin/faculty/{id}` | Delete a faculty account | `ADMIN` |

---

## ⚙️ Setup & Installation

### Backend (Spring Boot)
1. Configure database connection inside [application.properties](file:///c:/Users/sanje/Downloads/PROJECTS/EduFlow/eduflow-backend/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:postgresql://127.0.0.1:5432/EduFlow
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_PASSWORD
   ```
2. Build and run:
   ```bash
   mvn clean compile
   mvn spring-boot:run
   ```

### Frontend (React/Vite)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
