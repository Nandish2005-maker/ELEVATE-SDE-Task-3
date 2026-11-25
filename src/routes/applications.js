import { Router } from "express";
import db from "../db.js";
import { cleanId, nextId } from "../utils/ids.js";
import { validateApplication } from "../utils/validate.js";

const router = Router();

// POST /api/applications  -  citizen submits a certificate request
router.post("/", (req, res) => {
  const { errors, data } = validateApplication(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  const applicationId = nextId("applications", "applicationId", "APP");
  db.prepare(
    "INSERT INTO applications (applicationId, name, phone, gender, city, state) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(applicationId, data.name, data.phone, data.gender, data.city, data.state);

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    applicationId,
    status: "Pending",
  });
});

// GET /api/applications/track/:applicationId  -  citizen tracks an application
router.get("/track/:applicationId", (req, res) => {
  const row = db
    .prepare("SELECT applicationId, name, status, submittedAt FROM applications WHERE applicationId = ?")
    .get(cleanId(req.params.applicationId));

  if (!row) return res.status(404).json({ success: false, message: "Application not found" });
  res.json({ success: true, ...row });
});

export default router;
