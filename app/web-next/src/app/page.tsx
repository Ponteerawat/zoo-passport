// src/app/page.tsx — หน้า Login with LINE (แปลงจาก app/web/01-login/index.html)
// ต้องเป็นหน้าแรกสุดของแอป: ล็อกอิน LINE สำเร็จแล้วค่อยไปหน้า /welcome
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { lineLogin, setToken } from "@/lib/api";
import Image from "next/image";
import { Loader_line } from "@/components/Loader";
import LineLoginButton from "@/components/LineLoginButton";


type Status = "connecting" | "idle" | "authenticating" | "error";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("connecting");
  const [errorMsg, setErrorMsg] = useState("");

  // exchange LIFF idToken -> app accessToken แล้วพาไปหน้า Welcome
  async function completeLogin(liff: any) {
    setStatus("authenticating");
    try {
      const idToken = liff.getIDToken();
      const { accessToken } = await lineLogin(idToken);
      setToken(accessToken);
      router.replace("/welcome");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  }

  // init LIFF ตอนโหลดหน้า — ถ้าล็อกอิน LINE ไว้อยู่แล้ว (เช่น กลับมาจาก LINE OAuth)
  // ให้พาเข้าระบบต่ออัตโนมัติ ไม่ต้องกดปุ่มซ้ำ
  useEffect(() => {
    async function run() {
      try {
        const liff = (window as any).liff;
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });

        if (liff.isLoggedIn()) {
          await completeLogin(liff);
        } else {
          setStatus("idle");
        }
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setErrorMsg(`LIFF init ล้มเหลว: ${err?.message ?? "unknown error"}`);
      }
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // กดปุ่มแล้วค่อยเด้งไปหน้า LINE OAuth ปกติ (ไม่ auto-redirect ตั้งแต่โหลดหน้า)
  function handleLoginClick() {
    const liff = (window as any).liff;
    if (!liff?.isLoggedIn()) {
      liff.login();
    } else {
      completeLogin(liff);
    }
  }

  // ทางลัดสำหรับ dev เท่านั้น: ข้าม LIFF ไปเลย ใช้ตอน backend เปิด
  // USE_LINE_LOGIN_MOCK=true (รับ idToken อะไรก็ได้ ไม่เช็คกับ LINE จริง)
  // ต้องเปิดใช้ด้วยการตั้ง NEXT_PUBLIC_USE_LOGIN_MOCK=true ใน .env.local เอง
  // Safeguard: เช็ค NODE_ENV ด้วย กันไม่ให้ปุ่มนี้โผล่ใน production build
  // ต่อให้ลืมลบ/ลืมปิด NEXT_PUBLIC_USE_LOGIN_MOCK ก่อน deploy จริง
  const showMockLogin =
    process.env.NEXT_PUBLIC_USE_LOGIN_MOCK === "true" &&
    process.env.NODE_ENV !== "production";

  async function handleMockLogin() {
    setStatus("authenticating");
    try {
      const { accessToken } = await lineLogin("mock-token");
      setToken(accessToken);
      router.replace("/welcome");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Mock login ไม่สำเร็จ เช็คว่า backend เปิด USE_LINE_LOGIN_MOCK=true หรือยัง");
    }
  }


  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-cream px-6">
      <div className="w-full max-w-[360px] rounded-2xl bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-leaf/10 text-5xl">
          <Image
        src="/image/logozoo.png"
        alt="logozoo"
        width={1500}
        height={1500}
        loading="eager"
      /> 
        </div>
        <h1 className="mb-1 font-display text-xl font-bold text-forest-dark">
          Zoo Passport
        </h1>
        <p className="mb-6 text-sm text-ink/60">
          สแกน เล่นเกม สะสมตราประทับ ที่สวนสัตว์
        </p>

        {status === "idle" && (
          <>
            <p className="mb-4 text-ink/70" >กรุณาล็อกอินด้วยบัญชี LINE </p>
            <LineLoginButton onClick={handleLoginClick} />
            {showMockLogin && (
              <button
                onClick={handleMockLogin}
                className="mt-3 mx-auto block text-xs font-semibold text-muted underline"
              >
                Dev: ข้าม LIFF (Mock Login)
              </button>
            )}
          </>
        )}

        {(status === "connecting" || status === "authenticating") && (
              <Loader_line />
        )}

        {status === "error" && (
          <>
            <p className="mb-4 text-sm text-wood-dark">{errorMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mx-auto"
            >
              ลองอีกครั้ง
            </button>
            {showMockLogin && (
              <button
                onClick={handleMockLogin}
                className="mt-3 mx-auto block text-xs font-semibold text-muted underline"
              >
                Dev: ข้าม LIFF (Mock Login)
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
