import { Suspense } from "react";
import { AdminPaymentReviewClient } from "@/components/admin/AdminPaymentReviewClient";

async function ResolvedPaymentReview({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  return <AdminPaymentReviewClient reference={reference} />;
}

export default function AdminPaymentReviewPage({ params }: { params: Promise<{ reference: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading...</div>}>
      <ResolvedPaymentReview params={params} />
    </Suspense>
  );
}
