import { t } from "elysia"

// shared error response shape — ต้องตรงกับ object ที่ handleApiError คืนกลับเสมอ
// (app/api/src/modules/lib/error-handdle.ts)
export const errorResponseSchema = t.Object({
  success: t.Boolean(),
  message: t.String(),
})
