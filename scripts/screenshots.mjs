// Takes the README's screenshots: bundles demo/ with esbuild and opens it in
// Chrome (puppeteer-core; CHROME_PATH, else Chrome's macOS location).
// Usage: pnpm run screenshots
import { build } from "esbuild";
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "screenshots");
fs.mkdirSync(out, { recursive: true });

await build({
  entryPoints: [path.join(root, "demo/main.tsx")],
  bundle: true,
  outdir: path.join(root, "demo/build"),
  jsx: "automatic",
  format: "iife",
  minify: true,
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-first-run", "--disable-extensions"],
});
const page = await browser.newPage();
const demo = pathToFileURL(path.join(root, "demo/index.html")).href;
const phone = { width: 390, height: 760, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

async function take(name, query, viewport) {
  await page.setViewport(viewport);
  await page.goto(`${demo}?${query}`, { waitUntil: "networkidle0" });
  await page.waitForSelector(".wdp-panel");
  await page.evaluate(() => document.fonts.ready);
  // Let the opening animation and the wheels settle.
  await new Promise((r) => setTimeout(r, 700));
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.screenshot({ path: path.join(out, `${name}.png`) });
  console.log(`screenshots/${name}.png`);
}

await take("date-sheet", "open=date&date=1992-08-15", phone);
await take("date-sheet-lao", "open=date&date=1992-08-15&lang=lo", phone);
await take("time-sheet", "open=time&time=09:30", phone);
await take("date-dialog", "open=date&date=1992-08-15", { width: 1100, height: 720, deviceScaleFactor: 1 });
await browser.close();
