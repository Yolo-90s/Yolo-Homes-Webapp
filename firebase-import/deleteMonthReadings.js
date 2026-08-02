// Deletes all "readings" docs whose date falls within a given month.
//
// Usage:
//   node deleteMonthReadings.js 2026-06            (dry run — lists matches, deletes nothing)
//   node deleteMonthReadings.js 2026-06 --confirm  (actually deletes)

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const period = process.argv[2];
const confirm = process.argv.includes("--confirm");

if (!period || !/^\d{4}-\d{2}$/.test(period)) {
  console.error('Usage: node deleteMonthReadings.js yyyy-MM [--confirm]');
  process.exit(1);
}

const [year, month] = period.split("-").map(Number);
const start = new Date(year, month - 1, 1).getTime();
const end = new Date(year, month, 1).getTime();

// Reading "date" fields are written inconsistently (Timestamp, number, or string) —
// coerce whatever we get to epoch millis before comparing against the month range.
function toMillis(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") {
    const t = Date.parse(v);
    return isNaN(t) ? 0 : t;
  }
  return 0;
}

async function run() {
  const snap = await db.collection("readings").get();

  const matches = snap.docs.filter((doc) => {
    const ms = toMillis(doc.data().date);
    return ms >= start && ms < end;
  });

  if (matches.length === 0) {
    console.log(`No readings found for ${period}.`);
    return;
  }

  console.log(`Found ${matches.length} reading(s) for ${period}:`);
  matches.forEach((doc) => {
    const d = doc.data();
    console.log(`  ${doc.id}  flatId=${d.flatId}  amount=${d.amount}  date=${new Date(toMillis(d.date)).toISOString()}`);
  });

  if (!confirm) {
    console.log("\nDry run only — nothing deleted. Re-run with --confirm to delete these.");
    return;
  }

  // Firestore batches cap at 500 writes; chunk just in case.
  const chunkSize = 500;
  for (let i = 0; i < matches.length; i += chunkSize) {
    const batch = db.batch();
    matches.slice(i, i + chunkSize).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log(`\nDeleted ${matches.length} reading(s) for ${period}.`);
}

run();
