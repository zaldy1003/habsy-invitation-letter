import { test, expect } from "@playwright/test";

test("cover is a separate responsive page with working navigation and history", async ({ page }) => {
  for (const width of [320, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 740 : 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { name: "Muhammad Al-Habsy Mulfi", level: 1 })).toBeVisible();
    await expect(page.locator(".profile, .guestbook-section, .countdown, footer")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Putar musik" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Buka Undangan" })).toBeInViewport();
    await expect(page.locator(".open-button img, .open-button svg")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390 || width === 1440) await page.screenshot({ path: `test-results/${test.info().project.name}-cover-${width}.png`, fullPage: true });
  }
  await page.getByRole("link", { name: "Buka Undangan" }).click();
  await expect(page).toHaveURL(/\/undangan$/);
  await expect(page.locator(".cover")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.reload();
  await expect(page.locator("#participant-name")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: "Buka Undangan" })).toBeVisible();
});

test("six distinct sessions start with salam and keep related content together", async ({ page }) => {
  await page.goto("/undangan");
  await expect(page.locator("main > section.invitation-session")).toHaveCount(6);
  await expect(page.locator(".session-heading, .session-number")).toHaveCount(0);
  await expect(page.locator('[data-session="1"] .intro-greeting')).toContainText("Assalamu’alaikum");
  await expect(page.locator('[data-session="1"] .profile')).toBeVisible();
  await expect(page.locator('[data-session="2"]')).toContainText("Insya Allah akan dilaksanakan pada");
  await expect(page.locator('[data-session="3"] .countdown')).toHaveCount(1);
  await expect(page.locator('[data-session="3"] .location-card')).toHaveCount(1);
  await expect(page.locator('[data-session="4"] .memory-photo')).toHaveCount(1);
  await expect(page.locator(".session-gift, .bank-account")).toHaveCount(0);
  await expect(page.locator('[data-session="5"] .arabic-prayer')).toHaveCount(1);
  await expect(page.locator('[data-session="5"] .signature')).toHaveCount(1);
  await expect(page.locator('[data-session="6"] form')).toHaveCount(1);
});

test("updated family, schedule, venue and original photo proportions are consistent", async ({ page }) => {
  await page.goto("/undangan");
  await expect(page.locator(".profile-copy")).toContainText("Putra ke-dua dari Bapak Mulfi Akil & Ibu Isniani");
  await expect(page.locator(".achievement")).toHaveText("Telah Menyelesaikan Pembacaan 30 Juz");
  await expect(page.locator(".day")).toHaveText("Jumat");
  await expect(page.locator("#event-date")).toHaveText("9 Oktober 2026");
  await expect(page.locator(".time-heading")).toContainText("19:00 WITA – SELESAI");
  await expect(page.locator(".detail-rows")).toContainText("Hotel Grand Puri Perintis");
  await expect(page.locator(".detail-rows")).toContainText("Jl. Perintis Kemerdakaan Km.11 No.77b, Tamalanrea, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan, 90245.");
  await expect(page.locator("body")).not.toContainText(/Rayyan|Fauzi|Nurul|Hafalan|Juz 'Amma|Bougenville|Panakkukang/);
  await expect(page).toHaveTitle(/Muhammad Al-Habsy Mulfi/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Jumat, 9 Oktober 2026, pukul 19:00 WITA/);
  for (const [selector, file, ratio] of [[".portrait", "habsy-portrait.png", 1024 / 1536], [".memory-photo", "habsy-family.png", 1122 / 1402]] as const) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await expect(page.locator(`${selector} img`)).toHaveAttribute("src", new RegExp(file));
    const actual = await page.locator(selector).evaluate((element) => { const rect = element.getBoundingClientRect(); return rect.width / rect.height; });
    expect(Math.abs(actual - ratio)).toBeLessThan(0.01);
  }
});

