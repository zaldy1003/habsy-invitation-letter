import { test, expect } from "@playwright/test";

test("RSVP validates and keeps one request ID after a lost response", async ({ page }) => {
  const submissions: Record<string, unknown>[] = [];
  await page.route("**/api/guestbook", async route => {
    if (route.request().method() === "GET") return route.fulfill({ json: { wishes: [] } });
    submissions.push(route.request().postDataJSON());
    if (submissions.length === 1) return route.abort();
    return route.fulfill({ json: { saved: true } });
  });
  await page.goto("/undangan");
  const submit = page.getByRole("button", { name: "Kirim ucapan & konfirmasi" });
  await submit.click();
  await expect(page.getByLabel("Nama tamu / keluarga")).toBeFocused();
  await page.getByLabel("Nama tamu / keluarga").fill("Tamu Uji");
  await page.getByLabel("Berhalangan", { exact: true }).check();
  await page.getByLabel("Untaian doa & ucapan").fill("Semoga berkah");
  await page.getByLabel("Saya mengizinkan").check();
  await submit.click();
  await expect(page.locator(".guestbook-card form .form-status")).toContainText("Koneksi terputus");
  await page.reload();
  await expect(page.getByLabel("Nama tamu / keluarga")).toHaveValue("Tamu Uji");
  await submit.click();
  await expect(page.locator(".guestbook-card form .form-status")).toContainText("telah tersimpan");
  await expect(page.getByRole("button", { name: "Konfirmasi tersimpan" })).toBeDisabled();
  expect(submissions).toHaveLength(2);
  expect(submissions[0].requestId).toBe(submissions[1].requestId);
  expect(submissions[1].attendance).toBe("berhalangan");
  await expect(page.locator(".wishes")).not.toContainText("Tamu Uji");
});

test("storage denied, reduced motion, feed retry and text escaping", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error("denied"); }; });
  let reads = 0;
  await page.route("**/api/guestbook", async route => {
    if (route.request().method() === "POST") return route.fulfill({ json: { saved: true } });
    if (++reads === 1) return route.fulfill({ status: 503, json: { error: "unavailable" } });
    return route.fulfill({ json: { wishes: [{ id: "1", name: "Kerabat", message: "<script>alert('test')</script>", created_at: "2026-10-04" }] } });
  });
  await page.goto("/undangan");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  await page.locator(".guestbook-feed").getByRole("button", { name: "Coba lagi" }).click();
  await expect(page.locator(".wishes")).toContainText("<script>alert('test')</script>");
  await expect(page.locator(".wishes script")).toHaveCount(0);
  await page.getByLabel("Nama tamu / keluarga").fill("Tamu tanpa penyimpanan");
  await page.getByRole("button", { name: "Kirim ucapan & konfirmasi" }).click();
  await expect(page.locator(".guestbook-card form .form-status")).toContainText("telah tersimpan");
});

test("server rejects invalid origin, oversized and invalid payload before writing", async ({ request }) => {
  const base = "http://127.0.0.1:3000";
  expect((await request.post("/api/guestbook", { headers: { origin: "https://other.example" }, data: {} })).status()).toBe(403);
  expect((await request.post("/api/guestbook", { headers: { origin: base }, data: { name: "a".repeat(9000) } })).status()).toBe(413);
  expect((await request.post("/api/guestbook", { headers: { origin: base }, data: {} })).status()).toBe(400);
});
