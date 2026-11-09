import { CalendarCheck, BedDouble, Clock3, CircleDollarSign } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SAMPLE_LODGE_ENQUIRIES } from "@/lib/data/admin-mock";
import { ROOM_BLOCKS } from "@/lib/data/rooms";

const TOTAL_ROOMS = ROOM_BLOCKS.reduce((sum, block) => sum + block.roomNumbers.length, 0);

export default function AdminDashboardPage() {
  const pending = SAMPLE_LODGE_ENQUIRIES.filter((e) => e.status === "new").length;

  const stats = [
    { label: "Today's enquiries", value: SAMPLE_LODGE_ENQUIRIES.length, icon: CalendarCheck },
    { label: "Pending review", value: pending, icon: Clock3 },
    { label: "Rooms (total)", value: TOTAL_ROOMS, icon: BedDouble },
    { label: "Outstanding", value: "—", icon: CircleDollarSign },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Showing sample data — this connects to real bookings once the backend is built (Stage 10).
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-background p-5">
            <Icon className="text-dv-pool" size={20} />
            <span className="mt-3 block font-serif text-2xl text-dv-forest">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-background p-5">
        <h2 className="font-serif text-lg text-dv-forest">Recent lodge enquiries</h2>
        <div className="mt-4 flex flex-col divide-y divide-border">
          {SAMPLE_LODGE_ENQUIRIES.map((enquiry) => (
            <div key={enquiry.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-dv-black">{enquiry.name}</p>
                <p className="text-sm text-muted-foreground">{enquiry.checkIn} · {enquiry.guests} guests</p>
              </div>
              <StatusBadge status={enquiry.status === "new" ? "pending" : enquiry.status === "contacted" ? "pending" : "confirmed"} />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
