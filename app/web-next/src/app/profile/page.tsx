// src/app/profile/page.tsx — หน้า Profile (หน้า 9 ในดีไซน์)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProfile, clearToken } from "@/lib/api";
import type { ProfileSummary } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import Image from "next/image";
import { Loader_line } from "@/components/Loader";
import ConfirmDialog from "@/components/ConfirmDialog";

const MENU = [
  { href: "/collection", label: "My Collection", icon: 
  <Image
        src="/image/icon-collection.png"
        alt="collection"
        width={24}
        height={24}
      />
   },
  { href: "/history", label: "History", icon: 
  <Image
        src="/image/icon-history.png"
        alt="history"
        width={24}
        height={24}
      />
   },
  { href: "/how-to-play", label: "How to Play", icon: "❓" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogoutConfirmed() {
    clearToken();
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col bg-cream">
        <header className="flex items-center justify-center bg-forest-dark px-5 py-4">
          <h1 className="font-display text-lg font-bold text-gold">Profile</h1>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <Loader_line />
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="flex items-center justify-center bg-forest-dark px-5 py-4">
        <h1 className="font-display text-lg font-bold text-gold">Profile</h1>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto flex max-w-[420px] flex-col items-center gap-2">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-leaf-light bg-white text-5xl shadow-card">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt={profile.displayName ?? "Explorer"} className="h-full w-full object-cover" />
            ) : (
              <span>🐻</span>
            )}
          </div>
          <h2 className="font-display text-xl font-bold text-forest-dark">
            {profile?.displayName ?? "Explorer"}
          </h2>

          <div className="mt-3 flex w-full justify-around">
            <div className="text-center">
              <p className="text-sm text-ink/60">Stamps</p>
              <p className="font-display font-bold text-forest-dark">
                {profile?.stampsCollected ?? 0} / {profile?.totalZones ?? 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-ink/60">Points</p>
              <p className="font-display font-bold text-gold-dark">
                {profile?.totalPoints ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-2">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 font-semibold text-black shadow-card transition-colors hover:bg-indigo-600 hover:text-white"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </Link>
            ))}
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-red-500"
          >
            Log out
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
          </button>
        </div>
      </main>

      <BottomNav />

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Are you sure?"
        message="Are you sure you Logout"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirmed}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
