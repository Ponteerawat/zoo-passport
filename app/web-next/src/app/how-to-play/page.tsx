// src/app/how-to-play/page.tsx — หน้า How to Play (static content)
import Link from "next/link";
import Image from "next/image";

const STEPS = [
  {
    title: "รับ Zoo Passport",
    desc: "เพิ่มเพื่อน LINE OA ของสวนสัตว์ แล้วรับ Zoo Passport เพื่อเริ่มภารกิจ",
  },
  {
    title: "เลือกโซนที่ต้องการ",
    desc: "ดูรายชื่อโซนทั้งหมดในหน้า Passport และเลือกโซนที่อยากไปสำรวจ",
  },
  {
    title: "สแกน QR Code ที่ป้ายโซน",
    desc: "แตะแท็บ QR Scan แล้วสแกน QR Code ที่ป้ายของโซนนั้นๆ เพื่อเข้าสู่ Mini Game",
  },
  {
    title: "เล่น Mini Game",
    desc: "เล่น Mini Game ให้สำเร็จตามเงื่อนไขของแต่ละโซนก่อนหมดเวลา",
  },
  {
    title: "รับ Stamp",
    desc: "เมื่อเล่นสำเร็จ คุณจะได้รับตราประทับ (Stamp) ของโซนนั้นทันที",
  },
  {
    title: "สะสม Stamp ให้ครบ",
    desc: "สะสมตราประทับให้ครบทุกโซนเพื่อปลดล็อกของรางวัล",
  },
  {
    title: "รับรางวัล",
    desc: "เมื่อสะสมครบทุกโซน รับตำแหน่ง Master Zoo Explorer พร้อมของรางวัลพิเศษจาก Zoo Passport",
  },
];

const TIPS = [
  { icon: "⏰", text: "วางแผนเวลา — บาง Mini Game มีเวลาจำกัด" },
  { icon: "🔭", text: "สำรวจให้ครบ — อย่าลืมสแกนทุกโซนเพื่อรับรางวัลใหม่" },
  { icon: "👥", text: "สนุกกับเพื่อน — ชวนเพื่อนมาเล่นยิ่งสนุกกว่าเดิม" },
];

export default function HowToPlayPage() {
  return (
    <main className="min-h-dvh bg-cream">
      <header className="flex items-center gap-4 bg-forest-dark px-4 py-4">
        <Link
          href="/profile"
          aria-label="ย้อนกลับ"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-cream"
        >
          ←
        </Link>
        <h1 className="font-display text-lg font-bold text-gold">
          How to Play
        </h1>
      </header>

      <div className="mx-auto max-w-[480px] px-5 py-6">
        <div className="mb-6 text-center">
          <Image
            src="/image/logozoo.png"
            alt="logo zoo"
            width={64}
            height={64}
            className="mx-auto mb-1 h-16 w-16 object-contain"
          />
          <h2 className="font-display text-xl font-bold text-forest-dark">
            วิธีการเล่น Zoo Passport
          </h2>
          <p className="text-sm text-ink/50">
            ทำตาม {STEPS.length} ขั้นตอนนี้เพื่อสะสมตราประทับให้ครบทุกโซน
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="flex gap-3.5 rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-leaf font-display font-extrabold text-white">
                {i + 1}
              </div>
              <div>
                <p className="mb-0.5 font-display font-bold text-forest-dark">
                  {step.title}
                </p>
                <p className="text-sm leading-relaxed text-ink/60">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-5 rounded-2xl bg-forest-dark p-4">
          <h3 className="mb-3 text-center font-display font-bold text-gold">
            Tips
          </h3>
          <div className="flex flex-col divide-y divide-white/10">
            {TIPS.map((tip) => (
              <div
                key={tip.text}
                className="flex items-start gap-2.5 py-2 text-sm text-cream/90"
              >
                <span className="flex-shrink-0">{tip.icon}</span>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-sm text-ink/50">
          Enjoy your adventure!
          {[
            { src: "/image/model-Giraffe.png", alt: "giraffe" },
            { src: "/image/model-Elephant.png", alt: "elephant" },
            { src: "/image/model-pengin.png", alt: "penguin" },
            { src: "/image/model-Panda.png", alt: "panda" },
            { src: "/image/model-Monkey.png", alt: "monkey" },
          ].map((animal) => (
            <Image
              key={animal.src}
              src={animal.src}
              alt={animal.alt}
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
            />
          ))}
        </p>
      </div>
    </main>
  );
}
