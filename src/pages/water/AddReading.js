import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { Spinner } from "../../components/ui";
import { DetailRow } from "../../components/DetailRow";
import { useFlats, useSettings } from "../../data/hooks";
import { addReading, latestReadingForFlat } from "../../data/repo";
import { computeBill } from "../../lib/firestore";
import { liters, currency, currencyPrecise } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";

export default function AddReading() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { flats } = useFlats();
  const settings = useSettings();

  const [flatId, setFlatId] = useState("");
  const [previous, setPrevious] = useState(0);
  const [current, setCurrent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function onPickFlat(id) {
    setFlatId(id);
    setCurrent("");
    if (!id) return setPrevious(0);
    const latest = await latestReadingForFlat(id);
    setPrevious(latest?.currentReading || 0);
  }

  const cur = parseFloat(current) || 0;
  const bill = computeBill(settings, previous, cur);
  const valid = flatId && current !== "" && cur >= previous;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await addReading({
        flatId,
        previousReading: previous,
        currentReading: cur,
        usageLiters: bill.usage,
        excessLiters: bill.excess,
        amount: bill.amount,
        capturedBy: session?.user?.displayName || "",
      });
      navigate(-1);
    } catch (e) {
      setError(e?.message || "Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <PageTitle title="Add Reading" back />
      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-muted mb-1 block">Select Flat</span>
          <select className="input" value={flatId} onChange={(e) => onPickFlat(e.target.value)}>
            <option value="">Choose a flat…</option>
            {flats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.displayName} — {f.occupantName}
              </option>
            ))}
          </select>
        </label>

        {flatId && (
          <>
            <label className="block">
              <span className="text-xs font-medium text-muted mb-1 block">Previous Reading</span>
              <input className="input bg-canvas" value={liters(previous)} readOnly />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted mb-1 block">Current Reading</span>
              <input
                className="input"
                inputMode="decimal"
                value={current}
                onChange={(e) => setCurrent(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="Enter meter reading"
              />
            </label>

            <div className="card p-4">
              <p className="section-title mb-1">Live Calculation</p>
              <DetailRow label="Usage" value={liters(bill.usage)} />
              <DetailRow label="Exclude Limit (≤)" value={liters(settings.freeLiters)} />
              <DetailRow label="Billable Usage" value={liters(bill.excess)} />
              <DetailRow label="Rate / Liter" value={currencyPrecise(settings.ratePerExcessLiter, settings.currency)} />
              <DetailRow label="Amount" value={currency(bill.amount, settings.currency)} emphasize />
            </div>
          </>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary flex items-center justify-center" disabled={saving || !valid} onClick={save}>
          {saving ? <Spinner /> : "Save Reading"}
        </button>
      </div>
    </div>
  );
}
