import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categories } from "@/lib/catalog";
import { SectionHeader } from "@/components/shared/section-header";
import { ServiceIcon } from "@/components/shared/service-icon";

export function CategoryGrid() {
  return (
    <section className="container-page py-14 sm:py-20" aria-labelledby="categories-heading">
      <SectionHeader
        id="categories-heading"
        eyebrow="Ceremonies"
        title="What are you celebrating?"
        description="Choose a ceremony to see purohits who specialise in it."
        action={{ href: "/search", label: "All purohits" }}
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/search?category=${cat.id}`}
              className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-[border-color,background-color] hover:border-gold-700/60 hover:bg-surface sm:p-4"
            >
              <ServiceIcon name={cat.icon} className="size-10 transition-transform duration-300 group-hover:scale-105 sm:size-11" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-snug font-medium text-foreground">{cat.name}</span>
                <span className="block text-xs text-muted-foreground">{cat.count} purohits</span>
              </span>
              <ChevronRight className="hidden size-4 shrink-0 text-subtle-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
