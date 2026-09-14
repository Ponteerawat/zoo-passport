// src/lib/zone-icons.ts
// Map zone.animaltype -> โลโก้ประจำโซนใน public/image
// ใช้ตอนที่ backend ยังไม่มี iconUrl (เป็น null) หรืออยาก override รูปฝั่ง frontend

const ZONE_LOGO_BY_ANIMAL_TYPE: Record<string, string> = {
  lion: "/image/lionlogo.png",
  elephant: "/image/Elepantlogo.png",
  giraffe: "/image/Girafflogo.png",
  penguin: "/image/panguinlogo.png",
  panda: "/image/pandalogo.png",
  monkey: "/image/Monkeylogo.png",
};

export function getZoneIconSrc(
  animaltype: string,
  iconUrl?: string | null
): string | null {
  if (iconUrl) return iconUrl;
  return ZONE_LOGO_BY_ANIMAL_TYPE[animaltype?.toLowerCase()] ?? null;
}
