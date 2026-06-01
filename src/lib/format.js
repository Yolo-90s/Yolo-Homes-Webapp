// Formatting + period helpers, mirroring the Android Formatters object.

export function currency(amount, symbol = "₹") {
  const n = Number(amount) || 0;
  return `${symbol}${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function currencyPrecise(amount, symbol = "₹", decimals = 2) {
  const n = Number(amount) || 0;
  return `${symbol}${n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function liters(value) {
  const n = Number(value) || 0;
  return `${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })} L`;
}

function pad2(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

/** "yyyy-MM" for a Date (default now). */
export function periodKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** "yyyy-MM" from epoch millis (0 → empty). */
export function periodKeyFromMillis(millis) {
  if (!millis) return periodKey(new Date(0));
  return periodKey(new Date(millis));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthLabel(period) {
  if (!period || !period.includes("-")) return period || "";
  const [y, m] = period.split("-");
  const idx = parseInt(m, 10) - 1;
  if (idx < 0 || idx > 11) return period;
  return `${MONTHS[idx]} ${y}`;
}

export function shortDate(millis) {
  if (!millis) return "—";
  const d = new Date(millis);
  if (isNaN(d.getTime())) return "—";
  return `${pad2(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Last `count` period keys ending with the current month, oldest first. */
export function recentPeriods(count) {
  const out = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(periodKey(d));
  }
  return out;
}

export function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
