import type { Metadata } from "next";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Your Payment, ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function IncompletePaymentLinkPage() {
  return (
    <Container className="py-24 text-center">
      <SectionHeading
        eyebrow="Payment"
        title="This link looks incomplete."
        subtitle="Payment links from Damview Resort include a security code after the reference. Please use the full link exactly as sent, or get in touch and we'll resend it."
      />
      <div className="mt-6 flex justify-center">
        <WhatsAppButton label="Contact Damview on WhatsApp" message="Hi, I need my payment link resent." />
      </div>
    </Container>
  );
}
