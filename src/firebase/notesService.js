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

// ── Real-time listener for a user's notes ──────────────────────────────────
export function subscribeToNotes(userId, callback) {
  const q = query(
    collection(db, NOTES_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// ── Update ─────────────────────────────────────────────────────────────────
export async function updateNote(noteId, data) {
  const ref = doc(db, NOTES_COLLECTION, noteId);
  return updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

// ── Delete ─────────────────────────────────────────────────────────────────
export async function deleteNote(noteId) {
  return deleteDoc(doc(db, NOTES_COLLECTION, noteId));
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
  // Firestore doesn't index arbitrary fields by default;
  // use a query on shareId field.
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
