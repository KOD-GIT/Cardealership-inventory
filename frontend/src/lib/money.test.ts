import { formatInr, formatInrCompact, formatRupees, fromPaise, parseRupees, sumPaise, toPaise } from "./money";

describe("paise arithmetic", () => {
  it("converts rupees to whole paise without float drift", () => {
    expect(toPaise(0.1 + 0.2)).toBe(30);
    expect(toPaise(815000.5)).toBe(81500050);
    expect(toPaise(24200000)).toBe(2_420_000_000);
  });
  it("sums exactly and converts back", () => {
    expect(sumPaise([toPaise(0.1), toPaise(0.2)])).toBe(30);
    expect(fromPaise(sumPaise([toPaise(815000), toPaise(1620000)]))).toBe(2435000);
  });
});

describe("Indian digit grouping", () => {
  it("groups in lakhs and crores", () => {
    expect(formatRupees(815000)).toBe("₹8,15,000");
    expect(formatRupees(24200000)).toBe("₹2,42,00,000");
    expect(formatRupees(41000000)).toBe("₹4,10,00,000");
  });
  it("shows paise only when there are some", () => {
    expect(formatInr(81500000)).toBe("₹8,15,000");
    expect(formatRupees(815000.5)).toBe("₹8,15,000.50");
  });
  it("has a compact form for big totals", () => {
    expect(formatInrCompact(toPaise(44445000))).toBe("₹4.44 Cr");
    expect(formatInrCompact(toPaise(815000))).toBe("₹8.15 L");
    expect(formatInrCompact(toPaise(50000))).toBe("₹50,000");
    expect(formatInrCompact(toPaise(10000000))).toBe("₹1 Cr");
  });
});

describe("parseRupees", () => {
  it("accepts what people really type", () => {
    expect(parseRupees("8,15,000")).toBe(815000);
    expect(parseRupees("₹ 8,15,000.50")).toBe(815000.5);
    expect(parseRupees("  42 ")).toBe(42);
  });
  it("rejects anything that is not a clean non-negative amount", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1e5", "12 34x"]) expect(parseRupees(bad)).toBeNull();
  });
});
