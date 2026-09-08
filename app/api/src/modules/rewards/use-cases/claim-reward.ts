import { eq, and, count, sql } from "drizzle-orm"
import {
  db,
  rewardsSchema,
  userRewardsSchema,
  userZoneProgressSchema,
  profilesSchema,
} from "@repo/database"

export const claimRewardUsecase = {
  async execute(profileId: string, rewardId: string) {
    const [reward] = await db.select().from(rewardsSchema).where(eq(rewardsSchema.id, rewardId)).limit(1)

    if (!reward) {
      throw new Error("Reward not found")
    }

    const [existingClaim] = await db
      .select()
      .from(userRewardsSchema)
      .where(and(eq(userRewardsSchema.userId, profileId), eq(userRewardsSchema.rewardId, rewardId)))
      .limit(1)

    if (existingClaim) {
      throw new Error("Reward already claimed")
    }

    // ตรวจฝั่ง server เสมอ — ห้ามเชื่อ isEligible ที่ client อาจเคยเห็นจาก /rewards ตอนก่อนหน้า
    const [ completedZoneRow ] = await db
      .select({ completedZones: count() })
      .from(userZoneProgressSchema)
      .where(
        and(
          eq(userZoneProgressSchema.userId, profileId),
          eq(userZoneProgressSchema.status, "completed"),
        ),
      )

    if (Number(completedZoneRow?.completedZones ?? 0) < reward.requiredStamps) {
      throw new Error("Not enough stamps collected yet")
    }

    const [claim] = await db
      .insert(userRewardsSchema)
      .values({ userId: profileId, rewardId })
      .returning()

    if (!claim) {
      throw new Error("Failed to record reward claim")
    }

    const [updatedProfile] = await db
      .update(profilesSchema)
      .set({ totalPoints: sql`${profilesSchema.totalPoints} + ${reward.pointsValue}` })
      .where(eq(profilesSchema.id, profileId))
      .returning()

    if (!updatedProfile) {
      throw new Error("Failed to update profile points")
    }  

    return {
      success: true,
      data: {
        rewardId: reward.id,
        pointsAwarded: reward.pointsValue,
        totalPoints: updatedProfile.totalPoints,
        claimedAt: claim.claimedAt.toISOString(),
      },
    }
  },
}