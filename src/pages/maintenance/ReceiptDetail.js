import { useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { useReceipts, useFlats, useSettings } from "../../data/hooks";
import { flatLookup } from "../../lib/firestore";
import { currency, monthLabel, shortDate } from "../../lib/format";
import { DetailRow, ReceiptDoc } from "../../components/DetailRow";

export default function ReceiptDetail() {
  const { id } = useParams();
  const { receipts } = useReceipts();
  const { flats } = useFlats();
  const settings = useSettings();
  const byId = flatLookup(flats);
  const r = receipts.find((x) => x.id === id);
  const flat = r ? byId[r.flatId] : null;

  return (
    <div className="max-w-md mx-auto">
      <PageTitle title="Receipt" back />
      {!r ? (
        <p className="p-4 text-sm text-muted">Receipt not found.</p>
      ) : (
        <div className="p-4 space-y-4">
          <ReceiptDoc title="Maintenance Receipt" subtitle={settings.apartmentName}>
            <p className="text-3xl font-extrabold text-brand mb-3">{currency(r.amount, settings.currency)}</p>
            <DetailRow label="Flat Number" value={flat?.displayName || r.flatId} />
            <DetailRow label="Owner Name" value={flat?.ownerName || "—"} />
            <DetailRow label="Period" value={monthLabel(r.period)} />
            <DetailRow label="Paid Date" value={shortDate(r.paidDate)} />
            <DetailRow label="Payment Method" value={r.paymentMethod} />
            <DetailRow label="Captured By" value={r.capturedBy || "—"} />
          </ReceiptDoc>
          <button className="btn-primary" onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  );
}
