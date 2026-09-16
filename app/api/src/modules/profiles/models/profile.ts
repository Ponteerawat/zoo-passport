import { t } from "elysia"

export const getProfileHeadersSchema = t.Object({
  authorization: t.String(),
})

export const profileResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    id: t.String(),
    lineUserId: t.String(),
    displayName: t.Nullable(t.String()),
    avatarUrl: t.Nullable(t.String()),
    totalPoints: t.Number(),
    stampsCollected: t.Number(),
    totalZones: t.Number(),
  }),
})

export type GetProfileHeaders = typeof getProfileHeadersSchema.static
export type ProfileResponse = typeof profileResponseSchema.static

export const resetProgressHeadersSchema = t.Object({
  authorization: t.String(),
})

export const resetProgressResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    success: t.Boolean(),
  }),
})

export type ResetProgressHeaders = typeof resetProgressHeadersSchema.static
export type ResetProgressResponse = typeof resetProgressResponseSchema.static