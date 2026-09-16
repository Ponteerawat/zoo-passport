import { eq } from "drizzle-orm"
import {
  db,
  profilesSchema,
  userZoneProgressSchema,
  miniGameAttemptsSchema,
  userRewardsSchema,
} from "@repo/database"

export const resetProgressUsecase = {
  async execute(profileId: string) {
    // ลบ progress ทุกโซน, ประวัติเล่นมินิเกม, และรางวัลที่รับไปแล้วของ user คนนี้
    // + รีเซ็ตแต้มสะสมกลับเป็น 0 — ทำเป็น transaction เดียวกันกันข้อมูลค้างครึ่งๆ กลางๆ
    await db.transaction(async (tx) => {
      await tx
        .delete(userZoneProgressSchema)
        .where(eq(userZoneProgressSchema.userId, profileId))

      await tx
        .delete(miniGameAttemptsSchema)
        .where(eq(miniGameAttemptsSchema.userId, profileId))

      await tx
        .delete(userRewardsSchema)
        .where(eq(userRewardsSchema.userId, profileId))

      await tx
        .update(profilesSchema)
        .set({ totalPoints: 0, updatedAt: new Date() })
        .where(eq(profilesSchema.id, profileId))
    })

    return { success: true, data: { success: true } }
  },
}
