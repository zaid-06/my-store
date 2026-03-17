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
---
# 📦 Product Module – Backend Documentation
## This module manages the complete product lifecycle including:

* Product creation
* Variant management
* Category management
* Media handling
* Publishing validation
* Public visibility filtering
* Soft delete behavior

## 🧭 Product Lifecycle
A product goes through the following stages:
```
Draft → Published → Soft Deleted
```

### 1️⃣ Draft
* Default status when product is created
* Not visible publicly
* Can be edited freely

### 2️⃣ Published
* Must satisfy publishing rules
* Visible in public APIs
* Must contain variants and media

### 3️⃣ Soft Deleted
* deletedAt timestamp is set
* Product is hidden from all public queries
* Data remains in database
* Cannot be published unless restored (if implemented)

## 🚀 Publishing Rules
### A product can only be published if:

* ✅ Product exists
* ✅ Product belongs to the store
* ✅ Product is not soft deleted
* ✅ At least 1 variant exists
* ✅ At least 1 media item exists

### If any rule fails:
```
publishProduct() returns null
```
### Publishing updates:
``` 
status = "published"
```
## 🧬 Variant Logic
###Each product:
* Must have at least 1 variant before publishing
* Variants belong to a single product
* Variants contain:
** name
** price
** inventory

### Rules:
* Cannot add variant to product of another store
* Price stored as string (decimal safety)
* Inventory must be numeric

## 🗂 Category Logic

#### Categories are scoped per store.

### Rules:
* Category name must be unique per store
* Different stores can reuse same category name
* Duplicate category in same store throws error

Example:
```
Store A → "Clothing" ✅
Store B → "Clothing" ✅
Store A → "Clothing" again ❌
```
## 🖼 Media Constraints
Media belongs to a product.
Publishing requires:
* At least one media item
* Media must be linked to productId

### Common fields:
* url
* type (image, video, etc.)
If no media exists → product cannot be published.

## 🌍 Public Visibility Filtering

### Public APIs return products only if:
1. status = "published"
2. deletedAt IS NULL
3. Has at least 1 variant
4. Has at least 1 media

### This ensures:
* Draft products are hidden
* Incomplete products are hidden
* Soft deleted products are hidden

### Example service logic:
```
if (variants.length === 0 || media.length === 0) {
  return null;
}
```
## 🗑 Soft Delete Behavior
Products are NOT permanently deleted.

Instead:
deletedAt = new Date()
Soft Delete Rules:
* Only product owner (store) can delete
* Already deleted product cannot be deleted again
* Deleted products are excluded from:
   * Published queries
   * Public visibility APIs 
   * Standard listing APIs

### Advantages:
* Audit safe
* Recovery possible
* Production-grade data safety

## 🏗 Architecture Design
### Separation of Concerns
Layer	           Responsibility
DB Layer      	 Pure database operations
Service Layer	   Business rules
Test Layer	     Integration validation

### This ensures:
* Clean architecture
* Testability
* Scalability
* Maintainability

## 🧪 Testing Coverage
### The module includes tests for:
* Variant creation
* Publishing validation rules
* Public visibility filtering
* Category uniqueness
* Soft delete behavior
* Store ownership validation

Tests run sequentially to avoid DB race conditions.

## 🔐 Store Ownership Enforcement
### All operations validate:
```
product.storeId === storeId
```
Prevents cross-store data manipulation.

### ✅ Module Status

✔ Product lifecycle implemented
✔ Publishing rules enforced
✔ Public filtering secured
✔ Category uniqueness validated
✔ Soft delete implemented
✔ Full test coverage


---

# Digital Product Delivery System
## Overview
Task‑5 introduces secure delivery for digital products.
This system allows customers to download digital files only after successful payment, using secure tokenized download links.

### The implementation ensures:

* Secure download access
* Token‑based validation
* Download tracking
* Creator visibility
* Protection against link abuse
 This functionality applies only to DIGITAL products.

## Digital vs Physical Products
Products now support two types:
```
productType: PHYSICAL | DIGITAL
```
### PHYSICAL Products
Delivered through shipping
No digital downloads
Cannot attach media of type file

### DIGITAL Products
* Delivered through secure download
* Must contain at least one media item with type file
* Download access is created after order becomes PAID

Validation rule:
```
If productType = DIGITAL
→ product must have at least one media item where type = "file"
```
This rule is enforced when publishing the product.


## Token Validation Logic
Every digital download uses a secure token.

Example download endpoint:
```
GET /v1/api/download/:token
```
Token validation steps:

1️⃣ Validate token exists
```
digital_downloads.token = token
```
If not found:
```
Invalid download token
```
2️⃣ Validate order status
Order must be:
```
status = PAID
```
Invalid states:
```
PENDING
CANCELLED
```
Errors:
```
Order not paid
Order cancelled
```
3️⃣ Validate expiry
```
if expiresAt < current time
→ Download expired
```
4️⃣ Validate download limit
```
if downloadCount >= maxDownloads
→ Download limit reached
```
5️⃣ Fetch file
File is retrieved from:
```
product_media
where type = "file"
```
6️⃣ Increment download count
```
downloadCount += 1
```
7️⃣ Log download activity

