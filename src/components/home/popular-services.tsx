"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { services } from "@/lib/mock-data";
import { formatINR } from "@/lib/format";
import { SectionHeader } from "@/components/shared/section-header";
import { ServiceIcon } from "@/components/shared/service-icon";
import { Button } from "@/components/ui/button";

export function PopularServices() {
  const popular = services.filter((s) => s.popular);
  const scroller = useRef<HTMLUListElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-14 sm:py-20" aria-labelledby="services-heading">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            id="services-heading"
            eyebrow="Most booked"
            title="Popular pujas"
            description="Fixed, transparent pricing. Samagri and dakshina guidance included."
            className="mb-0"
          />
          <div className="hidden shrink-0 gap-2 md:flex">
            <Button variant="outline" size="icon" aria-label="Scroll left" onClick={() => scrollBy(-1)} className="rounded-full">
              <ArrowLeft />
            </Button>
            <Button variant="outline" size="icon" aria-label="Scroll right" onClick={() => scrollBy(1)} className="rounded-full">
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>

      <ul
        ref={scroller}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 xl:scroll-px-[calc((100vw-72rem)/2+1.5rem)] xl:px-[calc((100vw-72rem)/2+1.5rem)]"
      >
        {popular.map((service) => (
          <li key={service.id} className="w-[17.5rem] shrink-0 snap-start sm:w-80">
            <Link
              href={`/search?category=${service.category}`}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-gold-700/60"
            >
              <div className="flex items-start justify-between gap-3">
                <ServiceIcon name={service.icon} size="lg" />
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {service.duration}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{service.name}</h3>
              <p lang="hi" className="text-sm text-gold-300/80">
                {service.nameHindi}
              </p>
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <div>
                  <span className="text-xs text-muted-foreground">From </span>
                  <span className="font-heading text-lg font-semibold text-foreground">
                    {formatINR(service.basePrice)}
                  </span>
                </div>
                <span className="flex size-9 items-center justify-center rounded-full border border-border-strong text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
