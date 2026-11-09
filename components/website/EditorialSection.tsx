import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";

interface EditorialSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  href: string;
  ctaLabel: string;
  imagePosition?: "left" | "right";
  tone?: "ivory" | "forest" | "cream" | "black";
}

const TONE_STYLES = {
  ivory: "bg-background text-dv-black",
  cream: "bg-dv-cream text-dv-black",
  forest: "bg-dv-forest text-dv-ivory",
  black: "bg-dv-black text-dv-ivory",
} as const;

export function EditorialSection({
  eyebrow,
  title,
  description,
  image,
  href,
  ctaLabel,
  imagePosition = "left",
  tone = "ivory",
}: EditorialSectionProps) {
  const isDark = tone === "forest" || tone === "black";

  return (
    <section className={cn("py-16 sm:py-24", TONE_STYLES[tone])}>
      <Container
        className={cn(
          "flex flex-col items-center gap-10 lg:flex-row lg:gap-16",
          imagePosition === "right" && "lg:flex-row-reverse"
        )}
      >
        <div className="relative aspect-[4/5] w-full max-w-md flex-1 overflow-hidden rounded-sm sm:aspect-[4/3] lg:aspect-[3/4]">
          <Image src={image} alt={title} fill className="object-cover" sizes="(min-width: 1024px) 45vw, 90vw" />
        </div>

        <div className="flex flex-1 flex-col items-start gap-4">
          <span className="font-promo text-sm tracking-widest text-dv-gold">{eyebrow}</span>
          <h2 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
          <p className={cn("max-w-md text-base leading-relaxed", isDark ? "text-dv-cream/85" : "text-dv-black/75")}>
            {description}
          </p>
          <Link
            href={href}
            className={cn(
              "mt-2 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold tracking-wide",
              isDark ? "bg-dv-gold text-dv-forest hover:bg-dv-sunshine" : "bg-dv-forest text-dv-ivory hover:bg-dv-leaf"
            )}
          >
            {ctaLabel} <ArrowUpRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
