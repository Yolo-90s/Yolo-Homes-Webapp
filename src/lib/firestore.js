// Tolerant Firestore mappers — the live DB (written by a prior app) stores fields with
// loose types: dates as Long/Timestamp/String, phones/colors as numbers, etc.

import { Timestamp } from "firebase/firestore";

/** Any temporal value → epoch millis. Handles number, Timestamp, Date, and date strings. */
export function asMillis(v) {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v?.toMillis === "function") return v.toMillis();
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") return parseDateString(v);
  return 0;
}

function parseDateString(value) {
  if (!value) return 0;
  // yyyy-MM-dd, ISO, or yyyy-MM
  const iso = Date.parse(value);
  if (!isNaN(iso)) return iso;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, 1).getTime();
  return 0;
}

function str(v) {
  return typeof v === "string" ? v : "";
}
/** Coerce any scalar (incl. numeric phones) to string. */
function text(v) {
  if (v == null) return "";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(v);
  return String(v);
}
function num(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
function bool(v, def = false) {
  return typeof v === "boolean" ? v : def;
}

export function toFlat(snap) {
  const d = snap.data() || {};
  return {
    id: snap.id,
    flatNo: str(d.flatNo) || text(d.flatNumber),
    block: text(d.block),
    ownerName: text(d.ownerName),
    ownerPhone: text(d.ownerPhone),
    tenantName: text(d.tenantName),
    tenantPhone: text(d.tenantPhone),
    role: str(d.role) || "resident",
    email: str(d.email),
    get displayName() {
      return this.block ? `${this.block}-${this.flatNo}` : this.flatNo;
    },
    get occupantName() {
      return this.tenantName || this.ownerName;
    },
  };
}

export function toReceipt(snap) {
  const d = snap.data() || {};
  return {
    id: snap.id,
    flatId: str(d.flatId),
    amount: num(d.amount),
    period: str(d.period),
    paymentMethod: str(d.paymentMethod),
    paidDate: asMillis(d.paidDate),
    capturedBy: str(d.capturedBy),
    edited: bool(d.edited),
  };
}

export function toReading(snap) {
  const d = snap.data() || {};
  return {
    id: snap.id,
    flatId: str(d.flatId),
    previousReading: num(d.previousReading),
    currentReading: num(d.currentReading),
    usageLiters: num(d.usageLiters),
    excessLiters: num(d.excessLiters),
    amount: num(d.amount),
    date: asMillis(d.date),
    capturedBy: str(d.capturedBy),
    edited: bool(d.edited),
    hasImage: bool(d.hasImage),
  };
}

export const DEFAULT_SETTINGS = {
  apartmentName: "Sri Manjunatha Residency",
  address: "",
  currency: "₹",
  billingMethod: "flat",
  freeLiters: 200,
  ratePerExcessLiter: 0,
  freeLitersMonthly: 10000,
  tieredRatePerLiter: 0.02,
  readingFrequency: "monthly",
  decimalPrecision: 0,
  roundingRule: "none",
  sendBillMessage: false,
  sendReminder: false,
  unit: "Liters",
  waterSource: "",
};

export function toSettings(snap) {
  if (!snap || !snap.exists?.()) return { ...DEFAULT_SETTINGS };
  const d = snap.data() || {};
  return {
    apartmentName: str(d.apartmentName) || DEFAULT_SETTINGS.apartmentName,
    address: str(d.address),
    currency: str(d.currency) || "₹",
    billingMethod: d.billingMethod === "tiered" ? "tiered" : "flat",
    freeLiters: d.freeLiters != null ? num(d.freeLiters) : DEFAULT_SETTINGS.freeLiters,
    ratePerExcessLiter: num(d.ratePerExcessLiter),
    freeLitersMonthly: d.freeLitersMonthly != null ? num(d.freeLitersMonthly) : DEFAULT_SETTINGS.freeLitersMonthly,
    tieredRatePerLiter: d.tieredRatePerLiter != null ? num(d.tieredRatePerLiter) : DEFAULT_SETTINGS.tieredRatePerLiter,
    readingFrequency: str(d.readingFrequency) || "monthly",
    decimalPrecision: d.decimalPrecision != null ? num(d.decimalPrecision) : 0,
    roundingRule: str(d.roundingRule) || "none",
    sendBillMessage: bool(d.sendBillMessage),
    sendReminder: bool(d.sendReminder),
    unit: str(d.unit),
    waterSource: str(d.waterSource),
  };
}

/**
 * Two billing methods, chosen via settings.billingMethod:
 * - "flat": absolute exclude baseline (freeLiters), every liter above it billed at ratePerExcessLiter.
 *   No monthly free allowance — the baseline only matters on a flat's first-ever reading.
 * - "tiered": a free allowance per billing period (freeLitersMonthly); only usage above it is
 *   billed, at tieredRatePerLiter.
 */
export function computeBill(settings, previous, current) {
  const tiered = settings?.billingMethod === "tiered";
  const usage = Math.max(0, current - previous);

  let billable, rate;
  if (tiered) {
    const freeAllowance = Number(settings?.freeLitersMonthly) || 0;
    rate = Number(settings?.tieredRatePerLiter) || 0;
    billable = Math.max(0, usage - freeAllowance);
  } else {
    const baseline = Number(settings?.freeLiters) || 0;
    rate = Number(settings?.ratePerExcessLiter) || 0;
    billable = Math.max(0, Math.max(current, baseline) - Math.max(previous, baseline));
  }

  const raw = billable * rate;
  let amount;
  switch ((settings?.roundingRule || "").toLowerCase()) {
    case "up":
    case "ceil":
      amount = Math.ceil(raw);
      break;
    case "down":
    case "floor":
      amount = Math.floor(raw);
      break;
    case "none":
    case "off":
    case "":
      amount = raw;
      break;
    default:
      amount = Math.round(raw);
  }
  return { usage, excess: billable, amount };
}

/** Resolves the rate/limit fields that actually apply under the active billing method. */
export function billingRateInfo(settings) {
  const tiered = settings?.billingMethod === "tiered";
  return {
    tiered,
    rate: tiered ? Number(settings?.tieredRatePerLiter) || 0 : Number(settings?.ratePerExcessLiter) || 0,
    limit: tiered ? Number(settings?.freeLitersMonthly) || 0 : Number(settings?.freeLiters) || 0,
    limitLabel: tiered ? "Free Allowance (Monthly)" : "Exclude Limit (≤)",
  };
}

/** Lookup keyed by BOTH doc id and flatNo so any flatId form resolves. */
export function flatLookup(flats) {
  const map = {};
  flats.forEach((f) => {
    if (f.flatNo) map[f.flatNo] = f;
  });
  flats.forEach((f) => {
    if (f.id) map[f.id] = f;
  });
  return map;
}
