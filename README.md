# CredVault - Certificate Issuing & Verification Platform (Backend)

Backend API for **ELEVATE SDE Internship - Task 3**.

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (Node.js built-in `node:sqlite` module)
- **Admin auth:** JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`)

## Getting Started

Requires [Node.js](https://nodejs.org/) 22.13 or newer.

```bash
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm run seed             # creates the admin and sample data
npm run dev              # starts the API on http://localhost:5000
```

Check it works: open `http://localhost:5000/api/health`, or run all endpoint checks with the server running:

```bash
npm run test:api
```

To reset the database, delete the `data` folder and run `npm run seed` again.

## Admin Login (demo)

- Username: `admin`
- Password: `admin`

## Database

The SQLite file is created automatically at `data/credvault.db`.

| Table | Columns |
|---|---|
| applications | applicationId, name, phone, gender, city, state, status, rejectionReason, submittedAt |
| certificates | certificateId, applicationId, issuedOn, status |
| admins | username, password (bcrypt hash) |

Statuses: `Pending`, `Approved`, `Rejected` (applications) and `Valid`, `Revoked` (certificates).

IDs look like `APP-0001` and `CERT-0001`. Lookups are case-insensitive and also accept a leading `#` (`#APP-0001`).

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/applications` | Submit a request. Body: `name`, `phone` (10 digits), `gender` (Male/Female/Other), `city`, `state`. Returns `201` with `applicationId` and `status` |
| GET | `/api/applications/track/:applicationId` | Returns `applicationId`, `name`, `status`, `submittedAt`, or `404` |
| GET | `/api/certificates/verify/:certificateId` | Returns `certificateId`, `name`, `phone`, `issuedOn`, `status`, or `404` |

Invalid request bodies return `400` with an `errors` object listing each problem field.

### Admin

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Body: `username`, `password`. Returns `200` with a `token`, or `401` |
| GET | `/api/admin/applications` | List all applications (token required) |
| GET | `/api/admin/certificates` | List all issued certificates (token required) |
| PATCH | `/api/admin/applications/:applicationId/approve` | Approve a Pending application. Sets status to `Approved` and creates a new certificate. Returns the `certificateId` |
| PATCH | `/api/admin/applications/:applicationId/reject` | Reject a Pending application. Optional body: `reason` |
| GET | `/api/admin/certificates/:certificateId/revoke` | Revoke a certificate. Only the certificate changes; the application record stays the same (`PATCH` is also accepted) |

Admin routes need the header `Authorization: Bearer <token>`. Without a valid token they return `401`.

Status codes used: `200` success, `201` created, `400` invalid input, `401` not logged in, `404` not found, `409` action not allowed in the current state (for example approving an application that is already approved).

## Project Structure

```
src/
  routes/       applications.js, certificates.js, admin.js
  middleware/   auth.js (JWT check for admin routes)
  utils/        ids.js, validate.js, states.js
  db.js         SQLite connection and table creation
  seed.js       creates the admin and sample data
  app.js        Express app and route setup
  server.js     starts the server
scripts/
  test-api.js   end-to-end endpoint checks
```
