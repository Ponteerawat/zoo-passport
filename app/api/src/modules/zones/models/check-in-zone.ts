import { t } from "elysia"

export const checkInZoneBodySchema = t.Object({
  qrSecret: t.String({ description: "ค่าที่อ่านได้จากการสแกน QR หน้ากรงสัตว์" }),
})

export const checkInZoneResponseSchema = t.Object({
  success: t.Boolean(),
  data: t.Object({
    zone: t.Object({
      id: t.String(),
      animaltype: t.String(),
      nameTh: t.String(),
      nameEn: t.String(),
      descriptionTh: t.Nullable(t.String()),
      iconUrl: t.Nullable(t.String()),
    }),
    status: t.String(), // 'in_progress' | 'completed'
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
})