import { eq, and, sql } from "drizzle-orm"
import {
  db,
  rewardsSchema,
  userRewardsSchema,
  profilesSchema,
} from "@repo/database"

export const claimRewardUsecase = {
  async execute(profileId: string, rewardId: string) {
    const [reward] = await db
      .select()
      .from(rewardsSchema)
      .where(eq(rewardsSchema.id, rewardId))
      .limit(1)

    if (!reward) {
      throw new Error("Reward not found")
    }

    const [existingClaim] = await db
      .select()
      .from(userRewardsSchema)
      .where(
        and(
          eq(userRewardsSchema.userId, profileId),
          eq(userRewardsSchema.rewardId, rewardId),
        ),
      )
      .limit(1)

    if (existingClaim) {
      throw new Error("Reward already claimed")
    }

    // Server-side check: the coupon unlocks at 600 total points.
    const [profile] = await db
      .select({ totalPoints: profilesSchema.totalPoints })
      .from(profilesSchema)
      .where(eq(profilesSchema.id, profileId))
      .limit(1)

    if (Number(profile?.totalPoints ?? 0) < 600) {
      throw new Error("Not enough points to unlock this coupon")
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
