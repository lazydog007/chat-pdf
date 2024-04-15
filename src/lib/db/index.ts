import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// neonConfig.fetchConnectionCache = true;

if (!process.env.NEXT_PUBLIC_DATABASE_URL) {
  throw new Error("NEXT_PUBLIC_DATABASE_URL is not set")
}

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL)

export const db = drizzle(sql)
