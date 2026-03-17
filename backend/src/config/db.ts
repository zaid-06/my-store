import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "./env";

import * as userSchema from "../modules/users/user.schema";
import * as storeSchema from "../modules/stores/store.schema"; 

import * as productSchema from "../modules/products/product.schema";
import * as orderSchema from "../modules/orders/order.schema";
import * as downloadSchema from "../modules/downloads/download.schema";
import * as messageSchema from "../modules/messages/message.schema";
import * as payoutSchema from "../modules/payouts/payout.schema";




const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...userSchema,
    ...storeSchema, 
    ...productSchema,
    ...orderSchema,
    ...downloadSchema,
    ...messageSchema,
    ...payoutSchema
  },
});
