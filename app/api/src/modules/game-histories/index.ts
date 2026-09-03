import { Elysia } from "elysia"
import { getGameHistories } from "./use-cases/get-game-histories"
import { getGameHistoriesQuerySchema } from "./models/history"

export const gamehistories = new Elysia({ prefix: "/game-histories" })
  .get(
    "/",
    async ({ query, set }) => {
      try {
        return await getGameHistories(query)
      } catch (error) {
        set.status = 500
        return {
          success: false,
          message: "Failed to get game histories",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    },
    {
      query: getGameHistoriesQuerySchema,
      tags: ["game-histories"],
      description: "ดึงประวัติการเล่นเกมของผู้ใช้พร้อม pagination และ filter",
    },
  )
