import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// drizzle-kit CLI doesn't load .env.local like Next.js does
config({ path: ".env.local" });

export default {
    schema: "./lib/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
} satisfies Config;
