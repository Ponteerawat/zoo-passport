// src/app/rewards/page.tsx — หน้า Rewards / Coupon
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRewards, claimReward } from "@/lib/api";
import type { RewardSummary } from "@/lib/types";
import RewardBanner from "@/components/RewardBanner";
import RewardRow from "@/components/RewardRow";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<RewardSummary[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<RewardSummary | null>(null);

  useEffect(() => {
    getRewards().then(setRewards).catch(() => setRewards([]));
  }, []);

  async function handleClaim(id: string) {
    setClaimingId(id);
    try {
      await claimReward(id);
      setRewards((rs) =>
        rs.map((r) => (r.id === id ? { ...r, isClaimed: true } : r)),
      );
      setSelectedReward((r) => (r?.id === id ? { ...r, isClaimed: true } : r));
    } finally {
      setClaimingId(null);
    }
  }

  const featured = rewards.find((r) => r.isEligible);
  const currentPoints = rewards[0]?.currentPoints ?? 0;
  const unlockPoints = rewards[0]?.unlockPoints ?? 600;
  const progress = Math.min(100, Math.round((currentPoints / unlockPoints) * 100));

  return (
    <main className="min-h-dvh bg-cream text-ink">
      <header className="flex items-center gap-3 px-5 py-4">
        <Link href="/passport" className="text-xl text-ink/60" aria-label="กลับ">
          ←
        </Link>
        <h1 className="font-display text-lg font-bold text-forest-dark">Rewards</h1>
      </header>

      <section className="mx-auto w-full max-w-[560px] px-5 pb-8">
        <div className="rounded-3xl border border-[#E8D6A8] bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink/60">คะแนนสะสม</p>
              <p className="mt-1 font-display text-3xl font-bold text-forest-dark">
                {currentPoints.toLocaleString()}
                <span className="ml-1 text-base font-semibold text-ink/50">/ {unlockPoints.toLocaleString()}</span>
              </p>
            </div>
            <span className="rounded-full bg-[#FFF4D6] px-3 py-1 text-xs font-bold text-wood">{progress}%</span>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EFE7D6]">
            <div className="h-full rounded-full bg-wood transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-ink/55">
            {currentPoints >= unlockPoints
              ? "🎉 คุณปลดล็อกคูปองแล้ว"
              : `สะสมอีก ${(unlockPoints - currentPoints).toLocaleString()} คะแนนเพื่อปลดล็อกคูปอง`}
          </p>
        </div>

        {featured && (
          <RewardBanner reward={featured} onView={() => setSelectedReward(featured)} />
        )}

        <div className="mt-5 space-y-3">
          {rewards.map((reward) => (
            <RewardRow
              key={reward.id}
              reward={reward}
              onView={() => setSelectedReward(reward)}
            />
          ))}
          {rewards.length === 0 && (
            <p className="mt-8 text-center text-ink/50">ยังไม่มีรางวัลให้แสดงตอนนี้</p>
          )}
        </div>
      </section>

      {selectedReward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="รายละเอียดคูปอง"
          onClick={() => setSelectedReward(null)}
        >
          <div
            className="w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-[#FFF4D6] to-[#F8E6B8] px-6 py-7 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl shadow-sm">🎟️</div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-wood">Zoo Coupon</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-forest-dark">{selectedReward.nameTh}</h2>
            </div>
            <div className="p-6">
              <p className="text-center leading-7 text-ink/65">
                {selectedReward.descriptionTh ?? "คูปองพิเศษสำหรับผู้ที่สะสมคะแนนครบตามเงื่อนไข"}
              </p>
              <div className="my-5 border-t border-dashed border-[#DCCFB8]" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/50">เงื่อนไขการปลดล็อก</span>
                <span className="font-bold text-forest-dark">{selectedReward.unlockPoints.toLocaleString()} คะแนน</span>
              </div>
              {selectedReward.isClaimed ? (
                <div className="mt-5 rounded-2xl bg-[#E9F7EE] px-4 py-3 text-center font-semibold text-[#237A43]">
                  ✓ รับคูปองแล้ว
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-gold mt-5 w-full disabled:opacity-60"
                  disabled={claimingId === selectedReward.id}
                  onClick={() => handleClaim(selectedReward.id)}
                >
                  {claimingId === selectedReward.id ? "กำลังรับคูปอง..." : "รับคูปอง"}
                </button>
              )}
              <button type="button" className="mt-3 w-full py-2 text-sm font-semibold text-ink/50" onClick={() => setSelectedReward(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
