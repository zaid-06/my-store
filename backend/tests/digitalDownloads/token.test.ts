import { describe, it, expect } from "vitest";
import { generateDownloadToken } from "../../src/shared/generateDownloadToken";

describe("Download Token Generation", () => {

  it("should generate a token", () => {
    const token = generateDownloadToken();

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should generate token with length >= 64", () => {
    const token = generateDownloadToken();

    expect(token.length).toBeGreaterThanOrEqual(64);
  });

  it("should generate unique tokens", () => {
    const token1 = generateDownloadToken();
    const token2 = generateDownloadToken();

    expect(token1).not.toBe(token2);
  });

  it("should generate valid hex string", () => {
    const token = generateDownloadToken();

    const hexRegex = /^[0-9a-f]+$/i;

    expect(hexRegex.test(token)).toBe(true);
  });

});

