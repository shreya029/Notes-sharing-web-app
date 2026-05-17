// src/pages/DashboardPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { subscribeToNotes } from "../firebase/notesService";
import Navbar from "../components/shared/Navbar";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";
import SearchBar from "../components/notes/SearchBar";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingNote, setEditingNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotes(user.uid, (data) => {
      setNotes(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const filtered = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.replace(/<[^>]+>/g, "").toLowerCase().includes(q)
    );
  }, [notes, search]);

  const openNew = () => { setEditingNote({}); setIsEditorOpen(true); };
  const openEdit = (note) => { setEditingNote(note); setIsEditorOpen(true); };
  const closeEditor = () => { setIsEditorOpen(false); setEditingNote(null); };

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.greetingSmall}>{greeting} ✦</p>
            <h1 className={styles.greeting}>
              Hey, <span className={styles.gradientName}>{firstName}</span>
            </h1>
            <p className={styles.sub}>
              {notes.length === 0
                ? "Your workspace is empty — create your first note!"
                : `${notes.length} note${notes.length !== 1 ? "s" : ""} in your workspace`}
            </p>
          </div>
          <button className={styles.newBtn} onClick={openNew}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New note
          </button>
        </div>

        {/* Stats bar */}
        {notes.length > 0 && (
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{notes.length}</span>
              <span className={styles.statLabel}>Total notes</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>{notes.filter(n => n.shareEnabled).length}</span>
              <span className={styles.statLabel}>Shared</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum}>
                {notes.filter(n => {
                  if (!n.updatedAt?.toDate) return false;
                  const diff = Date.now() - n.updatedAt.toDate().getTime();
                  return diff < 86400000;
                }).length}
              </span>
              <span className={styles.statLabel}>Today</span>
            </div>
            <div className={styles.searchWrap}>
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />
            <p>Loading your notes…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {search ? (
              <>
                <div className={styles.emptyIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p className={styles.emptyTitle}>No results for "<strong>{search}</strong>"</p>
                <button className={styles.clearSearch} onClick={() => setSearch("")}>Clear search</button>
              </>
            ) : (
              <>
                <div className={styles.emptyIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                </div>
                <p className={styles.emptyTitle}>No notes yet</p>
                <p className={styles.emptySub}>Create your first note and start building your workspace.</p>
                <button className={styles.emptyBtn} onClick={openNew}>
                  Create first note
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((note, i) => (
              <NoteCard key={note.id} note={note} onEdit={openEdit} index={i} />
            ))}
          </div>
        )}
      </main>

      {isEditorOpen && (
        <NoteEditor note={editingNote?.id ? editingNote : undefined} onClose={closeEditor} />
      )}
    </div>
  );
}
