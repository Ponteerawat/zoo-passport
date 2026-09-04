import { verifyLineIdToken } from "./verify-line-id-token"
import { upsertLineProfile } from "./upsert-line-profile"
import { signJwt } from "../../lib/jwt"
import type { LineLoginBody } from "../models/auth"

export const lineLoginUsecase = {
  async execute({ idToken }: LineLoginBody) {
    const linePayload = await verifyLineIdToken(idToken)

    const profile = await upsertLineProfile({
      lineUserId: linePayload.sub,
      displayName: linePayload.name,
      avatarUrl: linePayload.picture,
    })

    const accessToken = signJwt(
      { sub: profile.id, lineUserId: profile.lineUserId },
      Bun.env.JWT_SECRET ?? "",
    )

    return {
      success: true,
      data: { accessToken, profile },
    }
  },
}
