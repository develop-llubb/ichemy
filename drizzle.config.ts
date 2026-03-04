import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  out: "./db/migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.KIT_DATABASE_URL!,
  },
  schemaFilter: ["public"],
  tablesFilter: ["befe_*"],
});
