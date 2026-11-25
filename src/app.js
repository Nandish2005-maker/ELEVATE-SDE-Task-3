import express from "express";
import cors from "cors";
import db from "./db.js";
import applicationRoutes from "./routes/applications.js";
import certificateRoutes from "./routes/certificates.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check: confirms the server and database are working
app.get("/api/health", (req, res) => {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM applications").get();
  res.json({ success: true, message: "CredVault API is running", applications: count });
});

app.use("/api/applications", applicationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/admin", adminRoutes);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Any error thrown in a route (including bad JSON bodies)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON in request body" });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong on the server" });
});

export default app;
