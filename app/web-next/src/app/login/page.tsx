// src/app/login/page.tsx — path เดิม ย้าย logic ไปอยู่หน้าแรก (/) แล้ว เก็บไว้ redirect เผื่อ link ค้าง
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
