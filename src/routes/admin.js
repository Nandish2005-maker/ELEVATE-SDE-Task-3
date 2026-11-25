import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { requireAdmin, signToken } from "../middleware/auth.js";

const router = Router();

// Compared against when the username doesn't exist, so response time doesn't reveal valid usernames
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

// POST /api/admin/login  -  public
router.post("/login", (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }

  const admin = db.prepare("SELECT username, password FROM admins WHERE username = ?").get(username);
  const valid = bcrypt.compareSync(password, admin ? admin.password : DUMMY_HASH);

  if (!admin || !valid) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }

  res.json({
    success: true,
    message: "Login successful",
    token: signToken(admin.username),
    admin: { username: admin.username },
  });
});

// Everything below this line needs a valid admin token
router.use(requireAdmin);

// GET /api/admin/applications
router.get("/applications", (req, res) => {
  const applications = db
    .prepare(
      `SELECT a.applicationId, a.name, a.phone, a.gender, a.city, a.state, a.status,
              a.rejectionReason, a.submittedAt, c.certificateId
       FROM applications a
       LEFT JOIN certificates c ON c.applicationId = a.applicationId
       ORDER BY a.submittedAt DESC, a.applicationId DESC`
    )
    .all();
  res.json({ success: true, count: applications.length, applications });
});

// GET /api/admin/certificates
router.get("/certificates", (req, res) => {
  const certificates = db
    .prepare(
      `SELECT c.certificateId, c.applicationId, a.name, a.phone, a.city, a.state, c.issuedOn, c.status
       FROM certificates c
       JOIN applications a ON a.applicationId = c.applicationId
       ORDER BY c.issuedOn DESC, c.certificateId DESC`
    )
    .all();
  res.json({ success: true, count: certificates.length, certificates });
});

export default router;
