"use client";

import { useState } from "react";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmVariant = "danger",
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
              {title}
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              {description}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                className="h-10 flex-1 rounded-xl border border-border text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {cancelText}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="h-10 flex-1 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor:
                    confirmVariant === "danger" ? "#dc2626" : "var(--jobly-main)",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "..." : confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
