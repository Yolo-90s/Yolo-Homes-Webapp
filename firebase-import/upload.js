const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const RATE = 0.02;

const readings = [
  { flatNo: "101", current: 22573, previous: 12838 },
  { flatNo: "201", current: 32834, previous: 22089 },
  { flatNo: "301", current: 21255, previous: 15405 },
  { flatNo: "401", current: 58474, previous: 35319 },
  { flatNo: "501", current: 19253, previous: 12413 },
  { flatNo: "G01", current: 23762, previous: 19523 },
  { flatNo: "502", current: 12925, previous: 4973 },
  { flatNo: "402", current: 16094, previous: 7284 },
  { flatNo: "302", current: 20279, previous: 12578 },
  { flatNo: "202", current: 31310, previous: 21508 },
  { flatNo: "102", current: 16943, previous: 13166 },
  { flatNo: "403", current: 6795, previous: 6404 },
  { flatNo: "303", current: 31207, previous: 8502 },
  { flatNo: "203", current: 17515, previous: 13216 },
  { flatNo: "103", current: 24789, previous: 13898 },
  { flatNo: "104", current: 30392, previous: 20336 },
  { flatNo: "204", current: 35351, previous: 13825 },
  { flatNo: "404", current: 40733, previous: 23901 },
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
      date: new Date("2026-07-31T12:00:00+05:30").getTime(),
      // date: Date.now(),
      edited: false,
      hasImage: false,
    });

    console.log(`Inserted ${r.flatNo}`);
  }

  console.log("Done");
}

upload();
