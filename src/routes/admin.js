import { Router } from "express";
import bcrypt from "bcryptjs";
import db from "../db.js";
import { requireAdmin, signToken } from "../middleware/auth.js";
import { cleanId, nextId } from "../utils/ids.js";

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

// Runs several database changes as one unit: all succeed together or none are saved.
function inTransaction(work) {
  db.exec("BEGIN");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

// PATCH /api/admin/applications/:applicationId/approve
// Marks the application Approved and creates a new certificate for it.
router.patch("/applications/:applicationId/approve", (req, res) => {
  const applicationId = cleanId(req.params.applicationId);
  const application = db.prepare("SELECT applicationId, status FROM applications WHERE applicationId = ?").get(applicationId);

  if (!application) return res.status(404).json({ success: false, message: "Application not found" });
  if (application.status !== "Pending") {
    return res.status(409).json({ success: false, message: `Application is already ${application.status}` });
  }

  const certificateId = inTransaction(() => {
    const id = nextId("certificates", "certificateId", "CERT");
    db.prepare("UPDATE applications SET status = 'Approved' WHERE applicationId = ?").run(applicationId);
    db.prepare("INSERT INTO certificates (certificateId, applicationId) VALUES (?, ?)").run(id, applicationId);
    return id;
  });

  res.json({ success: true, message: "Application approved", applicationId, status: "Approved", certificateId });
});

// PATCH /api/admin/applications/:applicationId/reject   (optional body: { "reason": "..." })
router.patch("/applications/:applicationId/reject", (req, res) => {
  const applicationId = cleanId(req.params.applicationId);
  const reason = String(req.body?.reason ?? "").trim();

  if (reason.length > 500) {
    return res.status(400).json({ success: false, message: "Reason must be 500 characters or less" });
  }

  const application = db.prepare("SELECT applicationId, status FROM applications WHERE applicationId = ?").get(applicationId);

  if (!application) return res.status(404).json({ success: false, message: "Application not found" });
  if (application.status !== "Pending") {
    return res.status(409).json({ success: false, message: `Application is already ${application.status}` });
  }

  db.prepare("UPDATE applications SET status = 'Rejected', rejectionReason = ? WHERE applicationId = ?").run(reason || null, applicationId);

  res.json({ success: true, message: "Application rejected", applicationId, status: "Rejected" });
});

// Revoke a certificate. Only the certificate changes; the application record stays as it is.
// The task spec lists this as GET, so GET works; PATCH is also accepted to match approve/reject.
function revokeCertificate(req, res) {
  const certificateId = cleanId(req.params.certificateId);
  const certificate = db.prepare("SELECT certificateId, status FROM certificates WHERE certificateId = ?").get(certificateId);

  if (!certificate) return res.status(404).json({ success: false, message: "Certificate not found" });
  if (certificate.status === "Revoked") {
    return res.status(409).json({ success: false, message: "Certificate is already revoked" });
  }

  db.prepare("UPDATE certificates SET status = 'Revoked' WHERE certificateId = ?").run(certificateId);

  res.json({ success: true, message: "Certificate revoked", certificateId, status: "Revoked" });
}
router.get("/certificates/:certificateId/revoke", revokeCertificate);
router.patch("/certificates/:certificateId/revoke", revokeCertificate);

export default router;
