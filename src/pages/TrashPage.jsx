// src/pages/TrashPage.jsx
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/shared/Navbar";
import {
  subscribeToTrashedNotes,
  restoreNote,
  deleteNotePermanently,
  daysUntilPermanentDelete,
} from "../firebase/notesService";
import styles from "./TrashPage.module.css";

export default function TrashPage() {
  const { user } = useAuth();
  const [trashedNotes, setTrashedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMap, setActionMap] = useState({}); // noteId → "restoring"|"deleting"|"confirm"

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrashedNotes(user.uid, (data) => {
      setTrashedNotes(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const setAction = (id, val) =>
    setActionMap((prev) => ({ ...prev, [id]: val }));

  const handleRestore = async (noteId) => {
    setAction(noteId, "restoring");
    await restoreNote(noteId);
    setAction(noteId, null);
  };

  const handleDeleteForever = async (noteId) => {
    if (actionMap[noteId] !== "confirm") {
      setAction(noteId, "confirm");
      return;
    }
    setAction(noteId, "deleting");
    await deleteNotePermanently(noteId);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.trashIconWrap}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div>
              <h1 className={styles.title}>Trash</h1>
              <p className={styles.subtitle}>
                Notes are permanently deleted after <strong>30 days</strong>
              </p>
            </div>
          </div>
          {trashedNotes.length > 0 && (
            <span className={styles.countBadge}>{trashedNotes.length} note{trashedNotes.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading trash…</p>
          </div>
        ) : trashedNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <p className={styles.emptyTitle}>Trash is empty</p>
            <p className={styles.emptySub}>Deleted notes will appear here for 30 days before being permanently removed.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {trashedNotes.map((note, i) => {
              const daysLeft = daysUntilPermanentDelete(note);
              const timeAgo = note.deletedAt?.toDate
                ? formatDistanceToNow(note.deletedAt.toDate(), { addSuffix: true })
                : "recently";
              const plainContent = note.content?.replace(/<[^>]+>/g, "").slice(0, 100) || "";
              const isConfirm = actionMap[note.id] === "confirm";
              const isDeleting = actionMap[note.id] === "deleting";
              const isRestoring = actionMap[note.id] === "restoring";
              const urgency = daysLeft <= 3 ? "urgent" : daysLeft <= 7 ? "warning" : "normal";

              return (
                <div
                  key={note.id}
                  className={styles.card}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Days badge */}
                  <div className={`${styles.daysBadge} ${styles[urgency]}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {daysLeft === 0 ? "Deletes today" : `${daysLeft}d left`}
                  </div>

                  <h3 className={styles.noteTitle}>{note.title || "Untitled"}</h3>
                  <p className={styles.notePreview}>
                    {plainContent || <em style={{ opacity: 0.4 }}>No content</em>}
                  </p>
                  <p className={styles.deletedTime}>Deleted {timeAgo}</p>

                  <div className={styles.actions}>
                    {/* Restore */}
                    <button
                      className={styles.restoreBtn}
                      onClick={() => handleRestore(note.id)}
                      disabled={isRestoring || isDeleting}
                    >
                      {isRestoring ? (
                        <span className={styles.btnSpinner} />
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                          <path d="M3 3v5h5"/>
                        </svg>
                      )}
                      {isRestoring ? "Restoring…" : "Restore"}
                    </button>

                    {/* Delete forever */}
                    <button
                      className={`${styles.deleteForeverBtn} ${isConfirm ? styles.confirmState : ""}`}
                      onClick={() => handleDeleteForever(note.id)}
                      disabled={isDeleting || isRestoring}
                      onBlur={() => !isDeleting && setAction(note.id, null)}
                    >
                      {isDeleting ? (
                        <span className={styles.btnSpinner} />
                      ) : isConfirm ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          Confirm?
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                          Delete forever
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}