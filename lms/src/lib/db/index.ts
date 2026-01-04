import { drizzle } from "drizzle-orm/neon-http";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";
import "server-only";

let db: NeonHttpDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var cachedDb: NeonHttpDatabase<typeof schema> | undefined;
}

if (process.env.NODE_ENV === "production") {
  // Production: Create new connection each time
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  // Development: Use global cache to prevent hot reload issues
  if (!global.cachedDb) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    global.cachedDb = drizzle(pool, { schema });
  }
  db = global.cachedDb;
}

export { db };
export * from "./schema";
