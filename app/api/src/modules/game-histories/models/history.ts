import { Elysia, t } from "elysia"
import {
  type GameType,
  type HistoryStatus,
} from '@repo/database'

export interface History {
  id?: string
  userId?: string
  gameType?: GameType
  score?: number
  playedAt?: string
  status?: HistoryStatus
  points: number
}



export const getGameHistoriesQuerySchema = t.Object({
  userId: t.String(),
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  gameType: t.Optional(t.Union([
    t.Literal("lion-zone"),
    t.Literal("elephant-zone"),
    t.Literal("giraffe-zone"),
    t.Literal("monkeyAR-zone"),
    t.Literal("panda-zone"),
    t.Literal("penguinAR-zone"),
  ])),
  from: t.Optional(t.String({ format: "date-time" })),
  to: t.Optional(t.String({ format: "date-time" })),
})

export type GetGameHistoriesQuery = typeof getGameHistoriesQuerySchema.static
