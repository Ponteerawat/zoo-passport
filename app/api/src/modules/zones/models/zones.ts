import { t } from "elysia"

export const getZonesHeadersSchema = t.Object({
  authorization: t.String(),
})

export const getZonesResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Array(
    t.Object({
      id: t.String(),
      animaltype: t.String(),
      nameTh: t.String(),
      nameEn: t.String(),
      descriptionTh: t.Nullable(t.String()),
      iconUrl: t.Nullable(t.String()),
      orderIndex: t.Number(),
      status: t.String(), // 'locked' | 'available' | 'in_progress' | 'completed'
      bestScore: t.Number(),
      stampReceivedAt: t.Nullable(t.String()),
      miniGame: t.Nullable(
        t.Object({
          id: t.String(),
          name: t.String(),
          gameType: t.String(),
          timeLimitSeconds: t.Nullable(t.Number()),
          passScore: t.Number(),
        }),
      ),
    }),
  ),
})