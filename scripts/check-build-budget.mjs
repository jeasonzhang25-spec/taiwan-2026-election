import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const manifestPath = resolve(".next/server/app/page_client-reference-manifest.js");
const source = readFileSync(manifestPath, "utf8");
const marker = 'globalThis.__RSC_MANIFEST["/page"] = ';
const start = source.indexOf(marker);
if (start < 0) throw new Error("Cannot find /page client manifest");
const manifest = JSON.parse(source.slice(start + marker.length).replace(/;\s*$/, ""));
const files = [...new Set([
  ...(manifest.entryJSFiles?.["[project]/src/app/layout"] ?? []),
  ...(manifest.entryJSFiles?.["[project]/src/app/page"] ?? []),
])].filter((file) => file.endsWith(".js"));
const bytes = files.reduce((total, file) => total + statSync(resolve(".next", file)).size, 0);
const budget = 420_000;

console.log(`Homepage JavaScript budget: ${bytes.toLocaleString()} / ${budget.toLocaleString()} raw bytes (${files.length} chunks).`);
if (bytes > budget) {
  console.error("Homepage JavaScript exceeds the P1 budget. Defer below-fold modules or reduce client dependencies.");
  process.exit(1);
}
