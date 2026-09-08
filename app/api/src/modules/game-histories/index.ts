import { Elysia } from "elysia"
import { getGameHistoriesUsecase } from "./use-cases/get-game-histories"
import { getGameHistoriesQuerySchema, getGameHistoriesHeadersSchema } from "./models/history"
import { requireAuth } from "../lib/auth/auth-guard"
import { handleApiError } from "../lib/error-handdle"

export const gameHistory = new Elysia({ prefix: "/game-history" })
  .onError(({ error, set }) => handleApiError(error, set))
  .get(
    "/",
    async ({ headers, query }) => {
      const profileId = requireAuth(headers.authorization)
      return getGameHistoriesUsecase.execute(profileId, query)
    },
    {
      headers: getGameHistoriesHeadersSchema,
      query: getGameHistoriesQuerySchema,
      tags: ["game-history"],
      description: "ดึงประวัติการเล่นเกมของผู้ใช้ที่ login อยู่ พร้อม pagination และ filter",
    },
  )