# My Store – Full Stack Application (Dockerized)

This repository contains the **My Store** full-stack application, including:

- **Frontend**: Next.js + typescript
- **Backend**: Node.js + Express + typescript
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


```

## Running the Project

Start everything (frontend + backend + database)

```
 docker compose up --build
```

This will start:
Frontend → http://localhost:3000
Backend API → http://localhost:5000
PostgreSQL → internal Docker network (persistent volume)

---

## Common Commands

Stop containers

```
docker compose down
```

Stop and remove volumes (reset DB)

```
docker compose down -v
```

View logs

```
docker compose logs -f
```

Rebuild containers

```
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

---

## Store

### Store lifecycle

- **Create**: A user with the **CREATOR** role can create one store via `POST /v1/api/stores` (auth required). The store is created with the authenticated user’s ID.
- **Read**: The owner can get their store with `GET /v1/api/stores/me`. The public can view a store by username with `GET /v1/api/stores/:username` when the store is public and not deleted.
- **Update**: The owner can partially update their store with `PATCH /v1/api/stores/me`. Only allowed fields are updated; **username cannot be changed**.
- **Soft delete**: The owner can soft-delete their store with `DELETE /v1/api/stores/me`. This sets `deletedAt`; the row and username remain in the database.
- **Restore**: Only an **admin** can restore a soft-deleted store via `PATCH /v1/api/admin/stores/:id/restore`. Restore only clears `deletedAt`; it does not change `isPublic` or `isVacationMode`.

### Visibility rules

- **Public store** (`isPublic: true`, `deletedAt: null`): Visible to anyone at `GET /v1/api/stores/:username`. Response includes only public fields (e.g. username, name, description, avatar, banner, announcement, vacation mode).
- **Private store** (`isPublic: false`): Returns **404** from the public-by-username endpoint (store not found).
- **Soft-deleted store** (`deletedAt` set): Returns **404** from the public-by-username endpoint. The store is hidden from public discovery; the username remains reserved.

### Username permanence

- **On update**: The store’s **username is immutable**. Sending `username` in `PATCH /v1/api/stores/me` returns **400** with a message that the username cannot be changed.
- **After soft delete**: The username stays in the database and remains **reserved** (no other store can take it). The store is not listed or viewable publicly.

### Vacation mode behavior

- **Field**: `isVacationMode` is a store setting (boolean).
- **Update**: The owner can change it via `PATCH /v1/api/stores/me` with `isVacationMode: true | false`.
- **Restore**: When an admin restores a soft-deleted store, **vacation mode is not reset**; only `deletedAt` is cleared. The existing `isVacationMode` (and `isPublic`) values are kept.

### Admin restore capability

- **Who**: Only users with the **ADMIN** role can call admin store endpoints (auth + role required).
- **List stores**: `GET /v1/api/admin/stores` returns **all** stores (public, private, and soft-deleted).
- **Get store by ID**: `GET /v1/api/admin/stores/:id` returns one store by ID (any visibility or delete state).
- **Restore**: `PATCH /v1/api/admin/stores/:id/restore`:
  - Allowed only when the store has `deletedAt` set; otherwise returns **400**.
  - Sets `deletedAt` to `null` and updates `updatedAt`.
  - Does **not** modify `isPublic` or `isVacationMode`.

```
