import { Elysia } from "elysia"
import { getProfileUsecase } from "./use-cases/get-profile"
import { getProfileHeadersSchema, profileResponseSchema } from "./models/profile"
import { requireAuth } from "../lib/auth/auth-guard"
import { handleApiError } from "../lib/error-handdle"

export const profile = new Elysia({ prefix: "/profile" })
  .onError(({ error, set }) => handleApiError(error, set))
  .get(
    "/",
    async ({ headers }) => {
      const profileId = requireAuth(headers.authorization)
      return getProfileUsecase.execute(profileId)
    },
    {
      headers: getProfileHeadersSchema,
      response: profileResponseSchema,
      tags: ["profile"],
      description: "ดึงข้อมูลโปรไฟล์ผู้ใช้ที่ login อยู่ (ต้องแนบ Authorization: Bearer <token>)",
    },
  )