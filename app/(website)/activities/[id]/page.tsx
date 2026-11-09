import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SimpleEnquiryForm } from "@/components/booking/SimpleEnquiryForm";
import { getAllActivities, getActivityById } from "@/lib/data/activities";
import { SITE_NAME } from "@/lib/constants";

export async function generateStaticParams() {
  const activities = await getAllActivities();
  return activities.map((activity) => ({ id: activity.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) return { title: `Activities, ${SITE_NAME}` };

  return {
    title: `${activity.name}, ${SITE_NAME}`,
    description: activity.description,
  };
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) notFound();

  const backHref = activity.category === "damside" ? "/damside" : "/activities";
  const backLabel = activity.category === "damside" ? "Back to Damside Experience" : "Back to Activities";

  return (
    <>
      <PageHero
        eyebrow={activity.category === "damside" ? "Damside Experience" : "Recreational Activities"}
        title={activity.name}
        subtitle={
          activity.pricing
            ? `From $${activity.pricing.amount} ${activity.pricing.unit.replace("_", " ")}`
            : "Pricing to be confirmed"
        }
        image={activity.image ?? "https://images.pexels.com/photos/15490742/pexels-photo-15490742.jpeg?auto=compress&cs=tinysrgb&w=1600"}
      />

      <section className="py-20">
        <Container className="max-w-2xl">
          <Link
            href={backHref}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-dv-pool hover:underline"
          >
            <ArrowLeft size={15} /> {backLabel}
          </Link>
          <SectionHeading eyebrow="About This Activity" title={activity.name} subtitle={activity.description} />
        </Container>
      </section>

      <section className="bg-dv-cream py-20">
        <Container className="max-w-xl">
          <SectionHeading eyebrow="Enquire" title={`Ask about ${activity.name}.`} />
          <div className="mt-8">
            <SimpleEnquiryForm
              intro={`Hi, I'd like to enquire about ${activity.name} at Damview Resort.`}
              insertTarget={{ table: "activity_enquiries", activityId: activity.id }}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
