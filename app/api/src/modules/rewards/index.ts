import { Elysia } from "elysia"
import { getRewardsUsecase } from "./use-cases/get-rewards"
import { claimRewardUsecase } from "./use-cases/claim-reward"
import {
  rewardsHeadersSchema,
  getRewardsResponseSchema,
  claimRewardParamsSchema,
  claimRewardResponseSchema,
} from "./models/rewards"
import { requireAuth } from "../lib/auth/auth-guard"
import { handleApiError } from "../lib/error-handdle"
import { errorResponseSchema } from "../lib/error-response-schema"

export const rewards = new Elysia({ prefix: "/rewards" })
  .onError(({ error, set }) => handleApiError(error, set))
  .get(
    "/",
    async ({ headers }) => {
      const profileId = requireAuth(headers.authorization)
      return getRewardsUsecase.execute(profileId)
    },
    {
      headers: rewardsHeadersSchema,
      response: { 200: getRewardsResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
      tags: ["rewards"],
      description: "ดึงรายการรางวัลทั้งหมด พร้อมสถานะว่า user คนนี้เก็บครบ/รับไปแล้วหรือยัง",
    },
  )
  .post(
    "/:id/claim",
    async ({ headers, params }) => {
      const profileId = requireAuth(headers.authorization)
      return claimRewardUsecase.execute(profileId, params.id)
    },
    {
      headers: rewardsHeadersSchema,
      params: claimRewardParamsSchema,
      response: { 200: claimRewardResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
      tags: ["rewards"],
      description: "รับรางวัล ตรวจสอบเงื่อนไขซ้ำฝั่ง server ก่อนบวกคะแนนและบันทึกการรับ",
    },
  )