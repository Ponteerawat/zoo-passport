import { t } from "elysia"

export const lineLoginBodySchema = t.Object({
  idToken: t.String({ description: "LINE ID token from LIFF's liff.getIDToken()" }),
})

export type LineLoginBody = typeof lineLoginBodySchema.static

export const lineLoginResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    accessToken: t.String(),
    profile: t.Object({
      id: t.String(),
      lineUserId: t.String(),
      displayName: t.Nullable(t.String()),
      avatarUrl: t.Nullable(t.String()),
      totalPoints: t.Number(),
    }),
  }),
})
