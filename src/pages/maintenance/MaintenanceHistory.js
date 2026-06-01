import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { EmptyState, ReceiptIcon } from "../../components/ui";
import { useReceipts, useFlats, useSettings } from "../../data/hooks";
import { flatLookup } from "../../lib/firestore";
import { currency, monthLabel } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";

export default function MaintenanceHistory() {
  const navigate = useNavigate();
  const { session, isResident } = useAuth();
  const { receipts } = useReceipts();
  const { flats } = useFlats();
  const settings = useSettings();
  const byId = flatLookup(flats);

  const [q, setQ] = useState("");
  const [sortAmount, setSortAmount] = useState(false);
  const [periodFilter, setPeriodFilter] = useState("");

  const base = isResident && session?.flatId ? receipts.filter((r) => r.flatId === session.flatId) : receipts;
  const periods = useMemo(() => [...new Set(base.map((r) => r.period))].sort().reverse(), [base]);

  let list = base.filter((r) => (periodFilter ? r.period === periodFilter : true));
  if (q.trim()) {
    const t = q.toLowerCase();
    list = list.filter((r) => {
      const f = byId[r.flatId];
      return [f?.displayName, f?.ownerName, f?.tenantName, r.period, r.paymentMethod]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(t);
    });
  }
  list = sortAmount ? [...list].sort((a, b) => b.amount - a.amount) : list;

  return (
    <div>
      <PageTitle title="Maintenance History" back />
      <div className="space-y-3">
        <input className="input" placeholder="Search flat, owner, period…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Chip active={!sortAmount} onClick={() => setSortAmount(false)}>Newest</Chip>
          <Chip active={sortAmount} onClick={() => setSortAmount(true)}>Amount</Chip>
          <Chip active={periodFilter === ""} onClick={() => setPeriodFilter("")}>All months</Chip>
          {periods.map((p) => (
            <Chip key={p} active={periodFilter === p} onClick={() => setPeriodFilter(periodFilter === p ? "" : p)}>
              {monthLabel(p)}
            </Chip>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState title="No Receipts Found" message="Try a different search or filter." icon={<ReceiptIcon className="w-8 h-8" />} />
        ) : (
          <div className="space-y-2">
            {list.map((r) => {
              const flat = byId[r.flatId];
              return (
                <button key={r.id} onClick={() => navigate(`/maintenance/receipt/${r.id}`)} className="card w-full p-3.5 flex items-center justify-between text-left">
                  <span>
                    <span className="block font-semibold text-sm">Flat {flat?.displayName || r.flatId}</span>
                    <span className="block text-xs text-muted">{monthLabel(r.period)} · {r.paymentMethod}</span>
                  </span>
                  <span className="font-bold text-brand">{currency(r.amount, settings.currency)}</span>
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
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border ${
        active ? "bg-brand text-white border-brand" : "border-line text-muted"
      }`}
    >
      {children}
    </button>
  );
}
