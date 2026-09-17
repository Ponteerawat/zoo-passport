import type { RewardSummary } from "@/lib/types";

export default function RewardRow({
  reward,
  onView,
}: {
  reward: RewardSummary;
  onView: () => void;
}) {
  const remaining = Math.max(0, reward.unlockPoints - reward.currentPoints);
  const locked = !reward.isEligible;

  return (
    <button
      type="button"
      onClick={onView}
      disabled={locked}
      className={`group flex w-full items-center gap-3.5 rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
        locked
          ? "cursor-not-allowed border-transparent opacity-60"
          : "border-[#E8D6A8] hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
      }`}
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFF4D6] text-2xl">
        {reward.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={reward.imageUrl} alt={reward.nameTh} className="h-full w-full object-cover" />
        ) : locked ? (
          "🔒"
        ) : (
          "🎟️"
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-forest-dark">{reward.nameTh}</p>
        <p className="mt-0.5 text-sm text-ink/60">
          {locked ? `อีก ${remaining} คะแนนเพื่อปลดล็อก` : "ปลดล็อกแล้ว • กดเพื่อดูคูปอง"}
        </p>
      </div>
      <span className="rounded-full bg-forest-dark px-3 py-1.5 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
        ดูคูปอง
      </span>
    </button>
  );
}
