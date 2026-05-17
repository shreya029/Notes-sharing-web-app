// src/components/notes/NoteEditor.jsx
import { useState, useEffect } from "react";
import { createNote, updateNote } from "../../firebase/notesService";
import { useAuth } from "../../hooks/useAuth";
import styles from "./NoteEditor.module.css";

export default function NoteEditor({ note, onClose }) {
  const { user } = useAuth();
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      setError("Add a title or some content first.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (note?.id) await updateNote(note.id, { title, content });
      else await createNote(user.uid, { title, content });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const wordCount = content.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.replace(/<[^>]+>/g, "").length;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              {note?.id ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              )}
            </div>
            <h2 className={styles.heading}>{note?.id ? "Edit note" : "New note"}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <input
          className={styles.titleInput}
          placeholder="Note title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          maxLength={120}
        />

        <textarea
          className={styles.contentArea}
          placeholder="Write your note here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {content && (
              <span className={styles.stats}>
                {wordCount} words · {charCount} chars
              </span>
            )}
            {error && <span className={styles.error}>{error}</span>}
          </div>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? <span className={styles.spinner} /> : (note?.id ? "Save changes" : "Create note")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
