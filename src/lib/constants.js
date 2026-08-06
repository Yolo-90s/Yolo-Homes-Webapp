// Firestore collection names — mirror the existing schema, do not rename.
export const COL = {
  APP_SETTINGS: "appSettings",
  APP_SETTINGS_DOC: "main",
  MASTER_FLATS: "masterFlats",
  FLATS: "flats", // operational collection receipts/readings reference (auto-ids)
  MAINTENANCE_RECEIPTS: "maintenanceReceipts",
  READINGS: "readings",
  USERS: "users",
};

// Values match the Android app's PaymentMethods.ALL exactly — both apps write to the same
// maintenanceReceipts collection, and mismatched casing/wording breaks cross-app filtering.
export const PAYMENT_METHODS = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card"];
