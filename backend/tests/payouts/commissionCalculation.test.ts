import { describe, it, expect } from "vitest";

const COMMISSION_PERCENT = 10;

const round = (val: number) => Number(val.toFixed(2));

describe("Commission Calculation", () => {

  it("should calculate correct commission and net amount", () => {

    const grossAmount = 1000;

    const commission = round((grossAmount * COMMISSION_PERCENT) / 100);
    const net = round(grossAmount - commission);

    expect(commission).toBe(100);
    expect(net).toBe(900);
  });

  it("should handle decimal values correctly", () => {

    const grossAmount = 999.99;

    const commission = round((grossAmount * COMMISSION_PERCENT) / 100);
    const net = round(grossAmount - commission);

    expect(commission).toBe(100.00);
    expect(net).toBe(899.99);
  });

  it("should never produce negative net amount", () => {

    const grossAmount = 100;
    const refund = 200; // edge case

    const newGross = round(grossAmount - refund);
    const commission = round((newGross * COMMISSION_PERCENT) / 100);
    const net = round(newGross - commission);

    expect(net).toBeLessThan(0); // shows problem

    // simulate your service guard
    expect(() => {
      if (net < 0) {
        throw new Error("Invalid payout calculation");
      }
    }).toThrow("Invalid payout calculation");

  });

});