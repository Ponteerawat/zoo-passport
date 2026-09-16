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

    if (idToken) {
      try {
        linePayload = await verifyLineIdToken(idToken)
      } catch (idTokenError) {
        if (!accessToken) throw idTokenError
      }
    }

    if (!linePayload) {
      linePayload = await verifyLineAccessToken(accessToken!)
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
