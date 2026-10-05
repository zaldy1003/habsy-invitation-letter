import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:3000/');
await page.evaluate(() => document.fonts.ready);
await mkdir('test-results/visual', { recursive: true });
await page.locator('.cover').screenshot({ path: 'test-results/visual/cover.png' });
await page.getByRole('link', { name: 'Buka Undangan' }).click();
await page.waitForURL('**/undangan');
await page.evaluate(() => document.fonts.ready);
for (const name of ['session-opening', 'session-ceremony', 'session-journey', 'session-family', 'session-blessing', 'session-response']) {
  const section = page.locator(`.${name}`);
  await section.scrollIntoViewIfNeeded();
  await section.screenshot({ path: `test-results/visual/${name}.png` });
}
const sections = await page.locator('main > section').evaluateAll(elements => elements.map(element => ({
  name: element.className, y: element.getBoundingClientRect().top + window.scrollY,
  height: element.getBoundingClientRect().height,
})));
await writeFile('test-results/visual/geometry.json', JSON.stringify(sections, null, 2));
console.log(JSON.stringify(sections, null, 2));
await browser.close();
