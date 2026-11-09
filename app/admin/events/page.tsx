import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SAMPLE_EVENT_ENQUIRIES } from "@/lib/data/admin-mock";

export default function AdminEventsPage() {
  return (
    <AdminShell title="Events">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Sample event enquiries, local to your browser only, not saved yet.
      </div>

      <div className="flex flex-col gap-3">
        {SAMPLE_EVENT_ENQUIRIES.map((enquiry) => (
          <div key={enquiry.id} className="rounded-2xl border border-border bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-dv-black">{enquiry.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {enquiry.eventType.replace("_", " ")} · {enquiry.proposedDate} · {enquiry.expectedGuests} guests
                </p>
              </div>
              <StatusBadge status="pending" label={enquiry.status} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
              <div>
                <dt className="font-medium text-dv-black">Facilities</dt>
                <dd>{enquiry.facilitiesRequired.join(", ") || "None listed"}</dd>
              </div>
              <div>
                <dt className="font-medium text-dv-black">Catering</dt>
                <dd>{enquiry.cateringRequired ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="font-medium text-dv-black">Accommodation</dt>
                <dd>{enquiry.accommodationRequired ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="font-medium text-dv-black">Phone</dt>
                <dd>{enquiry.phone}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
