import { chromium } from "playwright-core";
import path from "node:path";

const browser = await chromium.launch({ args: ["--no-sandbox"] });

const widths = [1280, 900, 800, 761];
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 950 } });
  await page.goto("http://localhost:5173/");
  await page.waitForSelector("#historia", { timeout: 30000 });
  await page.locator("#historia").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // click "next" arrow once to flip to chapter 1 spread
  const nextBtn = page.locator("#historia .book-btn").last();
  await nextBtn.click();
  await page.waitForTimeout(1300);
  await page.locator("#historia").screenshot({ path: path.resolve(`__pw_shot_${width}_p1.png`) });

  await nextBtn.click();
  await page.waitForTimeout(1300);
  await page.locator("#historia").screenshot({ path: path.resolve(`__pw_shot_${width}_p2.png`) });

  console.log("done", width);
  await page.close();
}
await browser.close();
