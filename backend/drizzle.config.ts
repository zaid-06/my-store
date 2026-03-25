import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: [
    // "./auth-schema.ts", 
    "./src/modules/stores/store.schema.ts",
    "./src/modules/users/user.schema.ts",
    "./src/modules/products/product.schema.ts", 
    "./src/modules/orders/order.schema.ts",
    "./src/modules/downloads/download.schema.ts",
    "./src/modules/messages/message.schema.ts",
    "./src/modules/payouts/payout.schema.ts",
    "./src/modules/jobs/job.schema.ts"
  ],

  dialect: "postgresql",
  
  dbCredentials: {
    url: process.env.DATABASE_URL! ,
  },
});
