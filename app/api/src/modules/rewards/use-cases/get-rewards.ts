import { eq, and, count } from "drizzle-orm"
import {
  db,
  rewardsSchema,
  userRewardsSchema,
  userZoneProgressSchema
} from "@repo/database"

export const getRewardsUsecase = {
  async execute(profileId: string) {
    const [rewards, claimedRewards, completedZones ] = await Promise.all([
      db.select().from(rewardsSchema),
      db.select().from(userRewardsSchema).where(eq(userRewardsSchema.userId, profileId)),
      db
        .select({ completedZones: count() })
        .from(userZoneProgressSchema)
        .where(
          and(
            eq(userZoneProgressSchema.userId, profileId),
            eq(userZoneProgressSchema.status, "completed"),
          ),
        ),
    ])

    const claimedByRewardId = new Map(claimedRewards.map((row) => [row.rewardId, row]))
    const completedCount = Number(completedZones)

    const data = rewards.map((reward) => {
      const claimed = claimedByRewardId.get(reward.id)

      return {
        id: reward.id,
        animaltype: reward.animaltype,
        nameTh: reward.nameTh,
        descriptionTh: reward.descriptionTh,
        imageUrl: reward.imageUrl,
        requiredStamps: reward.requiredStamps,
        pointsValue: reward.pointsValue,
        isEligible: completedCount >= reward.requiredStamps,
        isClaimed: Boolean(claimed),
        claimedAt: claimed?.claimedAt?.toISOString() ?? null,
      }
    })

    return { success: true, data }
  },
}