// src/app/not-found.tsx — หน้า 404 ในธีม Zoo Passport
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-cream px-6 text-center">
      <div className="text-6xl">🦁</div>
      <h1 className="font-display text-xl font-bold text-forest-dark">
        หลงทางในสวนสัตว์แล้วสินะ
      </h1>
      <p className="text-ink/60">ไม่พบหน้านี้ ลองกลับไปที่พาสปอร์ตของคุณ</p>
      <Link href="/passport" className="btn-primary mt-2 max-w-[220px]">
        กลับหน้า Passport
      </Link>
    </main>
  );
}
