import { useMemo, useState } from "react";
import PageTitle from "../../components/PageTitle";
import { EmptyState } from "../../components/ui";
import { useReadings, useFlats, useSettings } from "../../data/hooks";
import { currency, liters, monthLabel, recentPeriods, periodKey } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";

export default function FlatConsumption() {
  const { session, isResident } = useAuth();
  const { readings } = useReadings();
  const { flats } = useFlats();
  const settings = useSettings();
  const periods = useMemo(() => recentPeriods(12).reverse(), []);
  const [period, setPeriod] = useState(periods[0]);

  const flatList = isResident && session?.flatId ? flats.filter((f) => f.id === session.flatId) : flats;
  const monthReadings = readings.filter((r) => periodKey(new Date(r.date)) === period);
  const byFlat = monthReadings.reduce((acc, r) => {
    (acc[r.flatId] = acc[r.flatId] || []).push(r);
    return acc;
  }, {});

  const rows = flatList
    .map((flat) => {
      const list = byFlat[flat.id] || byFlat[flat.flatNo] || [];
      return {
        flat,
        liters: list.reduce((s, r) => s + r.usageLiters, 0),
        amount: list.reduce((s, r) => s + r.amount, 0),
        hasReading: list.length > 0,
      };
    })
    .sort((a, b) => b.liters - a.liters);

  const maxL = Math.max(0, ...rows.map((r) => r.liters));
  const totalL = rows.reduce((s, r) => s + r.liters, 0);
  const totalRev = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <PageTitle title="Flat-wise Consumption" back />
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border ${
                p === period ? "bg-sky2 text-white border-sky2" : "border-line text-muted"
              }`}
            >
              {monthLabel(p)}
            </button>
          ))}
        </div>

        <div className="flex justify-between px-1">
          <div>
            <p className="text-[11px] text-muted">Total Consumption</p>
            <p className="font-semibold">{liters(totalL)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-muted">Revenue</p>
            <p className="font-semibold text-brand">{currency(totalRev, settings.currency)}</p>
          </div>
        </div>

        {flatList.length === 0 ? (
          <EmptyState title="No Flats Found" message="No flats to show consumption for." />
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={row.flat.id} className="card p-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-sky2/10 text-sky2 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">Flat {row.flat.displayName}</p>
                    <p className="text-xs text-muted truncate">{row.flat.occupantName || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${row.hasReading ? "" : "text-muted"}`}>
                      {row.hasReading ? liters(row.liters) : "No reading"}
                    </p>
                    {row.hasReading && <p className="text-xs text-sky2">{currency(row.amount, settings.currency)}</p>}
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-canvas overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: maxL > 0 ? `${Math.min(100, (row.liters / maxL) * 100)}%` : "0%",
                      background: "linear-gradient(90deg,#0EA5E9,#14B8A6)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
