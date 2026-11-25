import "dotenv/config";
import bcrypt from "bcryptjs";
import db from "./db.js";

// 1. Admin account (password is stored as a bcrypt hash, never as plain text)
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "admin";

const adminResult = db
  .prepare("INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?)")
  .run(username, bcrypt.hashSync(password, 10));
console.log(adminResult.changes ? `Admin created: ${username}` : `Admin already exists: ${username}`);

// 2. Sample data, same as the frontend's dummy data (only if the tables are empty)
const { count } = db.prepare("SELECT COUNT(*) AS count FROM applications").get();

if (count === 0) {
  const insertApp = db.prepare(
    `INSERT INTO applications (applicationId, name, phone, gender, city, state, status, submittedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertCert = db.prepare(
    `INSERT INTO certificates (certificateId, applicationId, issuedOn, status) VALUES (?, ?, ?, ?)`
  );

  // [applicationId, name, phone, gender, city, state, status, submittedAt]
  const apps = [
    ["APP-0001", "Aarav Sharma", "9876543210", "Male", "Mumbai", "Maharashtra", "Approved", "2026-11-02T10:00:00Z"],
    ["APP-0002", "Priya Nair", "9812345678", "Female", "Kochi", "Kerala", "Pending", "2026-11-05T10:00:00Z"],
    ["APP-0003", "Rohan Gupta", "9898989898", "Male", "Jaipur", "Rajasthan", "Rejected", "2026-11-07T10:00:00Z"],
    ["APP-0004", "Sneha Reddy", "9700011122", "Female", "Hyderabad", "Telangana", "Approved", "2026-11-10T10:00:00Z"],
    ["APP-0005", "Kiran Das", "9123456780", "Other", "Kolkata", "West Bengal", "Pending", "2026-11-14T10:00:00Z"],
  ];
  // [certificateId, applicationId, issuedOn, status]
  const certs = [
    ["CERT-0001", "APP-0001", "2026-11-03T10:00:00Z", "Valid"],
    ["CERT-0002", "APP-0004", "2026-11-11T10:00:00Z", "Revoked"],
  ];

  // All-or-nothing: if anything fails, nothing is saved
  db.exec("BEGIN");
  try {
    apps.forEach((a) => insertApp.run(...a));
    certs.forEach((c) => insertCert.run(...c));
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  console.log(`Sample data added: ${apps.length} applications, ${certs.length} certificates`);
} else {
  console.log("Sample data skipped (applications already exist)");
}
