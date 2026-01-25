// import { betterAuth } from "better-auth";
// import { env } from "../../config/env";

// export const auth = betterAuth({
//   secret: env.BETTERAUTH_SECRET,

//   emailAndPassword: {
//     enabled: true, //
//   },
// });

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../config/db";
import * as schema from "../../../auth-schema";
import { env } from "../../config/env";

export const auth = betterAuth({
  secret: env.BETTERAUTH_SECRET,

  // VERY IMPORTANT
  baseURL: "http://localhost:5000",

  // VERY IMPORTANT
  trustedOrigins: [
    "http://localhost:3000", // Next.js frontend
  ],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
  },
});
