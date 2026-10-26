// Screenshots every route at desktop and phone width, light and dark, into shots/.
// Usage: npm run build && node scripts/shots.mjs   (starts `next start` on :3111)
import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH ?? "playwright");

const PORT = 3111;
const routes = ["/", "/week", "/courses", "/library", "/body", "/money", "/jobs"];
fs.mkdirSync("shots", { recursive: true });

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)], { stdio: "ignore" });
const wait = async () => { for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://localhost:${PORT}/`); if (r.ok) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } throw new Error("server did not start"); };
await wait();

const browser = await chromium.launch();
const errors = [];
for (const [name, viewport] of [["desktop", { width: 1360, height: 900 }], ["phone", { width: 390, height: 844 }]]) {
  for (const scheme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport, colorScheme: scheme, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${name}/${scheme}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") errors.push(`${name}/${scheme} console: ${m.text()}`); });
    for (const r of routes) {
      await page.goto(`http://localhost:${PORT}${r}`, { waitUntil: "networkidle" });
      const wide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (wide) errors.push(`${name}/${scheme}${r}: horizontal overflow`);
      await page.screenshot({ path: `shots/${r === "/" ? "today" : r.slice(1)}-${name}-${scheme}.png`, fullPage: true });
    }
    await ctx.close();
  }
}
await browser.close();
server.kill("SIGTERM");
if (errors.length) { console.log("Problems:\n" + errors.join("\n")); process.exit(1); }
console.log("Clean. Screenshots in shots/.");
