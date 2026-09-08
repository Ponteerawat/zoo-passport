import { eq, asc, inArray } from "drizzle-orm"
import {
  db,
  zonesSchema,
  miniGamesSchema,
  userZoneProgressSchema,
} from "@repo/database"

export const getZonesUsecase = {
  async execute(profileId: string) {
    const zones = await db
      .select()
      .from(zonesSchema)
      .where(eq(zonesSchema.isActive, true))
      .orderBy(asc(zonesSchema.orderIndex))

    const zoneIds = zones.map((zone) => zone.id)

    const [miniGames, progressRows] = await Promise.all([
      db.select().from(miniGamesSchema).where(inArray(miniGamesSchema.zoneId, zoneIds)),
      db
        .select()
        .from(userZoneProgressSchema)
        .where(eq(userZoneProgressSchema.userId, profileId)),
    ])

    const miniGameByZoneId = new Map(miniGames.map((game) => [game.zoneId, game]))
    const progressByZoneId = new Map(progressRows.map((row) => [row.zoneId, row]))

    const data = zones.map((zone) => {
      const miniGame = miniGameByZoneId.get(zone.id)
      const progress = progressByZoneId.get(zone.id)

      return {
        id: zone.id,
        animaltype: zone.animaltype,
        nameTh: zone.nameTh,
        nameEn: zone.nameEn,
        descriptionTh: zone.descriptionTh,
        iconUrl: zone.iconUrl,
        orderIndex: zone.orderIndex,
        status: progress?.status ?? "locked",
        bestScore: progress?.bestScore ?? 0,
        stampReceivedAt: progress?.stampReceivedAt?.toISOString() ?? null,
        miniGame: miniGame
          ? {
              id: miniGame.id,
              name: miniGame.name,
              gameType: miniGame.gameType,
              timeLimitSeconds: miniGame.timeLimitSeconds,
              passScore: miniGame.passScore ?? 0,
            }
          : null,
      }
    })

    return { success: true, data }
  },
}