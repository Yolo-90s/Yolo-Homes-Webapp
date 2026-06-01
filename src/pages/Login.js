import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui";

export default function Login() {
  const { signIn, signingIn, error } = useAuth();
  return (
    <div className="min-h-full flex flex-col items-center justify-between px-7 py-12 bg-canvas">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-3xl bg-brand flex items-center justify-center shadow-soft">
          <svg className="w-11 h-11 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-2zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 8H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z" />
          </svg>
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">Yolo-Home's</h1>
        <p className="text-muted mt-1">Smart Apartment Management</p>
      </div>

      <div className="w-full max-w-sm">
        {error && <p className="text-danger text-sm text-center mb-3">{error}</p>}
        <button onClick={signIn} disabled={signingIn} className="btn-primary flex items-center justify-center gap-2 bg-white !text-ink border border-line hover:!bg-canvas">
          {signingIn ? (
            <Spinner className="text-brand" />
          ) : (
            <>
              <GoogleG />
              <span>Continue with Google</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-muted text-center mt-4">
          By continuing you agree to the apartment's data policy.
        </p>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c2.8 0 5.4 1.1 7.3 2.8l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 34.9 26.7 35 24 35c-5.3 0-9.6-2.6-11.3-7l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C39.9 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
