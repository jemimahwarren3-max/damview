import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExperienceCardProps {
  image: string;
  title: string;
  description: string;
  href?: string;
  icon?: LucideIcon;
  className?: string;
}

export function ExperienceCard({
  image,
  title,
  description,
  href,
  icon: Icon,
  className,
}: ExperienceCardProps) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full">
        <Image src={image} alt={title} fill className="object-cover" />
        {Icon && (
          <span className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-dv-ivory text-dv-forest">
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-dv-forest">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {href && (
          <Link
            href={href}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-dv-pool hover:underline"
          >
            Learn more <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
    </article>
  );
}
