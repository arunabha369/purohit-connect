"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert, UserRoundX } from "lucide-react";
import { useApp, type Role } from "@/lib/store";
import { loginHref, roleHome, roleLabel } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export function PageLoader({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center", fullScreen ? "min-h-dvh" : "min-h-[50vh]")}
    >
      <Loader2 className="size-6 animate-spin text-primary" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function currentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/**
 * Renders children only for a signed-in session with the given role.
 * Signed-out visitors are sent to the login page and returned here afterwards.
 */
export function RequireRole({
  role,
  children,
  fullScreen = false,
}: {
  role: Role;
  children: React.ReactNode;
  fullScreen?: boolean;
}) {
  const router = useRouter();
  const { hydrated, session, user, api } = useApp();

  const signedOut = hydrated && (!session || (session.role === "user" && !user));
  const needsProfile = hydrated && role === "user" && session?.role === "user" && !!user && !user.name;

  useEffect(() => {
    if (signedOut) {
      if (session) api.signOut();
      router.replace(loginHref(role, currentPath()));
    } else if (needsProfile) {
      router.replace(`${loginHref(role, currentPath())}&step=profile`);
    }
  }, [signedOut, needsProfile, session, role, router, api]);

  if (!hydrated || signedOut || needsProfile || !session) return <PageLoader fullScreen={fullScreen} />;

  const wrap = (node: React.ReactNode) => (
    <div className={cn("container-page flex items-center justify-center py-16", fullScreen && "min-h-dvh")}>
      {node}
    </div>
  );

  if (session.role !== role) {
    return wrap(
      <EmptyState
        icon={ShieldAlert}
        title={`This page is for ${roleLabel[role]} accounts`}
        description={`You're signed in with a ${roleLabel[session.role]} account.`}
        className="w-full max-w-md"
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={roleHome[session.role]} className={buttonVariants({ variant: "outline" })}>
              Go to my {session.role === "user" ? "home" : "dashboard"}
            </Link>
            <Button
              onClick={() => {
                api.signOut();
                router.replace(loginHref(role, currentPath()));
              }}
            >
              Switch account
            </Button>
          </div>
        }
      />
    );
  }

  if (role === "user" && user?.status === "suspended") {
    return wrap(
      <EmptyState
        icon={UserRoundX}
        title="Your account is suspended"
        description="Please call 1800-123-4567 and our team will help you restore access."
        className="w-full max-w-md"
        action={
          <Button
            variant="outline"
            onClick={() => {
              api.signOut();
              router.replace("/");
            }}
          >
            Sign out
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
