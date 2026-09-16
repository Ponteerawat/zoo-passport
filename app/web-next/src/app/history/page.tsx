// src/app/history/page.tsx — หน้า History (ประวัติการเล่นเกม) ต่อ /game-history จริง
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGameHistory } from "@/lib/api";
import type { GameHistoryEntry } from "@/lib/types";
import { getZoneIconSrc } from "@/lib/zone-icons";

function formatPlayedAt(iso: string) {
  return new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<GameHistoryEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getGameHistory(1, 50)
      .then((r) => setEntries(r.histories))
      .catch(() => setError("โหลดประวัติไม่สำเร็จ ลองรีเฟรชอีกครั้ง"));
  }, []);

  return (
    <main className="min-h-dvh bg-cream">
      <header className="flex items-center gap-4 bg-forest-dark px-4 py-4">
        <Link
          href="/profile"
          aria-label="ย้อนกลับ"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-cream"
        >
          ←
        </Link>
        <h1 className="font-display text-lg font-bold text-gold">History</h1>
      </header>

      <div className="mx-auto max-w-[480px] px-5 py-6">
        {error && <p className="text-center text-wood-dark">{error}</p>}

        {entries === null && !error && (
          <p className="text-center text-ink/50">กำลังโหลด...</p>
        )}

        {entries?.length === 0 && (
          <div className="flex flex-col items-center gap-2 pt-10 text-center">
            <div className="text-5xl">🕘</div>
            <p className="font-display font-bold text-forest-dark">
              ยังไม่มีประวัติการเล่น
            </p>
            <p className="text-sm text-ink/50">
              ลองไปเล่น Mini Game ที่โซนใดโซนหนึ่งดูสิ
              <br />
              ประวัติจะขึ้นที่นี่หลังเล่นจบ
            </p>
          </div>
        )}

        {entries && entries.length > 0 && (
          <>
            <p className="mb-4 text-center text-sm text-ink/60">
              เล่นไปแล้วทั้งหมด{" "}
              <strong className="text-leaf">{entries.length}</strong> ครั้ง
            </p>

            <div className="flex flex-col gap-2.5">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
                >
                  <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-leaf bg-muted-bg text-xl">
                    {getZoneIconSrc(entry.zoneCode, null) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getZoneIconSrc(entry.zoneCode, null)!}
                        alt={entry.zoneName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>🐾</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-forest-dark">
                      {entry.zoneName}
                    </p>
                    <p className="text-xs text-muted">
                      {formatPlayedAt(entry.playedAt)}
                    </p>
                  </div>

                  <span
                    className={`flex-shrink-0 font-display font-extrabold ${
                      entry.isPassed ? "text-gold" : "text-muted"
                    }`}
                  >
                    +{entry.score} pt
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
