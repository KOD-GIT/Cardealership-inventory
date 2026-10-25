import { csvField, toCsv } from "./csv";

describe("csvField", () => {
  it("leaves plain text alone", () => expect(csvField("Audi R8")).toBe("Audi R8"));
  it("quotes commas, quotes and newlines, doubling inner quotes", () => {
    expect(csvField('Say "hi", ok')).toBe('"Say ""hi"", ok"');
    expect(csvField("a\nb")).toBe('"a\nb"');
  });
  it("neutralises spreadsheet formulas (CSV injection)", () => {
    for (const evil of ["=SUM(A1:A9)", "+1+1", "-2+3", "@cmd", "\tcmd"]) expect(csvField(evil).startsWith("'") || csvField(evil).startsWith('"\'')).toBe(true);
  });
  it("writes numbers plainly (a negative number stays a number) and blanks for null", () => {
    expect(csvField(-3)).toBe("-3");
    expect(csvField(null)).toBe("");
    expect(csvField(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("joins rows with CRLF and ends with a newline", () => {
    expect(toCsv(["a", "b"], [["x", 1], ["y,z", -2]])).toBe('a,b\r\nx,1\r\n"y,z",-2\r\n');
  });
});
