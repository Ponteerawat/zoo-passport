// src/app/collection/page.tsx — หน้า My Collection (หน้า 7 ในดีไซน์)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getZones } from "@/lib/api";
import type { ZoneSummary } from "@/lib/types";
import { getZoneIconSrc } from "@/lib/zone-icons";

export default function CollectionPage() {
  const [zones, setZones] = useState<ZoneSummary[]>([]);

  useEffect(() => {
    getZones().then(setZones).catch(() => setZones([]));
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="flex items-center gap-3 bg-forest-dark px-5 py-4">
        <Link href="/profile" className="text-lg text-cream">
          ←
        </Link>
        <h1 className="font-display text-lg font-bold text-gold">
          My Collection
        </h1>
      </header>

      <main className="mx-auto grid w-full max-w-[420px] flex-1 grid-cols-2 gap-x-6 gap-y-7 px-6 py-8">
        {zones.map((zone) => {
          const done = zone.status === "completed";
          const iconSrc = getZoneIconSrc(zone.animaltype, zone.iconUrl);
          return (
            <Link
              key={zone.id}
              href={`/passport/${zone.id}`}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 text-3xl shadow-sm transition-transform hover:-translate-y-0.5 ${
                  done
                    ? "border-leaf-light bg-white"
                    : "border-muted bg-muted-bg grayscale opacity-60"
                }`}
              >
                {iconSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconSrc} alt={zone.nameTh} className="h-full w-full object-cover" />
                ) : (
                  <span>🐾</span>
                )}
              </div>
              <span
                className={`font-display text-sm font-bold ${
                  done ? "text-forest-dark" : "text-muted"
                }`}
              >
                {zone.nameTh}
              </span>
            </Link>
          );
        })}
      </main>
    </div>
  );
}
