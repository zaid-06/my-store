import { app } from "./app";
import { env } from "./config/env";

/**
 * Start HTTP server
 */
function startServer() {
  try {
    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server", error);
    process.exit(1);
  }
}

startServer();
