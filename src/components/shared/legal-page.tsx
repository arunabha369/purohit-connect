import { AppShell } from "@/components/layout/app-shell";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell footer>
      <article className="container-page max-w-3xl py-8 sm:py-12">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        </header>
        <div className="space-y-8 text-[0.9375rem] leading-relaxed text-foreground/85 [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </AppShell>
  );
}
