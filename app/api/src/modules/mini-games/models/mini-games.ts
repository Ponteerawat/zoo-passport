import { t } from "elysia"

export const miniGameHeadersSchema = t.Object({
  authorization: t.String(),
})

export const startMiniGameResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    sessionToken: t.String(),
    miniGame: t.Object({
      id: t.String(),
      name: t.String(),
      gameType: t.String(),
      timeLimitSeconds: t.Nullable(t.Number()),
      passScore: t.Number(),
      config: t.Any(),
    }),
  }),
})

export const submitMiniGameBodySchema = t.Object({
  sessionToken: t.String(),
  score: t.Integer({ minimum: 0 }),
})

export const submitMiniGameResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    isPassed: t.Boolean(),
    score: t.Number(),
    passScore: t.Number(),
    bestScore: t.Number(),
    stampUnlocked: t.Boolean(), // true เฉพาะตอนที่เพิ่งผ่านครั้งแรก (ไม่ใช่ทุกครั้งที่ isPassed)
  }),
})