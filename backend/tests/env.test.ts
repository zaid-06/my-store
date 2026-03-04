// import { test, expect } from "vitest";
// import { env } from "../src/config/env";

// test("env loads correctly", () => {
//   console.log(env);
//   expect(env.PORT).toBeDefined();

// });


import { describe, it, expect } from "vitest";
import { env } from "../src/config/env";

describe("Environment Config", () => {
  it("should load env correctly", () => {
    expect(env).toBeDefined();
    expect(env.PORT).toBeDefined();
  });
});   