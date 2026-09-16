// src/app/passport/[zoneId]/page.tsx — หน้า Zone Info (ออกแบบใหม่: 3 การ์ด)
// ไม่มีปุ่ม "เริ่มเกม" อีกต่อไป — เล่นได้แค่ผ่านสแกน QR จริงเท่านั้น (ดู /scan)
// หน้านี้แตะดูได้เสมอทุกโซน ไม่ว่าจะสแกนหรือยัง (ไม่มีการล็อกแล้ว)
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getZones } from "@/lib/api";
import type { ZoneSummary } from "@/lib/types";
import { getZoneIconSrc } from "@/lib/zone-icons";

export default function ZoneInfoPage() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const [zone, setZone] = useState<ZoneSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getZones()
      .then((zones) => {
        const found = zones.find((z) => z.id === zoneId);
        if (!found) throw new Error("not found");
        setZone(found);
      })
      .catch(() => setError("ไม่พบข้อมูลโซนนี้"));
  }, [zoneId]);

  return (
    <main className="min-h-dvh bg-cream">
      <header className="flex items-center gap-4 bg-forest-dark px-4 py-4">
        <Link
          href="/passport"
          aria-label="ย้อนกลับ"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-cream"
        >
          ←
        </Link>
        <h1 className="font-display text-lg font-bold text-gold">
          {zone?.nameEn ?? "Zone"}
        </h1>
      </header>

      {error && <p className="p-6 text-center text-wood-dark">{error}</p>}

      {zone && (
        <div className="mx-auto flex max-w-[480px] flex-col items-center gap-5 px-6 py-8">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-leaf-light bg-white text-5xl shadow-card">
            {getZoneIconSrc(zone.animaltype, zone.iconUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getZoneIconSrc(zone.animaltype, zone.iconUrl)!}
                alt={zone.nameTh}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>🐾</span>
            )}
          </div>

          <div className="text-center">
            <h2 className="font-display text-xl font-bold text-forest-dark">
              {zone.nameEn}
            </h2>
            {zone.status === "completed" && (
              <p className="mt-1 text-sm font-semibold text-leaf">
                ✓ สะสมตราประทับโซนนี้แล้ว
              </p>
            )}
          </div>

          <div className="w-full rounded-2xl bg-white p-5 shadow-card">
            <h3 className="mb-2 font-display font-bold text-forest-dark">
              {zone.storyTitleTh ?? zone.nameTh}
            </h3>
            <p className="text-ink/70">
              {zone.descriptionTh ?? "เร็วๆ นี้จะมีเรื่องราวของโซนนี้มาเล่าให้ฟัง"}
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white p-5 shadow-card">
            <h3 className="mb-2 font-display font-bold text-forest-dark">
              🎯 ภารกิจของคุณ
            </h3>
            <p className="text-ink/70">
              {zone.missionTh ?? "สแกน QR หน้าโซนนี้เพื่อเริ่มภารกิจ"}
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white p-5 shadow-card">
            <h3 className="mb-2 font-display font-bold text-forest-dark">
              Reward
            </h3>
            <p className="text-ink/70">🎖️ {zone.nameEn} Stamp</p>
          </div>
        </div>
      )}
    </main>
  );
}
