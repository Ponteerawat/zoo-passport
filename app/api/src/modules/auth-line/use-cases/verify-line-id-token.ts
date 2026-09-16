type LineProfilePayload = {
  sub: string
  name?: string
  picture?: string
}

type LineIdTokenPayload = LineProfilePayload

type LineAccessTokenPayload = {
  client_id: string
  expires_in: number
}

const lineRequest = async (url: string, init: RequestInit) => {
  const response = await fetch(url, init)
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    const detail =
      (body.error_description as string | undefined) ??
      (body.message as string | undefined) ??
      `HTTP ${response.status}`
    throw new Error(`LINE verification failed: ${detail}`)
  }
  return body
}

/** Verifies a LIFF ID token against LINE's Verify ID token endpoint. */
export const verifyLineIdToken = async (idToken: string): Promise<LineIdTokenPayload> => {
  const isMockAllowed =
    Bun.env.USE_LINE_LOGIN_MOCK === "true" && Bun.env.NODE_ENV !== "production"

  if (isMockAllowed) {
    return {
      sub: `mock-line-user-${idToken || "default"}`,
      name: "Mock Tester",
      picture: "https://placehold.co/200x200",
    }
  }

  return lineRequest("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: Bun.env.LINE_CHANNEL_ID ?? "",
    }),
  }) as Promise<LineIdTokenPayload>
}

/** Verifies a LIFF access token, then gets the LINE profile directly from LINE. */
export const verifyLineAccessToken = async (
  accessToken: string,
): Promise<LineProfilePayload> => {
  const channelId = Bun.env.LINE_CHANNEL_ID ?? ""
  const verification = (await lineRequest(
    `https://api.line.me/oauth2/v2.1/verify?access_token=${encodeURIComponent(accessToken)}`,
    { method: "GET" },
  )) as LineAccessTokenPayload

  if (verification.client_id !== channelId || verification.expires_in <= 0) {
    throw new Error("LINE access token is invalid for this channel")
  }

  return lineRequest("https://api.line.me/v2/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  }) as Promise<LineProfilePayload>
}
