"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
        <TriangleAlert className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold text-foreground sm:text-3xl">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again — if it keeps happening, call us on 1800-123-4567.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle-foreground">Ref: {error.digest}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={reset}>
          <RotateCcw /> Try again
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
