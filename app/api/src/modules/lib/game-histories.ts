import * as Sentry from "@sentry/elysia"
import type { GameType } from '@repo/database'
import type { DatetimeFsp } from "drizzle-orm/mysql-core"

export interface gamehistoriesResponse {
    id: string
    gameType: GameType
    gameData: string
    playedAt: Date
}

