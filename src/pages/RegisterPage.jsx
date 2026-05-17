// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    if (form.password.length < 6) errs.password = "Minimum 6 characters.";
    if (form.password !== form.confirm) errs.confirm = "Passwords don't match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate("/dashboard");
    } catch (err) {
      setApiError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" fill="white" fillOpacity="0.95"/>
              <path d="M10 6L14 8.5V13.5L10 16L6 13.5V8.5L10 6Z" fill="white" fillOpacity="0.25"/>
            </svg>
          </div>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Start capturing and sharing your notes</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {[
            { label: "Full name", name: "name", type: "text", placeholder: "Jane Doe" },
            { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
            { label: "Password", name: "password", type: "password", placeholder: "Min 6 characters" },
            { label: "Confirm password", name: "confirm", type: "password", placeholder: "••••••••" },
          ].map(({ label, name, type, placeholder }) => (
            <div className={styles.inputWrap} key={name}>
              <label className={styles.label}>{label}</label>
              <input
                className={`${styles.input} ${errors[name] ? styles.hasError : ""}`}
                type={type} name={name} placeholder={placeholder}
                value={form[name]} onChange={handleChange} required
              />
              {errors[name] && <span className={styles.fieldError}>{errors[name]}</span>}
            </div>
          ))}

          {apiError && <p className={styles.errorBanner}>{apiError}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : <>Create account →</>}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/invalid-email": return "Invalid email address.";
    case "auth/weak-password": return "Password is too weak.";
    default: return "Registration failed. Please try again.";
  }
}
