import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { openapi } from "@elysia/openapi"

import { gameHistory } from "./game-histories"
import { authLine } from "./auth-line"
import { profile } from "./profiles"
import { zones } from "./zones"
import { miniGames } from "./mini-games"
import { rewards } from "./rewards"

const port = process.env.API_PORT || 3003
const isProd = process.env.NODE_ENV === "production"

// CORS: prod จะรับเฉพาะโดเมนที่ระบุใน CORS_ORIGINS (คั่นด้วย comma) เท่านั้น
// dev ปล่อยรับทุก origin เหมือนเดิมเพื่อความสะดวก
const corsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

if (isProd && corsOrigins.length === 0) {
  throw new Error(
    "CORS_ORIGINS is required in production — ตั้งเป็นโดเมนของ frontend เช่น https://your-app.com",
  )
}

// เอกสาร API (/docs, /swagger): เปิดใน dev เสมอ, บน prod เปิดเฉพาะเมื่อตั้ง ENABLE_API_DOCS=true
const enableDocs = !isProd || process.env.ENABLE_API_DOCS === "true"

const docsPlugin = enableDocs
  ? new Elysia()
      .use(openapi({
        path: "/docs",
        documentation: {
          info: {
            title: "ZOO Passport API",
            version: "1.0.0",
            description: "API documentation for ZOO Passport",
          },
          tags: [
            { name: "game-history", description: "Game history endpoints" },
            { name: "auth", description: "LINE login & session endpoints" },
            { name: "profile", description: "Profile endpoints" },
            { name: "zones", description: "Zones endpoints" },
            { name: "mini-games", description: "Mini-games endpoints" },
            { name: "rewards", description: "Rewards endpoints" },
          ],
        },
      }))
      .use(swagger({
        path: "/swagger",
        documentation: {
          info: {
            title: "API documentation for ZOO Passport",
            version: "1.0.0",
          },
        },
      }))
  : new Elysia()

const app = new Elysia({ prefix: "api/v1" })
  .use(cors({ origin: isProd ? corsOrigins : true }))
  .use(docsPlugin)
  .use(authLine)
  .use(gameHistory)
  .use(profile)
  .use(zones)
  .use(miniGames)
  .use(rewards)
  .get("/health", () => ({ status: "ok" }))
  .listen(port)

export { app }
