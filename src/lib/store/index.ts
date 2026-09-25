"use client";

import { useMemo } from "react";
import { api, isHydratedDB, useDB } from "./store";
import { sessionAudience } from "./actions";
import {
  findUser,
  getPurohitView,
  listPublicPurohits,
  notificationsFor,
  walletBalance,
} from "./selectors";

export { api } from "./store";
export * from "./types";
export type { PurohitView } from "./selectors";

/**
 * App state for components. `hydrated` is false on the server and during the
 * first client render; gate anything that depends on the signed-in user on it.
 */
export function useApp() {
  const db = useDB();
  return useMemo(() => {
    const session = db.session;
    const user = session?.role === "user" ? (findUser(db, session.userId) ?? null) : null;
    return {
      db,
      hydrated: isHydratedDB(db),
      session,
      user,
      walletBalance: user ? walletBalance(db, user.id) : 0,
      api,
    };
  }, [db]);
}

export function usePublicPurohits() {
  const db = useDB();
  return useMemo(() => listPublicPurohits(db), [db]);
}

export function usePurohit(id: string | undefined) {
  const db = useDB();
  return useMemo(() => getPurohitView(db, id), [db, id]);
}

export function useNotifications() {
  const db = useDB();
  return useMemo(() => {
    const items = notificationsFor(db, sessionAudience(db));
    return { items, unread: items.filter((n) => !n.read).length };
  }, [db]);
}
