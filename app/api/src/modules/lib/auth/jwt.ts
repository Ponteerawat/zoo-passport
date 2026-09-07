import { createHmac } from "crypto"
import { timingSafeEqual } from "crypto"

const base64UrlEncode = (input: string) => Buffer.from(input).toString("base64url")

/** Signs a compact HS256 JWT without pulling in an extra dependency. */
export const signJwt = (
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds = 60 * 60 * 24 * 7, // 7 days
) => {
  const header = { alg: "HS256", typ: "JWT" }
  const issuedAt = Math.floor(Date.now() / 1000)

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(
    JSON.stringify({ ...payload, iat: issuedAt, exp: issuedAt + expiresInSeconds }),
  )

  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url")

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/** Verifies signature + expiry of a token created by signJwt. Throws if invalid/expired. */
export const verifyJwt = <T extends Record<string, unknown>>(token: string, secret: string): T => {
  const [encodedHeader, encodedPayload, signature] = token.split(".")

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Malformed token")
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url")

  const isValid =
    signature.length === expectedSignature.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))

  if (!isValid) {
    throw new Error("Invalid token signature")
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString()) as T & { exp: number }

  if (payload.exp * 1000 < Date.now()) {
    throw new Error("Token expired")
  }

  return payload
}