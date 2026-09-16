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

// NEXT_PUBLIC_API_URL ต้องตั้งตอน build เสมอบน production
// ถ้าไม่ตั้ง เว็บที่ deploy แล้วจะยิงไป localhost ของเครื่องผู้ใช้ → โหลดข้อมูลไม่ขึ้นทั้งแอป
// จึงให้ fail ตั้งแต่ตอน build แทนที่จะปล่อยให้พังเงียบๆ ตอนผู้ใช้เปิดเว็บ
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL;

if (!API_ORIGIN && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set — ต้องตั้งเป็น URL ของ API จริงก่อน build production",
  );
}

const API_BASE = (API_ORIGIN ?? "http://localhost:3003") + "/api/v1";

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
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      // กันหน้าค้างหมุนไม่รู้จบเวลา API/DB ไม่ตอบ — 15 วิแล้วถือว่า fail
      signal: options.signal ?? AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ (หมดเวลา) ลองใหม่อีกครั้ง");
    }
    throw new Error("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่");
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }

  return body.data as T;
}

// ---------- Auth ----------
export function lineLogin(idToken: string | null, accessToken: string | null) {
  return request<{ accessToken: string; profile: ProfileSummary }>(
    "/auth/line-login",
    {
      method: "POST",
      body: JSON.stringify({ idToken: idToken ?? undefined, accessToken: accessToken ?? undefined }),
    }
  );
}

// ---------- Profile ----------
export function getProfile() {
  return request<ProfileSummary>("/profile");
}

export function resetProgress() {
  return request<{ success: boolean }>("/profile/reset", { method: "DELETE" });
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
