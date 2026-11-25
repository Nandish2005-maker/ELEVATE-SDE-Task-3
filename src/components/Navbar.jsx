import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const publicLinks = [
  { to: "/request", label: "Request" },
  { to: "/track", label: "Track" },
  { to: "/verify", label: "Verify" },
];

export default function Navbar() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `rounded px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-brand text-white" : "text-muted hover:text-ink"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand">
          CredVault
        </Link>
        <div className="flex flex-wrap gap-1">
          {publicLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}

          {isAdmin ? (
            <>
              <NavLink to="/admin/applications" className={linkClass}>Applications</NavLink>
              <NavLink to="/admin/certificates" className={linkClass}>Certificates</NavLink>
              <button onClick={handleLogout} className="rounded px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50">
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/admin/login" className={linkClass}>Admin</NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
