import { test, expect } from "vitest";
import { env } from "../src/config/env";

test("env loads correctly", () => {
  expect(env.PORT).toBeDefined();
});
