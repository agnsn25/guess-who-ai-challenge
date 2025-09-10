import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  attributes: jsonb("attributes").notNull(), // JSON object with character attributes
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerCharacterId: varchar("player_character_id").references(() => characters.id),
  aiCharacterId: varchar("ai_character_id").references(() => characters.id),
  currentTurn: text("current_turn").notNull().default("player"), // "player" or "ai"
  status: text("status").notNull().default("active"), // "active", "won", "lost", "ai_won", "draw"
  eliminatedCharacters: jsonb("eliminated_characters").notNull().default([]), // Array of character IDs
  turnCount: integer("turn_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const gameHistory = pgTable("game_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull().references(() => games.id),
  type: text("type").notNull(), // "player_question", "ai_question", "player_response", "ai_response"
  content: text("content").notNull(),
  response: text("response"), // For questions, the yes/no response
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Character attributes schema
export const characterAttributesSchema = z.object({
  gender: z.enum(["male", "female"]),
  hairColor: z.enum(["black", "brown", "blonde", "red", "gray", "white", "other"]),
  hairLength: z.enum(["short", "medium", "long", "bald"]),
  eyeColor: z.enum(["brown", "blue", "green", "hazel", "gray"]),
  hasGlasses: z.boolean(),
  hasFacialHair: z.boolean(),
  age: z.enum(["young", "middle-aged", "elderly"]),
  skinTone: z.enum(["light", "medium", "dark"]),
  hasHat: z.boolean(),
  hasEarrings: z.boolean(),
  expression: z.enum(["smiling", "serious", "neutral"]),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
}).extend({
  attributes: characterAttributesSchema,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertGameHistorySchema = createInsertSchema(gameHistory).omit({
  id: true,
  timestamp: true,
});

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type CharacterAttributes = z.infer<typeof characterAttributesSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type GameHistoryEntry = typeof gameHistory.$inferSelect;
export type InsertGameHistory = z.infer<typeof insertGameHistorySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferSelect;
