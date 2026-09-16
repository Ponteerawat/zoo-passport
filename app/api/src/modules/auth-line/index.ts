import { Elysia } from "elysia"
import { lineLoginUsecase } from "./use-cases/line-login"
import { lineLoginBodySchema, lineLoginResponseSchema } from "./models/auth"
import { handleApiError } from "../lib/error-handdle"
import { errorResponseSchema } from "../lib/error-response-schema"

export const authLine = new Elysia({ prefix: "/auth" })
  .onError(({ error, set }) => handleApiError(error, set))
  .post(
    "/line-login",
    async ({ body }) => {
      const linelogin = await lineLoginUsecase.execute(body)
      return linelogin
    },
    {
      body: lineLoginBodySchema,
      response: { 200: lineLoginResponseSchema, 401: errorResponseSchema, 404: errorResponseSchema, 500: errorResponseSchema },
      tags: ["auth"],
      description: "แลก LINE ID token เป็น session ของแอป พร้อมสร้าง/ดึงโปรไฟล์ผู้ใช้",
    },
  )
