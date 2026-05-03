"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { useParams } from "next/navigation";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FlutterJobListGroup } from "@/components/flutter-job-list-group";
import type { FlutterJobItemData } from "@/components/flutter-job-item";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/browser";
import { PageShimmer } from "@/components/page-shimmer";
import { Input } from "@/components/ui/input";
import {
  Airplane,
  Book,
  Briefcase,
  Brush,
  Building,
  Code,
  Coffee,
  Courthouse,
  DocumentText,
  Electricity,
  Health,
  Microphone,
  Money,
  More,
  People,
  Setting2,
  Shield,
  Shop,
  TruckFast,
} from "iconsax-react";

type JobRow = {
  id: string | number;
  job_number?: number | string | null;
  title: string;
  company_name: string;
  company_logo: string;
  city: string;
  create_time: string;
  min_salary?: string | null;
  max_salary?: string | null;
  view_count?: number | null;
  applied_count?: number | null;
};

type CategoryRow = {
  id: string | number;
  list_id: number;
  category_name: string;
  job_count?: number | null;
};

function safeParseNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function categoryIcon(listId: number) {
  const props = {
    size: 20,
    variant: "Linear" as const,
    color: "var(--jobly-main, #245BEB)",
  };
  const map: Record<number, React.ReactNode> = {
    0: <Code {...props} />,
    1: <Shop {...props} />,
    2: <Money {...props} />,
    3: <Book {...props} />,
    4: <DocumentText {...props} />,
    5: <Health {...props} />,
    6: <Building {...props} />,
    7: <Coffee {...props} />,
    8: <TruckFast {...props} />,
    9: <Setting2 {...props} />,
    10: <Brush {...props} />,
    11: <Courthouse {...props} />,
    12: <Airplane {...props} />,
    13: <More {...props} />,
    14: <Electricity {...props} />,
    15: <Microphone {...props} />,
    16: <People {...props} />,
    17: <Shield {...props} />,
    18: <More {...props} />,
  };
  return map[listId] ?? <More {...props} />;
}

export default function CategoryViewPage() {
  const { t } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const params = useParams<{ list_id: string }>();

  const listId = safeParseNumber(params?.list_id) ?? 0;
  const categoryKey = `category${listId}`;

  const [inputValue, setInputValue] = useState("");
  const [queryValue, setQueryValue] = useState("");

  const pageSize = 20;
  const [items, setItems] = useState<FlutterJobItemData[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const v = inputValue.trim();
    const handle = window.setTimeout(() => {
      if (v.length >= 3) setQueryValue(v);
      else setQueryValue("");
    }, 350);
    return () => window.clearTimeout(handle);
  }, [inputValue]);

  useEffect(() => {
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [categoryKey, queryValue]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      setCategoriesLoading(true);
      try {
        const { data } = await supabase
          .from("categories")
          .select("id, list_id, category_name, job_count")
          .order("job_count", { ascending: false })
          .limit(300);
        if (cancelled) return;
        setCategories((data ?? []) as CategoryRow[]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };
    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const loadMore = useCallback(
    async (nextOffset: number) => {
      if (loadingRef.current) return;
      if (!hasMoreRef.current && nextOffset !== 0) return;

      setLoading(true);
      setError(null);
      if (nextOffset === 0) setInitialLoading(true);
      try {
        let q = supabase
          .from("jobs")
          .select(
            "id, job_number, title, company_name, company_logo, city, create_time, min_salary, max_salary, view_count, applied_count",
          )
          .eq("status", true)
          .eq("category_name", categoryKey)
          .order("create_time", { ascending: false })
          .range(nextOffset, nextOffset + pageSize - 1);

        if (queryValue) {
          const escaped = queryValue.replace(/,/g, " "); // avoid breaking .or() CSV
          const parsed = Number(escaped);
          const isNumber = Number.isFinite(parsed);
          const orParts = [
            `title.ilike.%${escaped}%`,
            `company_name.ilike.%${escaped}%`,
            ...(isNumber ? [`job_number.eq.${parsed}`] : []),
          ];
          q = q.or(orParts.join(","));
        }

        const { data, error: qErr } = await q;
        if (qErr) throw qErr;

        const rows = (data ?? []) as JobRow[];
        const mapped = rows.map(
          (j): FlutterJobItemData => ({
            id: String(j.id),
            job_number: j.job_number,
            title: j.title,
            company_name: j.company_name,
            company_logo: j.company_logo,
            city: j.city,
            create_time: j.create_time,
            min_salary: j.min_salary,
            max_salary: j.max_salary,
          }),
        );

        setItems((prev) => (nextOffset === 0 ? mapped : prev.concat(mapped)));
        setOffset(nextOffset + rows.length);
        setHasMore(rows.length === pageSize);
      } catch (e: any) {
        setError(
          t("category_jobs_load_error").replace(
            "{error}",
            e?.message ?? String(e),
          ),
        );
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [categoryKey, pageSize, queryValue, supabase, t],
  );

  useEffect(() => {
    void loadMore(0);
  }, [categoryKey, queryValue, loadMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!hasMoreRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loadingRef.current) return;
        if (!hasMoreRef.current) return;
        void loadMore(offset);
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [offset, hasMore, loading, loadMore]);

  const headerTitle = t(categoryKey);

  if (initialLoading && categoriesLoading) return <PageShimmer />;

  return (
    <div className="flex flex-col gap-4">
      <div className="lg:flex lg:gap-6">
        <div className="hidden lg:block lg:w-[280px] lg:shrink-0">
          <div className="rounded-2xl border border-border bg-card p-3">
            <div className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
              {t("category")}
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-auto pr-1">
              {categories.map((c) => {
                const isActive = c.list_id === listId;
                return (
                  <Link
                    key={String(c.id)}
                    href={`/category/${encodeURIComponent(String(c.list_id))}`}
                    className={`mb-1 flex items-center gap-2 rounded-xl px-2 py-2.5 transition-colors ${isActive ? "bg-jobly-soft text-primary" : "hover:bg-muted/70"}`}
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-background/70">
                      {categoryIcon(c.list_id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {t(c.category_name)}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs font-bold text-foreground/65">
                      {c.job_count ?? 0}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("search_job")}
              className="pl-11 pr-11"
            />
            {inputValue.trim() ? (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full"
                aria-label={t("clear")}
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-muted">
                  <i className="ri-close-line text-lg text-muted-foreground" />
                </div>
              </button>
            ) : null}
          </div>

          <div className="h-4" />

          {error ? (
            <div className="py-4 text-sm text-muted-foreground">{error}</div>
          ) : !loading && items.length === 0 ? (
            <EmptyState label={t("no_job_in_category")} />
          ) : (
            <div>
              <FlutterJobListGroup jobs={items} />
              {hasMore ? <div ref={sentinelRef} className="py-4" /> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
