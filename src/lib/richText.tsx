"use client";

import type { ReactNode } from "react";

/**
 * Tiny markdown subset: **bold**, *italic*, __underline__.
 * - No escaping, no nesting of the same marker, no mixed markers — simple enough
 *   to be deterministic and safe. Plain text outside markers renders as-is.
 * - Line breaks become <br /> so admin newlines are preserved.
 */

type Token = { type: "text" | "b" | "i" | "u" | "br"; value: string };

const PATTERN = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|__[^_\n]+?__|\n)/g;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  const matches = input.matchAll(PATTERN);

  for (const match of matches) {
    const [chunk] = match;
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      tokens.push({ type: "text", value: input.slice(lastIndex, idx) });
    }
    if (chunk === "\n") {
      tokens.push({ type: "br", value: "" });
    } else if (chunk.startsWith("**") && chunk.endsWith("**")) {
      tokens.push({ type: "b", value: chunk.slice(2, -2) });
    } else if (chunk.startsWith("__") && chunk.endsWith("__")) {
      tokens.push({ type: "u", value: chunk.slice(2, -2) });
    } else if (chunk.startsWith("*") && chunk.endsWith("*")) {
      tokens.push({ type: "i", value: chunk.slice(1, -1) });
    }
    lastIndex = idx + chunk.length;
  }
  if (lastIndex < input.length) {
    tokens.push({ type: "text", value: input.slice(lastIndex) });
  }
  return tokens;
}

/** Render bold/italic/underline markers as inline JSX. */
export function renderRichText(input: string | undefined | null): ReactNode {
  if (!input) return null;
  const tokens = tokenize(input);
  return tokens.map((t, i) => {
    if (t.type === "br") return <br key={i} />;
    if (t.type === "b") return <strong key={i}>{t.value}</strong>;
    if (t.type === "i") return <em key={i}>{t.value}</em>;
    if (t.type === "u") return <u key={i}>{t.value}</u>;
    return <span key={i}>{t.value}</span>;
  });
}

/** Strip markers for places that need plain text (search, snippets, properties). */
export function stripRichText(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/\*\*([^*\n]+?)\*\*/g, "$1")
    .replace(/__([^_\n]+?)__/g, "$1")
    .replace(/\*([^*\n]+?)\*/g, "$1");
}
