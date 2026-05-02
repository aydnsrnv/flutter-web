"use client";

import Link from "next/link";
import { SearchNormal1, Setting3 } from "iconsax-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n/client";
import { Input } from "@/components/ui/input";

export function CandidatesSearchBar({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const currentQuery = (searchParams.get("q") ?? "").trim();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(currentQuery || initialQuery);
  }, [currentQuery, initialQuery]);

  useEffect(() => {
    const trimmed = q.trim();

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (trimmed.length >= 3) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const nextQuery = params.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentHref = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextHref !== currentHref) {
        router.replace(nextHref, { scroll: false });
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [pathname, q, router, searchParams]);

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <Input
        className="pl-14 pr-[58px]"
        placeholder={t("search_cv_placeholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <SearchNormal1 size={21} variant="Linear" color="currentColor" className="text-muted-foreground" />
      </div>

      <Link
        href="/cv-filters"
        aria-label={t("aria_filters")}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        prefetch
      >
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary">
          <Setting3 size={21} variant="Linear" color="currentColor" className="text-primary-foreground" />
        </div>
      </Link>
    </form>
  );
}
