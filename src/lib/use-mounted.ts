"use client";

import { useEffect, useState } from "react";

/**
 * True after the first client render. Use it to gate UI that depends on the
 * user's clock or time zone, so server and client markup always match.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
