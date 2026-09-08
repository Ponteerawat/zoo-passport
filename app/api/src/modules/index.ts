import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { openapi } from "@elysia/openapi"

import { gameHistory } from "./game-histories"
<<<<<<< HEAD
import { authLine } from "./auth-line"
=======
>>>>>>> develop

const port = process.env.API_PORT || 3003

const app = new Elysia({ prefix: "api/v1" })
  .use(cors({ origin: true }))
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
<<<<<<< HEAD
        { name: "auth", description: "LINE login & session endpoints" },
=======
>>>>>>> develop
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
<<<<<<< HEAD
  .use(authLine)
=======
>>>>>>> develop
  .use(gameHistory)
  .get("/health", () => ({ status: "ok" }))
  .listen(port)

export { app }