test("Figma assets load, layout stays within viewport, and content is readable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 430, 768, 1440]) {
    // End the previous document before resizing so its responsive-image requests
    // do not race the next navigation in Chromium.
    await page.goto("about:blank");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/undangan");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { name: "Muhammad Al-Habsy Mulfi", level: 1 })).toBeVisible();
    for (const photo of await page.locator("img[loading='lazy']").all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator("img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const geometry = await page.evaluate(() => ({ viewport: window.innerWidth, width: document.documentElement.scrollWidth, main: document.querySelector("main")!.getBoundingClientRect().width }));
    expect(geometry.width).toBeLessThanOrEqual(geometry.viewport);
    expect(geometry.main).toBe(Math.min(width, 480));
    const svgGeometry = await page.locator("img.ornament").evaluateAll((images) => images.filter(image => image.checkVisibility()).map((image) => {
      const img = image as HTMLImageElement;
      return { source: img.src, width: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
    }));
    for (const asset of svgGeometry) {
      expect(Math.abs(asset.width - asset.naturalWidth), asset.source).toBeLessThan(1);
      expect(Math.abs(asset.height - asset.naturalHeight), asset.source).toBeLessThan(1);
    }
    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `test-results/${test.info().project.name}-${width}.png`, fullPage: true });
    }
  }
  expect(errors).toEqual([]);
});

test("opening starts real music, pause and resume work, returning to cover pauses", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Buka Undangan" }).click();
  await expect(page).toHaveURL(/\/undangan$/);
  await expect(page.locator(".cover")).toHaveCount(0);
  await expect(page.locator("#isi-undangan")).toBeVisible();
  await expect(page.getByRole("button", { name: "Simpan ke Kalender" })).toHaveCount(0);
  const maps = page.getByRole("link", { name: "Buka Google Maps", exact: false });
  await expect(maps).toHaveAttribute("href", "https://maps.app.goo.gl/CvDZMgdMPjiECkdp7");
  await expect(maps).toHaveAttribute("target", "_blank");
  await expect(page.getByRole("button", { name: "Jeda musik" })).toBeVisible();
  await expect.poll(() => page.locator("audio").evaluate((el) => (el as HTMLAudioElement).currentTime)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Jeda musik" }).click();
  await expect(page.getByRole("button", { name: "Putar musik" })).toHaveAttribute("aria-pressed", "false");
  const pausedAt = await page.locator("audio").evaluate((el) => (el as HTMLAudioElement).currentTime);
  await page.getByRole("button", { name: "Putar musik" }).click();
  await expect.poll(() => page.locator("audio").evaluate((el) => (el as HTMLAudioElement).currentTime)).toBeGreaterThan(pausedAt);
  await expect(page.locator("audio")).toHaveAttribute("loop", "");
  expect(await page.locator("audio").evaluate(el => (el as HTMLAudioElement).volume)).toBe(1);
  await expect(page.locator("audio")).toHaveAttribute("src", /mawlaya\.mp3\?v=/);
  await page.goBack();
  await expect.poll(() => page.locator("audio").evaluate((el) => (el as HTMLAudioElement).paused)).toBe(true);
});

test("countdown uses WITA and stops at zero after the event", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-10-08T10:00:00Z") });
  await page.goto("/undangan");
  await expect(page.locator(".countdown-number").first()).toHaveText("01");
  await page.clock.setSystemTime(new Date("2026-10-10T11:00:00Z"));
  await page.clock.runFor(1000);
  await expect(page.getByRole("heading", { name: "Hari bahagia telah tiba" })).toBeVisible();
  await expect(page.locator(".countdown-number")).toHaveText(["00", "00", "00", "00"]);
});

test("failed photo keeps its frame and can be retried", async ({ page }) => {
  await page.route("**/_next/image?*", (route) => route.abort());
  await page.goto("/undangan");
  const fallback = page.locator(".portrait.photo-fallback");
  await expect(fallback).toBeVisible();
  const originalHeight = await fallback.evaluate((element) => element.getBoundingClientRect().height);
  await page.unroute("**/_next/image?*");
  await fallback.getByRole("button", { name: "Coba lagi" }).click();
  const photo = page.locator(".portrait img");
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(await photo.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(originalHeight, 2);
});


test("entrance motion respects reduced motion and never hides content permanently", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    (window as unknown as { motionCalls: number }).motionCalls = 0;
    Element.prototype.animate = function (...args) {
      (window as unknown as { motionCalls: number }).motionCalls++;
      return original.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => (window as unknown as { motionCalls: number }).motionCalls)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByRole("link", { name: "Buka Undangan" })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { motionCalls: number }).motionCalls)).toBe(0);
});
