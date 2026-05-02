"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { useI18n } from "@/lib/i18n/client";

const items = [
  {
    href: "/home",
    labelKey: "nav_home",
    icon: { inactive: "ri-home-smile-line", active: "ri-home-smile-fill" },
  },
  {
    href: "/candidates",
    labelKey: "nav_candidates",
    icon: { inactive: "ri-user-2-line", active: "ri-user-2-fill" },
  },
  {
    href: "/companies",
    labelKey: "nav_companies",
    icon: { inactive: "ri-building-line", active: "ri-building-fill" },
  },
  {
    href: "/categories",
    labelKey: "nav_categories",
    icon: { inactive: "ri-briefcase-2-line", active: "ri-briefcase-2-fill" },
  },
];

export function BottomNav({
  variant = "mobile",
  onMenuOpen,
}: {
  variant?: "mobile" | "desktop";
  onMenuOpen?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navClassName =
    variant === "desktop"
      ? "sticky bottom-0 z-[80] w-full"
      : "fixed inset-x-0 bottom-0 z-[80] mx-auto w-full max-w-md";

  return (
    <nav id="bottom-nav" className={navClassName} data-bottom-nav>
      <div>
        <div className="overflow-hidden rounded-t-2xl">
          <div
            className={cn(
              "grid bg-background dark:bg-card",
              variant === "mobile" ? "grid-cols-5" : "grid-cols-4",
            )}
          >
            {items.map((it) => {
              const active =
                pathname === it.href || pathname.startsWith(it.href + "/");
              const iconClass = active ? it.icon.active : it.icon.inactive;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  prefetch
                  className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs"
                >
                  <span
                    className={cn(
                      "inline-flex rounded-2xl px-[18px] py-[2px]",
                      active && "bg-jobly-soft",
                    )}
                  >
                    <i
                      className={cn(
                        iconClass,
                        "text-[27px] leading-none",
                        active ? "text-primary" : "text-foreground/75",
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "leading-none text-xs",
                      active
                        ? "font-bold text-primary"
                        : "font-medium text-foreground/75",
                    )}
                  >
                    {t(it.labelKey)}
                  </span>
                </Link>
              );
            })}

            {variant === "mobile" ? (
              <button
                type="button"
                onClick={() => onMenuOpen?.()}
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs"
                aria-label="Open Menu"
              >
                <span className="inline-flex rounded-2xl px-[18px] py-[2px]">
                  <i className="ri-menu-2-line text-[27px] leading-none text-foreground/75" />
                </span>
                <span className="leading-none text-xs font-medium text-foreground/75">
                  Menu
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
