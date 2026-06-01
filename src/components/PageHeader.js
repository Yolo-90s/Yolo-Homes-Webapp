import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, right }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-line px-2 h-14 flex items-center gap-1">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full hover:bg-canvas flex items-center justify-center"
        aria-label="Back"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold flex-1 truncate">{title}</h1>
      {right}
    </header>
  );
}
