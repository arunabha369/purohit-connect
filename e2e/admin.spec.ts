import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { DEMO, signIn } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signIn(page, "Admin", DEMO.admin);
  await expect(page).toHaveURL(/\/admin/);
});

test("approving an application publishes the purohit, who can then sign in", async ({ page }) => {
  await page.goto("/admin#applications");
  await page.getByRole("button", { name: "Approve" }).first().click();
  await page.getByRole("button", { name: "Approve & publish" }).click();
  await expect(page.getByText("The profile is now live in search.")).toBeVisible();

  await page.goto("/search?q=Harish");
  await expect(page.getByRole("link", { name: "Pandit Harish Kulkarni" })).toBeVisible();

  await signIn(page, "Purohit", "9123456780");
  await expect(page.getByRole("heading", { name: "Namaste, Harish ji" })).toBeVisible();
});

test("exports bookings as CSV", async ({ page }) => {
  await page.goto("/admin#bookings");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export CSV" }).click()]);
  expect(download.suggestedFilename()).toMatch(/^bookings-\d{4}-\d{2}-\d{2}\.csv$/);
  const csv = readFileSync((await download.path())!, "utf8");
  expect(csv.split("\r\n")[0]).toContain("Booking ID");
  expect(csv).toContain("BK-240111");
});

test("suspending a purohit hides them from search", async ({ page }) => {
  await page.goto("/admin#purohits");
  const row = page.getByRole("row", { name: /Pandit Ramesh Shastri/ });
  await row.getByRole("button", { name: "Suspend" }).click();
  await expect(row.getByText("Suspended")).toBeVisible();
  await page.goto("/search?q=Ramesh");
  await expect(page.getByText("No purohits match your search")).toBeVisible();
});
