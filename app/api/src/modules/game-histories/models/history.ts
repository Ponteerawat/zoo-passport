import { t } from "elysia"

export const gameTypeValues = [
  "memory_match",
  "ar_feeding",
  "neck_adventure",
  "ar_catching",
  "platformer",
] as const

export type GameType = (typeof gameTypeValues)[number]

export const getGameHistoriesQuerySchema = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100 })),
  gameType: t.Optional(t.Union(gameTypeValues.map((value) => t.Literal(value)))),
  startDate: t.Optional(t.String({ format: "date-time" })),
  endDate: t.Optional(t.String({ format: "date-time" })),
})

export const getGameHistoriesHeadersSchema = t.Object({
  authorization: t.String(),
})

export type GetGameHistoriesQuery = typeof getGameHistoriesQuerySchema.static
