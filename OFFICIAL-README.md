# *EECS-IMS: Enhanced Extension and Community Service Information Management System with Role-Based Access and Data Analytics.*
This project is developed under the academic requirements for Information Management Systems. From the pressure of deadlines and the need for a unique approach, this project addresses the challenge of managing extension and community service programs by combining centralized data management with role-based workflows and data-driven analytics.<br>

# *About the Project*
EECS-IMS is a centralized, web-based information management system developed as a capstone school project for Eulogio Amang Rodriguez Institute of Science and Technology (EARIST). The system was designed to address real-world challenges in managing extension and community service programs—particularly the problems of fragmented record-keeping, manual document processing, lack of centralized reporting, and inconsistent user access control.

The system provides a complete public-facing website for browsing approved extension projects and community service activities, alongside a role-based dashboard system for administrators, program chairs, project heads, staff, and public users to manage every stage of the extension service workflow—from initial request submission to final approval and project completion.

On the administrative side, the system uses structured approval workflows, hierarchical budget management, task delegation, and activity logging to ensure transparency and accountability. The platform uses modern technologies like Next.js, Go, PostgreSQL, and JWT authentication to ensure performance, security, and scalability.

*Key Objectives of the Project:*
- To replace manual extension service operations with a centralized, automated system.
- To implement a multi-role approval workflow that enforces accountability at every level.
- To provide institutional decision-makers with actionable insights via dashboards, analytics, and KPI tracking.
- To strengthen community engagement through a transparent and publicly accessible extension service portal.

