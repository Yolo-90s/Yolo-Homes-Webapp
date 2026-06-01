import PageTitle from "../components/PageTitle";
import { Avatar } from "../components/ui";
import { DetailRow } from "../components/DetailRow";
import { useAuth } from "../context/AuthContext";
import { roleLabel } from "../lib/roles";
import { shortDate } from "../lib/format";

export default function Profile() {
  const { session, signOut } = useAuth();
  const u = session.user;
  return (
    <div className="max-w-2xl">
      <PageTitle title="Profile" />
      <div className="space-y-4">
        <div className="card p-4 flex items-center gap-4">
          <Avatar initials={u.initials} color={u.avatarColor} size={64} />
          <div className="min-w-0">
            <p className="text-lg font-bold truncate">{u.displayName}</p>
            <p className="text-sm text-muted truncate">{u.email}</p>
            <p className="text-sm text-brand font-medium">{roleLabel(session.role)}</p>
          </div>
        </div>

        <div className="card p-4">
          <DetailRow label="Role" value={roleLabel(session.role)} />
          <DetailRow label="Joined" value={shortDate(u.createdAt)} />
        </div>

        <div className="card p-4">
          <p className="section-title">About App</p>
          <p className="text-sm text-muted">Yolo-Home's — Smart Apartment Management</p>
          <p className="text-sm text-muted">Version 1.0</p>
        </div>

        <button onClick={signOut} className="btn-ghost w-full text-danger border-danger/30">
          Logout
        </button>
      </div>
    </div>
  );
}
