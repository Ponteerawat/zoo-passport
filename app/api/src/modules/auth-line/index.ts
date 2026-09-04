import { Elysia } from "elysia"
import { lineLoginUsecase } from "./use-cases/line-login"
import { lineLoginBodySchema, lineLoginResponseSchema } from "./models/auth"
import { handleApiError } from "../lib/error-handdle"

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
      response: lineLoginResponseSchema,
      tags: ["auth"],
      description: "แลก LINE ID token เป็น session ของแอป พร้อมสร้าง/ดึงโปรไฟล์ผู้ใช้",
    },
  )
