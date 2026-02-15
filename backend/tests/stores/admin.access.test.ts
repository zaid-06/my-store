import { describe, it, expect, vi } from "vitest";
import { requireRole } from "../../src/modules/auth/auth.middleware";
import { Role } from "../../src/types/roles";
import { ApiError } from "../../src/shared/api-error";

function mockReq(user: { id: string; role: Role } | null) {
  return { user } as any;
}

describe("Admin access (requireRole)", () => {
  it("calls next() when user has ADMIN role", () => {
    const req = mockReq({ id: "u1", role: Role.ADMIN });
    const res = {} as any;
    const next = vi.fn();

    requireRole(Role.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("throws ApiError 403 when user has CREATOR role", () => {
    const req = mockReq({ id: "u1", role: Role.CREATOR });
    const res = {} as any;
    const next = vi.fn();

    try {
      requireRole(Role.ADMIN)(req, res, next);
    } catch (e: any) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.statusCode).toBe(403);
      expect(e.message).toBe("Forbidden");
    }
    expect(next).not.toHaveBeenCalled();
  });

  it("throws ApiError 403 when user has BUYER role", () => {
    const req = mockReq({ id: "u1", role: Role.BUYER });
    const res = {} as any;
    const next = vi.fn();

    expect(() => requireRole(Role.ADMIN)(req, res, next)).toThrow(ApiError);
    expect(next).not.toHaveBeenCalled();
  });
});
