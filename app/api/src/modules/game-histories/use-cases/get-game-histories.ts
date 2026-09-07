import { and, desc, eq, gte, lte } from "drizzle-orm"
import {
  db,
  miniGameAttemptsSchema,
  miniGamesSchema,
  zonesSchema,
} from "@repo/database"
import type { GetGameHistoriesQuery } from "../models/history"
import { mockGameHistory } from "../../../../../../test/mocks/data"

export const getGameHistoriesUsecase = {
  async execute(query: GetGameHistoriesQuery) {
    // --------------------------------------------------------------
    // test mock data
    if (Bun.env.USE_GAME_HISTORIES_MOCK === "true") {
      const filtered = mockGameHistory.filter((history) => {
        if (query.gameType && history.gameType !== query.gameType) return false
        if (query.startDate && history.playedAt < query.startDate) return false
        if (query.endDate && history.playedAt > query.endDate) return false
        return true
      })

      const page = query.page ?? 1
      const limit = query.limit ?? 10
      const offset = (page - 1) * limit
      const histories = filtered.slice(offset, offset + limit)
      const total = filtered.length
      const totalPages = Math.ceil(total / limit)

      return {
        success: true,
        data: {
          histories,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
      }
    }

    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const offset = (page - 1) * limit

    const filters = [eq(miniGameAttemptsSchema.userId, "")]
    if (query.gameType) filters.push(eq(miniGamesSchema.gameType, query.gameType))
    if (query.startDate) filters.push(gte(miniGameAttemptsSchema.playedAt, new Date(query.startDate)))
    if (query.endDate) filters.push(lte(miniGameAttemptsSchema.playedAt, new Date(query.endDate)))

    const where = and(...filters)
    const rows = await db
      .select({
        id: miniGameAttemptsSchema.id,
        gameType: miniGamesSchema.gameType,
        gameName: miniGamesSchema.name,
        zoneCode: zonesSchema.animaltype,
        zoneName: zonesSchema.nameTh,
        score: miniGameAttemptsSchema.score,
        isPassed: miniGameAttemptsSchema.isPassed,
        timeTakenSeconds: miniGameAttemptsSchema.timeTakenSeconds,
        playedAt: miniGameAttemptsSchema.playedAt,
      })
      .from(miniGameAttemptsSchema)
      .innerJoin(miniGamesSchema, eq(miniGameAttemptsSchema.miniGameId, miniGamesSchema.id))
      .innerJoin(zonesSchema, eq(miniGamesSchema.zoneId, zonesSchema.id))
      .where(where)
      .orderBy(desc(miniGameAttemptsSchema.playedAt))
      .limit(limit)
      .offset(offset)

    const countRows = await db
      .select({ id: miniGameAttemptsSchema.id })
      .from(miniGameAttemptsSchema)
      .innerJoin(miniGamesSchema, eq(miniGameAttemptsSchema.miniGameId, miniGamesSchema.id))
      .where(where)

    const total = countRows.length
    const totalPages = Math.ceil(total / limit)

    return {
      success: true,
      data: {
        histories: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    }
  },
}
