"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Archive,
  CloseCircle,
  Global,
  InfoCircle,
  Moon,
  SecuritySafe,
  Sun1,
} from "iconsax-react";

import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/types";

import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";

  const cookie = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith("jobly_theme="));
  const cookieValue = cookie?.split("=")[1];
  if (cookieValue === "dark" || cookieValue === "light") return cookieValue;

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function setThemeCookie(next: ThemeMode) {
  document.cookie = `jobly_theme=${next}; path=/; max-age=31536000`;
}

export function DesktopLeftPanel() {
  const { t, locale, setLocale } = useI18n();

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    const root = document.documentElement;
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    setThemeCookie(initial);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);

    const root = document.documentElement;
    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    setThemeCookie(next);
  }, [theme]);

  const locales = useMemo<
    Array<{ value: Locale; label: string; flagSrc: string }>
  >(
    () => [
      {
        value: "az",
        label: t("resume_wizard_lang_azerbaijani"),
        flagSrc: "/flags/az.png",
      },
      {
        value: "en",
        label: t("resume_wizard_lang_english"),
        flagSrc: "/flags/usa.png",
      },
      {
        value: "ru",
        label: t("resume_wizard_lang_russian"),
        flagSrc: "/flags/rus.png",
      },
    ],
    [t],
  );

  function Divider() {
    return <div className="h-px w-full bg-border/60" />;
  }

  function RowContainer({
    icon,
    title,
    trailing,
    href,
    onClick,
  }: {
    icon: React.ReactNode;
    title: string;
    trailing?: React.ReactNode;
    href?: string;
    onClick?: () => void;
  }) {
    const content = (
      <div className="flex w-full items-center px-3 py-3">
        <div className="grid h-[60px] w-[60px] place-items-center">
          <div className="grid h-[60px] w-[60px] place-items-center rounded-full bg-jobly-soft">
            {icon}
          </div>
        </div>
        <div className="w-4 shrink-0" />
        <div className="min-w-0 flex-1 text-base font-normal">{title}</div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block" onClick={onClick}>
          {content}
        </Link>
      );
    }

    return (
      <div
        role="button"
        tabIndex={0}
        className="block w-full cursor-pointer text-left"
        onClick={onClick}
        onKeyDown={(e) => {
          if (!onClick) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {content}
      </div>
    );
  }

  function SocialCircle({
    icon,
    href,
  }: {
    icon: React.ReactNode;
    href: string;
  }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="grid h-[50px] w-[50px] place-items-center rounded-full text-sm font-semibold bg-jobly-soft text-primary"
      >
        {icon}
      </a>
    );
  }

  return (
    <aside className="min-w-0">
      <div className="sticky top-6">
        <div className="overflow-hidden rounded-2xl">
          <RowContainer
            icon={
              theme === "dark" ? (
                <Sun1 size={34} variant="Linear" color="currentColor" className="text-primary" />
              ) : (
                <Moon size={34} variant="Linear" color="currentColor" className="text-primary" />
              )
            }
            title={theme === "dark" ? t("menuLightMode") : t("menuDarkMode")}
            trailing={
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  className={cn(
                    "relative h-6 w-11 rounded-full",
                    theme === "dark" ? "bg-primary" : "bg-black/20",
                  )}
                  aria-label={t("toggle_theme")}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-[left]",
                      theme === "dark" ? "left-[22px]" : "left-[2px]",
                    )}
                  />
                </button>
              </div>
            }
            onClick={undefined}
          />
          <Divider />

          <RowContainer
            icon={<Global size={34} variant="Linear" color="currentColor" className="text-primary" />}
            title={t("changeLanguage")}
            trailing={
              <i className="ri-arrow-right-s-line text-[22px] text-icon-muted" />
            }
            onClick={() => setLangOpen(true)}
          />
          <Divider />

          <RowContainer
            icon={<Archive size={34} variant="Linear" color="currentColor" className="text-primary" />}
            title={t("menuFavorites")}
            trailing={
              <i className="ri-arrow-right-s-line text-[22px] text-icon-muted" />
            }
            href="/favorites"
          />
          <Divider />

          <RowContainer
            icon={<InfoCircle size={34} variant="Linear" color="currentColor" className="text-primary" />}
            title={t("aboutUs")}
            trailing={
              <i className="ri-arrow-right-s-line text-[22px] text-icon-muted" />
            }
            href="/about-us"
          />
          <Divider />

          <RowContainer
            icon={<SecuritySafe size={34} variant="Linear" color="currentColor" className="text-primary" />}
            title={t("privacyPolicyTitle")}
            trailing={
              <i className="ri-arrow-right-s-line text-[22px] text-icon-muted" />
            }
            href="/privacy-policy"
          />
        </div>

        <div className="mt-3 rounded-2xl px-4 py-5">
          <div className="text-center text-lg font-medium">
            {t("social_media_title")}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6">
            <SocialCircle
              href="https://www.linkedin.com/company/jobly-app/"
              icon={
                <i
                  className="ri-linkedin-fill text-[22px]"
                  aria-label={t("social_linkedin")}
                />
              }
            />
            <SocialCircle
              href="https://www.instagram.com/jobly_official"
              icon={
                <i
                  className="ri-instagram-fill text-[22px]"
                  aria-label={t("social_instagram")}
                />
              }
            />
            <SocialCircle
              href="https://t.me/jobly_official"
              icon={
                <i
                  className="ri-telegram-fill text-[22px]"
                  aria-label={t("social_telegram")}
                />
              }
            />
          </div>
        </div>
      </div>

      {langOpen ? (
        <div className="fixed inset-0 z-[10001]">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            onClick={() => setLangOpen(false)}
          />
          <div className="absolute left-0 right-0 top-1/2 mx-auto w-full max-w-[360px] -translate-y-1/2 px-4">
            <div className="rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-base font-semibold">
                  {t("selectLang")}
                </div>
                <button
                  type="button"
                  onClick={() => setLangOpen(false)}
                  aria-label={t("close")}
                >
                  <CloseCircle
                    size={22}
                    variant="Linear"
                    color="currentColor"
                    className="text-icon-muted"
                  />
                </button>
              </div>
              <Divider />

              <div className="p-2">
                {locales.map((l) => {
                  const selected = l.value === locale;
                  return (
                    <button
                      key={l.value}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left",
                        selected && "bg-jobly-soft",
                      )}
                      onClick={() => {
                        setLocale(l.value);
                        setLangOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="overflow-hidden rounded-md">
                          <img
                            src={l.flagSrc}
                            alt={l.label}
                            className="h-[30px] w-[30px] object-cover"
                          />
                        </div>
                        <div
                          className={cn(
                            "text-base",
                            selected
                              ? "font-bold text-primary"
                              : "font-normal",
                          )}
                        >
                          {l.label}
                        </div>
                      </div>
                      {selected ? (
                        <i
                          className="ri-checkbox-circle-fill text-[21px] text-primary"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
