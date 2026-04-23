"use client";

import { useEffect, useState } from "react";

// Try the admin API first (gives dev unsaved-live edits instantly). If it's
// 404 — the usual case in prod where /api/admin isn't shipped — fall back to
// the published static JSON at /content/<kind>.json.
async function fetchContent<T>(kind: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/admin/content/${kind}`, {
      cache: "no-store",
    });
    if (res.ok) return (await res.json()) as T;
  } catch {
    // ignore and fall through
  }
  try {
    const res = await fetch(`/content/${kind}.json`, { cache: "no-store" });
    if (res.ok) return (await res.json()) as T;
  } catch {
    // ignore
  }
  return null;
}

export function useLiveContent<T>(kind: string, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchContent<T>(kind);
      if (data && !cancelled) setValue(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return value;
}
