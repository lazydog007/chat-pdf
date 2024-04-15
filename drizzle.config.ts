import * as dotenv from "dotenv"
import type { Config } from "drizzle-kit"
dotenv.config({ path: ".env" })

export default {
  driver: "pg",
  schema: "./src/lib/db/schema.ts",
  dbCredentials: {
    connectionString: process.env.NEXT_PUBLIC_DATABASE_URL!,
  },
} satisfies Config

// npx drizzle-kit push:pg
