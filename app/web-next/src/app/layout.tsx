import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito, Kanit, Noto_Sans_Thai } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-baloo",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

// Baloo 2 / Nunito ไม่มีตัวอักษรไทย — ใช้สองตัวนี้เป็น fallback
// สำหรับข้อความไทยโดยเฉพาะ (เชื่อมกับ tailwind.config.ts)
const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["600", "700"],
  variable: "--font-kanit",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-thai",
});

export const metadata: Metadata = {
  title: "Zoo Passport",
  description: "สแกน เล่นเกม สะสมตราประทับ ที่สวนสัตว์",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1f3d1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${baloo.variable} ${nunito.variable} ${kanit.variable} ${notoSansThai.variable}`}
    >
      <body>
        {children}
        {/* LIFF SDK — โหลดก่อนหน้า /login ใช้งาน window.liff */}
        <Script
          src="https://static.line-scdn.net/liff/edge/2/sdk.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
