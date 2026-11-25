import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps admin routes: logged-out visitors are sent to the login page.
export default function ProtectedRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
