import { useEffect, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { COL } from "../lib/constants";
import { toFlat, toReceipt, toReading, toSettings, DEFAULT_SETTINGS } from "../lib/firestore";

/** Live snapshot subscription over a whole collection; errors fall back to empty. */
function useCollection(path, mapFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, path),
      (snap) => {
        setData(snap.docs.map(mapFn));
        setLoading(false);
      },
      () => {
        setData([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [path, mapFn]);
  return { data, loading };
}

export function useFlats() {
  const { data, loading } = useCollection(COL.FLATS, toFlat);
  return { flats: [...data].sort((a, b) => a.flatNo.localeCompare(b.flatNo)), loading };
}

export function useMasterFlats() {
  const { data, loading } = useCollection(COL.MASTER_FLATS, toFlat);
  return { flats: [...data].sort((a, b) => a.flatNo.localeCompare(b.flatNo)), loading };
}

/**
 * The complete building registry: the union of `masterFlats` (the maintained list, with
 * owner/tenant/block details) and the operational `flats` collection (which older readings
 * reference by auto-id). masterFlats wins on flatNo clash. Also returns `canonicalNo`, which
 * maps a reading's stored flatId (usually a `flats` auto-id) back to a flatNo so it resolves
 * to a flat even when the two collections are out of sync.
 */
export function useAllFlats() {
  const { flats: ops, loading: l1 } = useFlats();
  const { flats: master, loading: l2 } = useMasterFlats();

  const byNo = {};
  ops.forEach((f) => { if (f.flatNo) byNo[f.flatNo] = f; });
  master.forEach((f) => { if (f.flatNo) byNo[f.flatNo] = f; });
  const flats = Object.values(byNo).sort((a, b) => a.flatNo.localeCompare(b.flatNo));

  const autoIdToNo = {};
  ops.forEach((f) => { if (f.id && f.flatNo) autoIdToNo[f.id] = f.flatNo; });
  const canonicalNo = (flatId) => autoIdToNo[flatId] || flatId;

  return { flats, autoIdToNo, canonicalNo, loading: l1 || l2 };
}

export function useReceipts() {
  const { data, loading } = useCollection(COL.MAINTENANCE_RECEIPTS, toReceipt);
  return { receipts: [...data].sort((a, b) => b.paidDate - a.paidDate), loading };
}

export function useReadings() {
  const { data, loading } = useCollection(COL.READINGS, toReading);
  return { readings: [...data].sort((a, b) => b.date - a.date), loading };
}

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, COL.APP_SETTINGS, COL.APP_SETTINGS_DOC),
      (snap) => setSettings(toSettings(snap)),
      () => setSettings(DEFAULT_SETTINGS)
    );
    return unsub;
  }, []);
  return settings;
}
