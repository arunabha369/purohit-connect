import { expect, type Page } from "@playwright/test";

export const DEMO = {
  family: "9876543210",
  purohit: "9000000001",
  admin: "9000000000",
};

/** Signs in through the real OTP flow. Any 6-digit code is accepted in demo mode. */
export async function signIn(page: Page, role: "Family" | "Purohit" | "Admin", phone: string, next?: string) {
  await page.goto(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  const switchAccount = page.getByRole("button", { name: "Use a different account" });
  const roleRadio = page.getByRole("radio", { name: role, exact: true });
  await expect(switchAccount.or(roleRadio)).toBeVisible();
  if (await switchAccount.isVisible()) await switchAccount.click();
  await roleRadio.click();
  await page.getByLabel("Mobile number").fill(phone);
  await page.getByRole("button", { name: "Get OTP" }).click();
  await expect(page.getByRole("heading", { name: "Enter the code" })).toBeVisible();
  await page.keyboard.type("123456");
}

/** Fails the test on uncaught page errors (hydration mismatches, runtime exceptions). */
export function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !m.text().includes("Failed to load resource")) errors.push(m.text());
  });
  return errors;
}

export async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 768;
}
