// src/lib/api.ts
// API client กลาง — ทุกหน้าเรียกผ่านตัวนี้ที่เดียว ตรงกับ app/api/src/modules/index.ts
// prefix: "api/v1", default port: 3003 (ตั้งได้ผ่าน API_PORT ฝั่ง backend)
import type {
  ZoneSummary,
  ProfileSummary,
  RewardSummary,
  GameHistoryEntry,
  Pagination,
} from "./types";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003") + "/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("zoo_token");
}

export function setToken(token: string) {
  localStorage.setItem("zoo_token", token);
}

export function clearToken() {
  localStorage.removeItem("zoo_token");
}

// ทุก response ของ backend ห่อด้วย { success, data } — unwrap ให้ที่นี่ที่เดียว
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  return body.data as T;
}

// ---------- Auth ----------
export function lineLogin(idToken: string) {
  return request<{ accessToken: string; profile: ProfileSummary }>(
    "/auth/line-login",
    { method: "POST", body: JSON.stringify({ idToken }) }
  );
}

// ---------- Profile ----------
export function getProfile() {
  return request<ProfileSummary>("/profile");
}

// ---------- Zones ----------
export function getZones() {
  return request<ZoneSummary[]>("/zones");
}

// zoneId ไม่ต้องส่ง — backend หา zone จาก qrSecret เอง
export function checkInZone(qrSecret: string) {
  return request<{
    zone: Pick<
      ZoneSummary,
      "id" | "animaltype" | "nameTh" | "nameEn" | "descriptionTh" | "iconUrl"
    >;
    status: string;
    miniGame: ZoneSummary["miniGame"];
  }>("/zones/check-in", { method: "POST", body: JSON.stringify({ qrSecret }) });
}

// ---------- Mini games ----------
export function startMiniGame(zoneId: string) {
  return request<{
    sessionToken: string;
    miniGame: {
      id: string;
      name: string;
      gameType: string;
      timeLimitSeconds: number | null;
      passScore: number;
      config: unknown;
    };
  }>(`/mini-games/${zoneId}/start`, { method: "POST" });
}

export function submitMiniGame(
  zoneId: string,
  sessionToken: string,
  score: number
) {
  return request<{
    isPassed: boolean;
    score: number;
    passScore: number;
    bestScore: number;
    stampUnlocked: boolean; // true เฉพาะตอนเพิ่งผ่านครั้งแรก
  }>(`/mini-games/${zoneId}/submit`, {
    method: "POST",
    body: JSON.stringify({ sessionToken, score }),
  });
}

// ---------- Game history ----------
export function getGameHistory(page = 1, limit = 10) {
  return request<{ histories: GameHistoryEntry[]; pagination: Pagination }>(
    `/game-history?page=${page}&limit=${limit}`
  );
}

// ---------- Rewards ----------
export function getRewards() {
  return request<RewardSummary[]>("/rewards");
}

export function claimReward(rewardId: string) {
  return request<{
    rewardId: string;
    pointsAwarded: number;
    totalPoints: number;
    claimedAt: string;
  }>(`/rewards/${rewardId}/claim`, { method: "POST" });
}
