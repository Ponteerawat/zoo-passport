// app/api/src/db/schema.ts
import {
  pgTable,
  uuid,
  integer,
  timestamp,
  pgEnum,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import {
  createInsertSchema,createSelectSchema,
} from 'drizzle-zod'

export const historyStatus = pgEnum("history_status", [
  "success",
  "failed"
])

export type HistoryStatus = (typeof historyStatus.enumValues)[number]

export const HistoryStatusValue = {
  SUCCESS: "success",
  FAILED: "failed"
} as const satisfies Record<string, HistoryStatus>

export const gameType = pgEnum('game_type', [
  'lion-zone',
  'elephant-zone',
  'giraffe-zone',
  'monkeyAR-zone',
  'panda-zone',
  'penguinAR-zone',
])

export type GameType = (typeof gameType.enumValues)[number]

export const GameTypeValue = {
  LION: 'lion-zone',
  ELEPHANT: 'elephant-zone',
  GIRAFFE: 'giraffe-zone',
  MONKEY: 'monkeyAR-zone',
  PANDA: 'panda-zone',
  PENGUIN: 'penguinAR-zone',
} as const satisfies Record<string, GameType>

export const gameHistoriesSchema = pgTable(
  'game_histories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    gameType: gameType('game_type').notNull(),
    score: integer('score').notNull(),
    playedAt: timestamp('played_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userPlayedAtIdx: index('game_histories_user_played_at_idx').on(
      table.userId,
      table.playedAt,
    ),

    userGameTypeIdx: index('game_histories_user_game_type_idx').on(
      table.userId,
      table.gameType,
    ),

    scoreCheck: check(
      'game_histories_score_check',
      sql`${table.score} >= 0`,
    ),
  }),
).enableRLS()

export const gameHistoryInsertSchema =
  createInsertSchema(gameHistoriesSchema).pick({
    gameType: true,
    score: true,
  })

export const gameHistorySelectSchema =
  createSelectSchema(gameHistoriesSchema)