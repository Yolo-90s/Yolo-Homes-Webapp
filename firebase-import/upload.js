const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const RATE = 0.12;

const readings = [
  { flatNo: "101", current: 12838, previous: 5967 },
  { flatNo: "201", current: 22089, previous: 8968 },
  { flatNo: "301", current: 15405, previous: 9461 },
  { flatNo: "401", current: 35319, previous: 14001 },
  { flatNo: "501", current: 12413, previous: 6140 },
  { flatNo: "G01", current: 19523, previous: 10901 },
  { flatNo: "502", current: 4973, previous: 2206 },
  { flatNo: "402", current: 7284, previous: 1488 },
  { flatNo: "302", current: 12578, previous: 7454 },
  { flatNo: "202", current: 21508, previous: 11066 },
  { flatNo: "102", current: 13166, previous: 6189 },
  { flatNo: "403", current: 6404, previous: 2662 },
  { flatNo: "303", current: 8502, previous: 5433 },
  { flatNo: "203", current: 13216, previous: 9318 },
  { flatNo: "103", current: 13898, previous: 3661 },
  { flatNo: "104", current: 20336, previous: 11286 },
  { flatNo: "204", current: 13825, previous: 1335 },
  { flatNo: "404", current: 23901, previous: 8077 },
];

async function upload() {
  for (const r of readings) {
    // Find flat document by flatNo
    const flatSnap = await db
      .collection("flats")
      .where("flatNumber", "==", r.flatNo)
      .limit(1)
      .get();

    if (flatSnap.empty) {
      console.log(`Flat ${r.flatNo} not found`);
      continue;
    }

    const flatDoc = flatSnap.docs[0];

    const usage = r.current - r.previous;

    await db.collection("readings").add({
      amount: usage * RATE,
      capturedBy: "Nagarjuna Reddy (B.NReddy)",
      currentReading: r.current,
      previousReading: r.previous,
      usageLiters: usage,
      excessLiters: usage,
      flatId: flatDoc.id,
      //date: new Date("2026-06-30T12:00:00+05:30").getTime(),
      date: Date.now(),
      edited: false,
      hasImage: false,
    });

    console.log(`Inserted ${r.flatNo}`);
  }

  console.log("Done");
}

upload();
