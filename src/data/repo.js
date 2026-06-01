import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { COL } from "../lib/constants";
import { toReading } from "../lib/firestore";

export async function addReceipt({ flatId, amount, period, paymentMethod, capturedBy }) {
  await addDoc(collection(db, COL.MAINTENANCE_RECEIPTS), {
    flatId,
    amount,
    period,
    paymentMethod,
    paidDate: Date.now(),
    capturedBy: capturedBy || "",
    edited: false,
  });
}

export async function addReading({
  flatId,
  previousReading,
  currentReading,
  usageLiters,
  excessLiters,
  amount,
  capturedBy,
}) {
  await addDoc(collection(db, COL.READINGS), {
    flatId,
    previousReading,
    currentReading,
    usageLiters,
    excessLiters,
    amount,
    date: Date.now(),
    capturedBy: capturedBy || "",
    edited: false,
    hasImage: false,
  });
}

/** Latest reading for a flat (to seed previous reading on the add form). */
export async function latestReadingForFlat(flatId) {
  const q = query(collection(db, COL.READINGS), where("flatId", "==", flatId));
  const snap = await getDocs(q);
  const list = snap.docs.map(toReading).sort((a, b) => b.date - a.date);
  return list[0] || null;
}

export async function updateSettings(settings) {
  await setDoc(doc(db, COL.APP_SETTINGS, COL.APP_SETTINGS_DOC), settings, { merge: true });
}

export async function updateResident(flatNo, email, role) {
  await setDoc(doc(db, COL.MASTER_FLATS, flatNo), { email, role }, { merge: true });
}
