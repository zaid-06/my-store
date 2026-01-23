import "dotenv/config";
import { Pool } from "pg";

async function testDbConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query("SELECT 1;");
    console.log("✅ Database connected successfully:", result.rows);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await pool.end();
  }
}

testDbConnection();
