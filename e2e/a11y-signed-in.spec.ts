import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { DEMO, signIn } from "./helpers";

// Scan the settled UI: entrance animations would otherwise be measured mid-fade.
test.use({ contextOptions: { reducedMotion: "reduce" } });

async function expectAccessible(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    serious.map((v) => `${path} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)
  ).toEqual([]);
}

test("family pages are accessible", async ({ page }) => {
  await signIn(page, "Family", DEMO.family);
  await expect(page).toHaveURL("/");
  for (const path of ["/bookings", "/bookings/BK-240101", "/profile", "/book/pt-001"]) {
    await expectAccessible(page, path);
  }
});

test("purohit dashboard is accessible", async ({ page }) => {
  await signIn(page, "Purohit", DEMO.purohit);
  await expect(page).toHaveURL(/purohit-dashboard/);
  for (const view of ["overview", "requests", "schedule", "availability"]) {
    await expectAccessible(page, `/purohit-dashboard#${view}`);
  }
});

test("admin console is accessible", async ({ page }) => {
  await signIn(page, "Admin", DEMO.admin);
  await expect(page).toHaveURL(/admin/);
  for (const view of ["overview", "bookings", "purohits", "applications", "users"]) {
    await expectAccessible(page, `/admin#${view}`);
  }
});
