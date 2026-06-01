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

export const PAYMENT_METHODS = ["upi", "cash", "bank", "cheque", "card"];