A record is stored in:
```
download_logs
```
Fields recorded:
```
digitalDownloadId
ipAddress
userAgent
createdAt
```

## Download Lifecycle
The lifecycle of a digital download:

1️⃣ Order Creation
When a customer creates an order:
```
productType = DIGITAL
``` 
Behavior depends on payment method.

Online Payment
If:
```
paymentMethod = ONLINE
status = PAID
```
System creates:
```
digital_downloads record
```
COD (Cash on Delivery)
Initial order status:
```
PENDING
```
Download record is created only when status becomes PAID.

2️⃣ Download Access
Customer receives download link:
```
GET /v1/api/download/:token
```
System validates token and order status.

3️⃣ Download Tracking
Each download attempt:
```
increment downloadCount
insert record in download_logs
```
4️⃣ Creator Visibility
Creators can view download activity:
```
GET /v1/api/products/:id/downloads
```
Returned data:
```
orderId
downloadCount
createdAt
```
Only downloads belonging to the creator's store are visible.
---
5️⃣ Admin Visibility
Admins can view all digital downloads:

GET /v1/api/admin/downloads
## Security Decisions
No Direct File Path Exposure
Internal storage paths and database IDs are never exposed. Only the validated file URL is returned.

Download Logging
Each download attempt records:

* IP Address
* User Agent
* Timestamp

This helps detect misuse.

Order Validation
Downloads are allowed only when the order status is PAID.

### Token Generation
Tokens are generated using Node.js crypto:
```
crypto.randomBytes(32).toString("hex")
```
Properties:
* ≥ 64 characters
* Cryptographically secure
* Unpredictable

Token Hashing (Optional)
Tokens can be stored as hashed values in the database.
Example:
```
tokenHash = sha256(token)
```
Benefits:
* Prevents token leakage if the database is compromised
* Protects download links
* Adds an additional security layer

Flow:
```
generate token → hash token → store hash → validate during download
```

### Testing
Implemented unit tests for:
* Token Generation – verifies secure and correct token format
* Download Access Validation – invalid token, unpaid order,cancelled order
* PAID Status Enforcement – blocks downloads for unpaid orders
* Download Count Increment – verifies count update and logging
* Expiry Logic – blocks expired download links
* Creator Access Isolation – prevents creators from accessing other stores' downloads

---
# Messaging & Dispute System
## Conversation Lifecycle
1. Buyer sends a message for an order.
2. If no conversation exists for that order, the system automatically creates one (lazy creation).
3. Messages are then stored under that conversation.
4. Creator and buyer communicate through the conversation.
5. Buyer can escalate the conversation to a dispute if needed.
6. Admin can resolve the dispute when the issue is handled.

## Guest Verification Logic
Buyers are treated as guests, so verification is required before sending or reading messages.

Verification rules:
* email must match order.buyerEmail
* phone must match order.buyerPhone

If either does not match, the request is rejected with:
```
Buyer verification failed
```
This prevents unauthorized users from accessing another buyer’s order messages.

## Dispute System Behavior
The dispute system allows escalation when a buyer is not satisfied.

Rules:
* A buyer can escalate a conversation to dispute.
* A conversation cannot be disputed twice.
* Only admin can resolve disputes.
* Admin resolution removes the dispute flag and marks the issue as handled.

## Isolation Rules (Access Control)
Strict access rules are enforced:

Creator
  * Can only see conversations belonging to their own store.
Buyer
  * Can only access messages for their own order (via email + phone verification).
Admin
  * Has full visibility across all conversations and stores.
These rules ensure data privacy and store isolation.

## Why Real‑Time Messaging Is Not Used
Real‑time communication (WebSockets) was intentionally avoided to keep the system simple and reliable for this stage.

Reasons:
* Messaging is order‑based support, not live chat.
* Polling via API is sufficient.
* Reduces infrastructure complexity.
* Easier testing and debugging.

Real‑time features can be added later if needed.

---

# Payout System Logic

## Commission Logic
Platform commission is applied as a percentage on the order’s gross amount.
* commission = (gross × commission%)
* net = gross - commission
All values are rounded to 2 decimal places.

## Hold Period Logic
Payouts are not immediately released after order completion.
Each payout has an eligibleAt timestamp, representing a hold period (e.g., for returns/refunds).

## Eligibility Transition
Payout status flow:
```
LOCKED → ELIGIBLE → RELEASED
```
* A payout becomes ELIGIBLE only if:
  * eligibleAt time has passed
  * Order status is DELIVERED

## Refund Interaction Behavior
### Full Refund
* If refund ≥ gross amount
    → payout is CANCELLED

### Partial Refund
* Gross, commission, and net are recalculated
* Ensures:
  * Proper rounding
  * Net amount never becomes negative

## Manual Release Requirement
* Payouts are not auto-released
* Only ELIGIBLE payouts can be released manually
* Ensures control over fund disbursement

## Why Background Jobs Not Used Yet
* Current system uses on-demand execution (service-triggered)
* Simpler to debug and test during early stages
* Can be replaced later with cron/queue workers for scalability

