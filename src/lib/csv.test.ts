import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";

describe("csv", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell("Sector 62, Noida")).toBe('"Sector 62, Noida"');
    expect(csvCell('He said "namaste"')).toBe('"He said ""namaste"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(csvCell(3199)).toBe("3199");
    expect(csvCell(undefined)).toBe("");
  });

  it("neutralises formula injection in text cells", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csvCell("+91 98765")).toBe("'+91 98765");
    expect(csvCell(-5)).toBe("-5");
  });

  it("builds rows with CRLF", () => {
    expect(toCsv(["a", "b"], [[1, "x,y"]])).toBe('a,b\r\n1,"x,y"');
  });
});
