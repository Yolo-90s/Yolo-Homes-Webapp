import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";
import { roleLabel } from "../lib/roles";

function Icon({ path }) {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  maintenance: "M6 2h12a1 1 0 0 1 1 1v18l-3-2-3 2-3-2-3 2-2-1.3V3a1 1 0 0 1 1-1zm2 5h8v2H8V7zm0 4h8v2H8v-2z",
  water: "M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z",
  reports: "M4 20h16v-2H4v2zM6 16h3V8H6v8zm5 0h3V4h-3v12zm5 0h3v-6h-3v6z",
  settings:
    "M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.5-2.4 1a7.6 7.6 0 0 0-1.7-1L14 3h-4l-.3 2.5a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.5L3.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.5 2.4-1c.5.4 1.1.7 1.7 1L10 21h4l.3-2.5c.6-.3 1.2-.6 1.7-1l2.4 1 2-3.5-2-1.5zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
  people:
    "M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  logout: "M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z",
};

export default function Layout() {
  const { session, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
      isActive ? "bg-brand text-white" : "text-slate-600 hover:bg-canvas"
    }`;

  const SidebarBody = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-2 py-1 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center">
          <Icon path="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-2z" />
        </div>
        <div>
          <p className="font-bold leading-tight">Yolo-Home's</p>
          <p className="text-[11px] text-muted leading-tight">Apartment Manager</p>
        </div>
      </div>

      <nav className="space-y-1" onClick={() => setOpen(false)}>
        <NavLink to="/" end className={navItem}>
          <Icon path={ICONS.maintenance} /> Maintenance
        </NavLink>
        <NavLink to="/water" className={navItem}>
          <Icon path={ICONS.water} /> Water
        </NavLink>
        <NavLink to="/reports" className={navItem}>
          <Icon path={ICONS.reports} /> Reports
        </NavLink>
        {isAdmin && (
          <>
            <p className="text-[11px] uppercase tracking-wide text-muted px-3 pt-4 pb-1">Admin</p>
            <NavLink to="/settings" className={navItem}>
              <Icon path={ICONS.settings} /> Settings
            </NavLink>
            <NavLink to="/settings/residents" className={navItem}>
              <Icon path={ICONS.people} /> Manage Residents
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto pt-4">
        <button
          onClick={() => {
            setOpen(false);
            navigate("/profile");
          }}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-canvas text-left"
        >
          <Avatar initials={session.user.initials} color={session.user.avatarColor} size={36} />
          <span className="min-w-0">
            <span className="block text-sm font-semibold truncate">{session.user.displayName}</span>
            <span className="block text-[11px] text-muted">{roleLabel(session.role)}</span>
          </span>
        </button>
        <button onClick={signOut} className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-danger hover:bg-danger/5">
          <Icon path={ICONS.logout} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-canvas">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-white border-r border-line p-4">
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-white border-r border-line p-4">{SidebarBody}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-line h-14 flex items-center gap-2 px-3">
          <button onClick={() => setOpen(true)} className="w-10 h-10 rounded-lg hover:bg-canvas flex items-center justify-center" aria-label="Menu">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-bold">Yolo-Home's</span>
          <button onClick={() => navigate("/profile")} className="ml-auto" aria-label="Profile">
            <Avatar initials={session.user.initials} color={session.user.avatarColor} size={32} />
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
