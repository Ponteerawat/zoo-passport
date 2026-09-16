// src/app/welcome/page.tsx — หน้า Welcome (หน้า 1 ในดีไซน์) แสดงหลังล็อกอิน LINE สำเร็จ
import Link from "next/link";
import Image from "next/image";
import AdventureButton from "@/components/AdventureButton";

export default function WelcomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-cream">
      <section className="relative flex flex-1 items-end justify-center overflow-hidden bg-gradient-to-b from-[#EFF7E6] to-[#cfe6c4] px-6 pb-4 pt-10">
        {/* ตำแหน่งรูปสัตว์ hero — ใส่ไฟล์จริงที่ /public/hero-animals.png */}
        <Image
          src="/image/logozoo.png"
          alt="logozoo"
          width={420}
          height={280}
          priority
          className="h-auto w-full max-w-[380px] object-contain"
        />
      </section>

      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 pb-10 pt-6 text-center">
        <div className="flex items-center gap-2 font-display text-2xl font-extrabold text-forest">
          <span>ZOO</span>
          <span className="text-gold">PASSPORT</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-ink">
          ยินดีต้อนรับ
        </h1>
        <p className="max-w-[320px] text-ink/70">
          สู่การผจญภัยในสวนสัตว์
          <br />
          มาร่วมเป็น <strong className="text-wood-dark">Master Zoo Explorer</strong> กันเถอะ!
        </p>

        <AdventureButton href="/passport">เริ่มต้นการผจญภัย</AdventureButton>
      </section>
    </main>
  );
}
