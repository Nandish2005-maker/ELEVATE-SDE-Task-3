import { DatabaseSync } from "node:sqlite"; // SQLite is built into Node.js 22, nothing extra to install
import fs from "node:fs";
import path from "node:path";

// The database is a single file, created automatically on first run.
const dir = path.resolve("data");
fs.mkdirSync(dir, { recursive: true });

const db = new DatabaseSync(path.join(dir, "credvault.db"));
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    applicationId   TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL,
    gender          TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    city            TEXT NOT NULL,
    state           TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    rejectionReason TEXT,
    submittedAt     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS certificates (
    certificateId TEXT PRIMARY KEY,
    applicationId TEXT NOT NULL UNIQUE REFERENCES applications(applicationId),
    issuedOn      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    status        TEXT NOT NULL DEFAULT 'Valid'
                  CHECK (status IN ('Valid', 'Revoked'))
  );

  CREATE TABLE IF NOT EXISTS admins (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  );
`);

export default db;
