import { chromium } from "playwright-core";
import path from "node:path";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const url = "http://localhost:5173/#historia";

const widths = [1280, 900, 800, 761, 700, 480];
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto("http://localhost:5173/");
  await page.waitForSelector("#historia", { timeout: 30000 });
  await page.locator("#historia").scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const file = path.resolve(`__pw_shot_${width}.png`);
  await page.locator("#historia").screenshot({ path: file });
  console.log("saved", file);
  await page.close();
}
await browser.close();
