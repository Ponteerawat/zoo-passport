import { Elysia } from 'elysia'


export const gameHistories = new Elysia({ prefix: '/game-histories'})
    .get('/',
    async({}) => {
        const gameHistories = await db.gameHistory.findMany()
    return gameHistories
  })
