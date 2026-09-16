// src/components/RewardBanner.tsx
// การ์ด "Congratulations!" ตอนมีรางวัลที่พร้อมรับ (หน้า Rewards)
import type { RewardSummary } from "@/lib/types";

export default function RewardBanner({
  reward,
  isClaiming,
  onClaim,
}: {
  reward: RewardSummary;
  isClaiming: boolean;
  onClaim: () => void;
}) {
  return (
    <section className="flex flex-col items-center gap-3 bg-gradient-to-b from-[#FDF2D8] to-cream px-6 py-8 text-center">
      <h2 className="font-display text-2xl font-bold text-forest-dark">
        Congratulations!
      </h2>
      <div className="text-6xl">🏆</div>
      <p className="text-ink/70">คุณสะสมตราครบทุกโซนแล้ว!</p>
      <span className="rounded-full bg-wood px-4 py-1.5 font-display font-semibold text-cream">
        🐾 {reward.nameTh}
      </span>
      <button
        className="btn-gold mt-1 disabled:opacity-60"
        disabled={isClaiming}
        onClick={onClaim}
      >
        {isClaiming ? "กำลังรับรางวัล..." : "รับรางวัล"}
      </button>
    </section>
  );
}
