import { verifyJwt } from "./jwt"

type SessionPayload = {
  sub: string // profile.id
  lineUserId: string
}

/** Extracts and verifies the Bearer token, returning the authenticated profile id. */
export const requireAuth = (authorizationHeader: string | undefined): string => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or malformed Authorization header")
  }

  const token = authorizationHeader.slice("Bearer ".length)
  const { sub } = verifyJwt<SessionPayload>(token, Bun.env.JWT_SECRET ?? "")

  return sub
}