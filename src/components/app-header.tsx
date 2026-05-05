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
        ) : null}
      </div>
    </header>
  );
}
