import type { Context } from "elysia"

export const handleApiError = (error: unknown, set: Context["set"]) => {
  set.status = 500

  return {
    success: false,
    message: "Failed to get game histories",
    error: error instanceof Error ? error.message : "Unknown error",
  }
}
