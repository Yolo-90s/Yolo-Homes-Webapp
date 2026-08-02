// Re-dates all "readings" docs whose date falls on a given day, or within a given month,
// to a new date.
//
// Usage:
//   node changeMonthReadingDates.js 2026-07 2026-08-01            (whole month, dry run)
//   node changeMonthReadingDates.js 2026-08-02 2026-07-31         (single day, dry run)
//   node changeMonthReadingDates.js 2026-08-02 2026-07-31 --confirm  (actually updates)

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const oldPeriod = process.argv[2];
const newDateArg = process.argv[3];
const confirm = process.argv.includes("--confirm");

const monthMatch = /^(\d{4})-(\d{2})$/.exec(oldPeriod || "");
const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(oldPeriod || "");

if (!oldPeriod || (!monthMatch && !dayMatch) || !newDateArg) {
  console.error("Usage: node changeMonthReadingDates.js yyyy-MM|yyyy-MM-dd yyyy-MM-dd [--confirm]");
  process.exit(1);
}

let start, end;
if (dayMatch) {
  const year = Number(dayMatch[1]), month = Number(dayMatch[2]), day = Number(dayMatch[3]);
  start = new Date(year, month - 1, day).getTime();
  end = new Date(year, month - 1, day + 1).getTime();
} else {
  const year = Number(monthMatch[1]), month = Number(monthMatch[2]);
  start = new Date(year, month - 1, 1).getTime();
  end = new Date(year, month, 1).getTime();
}

const newDateMs = Date.parse(newDateArg);
if (isNaN(newDateMs)) {
  console.error(`Could not parse new date "${newDateArg}". Use yyyy-MM-dd.`);
  process.exit(1);
}

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
    console.log(`No readings found for ${oldPeriod}.`);
    return;
  }

  console.log(`Found ${matches.length} reading(s) for ${oldPeriod} — will re-date to ${new Date(newDateMs).toISOString()}:`);
  matches.forEach((doc) => {
    const d = doc.data();
    console.log(`  ${doc.id}  flatId=${d.flatId}  amount=${d.amount}  date=${new Date(toMillis(d.date)).toISOString()}`);
  });

  if (!confirm) {
    console.log("\nDry run only — nothing changed. Re-run with --confirm to apply.");
    return;
  }

  // Firestore batches cap at 500 writes; chunk just in case.
  const chunkSize = 500;
  for (let i = 0; i < matches.length; i += chunkSize) {
    const batch = db.batch();
    matches.slice(i, i + chunkSize).forEach((doc) => batch.update(doc.ref, { date: newDateMs }));
    await batch.commit();
  }

  console.log(`\nRe-dated ${matches.length} reading(s) from ${oldPeriod} to ${new Date(newDateMs).toISOString()}.`);
}

run();
