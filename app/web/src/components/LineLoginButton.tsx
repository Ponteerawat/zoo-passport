// src/components/LineLoginButton.tsx
// ปุ่ม "Login with LINE" พร้อมไอคอน LINE (หน้าแรก)
import Image from "next/image";

export default function LineLoginButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="btn-primary mx-auto flex items-center justify-center gap-2"
    >
      Login with LINE
      <Image src="/image/icon-line.png" alt="LINE" width={32} height={32} />
    </button>
  );
}
