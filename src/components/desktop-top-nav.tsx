"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AddCircle,
  Archive,
  CloseCircle,
  Global,
  InfoCircle,
  Moon,
  Notification,
  SearchNormal1,
  SecuritySafe,
  Sun1,
  User,
} from "iconsax-react";

import { useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";
import { Input } from "@/components/ui/input";

const navItems = [
  {
    href: "/home",
    labelKey: "nav_home",
    icon: "ri-home-smile-line",
    iconActive: "ri-home-smile-fill",
  },
  {
    href: "/candidates",
    labelKey: "nav_candidates",
    icon: "ri-user-2-line",
    iconActive: "ri-user-2-fill",
  },
  {
    href: "/companies",
    labelKey: "nav_companies",
    icon: "ri-building-line",
    iconActive: "ri-building-fill",
  },
  {
    href: "/categories",
    labelKey: "nav_categories",
    icon: "ri-briefcase-2-line",
    iconActive: "ri-briefcase-2-fill",
  },
];

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

function TopNavSearch() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const isHome = pathname === "/home" || pathname === "/";
  const isCandidates = pathname === "/candidates";
  const isJobDetail = pathname.startsWith("/job/");
  const isCvDetail = pathname.startsWith("/cv/");
  const hasSearch = isHome || isCandidates || isJobDetail || isCvDetail;

  const currentQ = (searchParams.get("q") ?? "").trim();
  const [q, setQ] = useState(currentQ);

  useEffect(() => {
    setQ(currentQ);
  }, [currentQ]);

  useEffect(() => {
    if (!hasSearch) return;
    const trimmed = q.trim();
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed.length >= 3) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      const nextQuery = params.toString();
      const nextHref = nextQuery
        ? `${searchBasePath}?${nextQuery}`
        : searchBasePath;
      const currentHref = searchParams.toString()
        ? `${searchBasePath}?${searchParams.toString()}`
        : searchBasePath;
      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    }, 350);
    return () => window.clearTimeout(handle);
  }, [q, hasSearch, pathname, router, searchParams]);

  if (!hasSearch) {
    return null;
  }

  const searchBasePath = isCandidates || isCvDetail ? "/candidates" : "/home";
  const placeholder =
    isHome || isJobDetail
      ? t("search_job")
      : t("search_cv_placeholder");
  return (
    <form
      className="relative hidden md:block"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Input
        className="h-9 w-[200px] lg:h-11 lg:w-[240px] rounded-full border-border bg-muted/50 pl-10 pr-10 lg:pl-12 lg:pr-12 text-sm focus-visible:bg-background"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 lg:left-4">
        <SearchNormal1
          size={18}
          variant="Linear"
          color="currentColor"
          className="text-muted-foreground lg:scale-110"
        />
      </div>
    </form>
  );
}

