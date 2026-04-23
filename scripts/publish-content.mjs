#!/usr/bin/env node
// Copies local admin content (data/*.json) into public/content/*.json so it
// ships with the deployed build. Run via `npm run publish-content`.
//
// Kinds without a data/*.json file are skipped — the corresponding live
// component will use its own hardcoded FALLBACK at runtime.

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const OUT_DIR = path.join(ROOT, "public", "content");

async function main() {
  let files = [];
  try {
    files = await fs.readdir(DATA_DIR);
  } catch (err) {
    if (err && err.code === "ENOENT") {
      console.log("no data/ dir — nothing to publish.");
      return;
    }
    throw err;
  }
  const jsons = files.filter((f) => f.endsWith(".json"));
  if (jsons.length === 0) {
    console.log("no data/*.json files — nothing to publish.");
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const file of jsons) {
    const src = path.join(DATA_DIR, file);
    const dst = path.join(OUT_DIR, file);
    const text = await fs.readFile(src, "utf8");
    // Re-parse + re-stringify so we fail loud on malformed JSON and keep
    // formatting consistent with what the admin writes.
    const data = JSON.parse(text);
    await fs.writeFile(dst, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`published ${file}`);
  }

  const publishedAt = new Date().toISOString();
  await fs.writeFile(path.join(OUT_DIR, ".published-at"), publishedAt, "utf8");
  console.log(`done. published ${jsons.length} file(s) at ${publishedAt}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