----
# *System Architecture*
EECS-IMS is designed as a full-stack system with a Next.js frontend, a Go backend API, and a PostgreSQL database, with the help of the following technologies:
### *Tech Stack:*
### Frontend (Public-Facing Website & Dashboard)
![Next.js](https://img.shields.io/badge/next.js-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Radix UI](https://img.shields.io/badge/radix--ui-161618.svg?style=for-the-badge&logo=radixui&logoColor=white)

### Backend (API & Business Logic)
![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white)
![gorilla/mux](https://img.shields.io/badge/gorilla%2Fmux-000000.svg?style=for-the-badge&logo=go&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-00599C?style=for-the-badge&logo=gnu&logoColor=white)

### 🗄 Database
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

----

# *Development Environment & Dependencies*
### Core Dependencies:
Frontend Dependencies (/services/frontend/ecs):
```json
{
  "next": "^16.0.7",
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@tanstack/react-query": "^5.90.10",
  "@tanstack/react-form": "^1.25.0",
  "@tanstack/react-table": "^8.21.3",
  "zod": "^4.1.12",
  "lucide-react": "^0.554.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "react-easy-crop": "^5.5.7"
}
```

Backend Dependencies (/services/backend/go-services):
```go
require (
    github.com/gorilla/mux v1.8.1
    github.com/golang-jwt/jwt/v5 v5.2.1
    github.com/jackc/pgx/v5 v5.7.6
    github.com/joho/godotenv v1.5.1
    golang.org/x/crypto v0.37.0
)
```

----
# *System Features Overview*
## 1. Public-Facing Features

### Landing Pages
- Home page with hero section, statistics, announcements, projects, features, reports, and FAQ
- About Us section: History, Mission & Vision, Core Values, Organizational Team, Our Mandate
- Programs section: Volunteer & Service-Learning, Research-Based Solutions, Health & Wellness, Environmental Sustainability, Education & Training, Community Outreach
- Dark mode support across all pages

### Authentication & Security
- Email and password registration with account approval workflow
- JWT-based authentication with role-based access control
- Modal-based and standalone page login options
- Automatic session persistence via localStorage

## 2. Dashboard Features

### Role-Based Access (5 Roles)

#### Admin Dashboard
- Full system overview with aggregated statistics
- User management: approve, reject, deactivate, and manage all user accounts
- Program management: create, update, approve, and assign programs to departments
- Budget management: allocate budgets to program chairs and departments
- Analytics and reporting across the entire system
- Activity log monitoring for audit trails

#### Program Chair Dashboard
- Department-scoped program management
- Budget allocation to departments under supervision
- Project request review and approval workflow
- Staff and project head assignment to programs
- Analytics and reports scoped to owned programs
- Budget request review for department spending

#### Project Head Dashboard
- Task creation, assignment, and status tracking for team staff
- Project proposal submission and status monitoring
- Budget request creation with document attachment
- Staff assignment and team management
- Project analytics and reporting
- Pre-review of staff-originated projects before admin approval

#### Staff Dashboard
- Personal task dashboard with status tracking
- Project request submission
- Project task updates and completion marking
- Reports and analytics scoped to assigned projects

#### Public User Dashboard
- Project request submission form
- Browse approved and published projects
- Track own request status through the workflow

## 3. Backend Features

### API Endpoints
- Authentication routes (`/api/v1/auth/*`)
- User management (`/api/v1/users/*`)
- Project request workflow (`/api/v1/requests/*`)
- Program management (`/api/v1/programs/*`)
- Project management (`/api/v1/projects/*`)
- Department management (`/api/v1/departments/*`)
- Budget requests and allocations (`/api/v1/budget-requests/*`, `/api/v1/budgets/*`)
- Notifications (`/api/v1/notifications/*`)
- Activity logs (`/api/v1/activity-logs/*`)

### Database Operations
- PostgreSQL database with 12 tables and 5 reporting views
- Database triggers enforcing budget constraints, date validation, role checks, and auto-updates
- Row Level Security roles for different access levels
- UUID primary keys across all tables for security and scalability

### Security Implementation
- Password hashing (bcrypt)
- JWT token generation and validation (HS256)
- Role-based middleware injection into request context
- Database-level constraint enforcement via triggers
- Account status workflow (pending_approval → active → deactivated)

### Workflow Engine
- 13-stage project request lifecycle (submitted → under_program_chair_review → ... → approved/rejected)
- Hierarchical approval: Program Chair → Project Head → Admin
- Budget request pipeline with supporting document attachment
- Auto-notification on workflow stage changes via database triggers

### Data Processing
- Budget hierarchy enforcement (program → department → project → task)
- Program spent budget auto-sync from project spending
- KPI report tracking with JSONB metrics
- Reporting views for admin, program chair, and project head scopes

----
# *System Walkthrough & User Flow*
### I provide the GOOGLE DRIVE link below for all the images and screenshots of every part of the system. This is to ensure that all the parts, including the public site, each dashboard role, and authentication can be seen in one folder to avoid confusion.
GOOGLE DRIVE LINK:
(Insert your Google Drive link here)

----
# *Installation & Setup Guide*
### Prerequisites
- **Node.js** v18 or higher
- **Go** v1.25 or higher
- **PostgreSQL** (recommended v14+)

### Cloning the repository
```sh
git clone https://github.com/Xschema-dev/Earist-Extension-Service.git
cd Earist-Extension-Service
```

### Backend Setup:
1. Navigate to the backend directory:
   ```sh
   cd services/backend/go-services
   ```
2. Install Go dependencies:
   ```sh
   go mod tidy
   ```
3. Create a `.env` file based on the example config (database credentials, server port, JWT secret).
4. Import the database schema:
   ```sh
   psql -U <your_db_user> -d <your_db_name> -f services/backend/db-script/database.sql
   ```
5. Seed the admin user and demo data:
   ```sh
   psql -U <your_db_user> -d <your_db_name> -f services/backend/db-script/seed_admin.sql
   ```
6. Run the backend server:
   ```sh
   go run cmd/main.go
   ```
   - Backend runs on **port 8081** by default.

### Frontend Setup:
1. Navigate to the frontend directory:
   ```sh
   cd services/frontend/ecs
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the development server:
   ```sh
   npm run dev
   ```
   - Frontend runs on **port 3000** by default.

----
# *Materials & External Resources*
### Project Inspirations:
(Extension service management references)
- https://earist.edu.ph/
- https://www.ched.gov.ph/

(Overall)
- https://nextjs.org/
- https://go.dev/
- https://www.postgresql.org/
- https://tailwindcss.com/
- https://www.radix-ui.com/

----
# *Project Contributors*
(Your name here)
