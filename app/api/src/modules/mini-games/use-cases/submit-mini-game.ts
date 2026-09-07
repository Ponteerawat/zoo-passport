import { eq, and, sql } from "drizzle-orm"
import {
  db,
  miniGamesSchema,
  miniGameAttemptsSchema,
  userZoneProgressSchema,
  profilesSchema
} from "@repo/database"
import { verifyJwt } from "../../lib/auth/jwt"

type SessionPayload = {
  sub: string
  zoneId: string
  miniGameId: string
  startedAt: number
}

const MIN_PLAY_SECONDS = 2 // เร็วกว่านี้ = ไม่ใช่คนเล่นจริงแน่ๆ

export const submitMiniGameUsecase = {
  async execute(profileId: string, zoneId: string, sessionToken: string, score: number) {
    // 1-2: token ต้องถูกต้อง ยังไม่หมดอายุ และเป็นของ user + zone นี้จริง
    const session = verifyJwt<SessionPayload>(sessionToken, Bun.env.JWT_SECRET ?? "")

    if (session.sub !== profileId || session.zoneId !== zoneId) {
      throw new Error("Session token does not match this user or zone")
    }

    // 3: เวลาที่ใช้เล่นต้องสมเหตุสมผล (คำนวณฝั่ง server ล้วนๆ ไม่เชื่อ client)
    const timeTakenSeconds = Math.round((Date.now() - session.startedAt) / 1000)

    if (timeTakenSeconds < MIN_PLAY_SECONDS) {
      throw new Error("Suspiciously fast submission")
    }

    const [miniGame] = await db
      .select()
      .from(miniGamesSchema)
      .where(eq(miniGamesSchema.id, session.miniGameId))
      .limit(1)

    if (!miniGame) {
      throw new Error("Mini-game not found")
    }

    // 4: กันยัด score เกินขีดจำกัด ถ้าเกมนั้นกำหนด maxScore ไว้ใน config
    const maxScore = (miniGame.config as { maxScore?: number } | null)?.maxScore
    if (typeof maxScore === "number" && score > maxScore) {
      throw new Error("Score exceeds the maximum possible for this game")
    }

    const passScore = miniGame.passScore ?? 0
    const isPassed = score >= passScore

    await db.insert(miniGameAttemptsSchema).values({
      userId: profileId,
      miniGameId: miniGame.id,
      score,
      timeTakenSeconds,
      isPassed,
    })

    const [progress] = await db
      .select()
      .from(userZoneProgressSchema)
      .where(
        and(
          eq(userZoneProgressSchema.userId, profileId),
          eq(userZoneProgressSchema.zoneId, zoneId),
        ),
      )
      .limit(1)

    const wasAlreadyCompleted = progress?.status === "completed"
    const previousBestScore = progress?.bestScore ?? 0
    const bestScore = Math.max(previousBestScore, score)
    const pointsDelta = bestScore - previousBestScore // 0 ถ้าเล่นไม่ทำลาย best เดิม
    const stampUnlocked = isPassed && !wasAlreadyCompleted

    if (progress) {
      await db
        .update(userZoneProgressSchema)
        .set({
          bestScore,
          status: isPassed ? "completed" : progress.status,
          stampReceivedAt: stampUnlocked ? new Date() : progress.stampReceivedAt,
          updatedAt: new Date(),
        })
        .where(eq(userZoneProgressSchema.id, progress.id))
    }

    // totalPoints = ผลรวม bestScore ของทุกโซน — บวกเฉพาะส่วนต่างตอนทำลาย record เดิมได้เท่านั้น
    if (pointsDelta > 0) {
      await db
        .update(profilesSchema)
        .set({ totalPoints: sql`${profilesSchema.totalPoints} + ${pointsDelta}` })
        .where(eq(profilesSchema.id, profileId))
    }

    return {
      success: true,
      data: { isPassed, score, passScore, bestScore, stampUnlocked },
    }
  },
}