import { verifyLineAccessToken, verifyLineIdToken } from "./verify-line-id-token"
import { upsertLineProfile } from "./upsert-line-profile"
import { signJwt } from "../../lib/auth/jwt"
import type { LineLoginBody } from "../models/auth"

export const lineLoginUsecase = {
  async execute({ idToken, accessToken }: LineLoginBody) {
    if (!idToken && !accessToken) {
      throw new Error("LINE token is required")
    }

    let linePayload: Awaited<ReturnType<typeof verifyLineAccessToken>> | undefined

    if (accessToken) {
      try {
        linePayload = await verifyLineAccessToken(accessToken)
      } catch (accessError) {
        if (!idToken) throw accessError
      }
    }

    if (!linePayload) {
      linePayload = await verifyLineIdToken(idToken!)
    }

    const profile = await upsertLineProfile({
      lineUserId: linePayload.sub,
      displayName: linePayload.name,
      avatarUrl: linePayload.picture,
    })

    const sessionToken = signJwt(
      { sub: profile.id, lineUserId: profile.lineUserId },
      Bun.env.JWT_SECRET ?? "",
    )

    return {
      success: true,
      data: { accessToken: sessionToken, profile },
    }
  },
}
