import { Elysia } from "elysia"
import { getZonesUsecase } from "./use-cases/get-zones"
import { checkInZoneUsecase } from "./use-cases/get-check-in-zone"
import { getZonesHeadersSchema, getZonesResponseSchema } from "./models/zones"
import { checkInZoneBodySchema, checkInZoneResponseSchema } from "./models/check-in-zone"
import { requireAuth } from "../lib/auth/auth-guard"
import { handleApiError } from "../lib/error-handdle"

export const zones = new Elysia({ prefix: "/zones" })
  .onError(({ error, set }) => handleApiError(error, set))
  .get(
    "/",
    async ({ headers }) => {
      const profileId = requireAuth(headers.authorization)
      return getZonesUsecase.execute(profileId)
    },
    {
      headers: getZonesHeadersSchema,
      response: getZonesResponseSchema,
      tags: ["zones"],
      description: "ดึงรายการโซนทั้งหมด พร้อมสถานะ/คะแนนของผู้ใช้ที่ login อยู่",
    },
  )
  .post(
    "/check-in",
    async ({ headers, body }) => {
      const profileId = requireAuth(headers.authorization)
      return checkInZoneUsecase.execute(profileId, body.qrSecret)
    },
    {
      headers: getZonesHeadersSchema,
      body: checkInZoneBodySchema,
      response: checkInZoneResponseSchema,
      tags: ["zones"],
      description: "เช็คอินเข้าโซนด้วยการสแกน QR หน้ากรง — สร้าง/อัปเดตสถานะ user_zone_progress เป็น in_progress",
    },
  )