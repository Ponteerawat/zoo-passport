// src/app/passport/page.tsx — หน้า Zoo Passport (Home, หน้า 2 ในดีไซน์)
"use client";

import { useEffect, useState } from "react";
import { getProfile, getZones } from "@/lib/api";
import type { ZoneSummary, ProfileSummary } from "@/lib/types";
import ZoneRow from "@/components/ZoneRow";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/Loader";

export default function PassportHomePage() {
  const [zones, setZones] = useState<ZoneSummary[] | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getZones(), getProfile()])
      .then(([zoneList, p]) => {
        setZones(zoneList);
        setProfile(p);
      })
      .catch(() => setError("โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชอีกครั้ง"));
  }, []);

  const stampsDone = profile?.stampsCollected ?? 0;
  const stampsTotal = profile?.totalZones ?? zones?.length ?? 0;
  const progressPct =
    stampsTotal > 0 ? Math.round((stampsDone / stampsTotal) * 100) : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="relative flex-shrink-0 overflow-hidden bg-[url('/image/bg-passport.jpg')] bg-cover bg-center px-6 pb-9 pt-8 text-center">
        <Image
          src="/image/logozoo.png"
          alt="logo zoo"
          width={160}
          height={100}
          priority
          className="mx-auto mb-1 h-auto w-full max-w-[160px] object-contain drop-shadow"
        />
        <h1 className="font-display text-3xl font-extrabold tracking-wide text-gold [text-shadow:0_3px_0_theme(colors.wood.dark)]">
          ZOO
        </h1>
        <span className="mt-1 inline-block rounded-md bg-wood px-3.5 py-1 font-display text-sm font-bold tracking-[6px] text-cream">
          PASSPORT
        </span>
      </header>

      <main className="flex-1 px-4 pb-3 pt-5">
        <div className="mx-auto max-w-[480px]">
          <h2 className="mb-1 font-display text-xl font-bold text-forest-dark">
            Your Progress
          </h2>
          <p className="mb-2.5 font-display font-semibold text-wood">
            {stampsDone} / {stampsTotal} Stamps
          </p>
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-muted-bg shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-leaf-light to-leaf transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {stampsTotal > 0 && stampsDone === stampsTotal && (
            <Link
              href="/rewards"
              className="mt-3 block rounded-2xl bg-gold/15 px-4 py-3 text-center font-display font-bold text-gold-dark"
            >
              🏆 สะสมครบแล้ว! แตะเพื่อรับรางวัล
            </Link>
          )}

          {error && <p className="mt-4 text-center text-wood-dark">{error}</p>}

          <div className="mt-5 flex flex-col gap-3.5">
            {zones === null && !error ? (
              <Loader />
            ) : (
              zones
                ?.slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((zone) => <ZoneRow key={zone.id} zone={zone} />)
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
