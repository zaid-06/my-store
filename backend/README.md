Backend – My Store (Task 1)

This repository contains the backend foundation for the My Store project.
Task 1 focuses on setting up a production-ready backend base, including:

    Project structure
    Environment configuration
    Database setup
    Authentication foundation
    API standards
    Testing baseline

No business features are implemented at this stage.

<!-- Environment Variables -->

Environment variables are loaded using dotenv and validated using Zod.
The server will fail fast if any required variable is missing or invalid.

<!-- Required Variables -->

    DATABASE_URL
    BETTERAUTH_SECRET
    PORT
    NODE_ENV

<!-- .env.example -->

    DATABASE_URL=postgresql://user:password@localhost:5432/db
    BETTERAUTH_SECRET=dev-secret-key
    PORT=5000
    NODE_ENV=development

<!-- Installation -->

Install dependencies using pnpm:

    pnpm install

<!-- Running the Server (Development) -->

    pnpm dev

If successful, the server will start on the configured port.

<!-- Testing -->

Run tests using:

pnpm test

<!-- Current tests verify: -->

    Environment variable loading
    Environment validation

<!-- API Base Path -->

    All APIs are prefixed with:

    /v1/api

        Available Endpoints
    Auth Health Check
    GET /v1/api/auth/health

    Used to verify that the authentication module is correctly mounted and running.

    User Sign Up (Email & Password)
    POST /v1/api/auth/sign-up/email

    Creates a new user using email and password authentication powered by BetterAuth and stored in PostgreSQL.
    Request Body:

    {
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!"
    }

    Behavior:

    Validates input using BetterAuth
    Hashes password securely
    Stores user data in PostgreSQL
    Creates auth-related records automatically

<!-- Get Current User -->

    GET /v1/api/users/me


    Returns the authenticated user context.

    Example response:

    {
    "success": true,
    "data": {
        "id": "string",
        "email": "string",
        "role": "ADMIN | CREATOR | BUYER"
    },
    "error": null
    }

<!-- Database & Drizzle -->

PostgreSQL is used as the database

Drizzle ORM is used for:
Database connection
Schema management
Migrations
node-postgres (pg) is used as the database driver

Conventions
camelCase → TypeScript
snake_case → Database tables & columns

Migrations
Migrations are handled using drizzle-kit.

Run schema sync:
pnpm drizzle-kit push
Authentication-related tables are not manually created.

<!-- Authentication (BetterAuth) -->

Authentication is implemented using BetterAuth with email + password and a PostgreSQL-backed setup.

Current Auth Features
Email + password signup
PostgreSQL persistence
BetterAuth-managed schema  
 REST-based authentication

Important Rules Followed
❌ No custom users table created manually
❌ No duplicate auth data
✅ All auth data is managed by BetterAuth

Signup Endpoint
POST /v1/api/auth/sign-up/email

Request body:
{
"name": "Test User",
"email": "test@example.com",
"password": "Password123!"
}

On success:
User is created in PostgreSQL
Auth tables are populated automatically

<!-- Auth Tables Created -->

The following tables are created by BetterAuth and visible in pgAdmin:
user
account
session
(other internal auth tables)

<!-- Roles & Authorization -->

User roles are defined as:
ADMIN
CREATOR
BUYER
Role-based access control is handled using middleware.

<!-- Error Handling -->

    Centralized error handling is implemented

    Custom ApiError class is used

    All APIs return a standard response format:

    {
    "success": boolean,
    "data": any | null,
    "error": object | null
    }

<!-- Status -->

✅ Server starts successfully

✅ Environment validation works

✅ PostgreSQL connected

✅ Drizzle ORM configured

✅ Migrations working

✅ BetterAuth integrated

✅ Email/password signup working

✅ API routes functional

✅ Tests pass
