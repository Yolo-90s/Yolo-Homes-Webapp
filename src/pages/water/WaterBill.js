import { useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { useReadings, useFlats, useSettings } from "../../data/hooks";
import { flatLookup, billingRateInfo } from "../../lib/firestore";
import { currency, currencyPrecise, liters, shortDate } from "../../lib/format";
import { DetailRow, ReceiptDoc } from "../../components/DetailRow";

export default function WaterBill() {
  const { id } = useParams();
  const { readings } = useReadings();
  const { flats } = useFlats();
  const settings = useSettings();
  const byId = flatLookup(flats);
  const r = readings.find((x) => x.id === id);
  const flat = r ? byId[r.flatId] : null;
  const rateInfo = billingRateInfo(settings);

  return (
    <div className="max-w-md mx-auto">
      <PageTitle title="Water Bill" back />
      {!r ? (
        <p className="p-4 text-sm text-muted">Reading not found.</p>
      ) : (
        <div className="p-4 space-y-4">
          <ReceiptDoc title="Water Bill" subtitle={settings.apartmentName}>
            <p className="text-3xl font-extrabold text-sky2 mb-3">{currency(r.amount, settings.currency)}</p>
            <DetailRow label="Flat Number" value={flat?.displayName || r.flatId} />
            <DetailRow label="Owner Name" value={flat?.ownerName || "—"} />
            <DetailRow label="Previous Reading" value={liters(r.previousReading)} />
            <DetailRow label="Current Reading" value={liters(r.currentReading)} />
            <DetailRow label="Usage" value={liters(r.usageLiters)} />
            <DetailRow label={rateInfo.limitLabel} value={liters(rateInfo.limit)} />
            <DetailRow label="Billable Usage" value={liters(r.excessLiters)} />
            <DetailRow label="Rate / Liter" value={currencyPrecise(rateInfo.rate, settings.currency)} />
            <DetailRow label="Date" value={shortDate(r.date)} />
          </ReceiptDoc>
          <button className="btn-primary" onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  );
}
