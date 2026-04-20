'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useI18n } from '@/lib/i18n/client';

export function CustomAlertDialog({
  open,
  title,
  message,
  content,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  icon,
  iconColor,
  isDestructive,
  showCancelButton,
}: {
  open: boolean;
  title: string;
  message?: string | null;
  content?: ReactNode;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  icon?: ReactNode;
  iconColor?: string;
  isDestructive?: boolean;
  showCancelButton?: boolean;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  const confirmBg = isDestructive ? 'rgb(239,68,68)' : 'var(--jobly-main, #245BEB)';
  const iconTint = iconColor ?? (isDestructive ? 'rgb(239,68,68)' : 'var(--jobly-main, #245BEB)');

  const iconBg = (() => {
    const c = iconTint.trim();
    const m = c.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
    if (m) return `rgba(${m[1]}, ${m[2]}, ${m[3]}, 0.12)`;
    const hex = c.match(/^#([0-9a-f]{6})$/i);
    if (hex) {
      const v = hex[1];
      const r = parseInt(v.slice(0, 2), 16);
      const g = parseInt(v.slice(2, 4), 16);
      const b = parseInt(v.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }
    return 'rgba(36, 91, 235, 0.12)';
  })();

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        onClick={onCancel}
        className="absolute inset-0 h-full w-full bg-black/40"
        aria-label={t('close')}
      />

      <div className="absolute inset-0 grid place-items-center px-5 py-5">
        <div
          className="w-full max-w-[420px] rounded-[20px] border border-border bg-card shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
          role="dialog"
          aria-modal="true"
        >
          <div className="px-5 pt-5 pb-4">
            <div className="flex justify-center">
              {icon ? (
                <div
                  className="grid h-12 w-12 place-items-center rounded-[12px]"
                  style={{ backgroundColor: iconBg }}
                >
                  <div style={{ color: iconTint }}>{icon}</div>
                </div>
              ) : null}
            </div>

            {icon ? <div className="h-[14px]" /> : null}

            <div className="text-center text-[18px] font-bold leading-[1.2] text-foreground">
              {title}
            </div>

            <div className="h-[10px]" />

            <div className="px-[6px] text-center text-[14px] leading-[1.45] text-muted-foreground">
              {content ?? message}
            </div>

            <div className="h-5" />

            {showCancelButton === false ? (
              <button
                type="button"
                onClick={() => void onConfirm()}
                className="h-11 w-full rounded-xl text-[14px] font-bold text-white"
                style={{ backgroundColor: confirmBg }}
              >
                {confirmText}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="h-11 flex-1 rounded-xl border border-border bg-transparent text-[14px] font-semibold text-foreground"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={() => void onConfirm()}
                  className="h-11 flex-1 rounded-xl text-[14px] font-bold text-white"
                  style={{ backgroundColor: confirmBg }}
                >
                  {confirmText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
