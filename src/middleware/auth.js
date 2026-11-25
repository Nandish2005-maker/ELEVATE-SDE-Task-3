import jwt from "jsonwebtoken";

// Read at call time so the value from .env is always loaded first
export const getSecret = () => process.env.JWT_SECRET || "dev-only-secret-change-me";

export const signToken = (username) => jwt.sign({ username, role: "admin" }, getSecret(), { expiresIn: "8h" });

// Protects admin routes. Expects the header:  Authorization: Bearer <token>
export function requireAdmin(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Admin login required" });
  }
  try {
    req.admin = jwt.verify(token, getSecret());
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token. Please log in again" });
  }
}
