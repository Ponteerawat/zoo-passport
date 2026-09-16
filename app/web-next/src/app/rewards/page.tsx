// src/app/rewards/page.tsx — หน้า Reward (หน้า 8 ในดีไซน์)
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

  useEffect(() => {
    getRewards().then(setRewards).catch(() => setRewards([]));
  }, []);

  async function handleClaim(id: string) {
    setClaimingId(id);
    try {
      await claimReward(id);
      setRewards((rs) =>
        rs.map((r) => (r.id === id ? { ...r, isClaimed: true } : r))
      );
    } finally {
      setClaimingId(null);
    }
  }

  const featured = rewards.find((r) => r.isEligible && !r.isClaimed);

  return (
    <main className="flex min-h-dvh flex-col bg-cream">
      <header className="flex items-center gap-3 px-5 py-4">
        <Link href="/passport" className="text-lg text-ink/60">
          ←
        </Link>
        <h1 className="font-display text-lg font-bold text-forest-dark">
          Rewards
        </h1>
      </header>

      {featured && (
        <RewardBanner
          reward={featured}
          isClaiming={claimingId === featured.id}
          onClaim={() => handleClaim(featured.id)}
        />
      )}

      <section className="mx-auto flex w-full max-w-[420px] flex-1 flex-col gap-3 px-6 py-6">
        {rewards.map((r) => (
          <RewardRow key={r.id} reward={r} />
        ))}

        {rewards.length === 0 && (
          <p className="mt-8 text-center text-ink/50">
            ยังไม่มีรางวัลให้แสดงตอนนี้
          </p>
        )}
      </section>
    </main>
  );
}
