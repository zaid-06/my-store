import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimiter } from "@/middlewares/rateLimiter"; // adjust path

describe("Task 9 - Rate Limiter", () => {

  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      ip: "127.0.0.1",
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();
  });

  // =========================
  // 🧪 ALLOW UNDER LIMIT
  // =========================
  it("should allow requests under limit", () => {
    for (let i = 0; i < 10; i++) {
      rateLimiter(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(10);
  });

  // =========================
  // 🧪 BLOCK AFTER LIMIT
  // =========================
  it("should block requests after limit exceeded", () => {
    for (let i = 0; i < 11; i++) {
      rateLimiter(req, res, next);
    }

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("Too many requests"),
      })
    );
  });

  // =========================
  // 🧪 DIFFERENT IP SHOULD NOT BLOCK
  // =========================
  it("should track limits per IP", () => {
    const req2 = { ip: "192.168.0.1" };

    for (let i = 0; i < 10; i++) {
      rateLimiter(req, res, next);
    }

    // second IP should still work
    rateLimiter(req2 as any, res, next);

    expect(next).toHaveBeenCalled();
  });

  // =========================
  // 🧪 RESET AFTER TIME WINDOW
  // =========================
  it("should reset after time window", () => {
    vi.useFakeTimers();

    for (let i = 0; i < 10; i++) {
      rateLimiter(req, res, next);
    }

    // move time forward 1 minute
    vi.advanceTimersByTime(60 * 1000);

    rateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();

    vi.useRealTimers();
  });

});