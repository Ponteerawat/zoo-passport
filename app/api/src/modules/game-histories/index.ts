import { Elysia } from "elysia"
import { getGameHistoriesUsecase } from "./use-cases/get-game-histories"
import { getGameHistoriesQuerySchema } from "./models/history"
import { handleApiError } from "../lib/error-handdle"

export const gameHistory = new Elysia({ prefix: "/game-history" })
  .onError(({ error, set }) => handleApiError(error, set))
  .get(
    "/",
    async ({ query }) => {
      const gamehistories = await getGameHistoriesUsecase.execute(query)
      return gamehistories
    },
    {
      query: getGameHistoriesQuerySchema,
      tags: ["game-history"],
      description: "ดึงประวัติการเล่นเกมของผู้ใช้พร้อม pagination และ filter",
    },
  )
