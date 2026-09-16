// src/components/ZoneRow.tsx — แถวรายการโซนในหน้า Passport (Home)
// หมายเหตุ: ทุกโซนแตะดูข้อมูลได้เสมอ ไม่มีการล็อกอีกต่อไป — เล่นเกมได้แค่
// ผ่านการสแกน QR จริงเท่านั้น (ดู /scan), หน้านี้มีไว้แค่โชว์ข้อมูล/ความคืบหน้า
import Link from "next/link";
import type { ZoneSummary } from "@/lib/types";
import { getZoneIconSrc } from "@/lib/zone-icons";

export default function ZoneRow({ zone }: { zone: ZoneSummary }) {
  const done = zone.status === "completed";
  const iconSrc = getZoneIconSrc(zone.animaltype, zone.iconUrl);

  return (
    <Link
      href={`/passport/${zone.id}`}
      className="flex items-center gap-3.5 rounded-2xl border-2 border-transparent bg-white p-2.5 px-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-leaf-light hover:shadow-md"
    >
      <div
        className={`flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] text-2xl ${
          done ? "grayscale opacity-55 border-muted" : "border-leaf-light"
        } bg-muted-bg`}
      >
        {iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconSrc}
            alt={zone.nameTh}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>🐾</span>
        )}
      </div>

      <span
        className={`flex-1 font-display font-bold ${
          done ? "text-muted" : "text-forest-dark"
        }`}
      >
        {zone.nameTh}
      </span>

      <span className={`text-leaf transition-opacity ${done ? "opacity-100" : "opacity-0"}`}>
        ✓
      </span>
      <span className="text-muted">›</span>
    </Link>
  );
}
