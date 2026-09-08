export interface GameHistoryResponse {
  id: string
  gameType: string
  gameName: string
  zoneCode: string
  zoneName: string
  score: number
  isPassed: boolean
  timeTakenSeconds: number | null
  playedAt: string
}

