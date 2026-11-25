import { Router } from "express";
import db from "../db.js";
import { cleanId } from "../utils/ids.js";

const router = Router();

// GET /api/certificates/verify/:certificateId  -  public certificate check
// Name and phone live in the applications table, so we join the two tables.
router.get("/verify/:certificateId", (req, res) => {
  const row = db
    .prepare(
      `SELECT c.certificateId, a.name, a.phone, c.issuedOn, c.status
       FROM certificates c
       JOIN applications a ON a.applicationId = c.applicationId
       WHERE c.certificateId = ?`
    )
    .get(cleanId(req.params.certificateId));

  if (!row) return res.status(404).json({ success: false, message: "Certificate not found" });
  res.json({ success: true, ...row });
});

export default router;
