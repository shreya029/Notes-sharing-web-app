// src/components/notes/NoteCard.jsx
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { enableShare, revokeShare, moveToTrash } from "../../firebase/notesService";
import styles from "./NoteCard.module.css";

const CARD_ACCENTS = ["violet", "teal", "rose", "amber"];

export default function NoteCard({ note, onEdit, index = 0 }) {
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const shareUrl = note.shareEnabled && note.shareId
    ? `${window.location.origin}/shared/${note.shareId}`
    : null;

  const timeAgo = note.updatedAt?.toDate
    ? formatDistanceToNow(note.updatedAt.toDate(), { addSuffix: true })
    : "just now";

  const handleShare = async () => {
    setSharing(true);
    try {
      if (note.shareEnabled) await revokeShare(note.id);
      else await enableShare(note.id);
    } finally { setSharing(false); }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Moves note to trash (soft-delete) — does NOT permanently delete
  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await moveToTrash(note.id);
  };

  const plainContent = note.content.replace(/<[^>]+>/g, "").slice(0, 110);

  return (
    <div className={`${styles.card} ${styles[accent]}`} style={{ animationDelay: `${index * 0.06}s` }}>
      <div className={styles.cardGlow} />

      <div className={styles.top}>
        <div className={styles.accentDot} />
        <span className={styles.time}>{timeAgo}</span>
      </div>

      <h3 className={styles.title}>{note.title || "Untitled"}</h3>
      <p className={styles.preview}>
        {plainContent || <em className={styles.empty}>No content yet…</em>}
      </p>

      {shareUrl && (
        <div className={styles.shareLink}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <span className={styles.shareLinkText}>{shareUrl}</span>
          <button className={styles.copyBtn} onClick={handleCopy}>
            {copied ? "✓" : "Copy"}
          </button>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={() => onEdit(note)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>

        <button
          className={`${styles.shareBtn} ${note.shareEnabled ? styles.shareActive : ""}`}
          onClick={handleShare}
          disabled={sharing}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {sharing ? "…" : note.shareEnabled ? "Shared" : "Share"}
        </button>

        {/* Trash button — moves to trash, not permanent delete */}
        <button
          className={`${styles.deleteBtn} ${confirmDelete ? styles.confirmDelete : ""}`}
          onClick={handleDelete}
          disabled={deleting}
          onBlur={() => setConfirmDelete(false)}
          title="Move to Trash"
        >
          {deleting ? "…" : confirmDelete ? "Move?" : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}