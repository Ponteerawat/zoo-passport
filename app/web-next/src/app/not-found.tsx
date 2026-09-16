// src/app/not-found.tsx — หน้า 404 ในธีม Zoo Passport
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-cream px-6 text-center">
      <Image
        src="/image/model-Lion.png"
        alt="lion"
        width={96}
        height={96}
        className="h-24 w-24 object-contain"
      />
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
