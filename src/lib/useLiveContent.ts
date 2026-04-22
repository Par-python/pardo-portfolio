"use client";

import { useEffect, useState } from "react";

export function useLiveContent<T>(kind: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/content/${kind}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as T;
        if (!cancelled) setValue(data);
      } catch {
        // Ignore — keep fallback. In prod the admin route doesn't exist.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return value;
}
