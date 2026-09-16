// src/app/settings/page.tsx — หน้า Settings
// "Reset Progress": มีปุ่ม + popup ยืนยัน เรียก DELETE /profile/reset จริง
// ลบ zone progress, ประวัติมินิเกม, รางวัลที่รับแล้ว และรีเซ็ตแต้มเป็น 0 — กู้คืนไม่ได้
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resetProgress } from "@/lib/api";
import ToggleSwitch from "@/components/ToggleSwitch";
import ConfirmDialog from "@/components/ConfirmDialog";

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
      window.dispatchEvent(new Event("zoo-settings-change"));
      return next;
    });
  }

  return [value, toggle] as const;
}

export default function SettingsPage() {
  const [sound, toggleSound] = useLocalToggle("zoo_sound_enabled", true);
  const [music, toggleMusic] = useLocalToggle("zoo_music_enabled", false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetNotice, setResetNotice] = useState<"success" | "error" | null>(null);

  async function handleResetConfirmed() {
    setIsResetting(true);
    try {
      await resetProgress();
      setShowResetConfirm(false);
      setResetNotice("success");
    } catch {
      setShowResetConfirm(false);
      setResetNotice("error");
    } finally {
      setIsResetting(false);
      setTimeout(() => setResetNotice(null), 3000);
    }
  }

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
            <ToggleSwitch checked={sound} onChange={toggleSound} label="Sound Effects" />
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
            <ToggleSwitch checked={music} onChange={toggleMusic} label="Background Music" />
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

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left shadow-sm transition-colors hover:bg-red-50"
          >
            <span className="text-xl">🗑️</span>
            <div>
              <p className="font-display font-bold text-red-500">
                Reset Progress
              </p>
              <p className="text-xs text-muted">
                ลบสถิติและตราประทับทั้งหมด เริ่มเล่นใหม่ตั้งแต่ต้น
              </p>
            </div>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showResetConfirm}
        title="รีเซ็ตความคืบหน้า?"
        message="การรีเซ็ตจะลบสถิติและตราประทับทั้งหมดที่สะสมไว้ ไม่สามารถกู้คืนได้"
        confirmLabel={isResetting ? "กำลังรีเซ็ต..." : "รีเซ็ต"}
        cancelLabel="ยกเลิก"
        onConfirm={handleResetConfirmed}
        onCancel={() => setShowResetConfirm(false)}
      />

      {resetNotice && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
          <div className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg">
            {resetNotice === "success"
              ? "รีเซ็ตความคืบหน้าเรียบร้อยแล้ว"
              : "รีเซ็ตไม่สำเร็จ ลองใหม่อีกครั้ง"}
          </div>
        </div>
      )}
    </main>
  );
}
