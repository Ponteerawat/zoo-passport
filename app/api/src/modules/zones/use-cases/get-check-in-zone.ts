import { eq, and } from "drizzle-orm"
import {
  db,
  zonesSchema,
  miniGamesSchema,
  userZoneProgressSchema,
} from "@repo/database"

export const checkInZoneUsecase = {
  async execute(profileId: string, qrSecret: string) {
    const [zone] = await db
      .select()
      .from(zonesSchema)
      .where(eq(zonesSchema.qrSecret, qrSecret))
      .limit(1)

    if (!zone) {
      throw new Error("Invalid QR code")
    }

    const [existingProgress] = await db
      .select()
      .from(userZoneProgressSchema)
      .where(
        and(
          eq(userZoneProgressSchema.userId, profileId),
          eq(userZoneProgressSchema.zoneId, zone.id),
        ),
      )
      .limit(1)

    // Never downgrade a zone that's already completed — checking in again
    // (e.g. walking past the same enclosure twice) shouldn't reset progress.
    const status = existingProgress?.status === "completed" ? "completed" : "in_progress"

    if (!existingProgress) {
      await db.insert(userZoneProgressSchema).values({
        userId: profileId,
        zoneId: zone.id,
        status: "in_progress",
      })
    } else if (existingProgress.status !== "completed") {
      await db
        .update(userZoneProgressSchema)
        .set({ status: "in_progress", updatedAt: new Date() })
        .where(eq(userZoneProgressSchema.id, existingProgress.id))
    }

    const [miniGame] = await db
      .select()
      .from(miniGamesSchema)
      .where(eq(miniGamesSchema.zoneId, zone.id))
      .limit(1)

    return {
      success: true,
      data: {
        zone: {
          id: zone.id,
          animaltype: zone.animaltype,
          nameTh: zone.nameTh,
          nameEn: zone.nameEn,
          descriptionTh: zone.descriptionTh,
          iconUrl: zone.iconUrl,
        },
        status,
        miniGame: miniGame
          ? {
              id: miniGame.id,
              name: miniGame.name,
              gameType: miniGame.gameType,
              timeLimitSeconds: miniGame.timeLimitSeconds,
              passScore: miniGame.passScore ?? 0,
            }
          : null,
      },
    }
  },
}