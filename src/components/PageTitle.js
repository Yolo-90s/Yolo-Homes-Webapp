import { useNavigate } from "react-router-dom";

/** Web-style content header: optional back button, title, and right-aligned actions. */
export default function PageTitle({ title, subtitle, back, actions }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 mb-6">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-lg border border-line hover:bg-white flex items-center justify-center shrink-0"
          aria-label="Back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold truncate">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function AddButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-brand text-white px-4 py-2.5 text-sm font-semibold hover:bg-brand-dark transition flex items-center gap-1.5"
    >
      <span className="text-lg leading-none">+</span>
      {children}
    </button>
  );
}
