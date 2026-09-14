// src/app/scan/page.tsx — หน้า สแกน QR ประจำโซน (แทนที่ Map เดิม)
// แปลงจาก app/web/11-qr-scan/index.html — ใช้กล้องจริง + jsQR อ่าน QR
// สแกนได้ -> ยิง checkInZone(qrSecret) จริง -> พาไปเกมของโซนนั้นตรงๆ
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import jsQR from "jsqr";
import { checkInZone } from "@/lib/api";

type ScanState = "scanning" | "processing" | "success" | "error" | "camera-error";

// เกมทั้ง 6 ตัว ย้ายมา serve จาก public/games/{zone}/ ของแอปนี้เอง (same-origin
// กับตอน login เลย ไม่ต้อง login LIFF ซ้ำในแต่ละเกม, ดู zoo-passport-client.js)
// qr_secret ใน DB ยังคงค่าเดิมไว้ (ไม่เกี่ยวกับ path นี้) แค่เปลี่ยนที่ redirect ไป
//
// สำคัญ: ต้องระบุ index.html ตรงๆ — Next.js ให้บริการไฟล์ใน public/ แบบ
// ต้องตรง path เป๊ะ ไม่เหมือนเว็บเซิร์ฟเวอร์ทั่วไปที่เจอโฟลเดอร์เปล่าแล้วไปหา
// index.html ให้เอง (ถ้าใช้แค่ "/games/lion/" จะเจอหน้า 404 ของแอปแทน)
const ZONE_GAME_URL: Record<string, string> = {
  lion: "/games/lion/index.html",
  elephant: "/games/elephant/index.html",
  giraffe: "/games/giraffe/index.html",
  panda: "/games/panda/index.html",
  monkey: "/games/monkey/index.html",
  penguin: "/games/penguin/index.html",
};

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scannedRef = useRef(false); // กันยิง API ซ้ำถ้า tick() วนมาก่อน state อัปเดตทัน
  const lastDecodeAtRef = useRef(0); // throttle: decode ไม่เกิน ~10 ครั้ง/วิ ให้วิดีโอ smooth

  const [state, setState] = useState<ScanState>("scanning");
  const [zoneName, setZoneName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function stopCamera() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // สแกนได้แล้ว -> ยิง checkInZone จริง -> ตัดสินใจว่าจะพาไปหน้าไหนต่อ
  async function handleDecoded(qrSecret: string) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    stopCamera();
    setState("processing");

    try {
      const result = await checkInZone(qrSecret);
      setZoneName(result.zone.nameTh);
      setState("success");
      setTimeout(() => {
        const gameUrl = ZONE_GAME_URL[result.zone.animaltype];
        if (gameUrl) {
          // ยังใช้ full navigation (ไม่ใช่ router.push) เพราะเป็นไฟล์ static
          // ธรรมดาใน public/ ไม่ใช่ route ของ Next.js — แนบ zoneId ให้เกมรู้ว่า
          // จะเรียก start/submit มินิเกมของโซนไหน (ดู zoo-passport-client.js)
          window.location.href = `${gameUrl}?zoneId=${result.zone.id}`;
        } else {
          // fallback กันเหนียว เผื่อเพิ่มโซนใหม่ในอนาคตแล้วลืมเติมใน ZONE_GAME_URL
          router.push(`/passport/${result.zone.id}`);
        }
      }, 1200);
    } catch (err: any) {
      setErrorMsg(
        err?.message ?? "ไม่พบโซนนี้ในระบบ ลองสแกน QR ป้ายหน้าโซนอีกครั้ง"
      );
      setState("error");
    }
  }

  // ความกว้างสูงสุดของ canvas ที่ใช้ decode — เล็กพอที่ jsQR จะไวขึ้นมาก
  // แต่ยังคมพอสำหรับอ่าน QR ทั่วไป (ไม่กระทบความแม่นยำ)
  const DECODE_MAX_WIDTH = 480;
  const DECODE_INTERVAL_MS = 100; // ~10 ครั้ง/วิ พอสำหรับสแกน ไม่แย่งเวลากับการ render วิดีโอ

  function tick(timestamp: number) {
    if (scannedRef.current) return;
    rafRef.current = requestAnimationFrame(tick);

    if (timestamp - lastDecodeAtRef.current < DECODE_INTERVAL_MS) return;
    lastDecodeAtRef.current = timestamp;

    const video = videoRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const scale = Math.min(1, DECODE_MAX_WIDTH / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data) {
      handleDecoded(code.data);
    }
  }

  async function startCamera() {
    scannedRef.current = false;
    setState("scanning");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 960 },
          height: { ideal: 540 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setErrorMsg("คุณยังไม่ได้อนุญาตให้เว็บนี้ใช้กล้อง ลองอนุญาตแล้วกดลองใหม่");
      } else if (err?.name === "NotFoundError") {
        setErrorMsg("ไม่พบกล้องบนอุปกรณ์นี้");
      } else {
        setErrorMsg("เกิดข้อผิดพลาดระหว่างเปิดกล้อง ลองใหม่อีกครั้ง");
      }
      setState("camera-error");
    }
  }

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="fixed inset-0 flex flex-col bg-black text-cream">
      <header className="relative z-30 flex flex-shrink-0 items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-5 py-4">
        <button
          onClick={() => {
            stopCamera();
            router.push("/passport");
          }}
          aria-label="ย้อนกลับ"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg"
        >
          ←
        </button>
        <h1 className="font-display text-lg font-bold text-gold">
          สแกน QR ประจำโซน
        </h1>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <Image src="/image/icon-qr-scan.png" alt="" width={20} height={20} />
        </span>
      </header>

      <div className="absolute inset-0 z-0 bg-[#111]">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className="h-full w-full object-cover"
        />
      </div>

      {(state === "scanning" || state === "processing") && (
        <div className="pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center">
          <div className="qr-scan-box">
            <div className="corner tl" />
            <div className="corner tr" />
            <div className="corner bl" />
            <div className="corner br" />
            {state === "scanning" && <div className="qr-scan-line" />}
          </div>
          <p className="mt-6 max-w-[280px] px-6 text-center text-sm font-bold [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">
            {state === "processing"
              ? "กำลังตรวจสอบ..."
              : "ส่องกล้องไปที่ป้าย QR หน้าโซน เพื่อยืนยันว่ามาถึงจุดนี้จริง"}
          </p>
        </div>
      )}

      {state === "success" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0a0e08]/95 px-8 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="font-display text-lg font-bold text-gold">
            สแกนสำเร็จ!
          </h2>
          <p className="text-sm text-cream/85">
            ยืนยันตัวตนที่ {zoneName} เรียบร้อยแล้ว
          </p>
        </div>
      )}

      {(state === "error" || state === "camera-error") && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0a0e08]/95 px-8 text-center">
          <div className="text-5xl">{state === "error" ? "🔎" : "📷"}</div>
          <h2 className="font-display text-lg font-bold text-gold">
            {state === "error" ? "สแกนไม่สำเร็จ" : "เปิดกล้องไม่ได้"}
          </h2>
          <p className="text-sm text-cream/85">{errorMsg}</p>
          <button onClick={startCamera} className="btn-primary mt-2">
            ลองใหม่
          </button>
        </div>
      )}
    </main>
  );
}
