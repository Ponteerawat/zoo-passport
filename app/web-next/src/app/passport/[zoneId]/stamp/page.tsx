// src/app/passport/[zoneId]/stamp/page.tsx — หน้า Stamp Received (หน้า 5 ในดีไซน์)
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getZones } from "@/lib/api";
import type { ZoneSummary } from "@/lib/types";

export default function StampReceivedPage() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const [zone, setZone] = useState<ZoneSummary | null>(null);

  useEffect(() => {
    getZones().then((zones) => {
      setZone(zones.find((z) => z.id === zoneId) ?? null);
    });
  }, [zoneId]);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center gap-4 overflow-hidden bg-gradient-to-b from-[#FDF2D8] to-cream px-6 text-center">
      <Link href="/passport" className="absolute right-5 top-5 text-2xl text-ink/40">
        ✕
      </Link>

      <div className="flex h-40 w-40 animate-[stampIn_0.5s_ease-out] items-center justify-center rounded-full border-8 border-forest bg-white shadow-card">
        <span className="text-6xl">🐾</span>
      </div>

      <h1 className="font-display text-2xl font-bold text-forest-dark">
        ยินดีด้วย!
      </h1>
      <p className="text-ink/70">คุณได้รับตราประทับ</p>

      {zone && (
        <span className="rounded-full bg-wood px-5 py-2 font-display font-bold text-cream">
          {zone.nameTh}
        </span>
      )}

      <Link href="/passport" className="btn-gold mt-2">
        ดูพาสปอร์ต
      </Link>
    </main>
  );
}
