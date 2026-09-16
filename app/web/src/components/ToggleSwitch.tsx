// src/components/ToggleSwitch.tsx
// สวิตช์เปิด/ปิด แบบวงกลมมี checkmark/cross อยู่ข้างใน (Uiverse by Galahhad)
// CSS อยู่ที่ globals.css: .toggle-switch, .toggle-switch__slider, .toggle-switch__circle, ...
//
// โครงสร้างสำคัญที่ทำให้มันทำงาน (อ่านไว้เผื่ออยากทำเอง):
// 1. <input type="checkbox"> ถูกซ่อนไว้ (display:none) แต่ยังเป็นตัวเก็บ state จริง
// 2. .toggle-switch__slider เป็น sibling ของ input โดยตรง — CSS selector
//    `input:checked + .toggle-switch__slider` เลยใช้ CSS ล้วนๆ เปลี่ยนสี/ตำแหน่งได้
//    โดยไม่ต้องเขียน JS สลับ className เอง
// 3. .toggle-switch__circle (วงกลมขาว) มี checkmark + cross ซ้อนกันอยู่ข้างใน
//    ปกติ cross โชว์ (scale 1), พอ checked จะสลับเป็น checkmark โชว์แทน

export default function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <div className="toggle-switch__slider">
        <div className="toggle-switch__circle">
          <svg
            className="toggle-switch__cross"
            viewBox="0 0 365.696 365.696"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M243.188 182.86 356.32 69.726c12.5-12.5 12.5-32.766 0-45.247L341.238 9.398c-12.504-12.503-32.77-12.503-45.25 0L182.86 122.528 69.727 9.374c-12.5-12.5-32.766-12.5-45.247 0L9.375 24.457c-12.5 12.504-12.5 32.77 0 45.25l113.152 113.152L9.398 295.99c-12.503 12.503-12.503 32.769 0 45.25L24.48 356.32c12.5 12.5 32.766 12.5 45.247 0l113.132-113.132L295.99 356.32c12.503 12.5 32.769 12.5 45.25 0l15.081-15.082c12.5-12.504 12.5-32.77 0-45.25zm0 0"
            />
          </svg>
          <svg
            className="toggle-switch__checkmark"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z"
            />
          </svg>
        </div>
      </div>
    </label>
  );
}
