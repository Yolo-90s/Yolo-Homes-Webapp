import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { COL } from "../lib/constants";
import { Role, canWrite, isResident, roleFrom } from "../lib/roles";
import { initials as deriveInitials } from "../lib/format";

const AuthContext = createContext(null);

const AVATAR_PALETTE = ["#2563EB", "#0EA5E9", "#14B8A6", "#F59E0B", "#8B5CF6", "#F43F5E"];
function pickColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

async function resolveRoleAndFlat(email, phone) {
  if (!email && !phone) return { role: Role.UNKNOWN, flatId: null, flatNo: null };
  let match = null;
  try {
    const snap = await getDocs(collection(db, COL.MASTER_FLATS));
    match = snap.docs.find((d) => {
      const data = d.data() || {};
      const docEmail = data.email != null ? String(data.email) : null;
      const op = data.ownerPhone != null ? String(data.ownerPhone) : null;
      const tp = data.tenantPhone != null ? String(data.tenantPhone) : null;
      return (
        (email && docEmail && docEmail.toLowerCase() === email.toLowerCase()) ||
        (phone && (phone === op || phone === tp))
      );
    });
  } catch (e) {
    return { role: Role.UNKNOWN, flatId: null, flatNo: null };
  }
  if (!match) return { role: Role.UNKNOWN, flatId: null, flatNo: null };

  const data = match.data() || {};
  const role = roleFrom(data.role != null ? String(data.role) : "");
  const flatNo = data.flatNo != null ? String(data.flatNo) : match.id;

  // Map flat number → operational `flats` doc id used by receipts/readings.
  let flatId = null;
  try {
    const fq = query(collection(db, COL.FLATS), where("flatNumber", "==", flatNo));
    const fsnap = await getDocs(fq);
    flatId = fsnap.docs[0]?.id || null;
  } catch (e) {
    flatId = null;
  }
  return { role, flatId, flatNo };
}

async function ensureProfileAndMirrorRole(fbUser, role) {
  const ref = doc(db, COL.USERS, fbUser.uid);
  const name = fbUser.displayName || fbUser.email?.split("@")[0] || "User";
  let profile = {
    id: fbUser.uid,
    uid: fbUser.uid,
    displayName: name,
    email: fbUser.email || "",
    initials: deriveInitials(name),
    avatarColor: pickColor(fbUser.uid),
    createdAt: Date.now(),
  };
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data() || {};
      const storedColor = typeof d.avatarColor === "string" ? d.avatarColor : null;
      profile = {
        id: fbUser.uid,
        uid: typeof d.uid === "string" ? d.uid : fbUser.uid,
        displayName: typeof d.displayName === "string" ? d.displayName : name,
        email: typeof d.email === "string" ? d.email : fbUser.email || "",
        initials: typeof d.initials === "string" ? d.initials : deriveInitials(name),
        avatarColor: storedColor && storedColor.startsWith("#") ? storedColor : pickColor(fbUser.uid),
        createdAt: typeof d.createdAt === "number" ? d.createdAt : Date.now(),
      };
    } else {
      await setDoc(ref, { ...profile }, { merge: true });
    }
    // Mirror role so Firestore rules can enforce writes.
    if (role !== Role.UNKNOWN) {
      await setDoc(ref, { role }, { merge: true });
    }
  } catch (e) {
    /* keep fallback profile */
  }
  return profile;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { user, role, flatId }
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setSession(null);
        setLoading(false);
        return;
      }
      const { role, flatId } = await resolveRoleAndFlat(fbUser.email, fbUser.phoneNumber);
      const user = await ensureProfileAndMirrorRole(fbUser, role);
      setSession({ user, role, flatId });
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn() {
    setSigningIn(true);
    setError(null);
    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError(e?.message || "Sign-in failed");
    } finally {
      setSigningIn(false);
    }
  }

  function signOutUser() {
    fbSignOut(auth);
  }

  const value = {
    session,
    loading,
    signingIn,
    error,
    signIn,
    signOut: signOutUser,
    isAdmin: session ? canWrite(session.role) : false,
    isResident: session ? isResident(session.role) : false,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
