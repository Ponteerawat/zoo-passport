interface ARButtonProps {
  href: string;
}

export function ARButton({ href }: ARButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="เปิด AR"
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border-2 border-gold-dark bg-gold px-5 py-2.5 font-display text-xs font-bold text-white shadow-[0_4px_0_#b96d16] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b96d16] active:translate-y-1 active:shadow-[0_1px_0_#b96d16]"
    >
      <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
      <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
        AR
      </span>
      <span className="relative">ดู AR</span>
      <span className="relative text-base leading-none transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}
