import { useState } from "react";
import PageTitle from "../components/PageTitle";
import { Spinner } from "../components/ui";
import { useMasterFlats } from "../data/hooks";
import { updateResident } from "../data/repo";
import { Role, roleFrom, roleLabel } from "../lib/roles";

const ROLE_OPTIONS = [Role.DEVELOPER, Role.ADMIN, Role.OWNER, Role.TENANT];

export default function ManageResidents() {
  const { flats } = useMasterFlats();
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  return (
    <div>
      <PageTitle title="Manage Residents" back />
      <div className="space-y-2">
        <p className="text-sm text-muted pb-1">
          Link each resident's Google sign-in email to their flat and set their role. They'll get that access on next
          login.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
        {flats.map((f) => (
          <button key={f.id} onClick={() => setEditing(f)} className="card w-full p-3.5 flex items-center gap-3 text-left">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Flat {f.flatNo}</p>
              <p className="text-xs text-muted truncate">{f.occupantName || "—"}</p>
              <p className={`text-xs truncate ${f.email ? "text-brand" : "text-danger"}`}>
                {f.email || "No email linked"}
              </p>
            </div>
            <span className="chip">{roleLabel(roleFrom(f.role))}</span>
          </button>
        ))}
        </div>
      </div>

      {editing && (
        <EditDialog
          flat={editing}
          onClose={() => setEditing(null)}
          onSaved={(flatNo) => {
            setEditing(null);
            setToast(`Flat ${flatNo} updated`);
            setTimeout(() => setToast(null), 2500);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white text-sm px-4 py-2 rounded-xl shadow-soft">
          {toast}
        </div>
      )}
    </div>
  );
}

function EditDialog({ flat, onClose, onSaved }) {
  const [email, setEmail] = useState(flat.email || "");
  const [role, setRole] = useState(() => {
    const r = roleFrom(flat.role);
    return r === Role.UNKNOWN ? Role.OWNER : r;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateResident(flat.flatNo, email.trim(), role);
      onSaved(flat.flatNo);
    } catch (e) {
      setError(e?.message || "Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-20 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <p className="font-semibold">
          Flat {flat.flatNo} • {flat.occupantName || "Resident"}
        </p>
        <label className="block">
          <span className="text-xs font-medium text-muted mb-1 block">Google email</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="resident@gmail.com" />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted mb-1 block">Role</span>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[11px] text-muted">
          Developer & Admin can capture data and edit settings. Owner & Tenant are read-only, scoped to their own flat.
        </p>
        {error && <p className="text-danger text-sm">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="rounded-xl bg-brand text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 disabled:opacity-50" disabled={saving || !email.trim()} onClick={save}>
            {saving && <Spinner />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
