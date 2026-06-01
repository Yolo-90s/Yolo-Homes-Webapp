import { useNavigate } from "react-router-dom";
import { useReadings, useFlats, useSettings } from "../../data/hooks";
import { flatLookup } from "../../lib/firestore";
import { currency, liters, monthLabel, recentPeriods, periodKey, shortDate } from "../../lib/format";
import { LineChart, BarChart } from "../../components/Charts";
import { EmptyState, StatCard, DropIcon } from "../../components/ui";
import PageTitle, { AddButton } from "../../components/PageTitle";
import { useAuth } from "../../context/AuthContext";

export default function Water() {
  const navigate = useNavigate();
  const { session, isAdmin, isResident } = useAuth();
  const { readings } = useReadings();
  const { flats } = useFlats();
  const settings = useSettings();

  const scoped =
    isResident && session?.flatId ? readings.filter((r) => r.flatId === session.flatId) : readings;
  const byId = flatLookup(flats);
  const cur = periodKey();
  const monthReadings = scoped.filter((r) => periodKey(new Date(r.date)) === cur);
  const totalConsumption = monthReadings.reduce((s, r) => s + r.usageLiters, 0);
  const revenue = monthReadings.reduce((s, r) => s + r.amount, 0);

  const perFlat = Object.values(
    monthReadings.reduce((acc, r) => {
      acc[r.flatId] = (acc[r.flatId] || 0) + r.usageLiters;
      return acc;
    }, {})
  );
  const highest = perFlat.length ? Math.max(...perFlat) : 0;
  const lowest = perFlat.length ? Math.min(...perFlat) : 0;

  const trend = recentPeriods(6).map((p) => ({
    label: monthLabel(p).slice(0, 3),
    value: scoped.filter((r) => periodKey(new Date(r.date)) === p).reduce((s, r) => s + r.usageLiters, 0),
  }));

  const topConsumers = monthReadings.reduce((acc, r) => {
    const flat = byId[r.flatId];
    const key = flat?.flatNo || r.flatId;
    acc[key] = (acc[key] || 0) + r.usageLiters;
    return acc;
  }, {});
  const topEntries = Object.entries(topConsumers)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div>
      <PageTitle
        title="Water"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/water/report")}
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold hover:bg-white transition"
            >
              All Flats Report
            </button>
            {isAdmin && <AddButton onClick={() => navigate("/water/add")}>Add Reading</AddButton>}
          </div>
        }
      />

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Consumption" value={liters(totalConsumption)} accent="#0EA5E9" icon={<DropIcon className="w-5 h-5" />} />
        <StatCard label="Revenue" value={currency(revenue, settings.currency)} accent="#22C55E" icon={<DropIcon className="w-5 h-5" />} />
        <StatCard label="Highest" value={liters(highest)} accent="#F59E0B" icon={<DropIcon className="w-5 h-5" />} />
        <StatCard label="Lowest" value={liters(lowest)} accent="#22C55E" icon={<DropIcon className="w-5 h-5" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div className="card p-4">
          <p className="section-title mb-2">Monthly Trend</p>
          {trend.every((t) => t.value === 0) ? (
            <p className="text-sm text-muted">No consumption data yet.</p>
          ) : (
            <LineChart entries={trend} color="#0EA5E9" />
          )}
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="section-title">Top Consumers</p>
            <button onClick={() => navigate("/water/consumption")} className="text-sm text-brand font-medium">
              Flat-wise →
            </button>
          </div>
          {topEntries.length === 0 ? (
            <p className="text-sm text-muted">No readings this month yet.</p>
          ) : (
            <BarChart entries={topEntries} color="#0EA5E9" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-7 mb-3">
        <h2 className="section-title">Recent Readings</h2>
        <button onClick={() => navigate("/water/history")} className="text-sm text-brand font-medium">
          View all
        </button>
      </div>

      {scoped.length === 0 ? (
        <EmptyState title="No Readings Available" message="Add a meter reading to start tracking." />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {scoped.slice(0, 12).map((r) => {
            const flat = byId[r.flatId];
            return (
              <button
                key={r.id}
                onClick={() => navigate(`/water/bill/${r.id}`)}
                className="card hover:shadow-soft transition w-full p-4 flex items-center gap-3 text-left"
              >
                <span className="w-11 h-11 rounded-xl text-white flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0EA5E9,#14B8A6)" }}>
                  <DropIcon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm">
                    Flat {flat?.displayName || r.flatId}
                    {flat?.occupantName ? <span className="text-muted font-normal"> • {flat.occupantName}</span> : null}
                  </span>
                  <span className="block text-xs text-muted">
                    Used {liters(r.usageLiters)} · billable {liters(r.excessLiters)} · {shortDate(r.date)}
                  </span>
                </span>
                <span className="font-bold text-sky2">{currency(r.amount, settings.currency)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
