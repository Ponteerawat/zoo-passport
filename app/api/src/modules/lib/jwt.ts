import { createHmac } from "crypto"

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
