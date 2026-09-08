import { eq, and } from "drizzle-orm"
import { db, miniGamesSchema, userZoneProgressSchema } from "@repo/database"
import { signJwt } from "../../lib/auth/jwt"

const GRACE_SECONDS = 30 // เผื่อ network lag ตอนส่ง submit กลับมา

export const startMiniGameUsecase = {
  async execute(profileId: string, zoneId: string) {
    const [miniGame] = await db
      .select()
      .from(miniGamesSchema)
      .where(and(eq(miniGamesSchema.zoneId, zoneId), eq(miniGamesSchema.isActive, true)))
      .limit(1)

    if (!miniGame) {
      throw new Error("Mini-game not found for this zone")
    }

    const [progress] = await db
      .select()
      .from(userZoneProgressSchema)
      .where(
        and(
          eq(userZoneProgressSchema.userId, profileId),
          eq(userZoneProgressSchema.zoneId, zoneId),
        ),
      )
      .limit(1)

    if (!progress || progress.status === "locked") {
      throw new Error("Zone not checked in yet — scan the QR code first")
    }

    const sessionToken = signJwt(
      { sub: profileId, zoneId, miniGameId: miniGame.id, startedAt: Date.now() },
      Bun.env.JWT_SECRET ?? "",
      (miniGame.timeLimitSeconds ?? 60) + GRACE_SECONDS,
    )

    return {
      success: true,
      data: {
        sessionToken,
        miniGame: {
          id: miniGame.id,
          name: miniGame.name,
          gameType: miniGame.gameType,
          timeLimitSeconds: miniGame.timeLimitSeconds,
          passScore: miniGame.passScore ?? 0,
          config: miniGame.config,
        },
      },
    }
  },
}