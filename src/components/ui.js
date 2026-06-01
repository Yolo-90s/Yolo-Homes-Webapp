// Small shared UI primitives.

export function Avatar({ initials, color = "#2563EB", size = 40 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials || "?"}
    </div>
  );
}

export function StatCard({ label, value, accent = "#2563EB", icon }) {
  return (
    <div className="stat-card flex-1 min-w-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      <div className="text-xl font-extrabold truncate">{value}</div>
      <div className="text-xs text-muted truncate">{label}</div>
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mt-1 mb-1">
      <h2 className="section-title">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, message, icon }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      <div className="w-20 h-20 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-3">
        {icon || <DropIcon />}
      </div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted mt-1">{message}</p>
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" width="20" height="20">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// A couple of inline icons used as fallbacks
export function DropIcon({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  );
}

export function ReceiptIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2h12a1 1 0 0 1 1 1v18l-3-2-3 2-3-2-3 2-2-1.3V3a1 1 0 0 1 1-1zm2 5h8v2H8V7zm0 4h8v2H8v-2z" />
    </svg>
  );
}
