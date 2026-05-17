// src/pages/SharedNotePage.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getNoteByShareId } from "../firebase/notesService";
import { formatDistanceToNow } from "date-fns";
import styles from "./SharedNotePage.module.css";

export default function SharedNotePage() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getNoteByShareId(shareId).then((data) => {
      if (data) setNote(data);
      else setNotFound(true);
      setLoading(false);
    });
  }, [shareId]);

  const timeAgo = note?.updatedAt?.toDate
    ? formatDistanceToNow(note.updatedAt.toDate(), { addSuffix: true })
    : "";

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>Loading note…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className={styles.center}>
        <div className={styles.notFoundIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className={styles.notFoundTitle}>Note not found</h2>
        <p className={styles.notFoundSub}>This link may have expired or been revoked.</p>
        <Link to="/login" className={styles.homeLink}>Go to NoteShare →</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/login" className={styles.brand}>
          <div className={styles.brandLogo}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" fill="white" fillOpacity="0.95"/>
              <path d="M10 6L14 8.5V13.5L10 16L6 13.5V8.5L10 6Z" fill="white" fillOpacity="0.25"/>
            </svg>
          </div>
          NoteShare
        </Link>
        <span className={styles.badge}>Shared note</span>
      </header>

      <article className={styles.article}>
        <div className={styles.articleMeta}>
          <span className={styles.metaBadge}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Shared publicly
          </span>
          {timeAgo && <span className={styles.metaTime}>Updated {timeAgo}</span>}
        </div>

        <h1 className={styles.title}>{note.title || "Untitled"}</h1>

        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: note.content || "<em>No content.</em>" }}
        />
      </article>

      <footer className={styles.footer}>
        <p>
          Shared via{" "}
          <Link to="/register" className={styles.footerLink}>NoteShare</Link>
          {" "}— create your free workspace today.
        </p>
      </footer>
    </div>
  );
}
