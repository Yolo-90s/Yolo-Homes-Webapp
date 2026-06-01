import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { Spinner } from "../../components/ui";
import { useFlats, useSettings } from "../../data/hooks";
import { addReceipt } from "../../data/repo";
import { PAYMENT_METHODS } from "../../lib/constants";
import { recentPeriods, monthLabel, currency } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";

export default function AddMaintenance() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { flats } = useFlats();
  const settings = useSettings();
  const periods = useMemo(() => recentPeriods(12).reverse(), []);

  const [flatId, setFlatId] = useState("");
  const [period, setPeriod] = useState(periods[0]);
  const [amount, setAmount] = useState(String(settings.monthlyFee || ""));
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const selectedFlat = flats.find((f) => f.id === flatId);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await addReceipt({
        flatId,
        amount: parseFloat(amount) || 0,
        period,
        paymentMethod: method,
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
      <PageTitle title="Add Maintenance" back />
      <div className="space-y-4">
        <Field label="Select Flat">
          <select className="input" value={flatId} onChange={(e) => setFlatId(e.target.value)}>
            <option value="">Choose a flat…</option>
            {flats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.displayName} — {f.ownerName || f.occupantName}
              </option>
            ))}
          </select>
        </Field>

        {selectedFlat && (
          <div className="card p-4">
            <p className="text-xs text-muted">Owner</p>
            <p className="font-semibold">{selectedFlat.ownerName || "—"}</p>
            <p className="text-xs text-muted">{selectedFlat.ownerPhone || ""}</p>
          </div>
        )}

        <Field label="Period">
          <select className="input" value={period} onChange={(e) => setPeriod(e.target.value)}>
            {periods.map((p) => (
              <option key={p} value={p}>
                {monthLabel(p)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Amount (${settings.currency})`}>
          <input
            className="input"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="1500"
          />
        </Field>

        <Field label="Payment Method">
          <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m.toUpperCase()}
              </option>
            ))}
          </select>
        </Field>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          className="btn-primary flex items-center justify-center"
          disabled={saving || !flatId || !(parseFloat(amount) > 0)}
          onClick={save}
        >
          {saving ? <Spinner /> : `Save Receipt · ${currency(parseFloat(amount) || 0, settings.currency)}`}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted mb-1 block">{label}</span>
      {children}
    </label>
  );
}
