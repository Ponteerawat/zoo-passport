// src/app/passport/[zoneId]/play/page.tsx — หน้า Mini Game (หน้า 4, Memory Match)
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { startMiniGame, submitMiniGame } from "@/lib/api";
import MemoryCard, { type MemoryCardData } from "@/components/MemoryCard";

const ICONS = ["🐾", "🦁", "🐾", "🦁", "🐾", "🦁"] as const;
const DEFAULT_SECONDS = 30;

type Card = MemoryCardData;

function shuffle(icons: readonly string[]): Card[] {
  return icons
    .map((icon, id) => ({ id, icon, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
}

export default function MiniGamePage() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const router = useRouter();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_SECONDS);
  const [cards, setCards] = useState<Card[]>(() => shuffle(ICONS));
  const [openIds, setOpenIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [status, setStatus] = useState<
    "starting" | "playing" | "submitting" | "failed"
  >("starting");

  const allMatched = useMemo(() => cards.every((c) => c.matched), [cards]);

  // เริ่มเกม: ขอ session token + เวลาจำกัดจริงของโซนนี้จาก backend (anti-cheat)
  useEffect(() => {
    startMiniGame(zoneId)
      .then(({ sessionToken, miniGame }) => {
        setSessionToken(sessionToken);
        const seconds = miniGame.timeLimitSeconds ?? DEFAULT_SECONDS;
        setTotalSeconds(seconds);
        setSecondsLeft(seconds);
        setStatus("playing");
      })
      .catch(() => router.replace(`/passport/${zoneId}`));
  }, [zoneId, router]);

  async function finishGame(finalScore: number) {
    if (!sessionToken || status === "submitting") return;
    setStatus("submitting");
    try {
      const result = await submitMiniGame(zoneId, sessionToken, finalScore);
      if (result.stampUnlocked) {
        router.push(`/passport/${zoneId}/stamp`);
      } else if (result.isPassed) {
        // ผ่านแต่เคยได้ตราไปแล้วก่อนหน้านี้ (ไม่ใช่ครั้งแรก) — กลับไปหน้าโซนเลย
        router.push(`/passport/${zoneId}`);
      } else {
        setStatus("failed");
      }
    } catch {
      router.replace(`/passport/${zoneId}`);
    }
  }

  // นับถอยหลัง — หมดเวลาแล้วส่งคะแนนปัจจุบันไปเลย
  useEffect(() => {
    if (status !== "playing") return;
    if (secondsLeft <= 0) {
      finishGame(score);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, status]);

  useEffect(() => {
    if (status === "playing" && allMatched) finishGame(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched, status]);

  function handleFlip(card: Card) {
    if (status !== "playing" || card.flipped || card.matched) return;
    if (openIds.length === 2) return;

    const nextOpen = [...openIds, card.id];
    setCards((cs) =>
      cs.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
    );
    setOpenIds(nextOpen);

    if (nextOpen.length === 2) {
      const [a, b] = nextOpen;
      const first = cards.find((c) => c.id === a)!;
      const isMatch = first.icon === card.icon;

      setTimeout(() => {
        setCards((cs) =>
          cs.map((c) =>
            c.id === a || c.id === b
              ? { ...c, matched: isMatch, flipped: isMatch }
              : c
          )
        );
        setOpenIds([]);
        if (isMatch) setScore((s) => s + 20);
      }, 600);
    }
  }

  if (status === "failed") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-cream px-6 text-center">
        <p className="text-3xl">😿</p>
        <p className="font-display font-bold text-forest-dark">
          คะแนนไม่ถึงเกณฑ์ ลองใหม่อีกครั้งนะ
        </p>
        <button className="btn-primary" onClick={() => location.reload()}>
          เล่นอีกครั้ง
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center bg-cream px-6 pt-8">
      <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-display font-bold text-forest-dark shadow-sm">
        ⏱ {secondsLeft}
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {cards.map((card) => (
          <MemoryCard key={card.id} card={card} onFlip={handleFlip} />
        ))}
      </div>

      <p className="mt-6 font-display text-lg font-bold text-wood">
        Score: {score}
      </p>
    </main>
  );
}
