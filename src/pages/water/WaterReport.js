import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import PageTitle from "../../components/PageTitle";
import { EmptyState } from "../../components/ui";
import { useReadings, useAllFlats, useSettings } from "../../data/hooks";
import { currency, currencyPrecise, liters, monthLabel, recentPeriods, periodKey, shortDate } from "../../lib/format";
import { billingRateInfo } from "../../lib/firestore";
import { useAuth } from "../../context/AuthContext";

/** Plain integer liters (no " L" suffix) — the column header already says "(L)". */
const num = (v) => (Number(v) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/** Every column: key, header, value getter, and whether it's numeric (right-aligned). */
const COLUMNS = [
  { key: "flat", header: "Flat", get: (r) => r.flat.displayName || "—" },
  { key: "block", header: "Block", get: (r) => r.flat.block || "—" },
  { key: "owner", header: "Owner", get: (r) => r.flat.ownerName || "—" },
  { key: "tenant", header: "Tenant", get: (r) => r.flat.tenantName || "—" },
  { key: "prev", header: "Prev (L)", get: (r) => (r.hasReading ? num(r.previousReading) : "—"), numeric: true },
  { key: "current", header: "Current (L)", get: (r) => (r.hasReading ? num(r.currentReading) : "—"), numeric: true },
  { key: "usage", header: "Usage (L)", get: (r) => (r.hasReading ? num(r.liters) : "—"), numeric: true },
  { key: "billable", header: "Billable (L)", get: (r) => (r.hasReading ? num(r.excess) : "—"), numeric: true },
  { key: "rate", header: "Rate / L", get: (r, s) => currencyPrecise(billingRateInfo(s).rate, s.currency), numeric: true },
  { key: "amount", header: "Amount", get: (r, s) => (r.hasReading ? currency(r.amount, s.currency) : "—"), numeric: true },
  { key: "date", header: "Date", get: (r) => (r.hasReading ? shortDate(r.date) : "—") },
  { key: "status", header: "Status", get: (r) => (!r.hasReading ? "No reading" : r.edited ? "Edited" : "Read") },
];

export default function WaterReport() {
  const { session, isResident } = useAuth();
  const { readings } = useReadings();
  const { flats, canonicalNo } = useAllFlats();
  const settings = useSettings();

  const periods = useMemo(() => recentPeriods(12).reverse(), []);
  const [period, setPeriod] = useState(periods[0]);
  const [visible, setVisible] = useState(() => Object.fromEntries(COLUMNS.map((c) => [c.key, true])));

  const cols = COLUMNS.filter((c) => visible[c.key]);
  const visibleCount = cols.length;

  function toggleCol(key) {
    setVisible((v) => {
      // Never hide the last remaining column.
      if (v[key] && visibleCount === 1) return v;
      return { ...v, [key]: !v[key] };
    });
  }

  // Resident scoping: resolve the resident's own flatNo from their flats-doc id.
  const residentNo = session?.flatId ? canonicalNo(session.flatId) : null;
  const flatList = isResident && residentNo ? flats.filter((f) => f.flatNo === residentNo) : flats;

  const monthReadings = readings.filter((r) => {
    if (periodKey(new Date(r.date)) !== period) return false;
    return !isResident || !residentNo || canonicalNo(r.flatId) === residentNo;
  });
  const byNo = monthReadings.reduce((acc, r) => {
    const k = canonicalNo(r.flatId);
    (acc[k] = acc[k] || []).push(r);
    return acc;
  }, {});

  const rows = flatList
    .map((flat) => {
      const list = (byNo[flat.flatNo] || byNo[flat.id] || []).slice().sort((a, b) => a.date - b.date);
      return {
        flat,
        hasReading: list.length > 0,
        previousReading: list[0]?.previousReading ?? 0,
        currentReading: list[list.length - 1]?.currentReading ?? 0,
        liters: list.reduce((s, r) => s + r.usageLiters, 0),
        excess: list.reduce((s, r) => s + r.excessLiters, 0),
        amount: list.reduce((s, r) => s + r.amount, 0),
        date: list[list.length - 1]?.date ?? 0,
        edited: list.some((r) => r.edited),
      };
    })
    .sort((a, b) => b.liters - a.liters);

  const totalL = rows.reduce((s, r) => s + r.liters, 0);
  const totalBillable = rows.reduce((s, r) => s + r.excess, 0);
  const totalRev = rows.reduce((s, r) => s + r.amount, 0);

  function downloadPdf() {
    if (!cols.length) return;
    // jsPDF's built-in fonts use WinAnsi encoding, which has no ₹ (U+20B9) glyph — it would
    // render as a stray character. Substitute "Rs" for the PDF and strip any other non-Latin1.
    const pdfSettings = { ...settings, currency: settings.currency === "₹" ? "Rs " : settings.currency };
    const safe = (v) => String(v).replace(/₹/g, "Rs ").replace(/[Ā-￿]/g, "");

    const doc = new jsPDF({ orientation: cols.length > 5 ? "landscape" : "portrait", unit: "pt", format: "a4" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("#2563EB");
    doc.text("Water Report", 40, 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#64748B");
    doc.text(safe(`${settings.apartmentName} - ${monthLabel(period)}`), 40, 62);

    const head = [cols.map((c) => c.header)];
    const body = rows.map((r) => cols.map((c) => safe(c.get(r, pdfSettings))));
    const totals = cols.map((c) => {
      switch (c.key) {
        case "flat": return "TOTAL";
        case "usage": return num(totalL);
        case "billable": return num(totalBillable);
        case "amount": return safe(currency(totalRev, pdfSettings.currency));
        default: return "";
      }
    });

    // Right-align numeric columns (header + body + totals) so figures line up.
    const columnStyles = {};
    cols.forEach((c, i) => { if (c.numeric) columnStyles[i] = { halign: "right" }; });

    autoTable(doc, {
      head,
      body: [...body, totals],
      startY: 78,
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak", valign: "middle", lineColor: [226, 232, 240], lineWidth: 0.5 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", halign: "left" },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles,
      margin: { left: 40, right: 40 },
      tableWidth: "auto",
      didParseCell: (data) => {
        // Bold the trailing TOTAL row.
        if (data.row.index === body.length) data.cell.styles.fontStyle = "bold";
      },
    });

    const y = doc.lastAutoTable.finalY || 78;
    doc.setFontSize(9);
    doc.setTextColor("#94A3B8");
    doc.text(`Generated by Yolo-Home's - ${rows.length} flats`, 40, Math.min(y + 20, doc.internal.pageSize.getHeight() - 24));
    doc.save(`water_report_${period}.pdf`);
  }

  return (
    <div>
      <PageTitle
        title="Water Report"
        back
        actions={
          <button
            onClick={downloadPdf}
            disabled={!rows.length || !cols.length}
            className="rounded-xl bg-brand text-white px-4 py-2.5 text-sm font-semibold hover:bg-brand-dark transition disabled:opacity-50"
          >
            Download PDF
          </button>
        }
      />

      <div className="space-y-3">
        {/* Month filter */}
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

        {/* Column show/hide */}
        <div className="card p-3">
          <p className="text-[11px] font-semibold text-muted mb-2">Columns ({visibleCount}/{COLUMNS.length})</p>
          <div className="flex flex-wrap gap-2">
            {COLUMNS.map((c) => {
              const on = visible[c.key];
              return (
                <button
                  key={c.key}
                  onClick={() => toggleCol(c.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                    on ? "bg-brand/10 text-brand border-brand/30" : "border-line text-muted"
                  }`}
                >
                  {on ? "✓ " : ""}{c.header}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary strip */}
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
          <EmptyState title="No Flats Found" message="Add flats in Manage Residents to see the report here." />
        ) : (
          <>
            <p className="text-[11px] text-muted px-1">{rows.length} flats • {visibleCount} columns shown</p>
            <div className="card p-0 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand text-white">
                    {cols.map((c) => (
                      <th
                        key={c.key}
                        className={`px-3 py-2.5 font-semibold whitespace-nowrap ${c.numeric ? "text-right" : "text-left"}`}
                      >
                        {c.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.flat.id || r.flat.flatNo} className={i % 2 ? "bg-canvas" : ""}>
                      {cols.map((c) => (
                        <td
                          key={c.key}
                          className={`px-3 py-2.5 whitespace-nowrap border-t border-line ${
                            c.numeric ? "text-right tabular-nums" : "text-left"
                          } ${!r.hasReading ? "text-muted" : ""}`}
                        >
                          {c.get(r, settings)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="font-semibold bg-brand/5">
                    {cols.map((c) => (
                      <td key={c.key} className={`px-3 py-2.5 border-t-2 border-line ${c.numeric ? "text-right tabular-nums" : "text-left"}`}>
                        {c.key === "flat" ? "TOTAL" : c.key === "usage" ? num(totalL) : c.key === "billable" ? num(totalBillable) : c.key === "amount" ? currency(totalRev, settings.currency) : ""}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
