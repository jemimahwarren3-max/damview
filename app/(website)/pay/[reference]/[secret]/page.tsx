import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentStatusClient } from "@/components/payments/PaymentStatusClient";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Your Payment, ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

async function ResolvedPaymentStatus({ params }: { params: Promise<{ reference: string; secret: string }> }) {
  const { reference, secret } = await params;
  return <PaymentStatusClient reference={reference} secret={secret} />;
}

export default function PaymentStatusPage({ params }: { params: Promise<{ reference: string; secret: string }> }) {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted-foreground">Loading...</div>}>
      <ResolvedPaymentStatus params={params} />
    </Suspense>
  );
}
