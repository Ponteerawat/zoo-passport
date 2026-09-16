// src/lib/types.ts — shape ตรงกับ response จริงของ backend (app/api)
// อ้างอิงจาก app/api/src/modules/*/models/*.ts โดยตรง — แก้ที่นี่ถ้า schema backend เปลี่ยน

export type ZoneStatus = "locked" | "available" | "in_progress" | "completed";

export interface ZoneMiniGame {
  id: string;
  name: string;
  gameType: string;
  timeLimitSeconds: number | null;
  passScore: number;
}

export interface ZoneSummary {
  id: string;
  animaltype: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  storyTitleTh: string | null;
  missionTh: string | null;
  iconUrl: string | null;
  orderIndex: number;
  status: ZoneStatus;
  bestScore: number;
  stampReceivedAt: string | null;
  miniGame: ZoneMiniGame | null;
}

export interface ProfileSummary {
  id: string;
  lineUserId: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  stampsCollected: number;
  totalZones: number;
}

export interface RewardSummary {
  id: string;
  animaltype: string;
  nameTh: string;
  descriptionTh: string | null;
  imageUrl: string | null;
  requiredStamps: number;
  pointsValue: number;
  isEligible: boolean;
  isClaimed: boolean;
  claimedAt: string | null;
}

export interface GameHistoryEntry {
  id: string;
  gameType: string;
  gameName: string;
  zoneCode: string;
  zoneName: string;
  score: number;
  isPassed: boolean;
  timeTakenSeconds: number | null;
  playedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
