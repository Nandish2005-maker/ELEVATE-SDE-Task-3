import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Request from "./pages/Request";
import Track from "./pages/Track";
import Verify from "./pages/Verify";
import AdminLogin from "./pages/AdminLogin";
import AdminApplications from "./pages/AdminApplications";
import AdminCertificates from "./pages/AdminCertificates";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<Request />} />
          <Route path="/track" element={<Track />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin pages: only reachable when logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/certificates" element={<AdminCertificates />} />
          </Route>

          <Route path="*" element={<h1 className="text-2xl font-semibold">Page not found</h1>} />
        </Routes>
      </main>
    </>
  );
}
