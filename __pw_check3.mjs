import { chromium } from "playwright-core";
import path from "node:path";

const browser = await chromium.launch({ args: ["--no-sandbox"] });

const widths = [1280, 1000, 800, 761];
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto("http://localhost:5173/");
  await page.waitForSelector("#historia", { timeout: 30000 });
  await page.locator("#historia").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const nextBtn = page.locator("#historia .book-btn").last();
  await nextBtn.click();
  await page.waitForTimeout(1300);
  const book = page.locator("#historia .book");
  await book.screenshot({ path: path.resolve(`__pw_zoom_${width}_book.png`) });
  console.log("done", width);
  await page.close();
}
await browser.close();
