// src/components/shared/Navbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login");
  };

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? "?";

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "";

  return (
    <nav className={styles.nav}>
      <button className={styles.brand} onClick={() => navigate("/dashboard")}>
        <div className={styles.logoMark}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" fill="white" fillOpacity="0.95"/>
            <path d="M10 6L14 8.5V13.5L10 16L6 13.5V8.5L10 6Z" fill="white" fillOpacity="0.2"/>
          </svg>
        </div>
        <span className={styles.brandName}>NoteShare</span>
      </button>

      {user && (
        <div className={styles.right}>
          <div className={styles.userPill}>
            <div className={styles.avatar}>{initials}</div>
            <span className={styles.userName}>{firstName}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} disabled={loggingOut}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {loggingOut ? "…" : "Sign out"}
          </button>
        </div>
      )}
    </nav>
  );
}
