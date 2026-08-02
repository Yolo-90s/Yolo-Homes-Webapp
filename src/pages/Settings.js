import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import { SectionTitle, Spinner } from "../components/ui";
import { useSettings } from "../data/hooks";
import { updateSettings } from "../data/repo";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const live = useSettings();

  const [form, setForm] = useState(live);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => setForm(live), [live]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateSettings({
        ...form,
        freeLiters: parseFloat(form.freeLiters) || 0,
        ratePerExcessLiter: parseFloat(form.ratePerExcessLiter) || 0,
        freeLitersMonthly: parseFloat(form.freeLitersMonthly) || 0,
        tieredRatePerLiter: parseFloat(form.tieredRatePerLiter) || 0,
      });
      navigate(-1);
    } catch (e) {
      setError(e?.message || "Save failed");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageTitle title="Settings" />
      <div className="space-y-4">
        {!isAdmin && (
          <div className="card p-4 text-sm text-muted">Only administrators can edit apartment settings.</div>
        )}

        {isAdmin && (
          <>
            <SectionTitle>Access</SectionTitle>
            <button onClick={() => navigate("/settings/residents")} className="card w-full p-4 flex items-center gap-3 text-left">
              <span className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-sm">Manage Residents</span>
                <span className="block text-xs text-muted">Link emails & assign roles per flat</span>
              </span>
              <span className="text-muted">›</span>
            </button>
          </>
        )}

        <SectionTitle>Water Billing</SectionTitle>
        <Field label="Billing Method">
          <select className="input" disabled={!isAdmin} value={form.billingMethod || "flat"}
            onChange={(e) => set("billingMethod", e.target.value)}>
            <option value="flat">Flat Rate (per liter)</option>
            <option value="tiered">Tiered (Free Allowance + Excess Rate)</option>
          </select>
        </Field>

        {(form.billingMethod || "flat") === "flat" ? (
          <>
            <Field label={`Rate per Liter (${form.currency || "₹"})`}>
              <input className="input" disabled={!isAdmin} inputMode="decimal" value={form.ratePerExcessLiter}
                onChange={(e) => set("ratePerExcessLiter", e.target.value.replace(/[^0-9.]/g, ""))} />
            </Field>
            <Field label="Free / Exclude Limit (L)">
              <input className="input" disabled={!isAdmin} inputMode="decimal" value={form.freeLiters}
                onChange={(e) => set("freeLiters", e.target.value.replace(/[^0-9.]/g, ""))} />
            </Field>
            <p className="text-xs text-muted">
              Water meters ship showing ~100+ L. The first {form.freeLiters || 200} L are excluded — billing counts only
              liters above this baseline, charged at the rate per liter.
            </p>
          </>
        ) : (
          <>
            <Field label="Free Allowance per Month (L)">
              <input className="input" disabled={!isAdmin} inputMode="decimal" value={form.freeLitersMonthly}
                onChange={(e) => set("freeLitersMonthly", e.target.value.replace(/[^0-9.]/g, ""))} />
            </Field>
            <Field label={`Rate per Excess Liter (${form.currency || "₹"})`}>
              <input className="input" disabled={!isAdmin} inputMode="decimal" value={form.tieredRatePerLiter}
                onChange={(e) => set("tieredRatePerLiter", e.target.value.replace(/[^0-9.]/g, ""))} />
            </Field>
            <p className="text-xs text-muted">
              Usage up to {form.freeLitersMonthly || 10000} L per billing period is free. Only usage above that
              is charged, at the rate per excess liter.
            </p>
          </>
        )}

        <Field label="Currency Symbol">
          <input className="input" disabled={!isAdmin} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
        </Field>
        <Field label="Reading Frequency">
          <input className="input" disabled={!isAdmin} value={form.readingFrequency} onChange={(e) => set("readingFrequency", e.target.value)} />
        </Field>
        <Field label="Water Source">
          <input className="input" disabled={!isAdmin} value={form.waterSource} onChange={(e) => set("waterSource", e.target.value)} />
        </Field>

        <SectionTitle>Notifications</SectionTitle>
        <Toggle label="Send Reminders" checked={!!form.sendReminder} disabled={!isAdmin} onChange={(v) => set("sendReminder", v)} />
        <Toggle label="Send Bill Message" checked={!!form.sendBillMessage} disabled={!isAdmin} onChange={(v) => set("sendBillMessage", v)} />

        {error && <p className="text-danger text-sm">{error}</p>}
        {isAdmin && (
          <button className="btn-primary flex items-center justify-center" disabled={saving} onClick={save}>
            {saving ? <Spinner /> : "Save Settings"}
          </button>
        )}
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

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <div className="card p-4 flex items-center justify-between">
      <span className="text-sm font-semibold">{label}</span>
      <button
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition relative ${checked ? "bg-brand" : "bg-line"} ${disabled ? "opacity-50" : ""}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
