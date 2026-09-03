import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { openapi } from "@elysia/openapi"

import { gamehistories } from "./game-histories"


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
        { name: "game-histories", description: "Game history endpoints" },
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
  .use(gamehistories)

export { app }
