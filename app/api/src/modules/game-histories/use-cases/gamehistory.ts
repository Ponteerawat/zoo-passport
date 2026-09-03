import { t } from "elysia"
import type { History } from "../models/history"


// const histories: History[] = [
//   {
//     id: "history_001",
//     userId: "user_001",
//     placeId: "place_001",
//     placeName: "อุทยานแห่งชาติดอยอินทนนท์",
//     placeImage:
//       "https://images.unsplash.com/photo-1528181304800-259b08848526",
//     playedAt: "2024-05-20T14:30:00+07:00",
//     status: "success",
//     points: 180,
//   },
//   {
//     id: "history_002",
//     userId: "user_001",
//     placeId: "place_002",
//     placeName: "วัดพระศรีรัตนศาสดาราม",
//     placeImage:
//       "https://images.unsplash.com/photo-1563492065599-3520f775eeed",
//     playedAt: "2024-05-18T10:15:00+07:00",
//     status: "success",
//     points: 150,
//   },
//   {
//     id: "history_003",
//     userId: "user_001",
//     placeId: "place_003",
//     placeName: "หาดป่าตอง",
//     placeImage:
//       "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
//     playedAt: "2024-05-15T16:45:00+07:00",
//     status: "success",
//     points: 120,
//   },
//   {
//     id: "history_004",
//     userId: "user_001",
//     placeId: "place_004",
//     placeName: "น้ำตกเอราวัณ",
//     placeImage:
//       "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2",
//     playedAt: "2024-05-12T11:20:00+07:00",
//     status: "success",
//     points: 100,
//   },
//   {                 // design สิ่งที่จะเก็บใน database          
//     id: "history_005", // เอาค่า id database
//     userId: "user_001", // userId
//     gameType: "lion-zone", // gameType
//     gameName: "เกมสิงโต", // gametitle
//     avatarimage:
//       "https://images.logolionzoo", // avatarUrl
//     playedAt: "2024-05-10T09:30:00+07:00", // playedAt
//     status: "failed", // status
//     points: 60, // points
//   },
// ]

export const getHistoryGame = ({
  query,
  set,
}: {
  query: {
    page?: number
    limit?: number
    status?: "all" | "success" | "failed"
    from?: string
    to?: string
  }
  set: {
    status: number
  }
}) => {
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? 10)

  if (page < 1 || limit < 1 || limit > 100) {
    set.status = 400

    return {
      success: false,
      message: "Invalid pagination",
    }
  }

  const userId = "user_001"

  let result = histories.filter((item) => item.userId === userId)

  /**
   * Filter by status
   *
   * all
   * success
   * failed
   */
  if (query.status && query.status !== "all") {
    result = result.filter((item) => item.status === query.status)
  }

  /**
   * Filter by date
   */
  if (query.from) {
    const fromDate = new Date(query.from)

    result = result.filter(
      (item) => new Date(item.playedAt) >= fromDate
    )
  }

  if (query.to) {
    const toDate = new Date(query.to)

    // Include the entire day
    toDate.setHours(23, 59, 59, 999)

    result = result.filter(
      (item) => new Date(item.playedAt) <= toDate
    )
  }

  /**
   * Newest first
   */
  result.sort(
    (a, b) =>
      new Date(b.playedAt).getTime() -
      new Date(a.playedAt).getTime()
  )

  const total = result.length

  const totalPages = Math.ceil(total / limit)

  const start = (page - 1) * limit
  const end = start + limit

  const items = result.slice(start, end)

  /**
   * Summary
   */
  const totalGames = histories.filter(
    (item) => item.userId === userId
  ).length

  const totalPoints = histories
    .filter((item) => item.userId === userId)
    .reduce((sum, item) => sum + item.points, 0)

  return {
    success: true,

    data: {
      player: {
        id: userId,
        name: "Explorer",
        avatar: "https://example.com/avatar/explorer.png",
        joinedAt: "2024-03-12",
      },

      summary: {
        totalGames,
        totalPoints,
      },

      histories: items.map((item) => ({
        id: item.id,

        place: {
          id: item.placeId,
          name: item.placeName,
          image: item.placeImage,
        },

        playedAt: item.playedAt,

        status: item.status,

        points: item.points,
      })),

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  }
}

export const getHistoryGameSchema = {
  query: t.Object({
    page: t.Optional(
      t.Numeric({
        minimum: 1,
      })
    ),

    limit: t.Optional(
      t.Numeric({
        minimum: 1,
        maximum: 100,
      })
    ),

    status: t.Optional(
      t.Union([
        t.Literal("all"),
        t.Literal("success"),
        t.Literal("failed"),
      ])
    ),

    from: t.Optional(t.String()),

    to: t.Optional(t.String()),
  }),
}



