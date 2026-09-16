// src/components/RewardRow.tsx
// แถวรายการรางวัลแต่ละอันในหน้า Rewards
import type { RewardSummary } from "@/lib/types";

export default function RewardRow({ reward }: { reward: RewardSummary }) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-sm ${
        !reward.isEligible ? "opacity-50" : ""
      }`}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted-bg text-xl">
        {reward.isClaimed ? (
          "✅"
        ) : reward.isEligible ? (
          "🎁"
        ) : reward.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reward.imageUrl}
            alt={reward.nameTh}
            className="h-full w-full object-cover"
          />
        ) : (
          "🔒"
        )}
      </div>
      <div className="flex-1">
        <p className="font-display font-bold text-forest-dark">
          {reward.nameTh}
        </p>
        <p className="text-sm text-ink/60">
          {reward.descriptionTh ?? `สะสมตรา ${reward.requiredStamps} ดวง`}
        </p>
      </div>
    </div>
  );
}
