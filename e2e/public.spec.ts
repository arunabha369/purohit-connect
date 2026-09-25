import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./helpers";

test("home page renders and search hands off to results", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sacred ceremonies");
  await page.getByPlaceholder("Search a puja or purohit").fill("Rudrabhishek");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/\/search\?q=Rudrabhishek/);
  await expect(page.getByRole("link", { name: "Acharya Suresh Dwivedi" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("search reads filters from the URL", async ({ page }) => {
  await page.goto("/search?category=wedding");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Vivah (Wedding) purohits");
  await expect(page.locator("#results-heading")).toContainText("3 purohits found");
});

test("private pages send visitors to sign in and back", async ({ page }) => {
  await page.goto("/bookings");
  await expect(page).toHaveURL(/\/login\?role=user&next=%2Fbookings/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("unknown pages show a helpful 404", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("This page has wandered off")).toBeVisible();
});

test("SEO endpoints are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/purohit/pt-001");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
  const manifest = await request.get("/manifest.webmanifest");
  expect((await manifest.json()).name).toBe("PurohitConnect");
  const home = await request.get("/");
  expect(home.headers()["x-frame-options"]).toBe("DENY");
});

test.describe("accessibility", () => {
  // Scan the settled UI: entrance animations would otherwise be measured mid-fade.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  for (const path of ["/", "/search", "/purohit/pt-001", "/login", "/help", "/join"]) {
    test(`has no serious accessibility violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
    });
  }
});
