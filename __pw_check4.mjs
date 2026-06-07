import { chromium } from "playwright-core";
import path from "node:path";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:5173/");
await page.waitForSelector("#historia", { timeout: 30000 });
await page.locator("#historia").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const nextBtn = page.locator("#historia .book-btn").last();
for (let i = 0; i < 3; i++) {
  await nextBtn.click();
  await page.waitForTimeout(1300);
}
await page.locator("#historia .book").screenshot({ path: path.resolve(`__pw_zoom_ch3.png`) });
await browser.close();
