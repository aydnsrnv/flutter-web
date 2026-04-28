"use client";

import Link from "next/link";

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted"
        >
          <i className="ri-menu-line text-xl" style={{ color: "var(--foreground)" }} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <i className="ri-external-link-line" />
            View Site
          </Link>
        </div>
      </div>
    </header>
  );
}
