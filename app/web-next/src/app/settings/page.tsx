// src/app/settings/page.tsx — หน้า Settings
// หมายเหตุ: "Reset Progress" ของเดิม (เวอร์ชัน static mockup) แค่ล้าง localStorage
// ตอนนี้ progress จริงอยู่บน Supabase ฝั่ง backend ไม่มี endpoint ลบ/รีเซ็ตให้ใช้งาน
// เลยเปลี่ยนเป็นสถานะ "ยังไม่รองรับ" แทนการทำฟีเจอร์ปลอมที่ไม่ได้ผลจริง
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function useLocalToggle(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved !== null) setValue(saved === "true");
  }, [key]);

  function toggle() {
    setValue((v) => {
      const next = !v;
      localStorage.setItem(key, String(next));
      return next;
    });
  }

  return [value, toggle] as const;
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-[26px] w-12 flex-shrink-0 rounded-full transition-colors ${
        checked ? "bg-leaf" : "bg-muted-bg"
      }`}
    >
      <span
        className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[25px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [sound, toggleSound] = useLocalToggle("zoo_sound_enabled", true);
  const [music, toggleMusic] = useLocalToggle("zoo_music_enabled", false);

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
        <h1 className="font-display text-lg font-bold text-gold">Settings</h1>
      </header>

      <div className="mx-auto max-w-[480px] px-5 py-6">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink/40">
          Preferences
        </p>

        <div className="mb-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <span className="text-xl">🔊</span>
              <div>
                <p className="font-display font-bold text-forest-dark">
                  Sound Effects
                </p>
                <p className="text-xs text-muted">เล่นเสียงตอบสนองในเกม</p>
              </div>
            </div>
            <Toggle checked={sound} onChange={toggleSound} label="Sound Effects" />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <span className="text-xl">🎵</span>
              <div>
                <p className="font-display font-bold text-forest-dark">
                  Background Music
                </p>
                <p className="text-xs text-muted">เปิดเสียงบรรยากาศสวนสัตว์</p>
              </div>
            </div>
            <Toggle checked={music} onChange={toggleMusic} label="Background Music" />
          </div>
        </div>

        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink/40">
          System &amp; Info
        </p>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-sm">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="font-display font-bold text-forest-dark">
                About App
              </p>
              <p className="text-xs text-muted">Zoo Passport v1.0.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white/60 p-4 opacity-70 shadow-sm">
            <span className="text-xl">🗑️</span>
            <div>
              <p className="font-display font-bold text-wood-dark">
                Reset Progress
              </p>
              <p className="text-xs text-muted">
                ยังไม่รองรับฟีเจอร์นี้ในเวอร์ชันปัจจุบัน
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
