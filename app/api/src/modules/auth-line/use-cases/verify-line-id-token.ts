// อันที่ comment ไว้ใช้จริงแต่เทส mock data
// type LineIdTokenPayload = {
//   sub: string // LINE user ID
//   name?: string
//   picture?: string
// }

// /** Verifies the ID token with LINE's own endpoint — never trust a client-supplied payload. */
// export const verifyLineIdToken = async (idToken: string): Promise<LineIdTokenPayload> => {
//   const response = await fetch("https://api.line.me/oauth2/v2.1/verify", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       id_token: idToken,
//       client_id: Bun.env.LINE_CHANNEL_ID ?? "",
//     }),
//   })

//   if (!response.ok) {
//     throw new Error("Invalid or expired LINE ID token")
//   }

//   return response.json() as Promise<LineIdTokenPayload>
// }

// test mockdata Line id token 
type LineIdTokenPayload = {
  sub: string // LINE user ID
  name?: string
  picture?: string
}

/** Verifies the ID token with LINE's own endpoint — never trust a client-supplied payload. */
export const verifyLineIdToken = async (idToken: string): Promise<LineIdTokenPayload> => {
  if (Bun.env.USE_LINE_LOGIN_MOCK === "true") {
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