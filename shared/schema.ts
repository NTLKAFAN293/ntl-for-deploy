import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from 'nanoid';

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bots = pgTable("bots", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  token: text("token").notNull(),
  isOnline: boolean("is_online").default(false).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  files: jsonb("files").$type<Record<string, string>>().default({}).notNull(),
  config: jsonb("config").$type<{
    prefix?: string;
    description?: string;
    permissions?: string[];
    isActive?: boolean;
  }>().default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const botFiles = pgTable("bot_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => bots.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  content: text("content").notNull().default(""),
  language: text("language").$type<"javascript" | "python" | "json">().notNull().default("javascript"),
  isDirty: boolean("is_dirty").default(false),
  size: text("size"),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const botLogs = pgTable("bot_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").references(() => bots.id, { onDelete: "cascade" }).notNull(),
  level: text("level").$type<"info" | "error" | "warn" | "debug">().notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas - simplified approach
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const insertBotSchema = z.object({
  name: z.string(),
  token: z.string(),
  isOnline: z.boolean().optional(),
  isActive: z.boolean().optional(),
  files: z.record(z.string()).optional(),
  config: z.object({
    prefix: z.string().optional(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }).optional(),
});

export const insertBotFileSchema = z.object({
  botId: z.string(),
  name: z.string(),
  content: z.string().optional(),
  language: z.enum(["javascript", "python", "json"]).optional(),
  isDirty: z.boolean().optional(),
  size: z.string().optional(),
});

export const insertBotLogSchema = z.object({
  botId: z.string(),
  level: z.enum(["info", "error", "warn", "debug"]),
  message: z.string(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Bot = typeof bots.$inferSelect;
export type InsertBot = z.infer<typeof insertBotSchema>;
export type BotFile = typeof botFiles.$inferSelect;
export type InsertBotFile = z.infer<typeof insertBotFileSchema>;
export type BotLog = typeof botLogs.$inferSelect;
export type InsertBotLog = z.infer<typeof insertBotLogSchema>;

// Public bot type without sensitive data
export type BotPublic = Omit<Bot, 'token'> & {
  tokenMasked: string;
};