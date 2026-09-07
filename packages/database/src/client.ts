import "dotenv/config"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Connection for queries
const client = postgres(process.env.DATABASE_URL!, {
  max: 10,
  prepare: false
})
export const db = drizzle({ client })