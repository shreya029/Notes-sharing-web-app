// src/pages/DashboardPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { subscribeToNotes } from "../firebase/notesService";
import Navbar from "../components/shared/Navbar";
import NoteCard from "../components/notes/NoteCard";
import NoteEditor from "../components/notes/NoteEditor";
import SearchBar from "../components/notes/SearchBar";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };
  const navigate = useNavigate();
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

  const totalShared = notes.filter(n => n.shareEnabled).length;
  const todayCount = notes.filter(n => {
    if (!n.updatedAt?.toDate) return false;
    return Date.now() - n.updatedAt.toDate().getTime() < 86400000;
  }).length;

  return (
    <div className={styles.shell}>
      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <span className={styles.logoName}>NoteShare</span>
        </div>

        <nav className={styles.nav}>
          <span className={styles.navLabel}>Workspace</span>
          <div className={`${styles.navItem} ${styles.navActive}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            All Notes
            <span className={styles.navCount}>{notes.length}</span>
          </div>
          <div className={`${styles.navItem} ${styles.navTrash}`} onClick={() => navigate("/trash")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Trash
          </div>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatarCircle}>
              {firstName.slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{firstName}</span>
              <span className={styles.userSub}>Personal workspace</span>
            </div>
            <button className={styles.signOutBtn} title="Sign out" onClick={handleSignOut}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <p className={styles.greetingSmall}>{greeting} ✦</p>
            <h1 className={styles.greetingBig}>
              Hey, <span className={styles.gradientName}>{firstName}</span>
            </h1>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.searchWrap}>
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <button className={styles.newBtn} onClick={openNew}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New note
            </button>
          </div>
        </header>

        {/* Body */}
        <div className={styles.body}>
          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconViolet}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <div className={styles.statNum}>{notes.length}</div>
                <div className={styles.statLabel}>Total notes</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconTeal}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
              <div>
                <div className={styles.statNum}>{totalShared}</div>
                <div className={styles.statLabel}>Shared</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.iconAmber}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <div className={styles.statNum}>{todayCount}</div>
                <div className={styles.statLabel}>Updated today</div>
              </div>
            </div>
          </div>

          {/* Section header */}
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Recent notes</span>
            <span className={styles.sectionSort}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Last updated
            </span>
          </div>

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
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <p className={styles.emptyTitle}>No results for "<strong>{search}</strong>"</p>
                  <button className={styles.clearSearch} onClick={() => setSearch("")}>Clear search</button>
                </>
              ) : (
                <>
                  <div className={styles.emptyIcon}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <p className={styles.emptyTitle}>No notes yet</p>
                  <p className={styles.emptySub}>Create your first note and start building your workspace.</p>
                  <button className={styles.emptyBtn} onClick={openNew}>Create first note</button>
                </>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((note, i) => (
                <NoteCard key={note.id} note={note} onEdit={openEdit} index={i} />
              ))}
              {/* Add note ghost card */}
              <div className={styles.addCard} onClick={openNew}>
                <div className={styles.addCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span>Create new note</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <NoteEditor note={editingNote?.id ? editingNote : undefined} onClose={closeEditor} />
      )}
    </div>
  );
}