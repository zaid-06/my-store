# My Store – Full Stack Application (Dockerized)

This repository contains the **My Store** full-stack application, including:

- **Frontend**: Next.js
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM / Migrations**: Drizzle ORM
- **Auth**: BetterAuth

The entire project is fully **Dockerized** and can be run with **a single command** on any machine that has **Docker installed**.

---

## Requirements

- Docker
- Docker Compose (v2)

> No local Node.js, pnpm, PostgreSQL, or environment setup is required.

---

## Project Structure

my-store/
├── backend/ # Express + API + Auth + Drizzle
├── frontend/ # Next.js app
├── docker-compose.yml # Orchestrates all services
├── .env # Environment variables (root)
└── README.md

---

## Environment Variables

All environment variables are managed via a **single `.env` file in the root**.

### `.env.example`

```env
# App
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/my_store

# Auth
BETTERAUTH_SECRET=super-secret-key
BETTERAUTH_URL=http://localhost:5000



# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

Create a .env file from .env.example before running Docker.


## Running the Project
Start everything (frontend + backend + database)
docker compose up --build


This will start:
Frontend → http://localhost:3000
Backend API → http://localhost:5000
PostgreSQL → internal Docker network (persistent volume)


## Database & Migrations (Drizzle)
Apply database schema
docker compose exec backend pnpm drizzle-kit push

Generate migrations (if needed)
docker compose exec backend pnpm drizzle-kit generate



## Common Commands

Stop containers
docker compose down

Stop and remove volumes (reset DB)
docker compose down -v

View logs
docker compose logs -f

Rebuild containers
docker compose up --build
```

## Authentication

Authentication is handled using BetterAuth
Email + Password login
No OAuth
No magic links
Auth tables are managed automatically (no custom user tables)

## Notes

PostgreSQL data is persisted using Docker volumes
The project works on a fresh machine with only Docker installed
No manual database setup required
Designed for reproducible development environments
