import { app } from "./app";
import { env } from "./config/env";
import { startJobRunner } from "./modules/jobs/job-runner";

/**
 * Start HTTP server
 */
function startServer() {
  try {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);

      // Start background job runner AFTER server starts
      startJobRunner();
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();