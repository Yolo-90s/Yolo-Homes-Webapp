import PageTitle from "../components/PageTitle";
import { SectionTitle, StatCard, DropIcon } from "../components/ui";
import { BarChart, LineChart } from "../components/Charts";
import { useReceipts, useReadings, useSettings } from "../data/hooks";
import { currency, liters, monthLabel, recentPeriods, periodKey } from "../lib/format";

export default function Reports() {
  const { receipts } = useReceipts();
  const { readings } = useReadings();
  const settings = useSettings();
  const periods = recentPeriods(12);

  const maint = periods.map((p) => ({
    label: monthLabel(p).slice(0, 3),
    value: receipts.filter((r) => r.period === p).reduce((s, r) => s + r.amount, 0),
  }));
  const water = periods.map((p) => ({
    label: monthLabel(p).slice(0, 3),
    value: readings.filter((r) => periodKey(new Date(r.date)) === p).reduce((s, r) => s + r.amount, 0),
  }));
  const totalMaint = receipts.reduce((s, r) => s + r.amount, 0);
  const totalWater = readings.reduce((s, r) => s + r.amount, 0);
  const totalCons = readings.reduce((s, r) => s + r.usageLiters, 0);

  return (
    <div>
      <PageTitle title="Reports" actions={<button onClick={() => window.print()} className="btn-ghost">Print / PDF</button>} />
      <div className="space-y-4">
        <SectionTitle>Overview (12 months)</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Maintenance" value={currency(totalMaint, settings.currency)} accent="#2563EB" icon={<DropIcon className="w-5 h-5" />} />
          <StatCard label="Water Revenue" value={currency(totalWater, settings.currency)} accent="#0EA5E9" icon={<DropIcon className="w-5 h-5" />} />
          <StatCard label="Total Consumption" value={liters(totalCons)} accent="#22C55E" icon={<DropIcon className="w-5 h-5" />} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <SectionTitle>Maintenance Collection</SectionTitle>
            <div className="card p-4">
              {maint.every((m) => m.value === 0) ? <p className="text-sm text-muted">No data yet.</p> : <BarChart entries={maint} color="#2563EB" />}
            </div>
          </div>
          <div>
            <SectionTitle>Water Revenue</SectionTitle>
            <div className="card p-4">
              {water.every((m) => m.value === 0) ? <p className="text-sm text-muted">No data yet.</p> : <LineChart entries={water} color="#0EA5E9" />}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <p className="text-sm text-muted">Grand Total Revenue</p>
          <p className="text-2xl font-extrabold">{currency(totalMaint + totalWater, settings.currency)}</p>
        </div>
      </div>
    </div>
  );
}
