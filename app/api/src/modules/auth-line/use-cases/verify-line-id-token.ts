type LineIdTokenPayload = {
  sub: string // LINE user ID
  name?: string
  picture?: string
}

/** Verifies the ID token with LINE's own endpoint — never trust a client-supplied payload. */
export const verifyLineIdToken = async (idToken: string): Promise<LineIdTokenPayload> => {
  // Safeguard: mock ใช้ได้เฉพาะตอน dev เท่านั้น ต่อให้ลืมลบ/ลืมปิด
  // USE_LINE_LOGIN_MOCK ใน production env ก็ยังไม่มีทาง bypass การ verify จริงได้
  const isMockAllowed =
    Bun.env.USE_LINE_LOGIN_MOCK === "true" && Bun.env.NODE_ENV !== "production"

  if (isMockAllowed) {
    return {
      sub: `mock-line-user-${idToken || "default"}`,
      name: "Mock Tester",
      picture: "https://placehold.co/200x200",
    }
  }

  const response = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: Bun.env.LINE_CHANNEL_ID ?? "",
    }),
  })

  if (!response.ok) {
    throw new Error("Invalid or expired LINE ID token")
  }

  return response.json() as Promise<LineIdTokenPayload>
}