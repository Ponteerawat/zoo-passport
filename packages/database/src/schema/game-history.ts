import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  unique,
} from "drizzle-orm/pg-core"

export const profilesSchema = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  lineUserId: text("line_user_id").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  title: text("title").default("Zoo Explorer"),
  totalPoints: integer("total_points").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const zonesSchema = pgTable("zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  animaltype: text("animaltype").notNull().unique(),
  nameTh: text("name_th").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionTh: text("description_th"),
  iconUrl: text("icon_url"),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
})

export const miniGamesSchema = pgTable("mini_games", {
  id: uuid("id").primaryKey().defaultRandom(),
  zoneId: uuid("zone_id").notNull().references(() => zonesSchema.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  gameType: text("game_type").notNull(),
  timeLimitSeconds: integer("time_limit_seconds"),
  passScore: integer("pass_score").default(0),
  config: jsonb("config").default({}),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
  zoneIdx: index("idx_mini_games_zone_id").on(table.zoneId),
}))

export const userZoneProgressSchema = pgTable("user_zone_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profilesSchema.id, { onDelete: "cascade" }),
  zoneId: uuid("zone_id").notNull().references(() => zonesSchema.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("locked"),
  bestScore: integer("best_score").notNull().default(0),
  stampReceivedAt: timestamp("stamp_received_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_user_zone_progress_user_id").on(table.userId),
  zoneIdx: index("idx_user_zone_progress_zone_id").on(table.zoneId),
  userZoneUnique: unique("user_zone_progress_user_id_zone_id_unique").on(table.userId, table.zoneId),
}))

export const miniGameAttemptsSchema = pgTable("mini_game_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profilesSchema.id, { onDelete: "cascade" }),
  miniGameId: uuid("mini_game_id").notNull().references(() => miniGamesSchema.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  timeTakenSeconds: integer("time_taken_seconds"),
  isPassed: boolean("is_passed").notNull().default(false),
  playedAt: timestamp("played_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: index("idx_mini_game_attempts_user_id").on(table.userId),
  miniGameIdx: index("idx_mini_game_attempts_mini_game_id").on(table.miniGameId),
}))
