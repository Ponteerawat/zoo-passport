import { Elysia } from "elysia"
import { getProfileUsecase } from "./use-cases/get-profile"
import { resetProgressUsecase } from "./use-cases/reset-progress"
import {
  getProfileHeadersSchema,
  profileResponseSchema,
  resetProgressHeadersSchema,
  resetProgressResponseSchema,
} from "./models/profile"
import { requireAuth } from "../lib/auth/auth-guard"
import { handleApiError } from "../lib/error-handdle"
import { errorResponseSchema } from "../lib/error-response-schema"

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
      response: { 200: profileResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
      tags: ["profile"],
      description: "ดึงข้อมูลโปรไฟล์ผู้ใช้ที่ login อยู่ (ต้องแนบ Authorization: Bearer <token>)",
    },
  )
  .delete(
    "/reset",
    async ({ headers }) => {
      const profileId = requireAuth(headers.authorization)
      return resetProgressUsecase.execute(profileId)
    },
    {
      headers: resetProgressHeadersSchema,
      response: { 200: resetProgressResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
      tags: ["profile"],
      description:
        "รีเซ็ต progress ทั้งหมดของผู้ใช้ที่ login อยู่ (ลบ zone progress, ประวัติมินิเกม, รางวัลที่รับแล้ว และรีเซ็ตแต้มเป็น 0) — ทำแล้วกู้คืนไม่ได้",
    },
  )