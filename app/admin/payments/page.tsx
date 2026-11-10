import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";

/** Sample-only — no payment records exist until the backend is built (Stage 10). */
const SAMPLE_PAYMENTS = [
  { customer: "Tendai Moyo", amount: 35, paid: 35, reference: "F2 · 1 night" },
  { customer: "Rudo & Tinashe", amount: 60, paid: 30, reference: "B4 · 2 nights" },
  { customer: "Chiedza Events Co.", amount: 850, paid: 200, reference: "Wedding deposit" },
];

export default function AdminPaymentsPage() {
  const totalOutstanding = SAMPLE_PAYMENTS.reduce((sum, p) => sum + (p.amount - p.paid), 0);

  return (
    <AdminShell title="Payments">
      <div className="mb-6 rounded-lg border border-dv-gold/40 bg-dv-sunshine/20 px-4 py-3 text-sm text-dv-black">
        Sample balances. There&apos;s no real payments table yet - use Invoices to record an actual
        payment and generate a receipt.
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-background p-5">
        <span className="text-sm text-muted-foreground">Total outstanding</span>
        <p className="font-serif text-3xl text-dv-forest">${totalOutstanding.toFixed(2)}</p>
      </div>

      <div className="flex flex-col gap-3">
        {SAMPLE_PAYMENTS.map((payment) => {
          const balance = payment.amount - payment.paid;
          return (
            <div key={payment.customer} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5">
              <div>
                <p className="font-medium text-dv-black">{payment.customer}</p>
                <p className="text-sm text-muted-foreground">{payment.reference}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  ${payment.paid.toFixed(2)} / ${payment.amount.toFixed(2)}
                </p>
                <StatusBadge status={balance === 0 ? "confirmed" : "pending"} label={balance === 0 ? "Paid" : `$${balance.toFixed(2)} due`} />
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
