// src/components/AdventureButton.tsx
// ปุ่ม "เริ่มต้นการผจญภัย" — วงกลมไอคอนขยายเต็มปุ่มตอน hover (จาก Uiverse M4rio1/odd-cougar-66)
// CSS อยู่ที่ globals.css: .btn-adventure, .btn-adventure-icon
import Link from "next/link";

export default function AdventureButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn-adventure mt-2">
      {children}
      <span className="btn-adventure-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            fill="currentColor"
            d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
          />
        </svg>
      </span>
    </Link>
  );
}
