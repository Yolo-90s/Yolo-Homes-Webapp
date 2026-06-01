import { useNavigate } from "react-router-dom";
import { useReceipts, useFlats, useSettings } from "../../data/hooks";
import { flatLookup } from "../../lib/firestore";
import { currency, monthLabel, recentPeriods, periodKey } from "../../lib/format";
import { BarChart } from "../../components/Charts";
import { EmptyState, ReceiptIcon } from "../../components/ui";
import PageTitle, { AddButton } from "../../components/PageTitle";
import { useAuth } from "../../context/AuthContext";

export default function Maintenance() {
  const navigate = useNavigate();
  const { session, isAdmin, isResident } = useAuth();
  const { receipts } = useReceipts();
  const { flats } = useFlats();
  const settings = useSettings();

  const scoped =
    isResident && session?.flatId ? receipts.filter((r) => r.flatId === session.flatId) : receipts;
  const byId = flatLookup(flats);
  const cur = periodKey();
  const monthTotal = scoped.filter((r) => r.period === cur).reduce((s, r) => s + r.amount, 0);
  const trend = recentPeriods(6).map((p) => ({
    label: monthLabel(p).slice(0, 3),
    value: scoped.filter((r) => r.period === p).reduce((s, r) => s + r.amount, 0),
  }));

  return (
    <div>
      <PageTitle
        title="Maintenance"
        actions={isAdmin && <AddButton onClick={() => navigate("/maintenance/add")}>Add Receipt</AddButton>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl p-5 text-white md:col-span-1" style={{ background: "linear-gradient(135deg,#2563EB,#22C55E)" }}>
          <p className="text-xs opacity-90">Current Month Collection</p>
          <p className="text-3xl font-extrabold">{currency(monthTotal, settings.currency)}</p>
          <p className="text-xs opacity-90">{scoped.length} total receipts</p>
        </div>
        <div className="card p-4 md:col-span-2">
          <p className="section-title mb-2">Collection Trend (6 months)</p>
          {trend.every((t) => t.value === 0) ? (
            <p className="text-sm text-muted">No collection data yet.</p>
          ) : (
            <BarChart entries={trend} color="#2563EB" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-7 mb-3">
        <h2 className="section-title">Recent Receipts</h2>
        <button onClick={() => navigate("/maintenance/history")} className="text-sm text-brand font-medium">
          View all
        </button>
      </div>

      {scoped.length === 0 ? (
        <EmptyState title="No Receipts Found" message="Use Add Receipt to record a payment." icon={<ReceiptIcon className="w-8 h-8" />} />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {scoped.slice(0, 12).map((r) => {
            const flat = byId[r.flatId];
            return (
              <button
                key={r.id}
                onClick={() => navigate(`/maintenance/receipt/${r.id}`)}
                className="card hover:shadow-soft transition w-full p-4 flex items-center gap-3 text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                  <ReceiptIcon />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm">
                    Flat {flat?.displayName || r.flatId}
                    {flat?.ownerName ? <span className="text-muted font-normal"> • {flat.ownerName}</span> : null}
                  </span>
                  <span className="block text-xs text-muted">
                    {monthLabel(r.period)} · {r.paymentMethod}
                  </span>
                </span>
                <span className="font-bold text-success">{currency(r.amount, settings.currency)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
