import { expect, test, type Page } from "@playwright/test";
import { DEMO, signIn, trackPageErrors } from "./helpers";

async function pickFirstOpenSlot(page: Page) {
  const dates = page.getByRole("radiogroup", { name: "Date" }).getByRole("radio");
  await expect(dates.first()).toBeVisible();
  const count = await dates.count();
  for (let i = 0; i < count; i++) {
    const date = dates.nth(i);
    if (!(await date.isEnabled())) continue;
    await date.click();
    const slot = page.locator('[aria-label$="slots"] [role=radio]:not([disabled])').first();
    if (await slot.count()) {
      await slot.click();
      return;
    }
  }
  throw new Error("No open slot found");
}

test("family books with a coupon, reschedules and cancels with a refund", async ({ page }) => {
  const errors = trackPageErrors(page);
  await signIn(page, "Family", DEMO.family, "/purohit/pt-001");
  await expect(page).toHaveURL(/\/purohit\/pt-001$/);
  await page.getByRole("link", { name: "Book now" }).click();

  await page.getByRole("radio", { name: /Satyanarayan Puja/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await pickFirstOpenSlot(page);
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("radio", { name: /Home.*Sunrise Apartments/ })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: /Continue/ }).click();

  await page.getByRole("button", { name: /PUJA10/ }).click();
  await expect(page.getByText("· you save ₹310")).toBeVisible();
  await page.getByRole("button", { name: "Pay ₹2,889" }).click();
  await expect(page.getByRole("heading", { name: "Booking request sent" })).toBeVisible();

  await page.getByRole("link", { name: "Track booking" }).click();
  await expect(page).toHaveURL(/\/bookings\/BK-/);
  await expect(page.getByText("Coupon PUJA10")).toBeVisible();

  await page.getByRole("button", { name: "Reschedule" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Reschedule" })).toBeVisible();
  const dates = dialog.getByRole("radiogroup", { name: "Date" }).getByRole("radio");
  await dates.filter({ has: page.locator(":scope:not([disabled])") }).last().click();
  await dialog.locator('[aria-label$="slots"] [role=radio]:not([disabled])').first().click();
  await dialog.getByRole("button", { name: "Confirm new time" }).click();
  await expect(page.getByText("Rescheduled", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Cancel booking" }).click();
  await page.getByRole("radio", { name: "I booked another purohit" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Cancel booking" }).click();
  await expect(page.getByText("Cancelled by you")).toBeVisible();
  await expect(page.getByText(/is being refunded to your (card|UPI account)/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("new family signs up, adds an address and sees the first-booking offer", async ({ page }) => {
  await signIn(page, "Family", "9123412345");
  await expect(page.getByRole("heading", { name: "Tell us about you" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("full name");
  await page.getByLabel("Full name").fill("Kavya Rao");
  await page.getByLabel("City").click();
  await page.getByRole("option", { name: "Pune" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/book/pt-003");
  await page.getByRole("radio", { name: /Ganesh Puja/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await pickFirstOpenSlot(page);
  await page.getByRole("button", { name: /Continue/ }).click();

  // No saved addresses yet: the new-address form is shown and validated.
  await page.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByText("Enter a valid 6-digit PIN code")).toBeVisible();
  await page.getByLabel("Full address").fill("Flat 5, Kothrud Heights, Paud Road");
  await page.getByLabel("City").fill("Pune");
  await page.getByLabel("PIN code").fill("411038");
  await page.getByRole("button", { name: /Continue/ }).click();

  await expect(page.getByRole("button", { name: /FIRST100/ })).toBeVisible();
  await page.getByRole("button", { name: /FIRST100/ }).click();
  await expect(page.getByRole("button", { name: "Pay ₹1,499" })).toBeVisible();
});

test("saving a purohit asks signed-out visitors to sign in", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("button", { name: /^Save Pandit Ramesh Shastri/ }).click();
  await expect(page).toHaveURL(/\/login\?role=user&next=%2Fsearch/);
});
