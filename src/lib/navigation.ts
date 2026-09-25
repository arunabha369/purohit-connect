import type { Role } from "./store/types";

export const roleHome: Record<Role, string> = {
  user: "/",
  purohit: "/purohit-dashboard",
  admin: "/admin",
};

export const roleLabel: Record<Role, string> = {
  user: "family",
  purohit: "purohit",
  admin: "admin",
};

/**
 * Only allow same-site relative paths as post-login redirects, so `?next=`
 * can't be used to send people to another site.
 */
export function safeNext(next: string | null | undefined, fallback: string) {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

export function loginHref(role: Role, next?: string) {
  const params = new URLSearchParams({ role });
  if (next) params.set("next", next);
  return `/login?${params}`;
}
