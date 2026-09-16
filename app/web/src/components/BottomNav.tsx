// src/components/BottomNav.tsx — แถบเมนูล่าง ใช้ร่วมกัน 3 หน้าหลัก
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const items = [
  { href: "/passport", label: "Passport", Image:
    <Image
        src="/image/icon-book.png"
        alt="passport"
        width={24}
        height={24}
      />
  , },
  { href: "/scan", label: "QR Scan", Image:  
  <Image
        src="/image/icon-qr-scan.png"
        alt="qr scan"
        width={24}
        height={24}
      /> 
    },
  { href: "/profile", label: "Profile", Image:  
      <Image
        src="/image/icon-user.png"
        alt="profile"
        width={24}
        height={24}
      />  
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="sticky bottom-0 z-10 flex w-full justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
      <nav className="flex items-center gap-8 rounded-full bg-wood px-7 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-colors ${
                  active ? "bg-forest-dark" : ""
                }`}
              >
                {item.Image}
              </span>
              <span
                className={`text-[11px] font-semibold transition-opacity ${
                  active ? "text-cream opacity-100" : "text-cream opacity-60"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
