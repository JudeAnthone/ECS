# ECS System Setup Guide

This project consists of a backend (Go) and a frontend (Next.js + React + TypeScript).

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Go** (for backend services)
- **PostgreSQL** (for database)


## Project Structure


```
ECS/
├── README.md                  # Project documentation and setup guide
├── services/
│   ├── backend/               # Backend (Go) related files
│   │   ├── manual-db-commands.md  # Manual database command references
│   │   ├── db-script/             # SQL scripts for schema and seeding
│   │   │   ├── database.sql       # Main database schema
│   │   │   └── seed_admin.sql     # Admin user seed script
│   │   └── go-services/           # Go backend source code
│   │       ├── .env.example       # Example environment variables for backend and adatbase
│   │       ├── go.mod             # Go module definition
│   │       ├── bin/               # Compiled binaries (if any)
│   │       ├── cmd/               # Entrypoint for Go app
│   │       │   └── main.go        # Main Go application
│   │       ├── internal/          # Internal Go packages
│   │       │   ├── config/        # Configuration logic
│   │       │   ├── delivery/      # HTTP and other delivery layers
│   │       │   ├── domain/        # Domain models
│   │       │   ├── pkg/           # Utility packages
│   │       │   ├── repository/    # Data access logic
│   │       │   └── usecase/       # Business logic
│   └── frontend/
│       ├── ecs/
│       │   ├── components.json    # Component registry/config
│       │   ├── next.config.ts     # Next.js configuration
│       │   ├── package.json       # Frontend dependencies
│       │   ├── public/            # Static assets
│       │   ├── shared/            # Shared frontend code/components
│       │   ├── src/
│       │   │   └── app/           # Next.js app directory (pages, routes)
│       │   └── ...                # Other frontend files
│       └── ...                    # Other frontend projects (if any)
└── ...                            # Other project files/folders
```

- `services/backend/go-services` — Go backend services (use "go run .cmd/main.go" here)
- `services/frontend/ecs` — Next.js frontend React + TypeScript (use "npm run dev" here)

---

## Backend Setup (Port 8081)

1. **Navigate to the backend directory:**
   ```sh
   cd services/backend/go-services
   ```
2. **Install Go dependencies:**
   ```sh
   go mod tidy
   ```
3. **Set up environment variables:**
   - Copy or create a `.env` file as needed (see `go-services/internal/.env.example` for reference).

4. **Import the database schema and seed data:**
   - Make sure PostgreSQL is running and you have created a database (e.g., `ecs_db`).
   - Import the schema:
     ```sh
     psql -U <your_db_user> -d <your_db_name> -f services/backend/db-script/database.sql
     ```
   - Seed admin user:
     ```sh
     psql -U <your_db_user> -d <your_db_name> -f services/backend/db-script/seed_admin.sql
     ```

5. **Run the backend server:**
   ```sh
   go run cmd/main.go
   ```
   - The backend will start on **port 8081** by default.

---

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```sh
   cd services/frontend/ecs
   ```
2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Copy `.env.local.example` to `.env.local` and update as needed.
4. **Run the frontend development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
   - The frontend will typically run on **port 3000**.

---