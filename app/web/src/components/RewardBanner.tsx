import type { RewardSummary } from "@/lib/types";

export default function RewardBanner({
  reward,
  onView,
}: {
  reward: RewardSummary;
  onView: () => void;
}) {
  return (
    <section className="mx-auto mt-2 w-[calc(100%-2rem)] max-w-[560px] rounded-3xl border border-[#E8D6A8] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFF4D6] text-4xl">
          🎟️
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-wood">Coupon Unlocked</p>
          <h2 className="mt-1 font-display text-xl font-bold text-forest-dark">{reward.nameTh}</h2>
          <p className="mt-1 text-sm text-ink/60">ครบ {reward.unlockPoints.toLocaleString()} คะแนนแล้ว</p>
        </div>
      </div>
      <button type="button" onClick={onView} className="btn-gold mt-4 w-full">
        ดูคูปอง
      </button>
    </section>
  );
}
