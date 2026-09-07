import { Elysia, t } from "elysia"
import { startMiniGameUsecase } from "./use-cases/start-mini-game"
import { submitMiniGameUsecase } from "./use-cases/submit-mini-game"
import {
  miniGameHeadersSchema,
  startMiniGameResponseSchema,
  submitMiniGameBodySchema,
  submitMiniGameResponseSchema,
} from "./models/mini-games"
import { requireAuth } from "../lib/auth/auth-guard"
import { handleApiError } from "../lib/error-handdle"

export const miniGames = new Elysia({ prefix: "/mini-games" })
  .onError(({ error, set }) => handleApiError(error, set))
  .post(
    "/:zoneId/start",
    async ({ headers, params }) => {
      const profileId = requireAuth(headers.authorization)
      return startMiniGameUsecase.execute(profileId, params.zoneId)
    },
    {
      headers: miniGameHeadersSchema,
      params: t.Object({ zoneId: t.String() }),
      response: startMiniGameResponseSchema,
      tags: ["mini-games"],
      description: "เริ่มเล่นมินิเกมของโซนนี้ ออก session token อายุสั้นๆ ไว้ตรวจตอน submit",
    },
  )
  .post(
    "/:zoneId/submit",
    async ({ headers, params, body }) => {
      const profileId = requireAuth(headers.authorization)
      return submitMiniGameUsecase.execute(profileId, params.zoneId, body.sessionToken, body.score)
    },
    {
      headers: miniGameHeadersSchema,
      params: t.Object({ zoneId: t.String() }),
      body: submitMiniGameBodySchema,
      response: submitMiniGameResponseSchema,
      tags: ["mini-games"],
      description: "ส่งคะแนนหลังเล่นจบ ตรวจ anti-cheat ครบทุกจุดก่อนปลดล็อกตรา",
    },
  )