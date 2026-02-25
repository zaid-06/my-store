// backend/vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],

    // ✅ run tests sequentially
    pool: "forks",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});



// import { defineConfig } from "vitest/config";
// import path from "path";

// export default defineConfig({
 
//   test: {
//     environment: "node",
//     globals: true,
//     include: ["tests/**/*.test.ts"],
//     setupFiles: ["tests/setup.ts"],
//     // threads: false,
//   },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src"),
//     },
//   },
// });

// backend/vitest.config.ts
// import { defineConfig } from "vitest/config";
// import path from "path";

// export default defineConfig({
//   test: {
//     environment: "node",
//     globals: true,
//     include: ["tests/**/*.test.ts"],
//     setupFiles: ["tests/setup.ts"],

//     // 🔴 Important: disable parallel workers so DB state is not shared concurrently
//     poolOptions: {
//       threads: {
//         singleThread: true,
//       },
//     },
//   },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src"),
//     },
//   },
// });