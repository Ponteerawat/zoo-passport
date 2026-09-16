// src/components/ConfirmDialog.tsx
// กล่องยืนยันก่อนทำ action สำคัญ (เช่น Logout)
// ปรับจาก Uiverse.io by Yaya12085 — เปลี่ยนไอคอนเป็นสีเหลืองตามที่ขอ

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
      <div className="w-full max-w-[290px] overflow-hidden rounded-lg bg-white text-left shadow-xl">
        <div className="px-4 pb-1 pt-5">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg
              aria-hidden="true"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-yellow-500"
            >
              <path
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="mt-3 text-center">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>

        <div className="mx-4 my-3 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
