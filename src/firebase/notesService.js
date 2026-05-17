// src/firebase/notesService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { v4 as uuidv4 } from "uuid";

const NOTES_COLLECTION = "notes";

// ── Real-time listener for ACTIVE notes ────────────────────────────────────
// Uses only userId + orderBy (no composite index needed).
// Filters client-side so old notes WITHOUT the `deleted` field still show up.
export function subscribeToNotes(userId, callback) {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((n) => !n.deleted); // missing field → treated as active ✓
    callback(notes);
  });
}

// ── Real-time listener for TRASHED notes ───────────────────────────────────
export function subscribeToTrashedNotes(userId, callback) {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const notes = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((note) => {
        if (!note.deleted) return false;
        if (!note.deletedAt?.toDate) return true;
        return now - note.deletedAt.toDate().getTime() < THIRTY_DAYS_MS;
      });
    callback(notes);
  });
}

// ── Create ─────────────────────────────────────────────────────────────────
export async function createNote(userId, { title, content }) {
  return addDoc(collection(db, NOTES_COLLECTION), {
    userId,
    title: title || "Untitled",
    content: content || "",
    shareId: null,
    shareEnabled: false,
    deleted: false,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ── Update ─────────────────────────────────────────────────────────────────
export async function updateNote(noteId, data) {
  const ref = doc(db, NOTES_COLLECTION, noteId);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// ── Soft Delete → Move to Trash ────────────────────────────────────────────
// Does NOT delete from Firestore. Sets deleted=true + deletedAt timestamp.
export async function moveToTrash(noteId) {
  const ref = doc(db, NOTES_COLLECTION, noteId);
  return updateDoc(ref, {
    deleted: true,
    deletedAt: serverTimestamp(),
    shareEnabled: false,
    shareId: null,
    updatedAt: serverTimestamp(),
  });
}

// ── Restore from Trash ─────────────────────────────────────────────────────
export async function restoreNote(noteId) {
  const ref = doc(db, NOTES_COLLECTION, noteId);
  return updateDoc(ref, {
    deleted: false,
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

// ── Permanent Delete (Trash only) ─────────────────────────────────────────
export async function deleteNotePermanently(noteId) {
  return deleteDoc(doc(db, NOTES_COLLECTION, noteId));
}

// ── deleteNote alias → soft-deletes ───────────────────────────────────────
export async function deleteNote(noteId) {
  return moveToTrash(noteId);
}

// ── Share link ─────────────────────────────────────────────────────────────
export async function enableShare(noteId) {
  const shareId = uuidv4();
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    shareId,
    shareEnabled: true,
    updatedAt: serverTimestamp(),
  });
  return shareId;
}

export async function revokeShare(noteId) {
  await updateDoc(doc(db, NOTES_COLLECTION, noteId), {
    shareId: null,
    shareEnabled: false,
    updatedAt: serverTimestamp(),
  });
}

// ── Public view by shareId ─────────────────────────────────────────────────
export async function getNoteByShareId(shareId) {
  const { getDocs } = await import("firebase/firestore");
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("shareId", "==", shareId),
    where("shareEnabled", "==", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ── Get single note by Firestore doc id ───────────────────────────────────
export async function getNoteById(noteId) {
  const snap = await getDoc(doc(db, NOTES_COLLECTION, noteId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Days remaining before permanent auto-delete ───────────────────────────
export function daysUntilPermanentDelete(note) {
  if (!note.deletedAt?.toDate) return 30;
  const deletedMs = note.deletedAt.toDate().getTime();
  const remaining = 30 - Math.floor((Date.now() - deletedMs) / (24 * 60 * 60 * 1000));
  return Math.max(0, remaining);
}