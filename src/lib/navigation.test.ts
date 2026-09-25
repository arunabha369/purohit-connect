import { describe, expect, it } from "vitest";
import { loginHref, safeNext } from "./navigation";

describe("safeNext", () => {
  it("allows same-site paths only", () => {
    expect(safeNext("/bookings/BK-1?x=1#y", "/")).toBe("/bookings/BK-1?x=1#y");
    expect(safeNext("https://evil.example", "/")).toBe("/");
    expect(safeNext("//evil.example", "/")).toBe("/");
    expect(safeNext("/\\evil.example", "/")).toBe("/");
    expect(safeNext(null, "/admin")).toBe("/admin");
  });

  it("builds login links", () => {
    expect(loginHref("purohit", "/purohit-dashboard#requests")).toBe(
      "/login?role=purohit&next=%2Fpurohit-dashboard%23requests"
    );
  });
});
