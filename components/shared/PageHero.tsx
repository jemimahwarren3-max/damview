import Image from "next/image";
import { Container } from "@/components/shared/Container";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
}

export function PageHero({ eyebrow, title, subtitle, image }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[380px] items-end">
      <Image src={image} alt={title} fill priority className="object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(23,61,43,0.35) 0%, rgba(15,24,18,0.88) 100%)",
        }}
      />
      <Container className="relative flex flex-col gap-3 pt-32 pb-12">
        <span className="font-promo text-sm tracking-widest text-dv-sunshine">{eyebrow}</span>
        <h1 className="max-w-2xl font-serif text-4xl text-dv-ivory sm:text-5xl">{title}</h1>
        {subtitle && <p className="max-w-xl text-dv-cream/90">{subtitle}</p>}
      </Container>
    </section>
  );
}
