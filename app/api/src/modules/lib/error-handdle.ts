import type { Context } from "elysia"

// จับคู่ message ของ error กับ status code ที่เหมาะสม — เช็คตามลำดับ ใช้ตัวแรกที่ match
const STATUS_RULES: Array<[RegExp, number]> = [
  [/authorization|unauthorized|invalid.*token|token.*expired/i, 401],
  [/invalid qr code|not found/i, 404],
]

export const handleApiError = (error: unknown, set: Context["set"]) => {
  // สำคัญ: ต้องส่ง message จริงของ error กลับไปเสมอ ห้าม hardcode ข้อความตายตัว
  // ไม่งั้น frontend จะโชว์ error ผิด endpoint (เคย hardcode เป็นข้อความของ game-histories ทุกจุด)
  const message = error instanceof Error ? error.message : "Unexpected server error"

  const matchedRule = STATUS_RULES.find(([pattern]) => pattern.test(message))
  set.status = matchedRule ? matchedRule[1] : 500

  return {
    success: false,
    message,
  }
}