export function DesktopTopNav({ aside }: { aside?: React.ReactNode }) {
  const { t, locale, setLocale } = useI18n();
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const [theme, setTheme] = useState<ThemeMode>("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [createHref, setCreateHref] = useState<string>("/create");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    const root = document.documentElement;
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    setThemeCookie(initial);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      const isLoggedIn = Boolean(user);
      setLoggedIn(isLoggedIn);

      if (!user) {
        setCreateHref("/create");
        return;
      }

      try {
        const { data: userRow, error } = await supabase
          .from("users")
          .select("user_type")
          .eq("user_id", user.id)
          .maybeSingle();

        const userType = (userRow?.user_type ?? "").toString().toLowerCase();
        if (!error && userType === "employer") {
          setCreateHref("/create/job/add");
        } else if (!error && userType === "candidate") {
          setCreateHref("/create/cv/add");
        } else {
          setCreateHref("/create");
        }
      } catch (_) {
        setCreateHref("/create");
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <>
      <header className="sticky top-0 z-[70] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-[60px] lg:h-[72px] items-center justify-between gap-4 px-4 lg:px-24 border-b border-border mb-5">
        {/* Left: Logo + Search */}
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 lg:h-10 lg:w-10 overflow-hidden rounded-full bg-white">
              <Image
                src="/jobly_icon.jpg"
                alt={t("app_name")}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-[24px] lg:text-[29px] font-bold leading-none text-primary hidden xl:inline">
              {t("app_name")}
            </span>
          </Link>

          <TopNavSearch />
        </div>

        {/* Center: Nav links */}
        <nav className="flex items-center gap-1">
          {navItems.map((it) => {
            const active =
              pathname === it.href || pathname.startsWith(it.href + "/");
            return (
              <Link
                key={it.href}
                href={it.href}
                prefetch
                className="group relative flex flex-col items-center justify-center px-3 py-1"
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl px-3 py-1.5 transition-colors",
                    active && "bg-jobly-soft",
                  )}
                >
                  <i
                    className={cn(
                      active ? it.iconActive : it.icon,
                      "text-[22px] lg:text-[26px] leading-none transition-colors",
                      active ? "text-primary" : "text-foreground/75 group-hover:text-primary",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[11px] lg:text-[13px] leading-none transition-colors",
                    active
                      ? "font-bold text-primary"
                      : "font-medium text-foreground/75 group-hover:text-primary",
                  )}
                >
                  {t(it.labelKey)}
                </span>

              </Link>
            );
          })}
        </nav>

        {/* Right: Actions + Dropdown */}
        <div className="flex items-center gap-1">
          {loggedIn ? (
            <>
              <Link
                href={createHref}
                className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-muted hover:text-primary"
                title={t("aria_add")}
              >
                <AddCircle size={22} variant="Linear" color="currentColor" className="lg:scale-110" />
              </Link>
              <Link
                href="/notifications"
                className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-muted hover:text-primary"
                title={t("aria_notifications")}
              >
                <Notification
                  size={22}
                  variant="Linear"
                  color="currentColor"
                  className="lg:scale-110"
                />
              </Link>
              <Link
                href="/profile"
                className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-muted hover:text-primary"
                title={t("aria_profile")}
              >
                <User size={22} variant="Linear" color="currentColor" className="lg:scale-110" />
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-muted hover:text-primary"
              title={t("aria_login")}
            >
              <User size={22} variant="Linear" color="currentColor" className="lg:scale-110" />
            </Link>
          )}

          {/* İş İçin Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className={cn(
                "group flex flex-col items-center justify-center px-3 py-1 transition-colors",
                dropdownOpen ? "text-primary" : "text-foreground/60",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-xl px-3 py-1.5 transition-colors group-hover:bg-muted/50",
                  dropdownOpen && "bg-jobly-soft",
                )}
              >
                <i className="ri-grid-fill text-[22px] lg:text-[26px] leading-none transition-colors group-hover:text-primary" />
              </span>
              <span className="mt-0.5 text-[11px] lg:text-[13px] font-medium leading-none transition-colors group-hover:text-primary">
                {t("menu_title")}
              </span>
            </button>

            {dropdownOpen && (
              <div
                className={cn(
                  "absolute right-0 top-[calc(100%+12px)] flex overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
                  aside ? "w-[min(740px,calc(100vw-2rem))]" : "w-[320px]",
                )}
              >
                <div className={cn("shrink-0", aside ? "w-[320px]" : "w-full")}>
                  {/* Theme Toggle */}
                  <div className="flex items-center gap-3 px-4 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft">
                    {theme === "dark" ? (
                      <Sun1
                        size={22}
                        variant="Linear"
                        color="currentColor"
                        className="text-primary"
                      />
                    ) : (
                      <Moon
                        size={22}
                        variant="Linear"
                        color="currentColor"
                        className="text-primary"
                      />
                    )}
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {theme === "dark"
                      ? t("menuLightMode")
                      : t("menuDarkMode")}
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
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
                <div className="h-px w-full bg-border/60" />

                {/* Language */}
                <button
                  type="button"
                  onClick={() => setLangOpen(true)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft">
                    <Global
                      size={22}
                      variant="Linear"
                      color="currentColor"
                      className="text-primary"
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {t("changeLanguage")}
                  </span>
                  <i className="ri-arrow-right-s-line text-lg text-foreground/60" />
                </button>
                <div className="h-px w-full bg-border/60" />

                {/* Favorites */}
                <Link
                  href="/favorites"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft">
                    <Archive
                      size={22}
                      variant="Linear"
                      color="currentColor"
                      className="text-primary"
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {t("menuFavorites")}
                  </span>
                  <i className="ri-arrow-right-s-line text-lg text-foreground/60" />
                </Link>
                <div className="h-px w-full bg-border/60" />

                {/* About Us */}
                <Link
                  href="/about-us"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft">
                    <InfoCircle
                      size={22}
                      variant="Linear"
                      color="currentColor"
                      className="text-primary"
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {t("about_us")}
                  </span>
                  <i className="ri-arrow-right-s-line text-lg text-foreground/60" />
                </Link>
                <div className="h-px w-full bg-border/60" />

                {/* Privacy Policy */}
                <Link
                  href="/privacy-policy"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft">
                    <SecuritySafe
                      size={22}
                      variant="Linear"
                      color="currentColor"
                      className="text-primary"
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {t("privacyPolicyTitle")}
                  </span>
                  <i className="ri-arrow-right-s-line text-lg text-foreground/60" />
                </Link>

                {/* Social Media */}
                <div className="border-t border-border/60 px-4 py-4">
                  <div className="mb-3 text-center text-sm font-medium text-muted-foreground">
                    {t("social_media_title")}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <a
                      href="https://www.linkedin.com/company/jobly-app/"
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft text-primary transition-transform hover:scale-105"
                      aria-label={t("social_linkedin")}
                    >
                      <i className="ri-linkedin-fill text-lg" />
                    </a>
                    <a
                      href="https://www.instagram.com/jobly_official"
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft text-primary transition-transform hover:scale-105"
                      aria-label={t("social_instagram")}
                    >
                      <i className="ri-instagram-fill text-lg" />
                    </a>
                    <a
                      href="https://t.me/jobly_official"
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-10 w-10 place-items-center rounded-full bg-jobly-soft text-primary transition-transform hover:scale-105"
                      aria-label={t("social_telegram")}
                    >
                      <i className="ri-telegram-fill text-lg" />
                    </a>
                  </div>
                </div>
              </div>
              {aside ? (
                  <div className="flex w-[380px] shrink-0 items-center justify-center border-l border-border bg-muted/30 p-4">
                    <div className="w-full">{aside}</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
    {langOpen && (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/55 px-4" onClick={() => setLangOpen(false)}>
        <div className="relative w-full max-w-[360px]" onClick={(e) => e.stopPropagation()}>
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
                  className="text-foreground/60"
                />
              </button>
            </div>
            <div className="h-px w-full bg-border/60" />

            <div className="p-2">
              {locales.map((l) => {
                const selected = l.value === locale;
                return (
                  <button
                    key={l.value}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors",
                      selected && "bg-jobly-soft",
                    )}
                    onClick={() => {
                      setLocale(l.value);
                      setLangOpen(false);
                      setDropdownOpen(false);
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
    )}
    </>
  );
}
