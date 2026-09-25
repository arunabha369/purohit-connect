import Link from "next/link";
import { Compass } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <AppShell>
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Compass className="size-7" />
        </span>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-primary uppercase">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">This page has wandered off</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          The link may be broken or the page may have moved. Let&apos;s get you back on the right path.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Go home
          </Link>
          <Link href="/search" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Find a purohit
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
