import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  varchar,
  bigint,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Users table (expanded from foundation)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 })
    .notNull()
    .default("student")
    .$type<"student" | "instructor" | "admin">(),
  language_pref: varchar("language_pref", { length: 10 })
    .notNull()
    .default("fr")
    .$type<"fr" | "ar" | "en">(),
  github_username: varchar("github_username", { length: 255 }),
  profile_image_url: varchar("profile_image_url", { length: 500 }),
  password_hash: varchar("password_hash", { length: 255 }),
  email_verified: boolean("email_verified").default(false),
  verification_token: varchar("verification_token", { length: 255 }),
  verification_token_expires: timestamp("verification_token_expires", {
    mode: "date",
  }),
  reset_token: varchar("reset_token", { length: 255 }),
  reset_token_expires: timestamp("reset_token_expires", { mode: "date" }),
  created_at: timestamp("created_at", { mode: "date" }).defaultNow(),
  updated_at: timestamp("updated_at", { mode: "date" }).defaultNow(),
  last_login: timestamp("last_login", { mode: "date" }),
  is_active: boolean("is_active").default(true),
});

// Sessions table for Next-Auth
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  session_token: varchar("session_token", { length: 255 }).notNull().unique(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Accounts table for OAuth providers
export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 255 }).primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  provider_account_id: varchar("provider_account_id", {
    length: 255,
  }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: bigint("expires_at", { mode: "bigint" }),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

// Verification tokens table
export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// TypeScript schemas for validation
// Note: We need to omit valid-only fields for insert schema if they are auto-generated or optional
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  password_hash: (schema) => schema.password_hash.min(60).max(60), // bcrypt hash length
  role: (schema) =>
    schema.role.refine(
      (val) => ["student", "instructor", "admin"].includes(val as string),
      {
        message: "Invalid role",
      }
    ),
  language_pref: (schema) =>
    schema.language_pref.refine(
      (val) => ["fr", "ar", "en"].includes(val as string),
      {
        message: "Invalid language preference",
      }
    ),
});

export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
