"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AddCircle, Login, Notification, User } from "iconsax-react";
import { Suspense, useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { IconButton } from "@/components/ui/icon-button";

export function AppHeader(props: {
  title?: string;
  showBrand?: boolean;
  aside?: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="h-[60px] w-full border-b border-border bg-card" />
      }
    >
      <AppHeaderInner {...props} />
    </Suspense>
  );
}

function AppHeaderInner({
  title,
  showBrand = true,
  aside,
}: {
  title?: string;
  showBrand?: boolean;
  aside?: React.ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const isEditMode = searchParams ? searchParams.has("id") : false;
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [createHref, setCreateHref] = useState<string>("/create");

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

  return (
    <header className="relative flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4">
        {showBrand && (pathname === "/home" || pathname === "/") ? (
          <>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="hidden lg:flex items-center gap-2 bg-transparent border-0 cursor-pointer"
            >
              <div className="h-7 w-7 overflow-hidden rounded-full bg-white">
                <Image
                  src="/jobly_icon.jpg"
                  alt={t("app_name")}
                  width={28}
                  height={28}
                />
              </div>
              <div className="text-[28px] font-bold leading-none text-primary">
                {title ?? t("app_name")}
              </div>
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex lg:hidden items-center gap-2 bg-transparent border-0 cursor-pointer"
            >
              <div className="h-7 w-7 overflow-hidden rounded-full bg-white">
                <Image
                  src="/jobly_icon.jpg"
                  alt={t("app_name")}
                  width={28}
                  height={28}
                />
              </div>
              <div className="text-xl font-bold leading-none text-primary">
                {t("app_name")}
              </div>
            </button>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {pathname === "/home" || pathname === "/" ? (
          loggedIn ? (
            <>
              <IconButton
                href={createHref}
                label={t("aria_add")}
              >
                <AddCircle size={24} variant="Linear" color="currentColor" />
              </IconButton>

              <IconButton
                href="/notifications"
                label={t("aria_notifications")}
              >
                <Notification size={24} variant="Linear" color="currentColor" />
              </IconButton>

              <IconButton
                href="/profile"
                label={t("aria_profile")}
              >
                <User size={24} variant="Linear" color="currentColor" />
              </IconButton>
            </>
          ) : (
            <IconButton
              href="/login"
              label={t("aria_login")}
            >
              <Login size={24} variant="Outline" color="currentColor" />
            </IconButton>
          )
        ) : (
          <div className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-center max-w-[60vw] truncate lg:left-1/2 lg:max-w-[60vw] lg:-translate-x-1/2 text-primary">
            {pathname.includes("/candidates")
              ? t("nav_candidates")
              : pathname.includes("/companies")
                ? t("nav_companies")
                : pathname.includes("/categories")
                  ? t("nav_categories")
                  : pathname.includes("/category/")
                    ? t("nav_categories")
                    : pathname.includes("/favorites")
                      ? t("nav_favorites")
                      : pathname.includes("/latest-cvs")
                        ? t("home_latest_resumes")
                        : pathname.includes("/my/cvs")
                          ? t("profile_my_cvs")
                          : pathname.includes("/cvs")
                            ? t("menu_tab_cvs")
                            : pathname.includes("/my/jobs")
                              ? t("menu_my_jobs")
                              : pathname.includes("/jobs")
                                ? t("jobs_title")
                                : pathname.includes("/my/drafts")
                                  ? t("drafts")
                                  : pathname.includes("/payments-history")
                                    ? t("menu_payments_history")
                                    : pathname.includes("/wallet-transactions")
                                      ? t("spendings_title")
                                      : pathname.includes("/notifications")
                                        ? t("notifications_title")
                                        : pathname.endsWith("/cv/add") ||
                                            pathname.endsWith("/cv")
                                          ? isEditMode
                                            ? t("edit_resume")
                                            : t("resume_wizard_title")
                                          : pathname.endsWith("/job/add")
                                            ? isEditMode
                                              ? t("edit_job")
                                              : t("add_job")
                                            : pathname.includes("/latest")
                                              ? t("latest_vacancies_title")
                                              : pathname.includes("/filters") ||
                                                  pathname.includes(
                                                    "/cv-filters",
                                                  ) ||
                                                  pathname.includes(
                                                    "/filter-results",
                                                  ) ||
                                                  pathname.includes(
                                                    "/cv-filter-results",
                                                  )
                                                ? t("detailed_search")
                                                : pathname.includes("/profile")
                                                  ? t("profile_title")
                                                  : pathname.includes("/create")
                                                    ? t("add")
                                                    : ""}
          </div>
        )}
      </div>
    </header>
  );
}
