import { expect, test } from "@playwright/test";
import { DEMO, signIn, trackPageErrors } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signIn(page, "Purohit", DEMO.purohit);
  await expect(page).toHaveURL(/\/purohit-dashboard/);
  await expect(page.getByRole("heading", { name: "Namaste, Ramesh ji" })).toBeVisible();
});

test("accepts a booking request", async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto("/purohit-dashboard#requests");
  const accept = page.getByRole("button", { name: "Accept" });
  const before = await accept.count();
  await accept.first().click();
  await expect(page.getByText(/Accepted —/)).toBeVisible();
  await expect(accept).toHaveCount(before - 1);
  expect(errors).toEqual([]);
});

test("declining requires a reason", async ({ page }) => {
  await page.goto("/purohit-dashboard#requests");
  await page.getByRole("button", { name: "Decline" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "Other" }).click();
  await dialog.getByRole("button", { name: "Decline request" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Please add a reason.");
  await dialog.getByRole("radio", { name: "The venue is too far for me" }).click();
  await dialog.getByRole("button", { name: "Decline request" }).click();
  await expect(page.getByText("Request declined")).toBeVisible();
});

test("takes today's ceremony from confirmed to completed", async ({ page }) => {
  await page.goto("/purohit-dashboard#schedule");
  for (const [action, result] of [
    ["Start travelling", "On the way"],
    ["Start ceremony", "Ceremony started"],
    ["Mark completed", "Completed"],
  ]) {
    await page.locator("button:not([disabled])", { hasText: action }).first().click();
    await expect(page.getByText(`Updated: ${result}`)).toBeVisible();
  }
});

test("marks a day off", async ({ page }) => {
  await page.goto("/purohit-dashboard#availability");
  await page.getByRole("button", { name: /, available$/ }).nth(1).click();
  await expect(page.getByText(/marked as a day off/)).toBeVisible();
});
