import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { EmptyState } from "../../components/ui";
import { useReadings, useFlats, useSettings } from "../../data/hooks";
import { flatLookup } from "../../lib/firestore";
import { currency, liters, shortDate } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";

export default function WaterHistory() {
  const navigate = useNavigate();
  const { session, isResident } = useAuth();
  const { readings } = useReadings();
  const { flats } = useFlats();
  const settings = useSettings();
  const byId = flatLookup(flats);

  const [q, setQ] = useState("");
  const [sortUsage, setSortUsage] = useState(false);

  let list = isResident && session?.flatId ? readings.filter((r) => r.flatId === session.flatId) : readings;
  if (q.trim()) {
    const t = q.toLowerCase();
    list = list.filter((r) => {
      const f = byId[r.flatId];
      return [f?.displayName, f?.ownerName, f?.tenantName].filter(Boolean).join(" ").toLowerCase().includes(t);
    });
  }
  if (sortUsage) list = [...list].sort((a, b) => b.usageLiters - a.usageLiters);

  return (
    <div>
      <PageTitle title="Reading History" back />
      <div className="space-y-3">
        <input className="input" placeholder="Search flat or owner…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2">
          <Chip active={!sortUsage} onClick={() => setSortUsage(false)}>Newest</Chip>
          <Chip active={sortUsage} onClick={() => setSortUsage(true)}>Highest usage</Chip>
        </div>
        {list.length === 0 ? (
          <EmptyState title="No Readings Available" message="Try a different search." />
        ) : (
          <div className="space-y-2">
            {list.map((r) => {
              const flat = byId[r.flatId];
              return (
                <button key={r.id} onClick={() => navigate(`/water/bill/${r.id}`)} className="card w-full p-3.5 flex items-center justify-between text-left">
                  <span className="min-w-0">
                    <span className="block font-semibold text-sm">Flat {flat?.displayName || r.flatId}</span>
                    <span className="block text-xs text-muted">
                      {liters(r.usageLiters)} · billable {liters(r.excessLiters)} · {shortDate(r.date)}
                    </span>
                  </span>
                  <span className="font-bold text-sky2">{currency(r.amount, settings.currency)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border ${active ? "bg-brand text-white border-brand" : "border-line text-muted"}`}>
      {children}
    </button>
  );
}
