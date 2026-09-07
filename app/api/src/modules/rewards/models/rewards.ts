import { t } from "elysia"

export const rewardsHeadersSchema = t.Object({
  authorization: t.String(),
})

export const getRewardsResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Array(
    t.Object({
      id: t.String(),
      animaltype: t.String(),
      nameTh: t.String(),
      descriptionTh: t.Nullable(t.String()),
      imageUrl: t.Nullable(t.String()),
      requiredStamps: t.Number(),
      pointsValue: t.Number(),
      isEligible: t.Boolean(),
      isClaimed: t.Boolean(),
      claimedAt: t.Nullable(t.String()),
    }),
  ),
})

export const claimRewardParamsSchema = t.Object({
  id: t.String(),
})

export const claimRewardResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    rewardId: t.String(),
    pointsAwarded: t.Number(),
    totalPoints: t.Number(),
    claimedAt: t.String(),
  }),
})