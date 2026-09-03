import { and, asc, desc, eq, gte, lte } from "drizzle-orm"
import { db, gameHistoriesSchema } from "@repo/database"
import type { GetGameHistoriesQuery } from "../models/history"

export const getGameHistories = async (query: GetGameHistoriesQuery) => {
  const page = query.page ?? 1
  const limit = query.limit ?? 10
  const offset = (page - 1) * limit

  const filters = [eq(gameHistoriesSchema.userId, query.userId)]

  if (query.gameType) {
    filters.push(eq(gameHistoriesSchema.gameType, query.gameType))
  }

  if (query.from) {
    filters.push(gte(gameHistoriesSchema.playedAt, new Date(query.from)))
  }

  if (query.to) {
    filters.push(lte(gameHistoriesSchema.playedAt, new Date(query.to)))
  }

  const where = and(...filters)

  const [histories, countResult] = await Promise.all([
    db.select().from(gameHistoriesSchema)
      .where(where)
      .orderBy(desc(gameHistoriesSchema.playedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: db.$count(gameHistoriesSchema, where) }),
  ])

  const total = countResult[0]?.count ?? 0
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
