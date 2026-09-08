import { eq, and, count } from "drizzle-orm"
import { db, profilesSchema, userZoneProgressSchema } from "@repo/database"

export const getProfileUsecase = {
  async execute(profileId: string) {
    const [profile] = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.id, profileId))
      .limit(1)

    if (!profile) {
      throw new Error("Profile not found")
    }

    const [ zoneProgress ] = await db
      .select({ stampsCollected: count() })
      .from(userZoneProgressSchema)
      .where(
        and(
          eq(userZoneProgressSchema.userId, profileId),
          eq(userZoneProgressSchema.status, "completed"),
        ),
      )

    return {
      success: true,
      data: {
        id: profile.id,
        lineUserId: profile.lineUserId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        totalPoints: profile.totalPoints,
        stampsCollected: Number(zoneProgress?.stampsCollected ?? 0),
        totalZones: 6, // จำนวนโซนทั้งหมด — hardcode ไว้ก่อน หรือ query count(*) จาก zonesSchema ก็ได้
      },
    }
  },
}