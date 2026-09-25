"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true on the client afterwards. Use
 * it to gate UI that depends on the user's clock or time zone, so server and
 * client markup always match.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
