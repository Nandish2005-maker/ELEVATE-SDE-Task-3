import { useState } from "react";
import { Navigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { isAdmin, login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");

  // Already logged in: skip the form.
  if (isAdmin) return <Navigate to="/admin/applications" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setLoginError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim()) errs.username = "Enter your username";
    if (!form.password) errs.password = "Enter your password";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // On success the context updates and the redirect above takes over.
    if (!login(form.username, form.password)) setLoginError("Incorrect username or password");
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Admin Login</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-line bg-white p-6">
        <FormInput label="Username" name="username" value={form.username} onChange={handleChange} error={errors.username} autoComplete="username" />
        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} autoComplete="current-password" />

        {loginError && <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">{loginError}</p>}

        <button type="submit" className="w-full rounded bg-brand py-2.5 font-medium text-white hover:bg-brand-dark">
          Login
        </button>
      </form>
    </section>
  );
}
