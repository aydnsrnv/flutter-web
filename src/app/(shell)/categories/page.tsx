import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

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

import { createClient } from "@/lib/supabase/server";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function serializeError(err: unknown) {
  if (!err) return null;
  if (err instanceof Error) {
    const own = Object.getOwnPropertyNames(err).reduce<Record<string, unknown>>(
      (acc, key) => {
        acc[key] = (err as any)[key];
        return acc;
      },
      {},
    );
    return { name: err.name, message: err.message, stack: err.stack, ...own };
  }

  if (typeof err === "object") {
    const own = Object.getOwnPropertyNames(err as object).reduce<
      Record<string, unknown>
    >((acc, key) => {
      acc[key] = (err as any)[key];
      return acc;
    }, {});
    return own;
  }

  return { value: String(err) };
}

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

type CategoryRow = {
  id: string | number;
  list_id: number;
  category_name: string;
  job_count?: number | null;
};

function categoryIcon(listId: number) {
  const props = {
    size: 28,
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

function localizeCategoryName(raw: string, t: (key: string) => string) {
  const key = String(raw ?? "").trim();
  if (!key) return t("dash_placeholder");
  return t(key);
}

function localizeCategorySubtitle(
  listId: number,
  rawSubtitle: string | null | undefined,
  t: (key: string) => string,
) {
  const key = `category${listId}_subtitle`;
  const translated = t(key);
  if (translated && translated !== key) return translated;
  return (rawSubtitle ?? "").trim();
}

export default async function CategoriesPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, list_id, category_name, job_count")
    .order("job_count", { ascending: false })
    .limit(200);

  const serializedError = serializeError(error);

  if (error) {
    console.error("[CategoriesPage] Supabase error", serializedError);
  }

  const rows = (data ?? []) as CategoryRow[];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl">
        {error ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            <div>{(serializedError as any)?.message ?? String(error)}</div>
            {(serializedError as any)?.code ? (
              <div className="mt-1">code: {(serializedError as any).code}</div>
            ) : null}
            {(serializedError as any)?.hint ? (
              <div className="mt-1">hint: {(serializedError as any).hint}</div>
            ) : null}
            {(serializedError as any)?.details ? (
              <div className="mt-1">
                details: {(serializedError as any).details}
              </div>
            ) : null}
            <pre
              className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-5"
              style={{ opacity: 0.9 }}
            >
              {JSON.stringify(serializedError, null, 2)}
            </pre>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState label={t("no_category")} />
        ) : (
          <div>
            {rows.map((c, idx) => {
              const listId = Number.isFinite(c.list_id) ? c.list_id : 0;
              const title = localizeCategoryName(c.category_name, t);
              const subtitle = localizeCategorySubtitle(listId, null, t);
              const count = c.job_count ?? 0;
              const href = `/category/${encodeURIComponent(String(listId))}`;

              return (
                <div key={String(c.id)}>
                  <Link href={href} className="block py-3">
                    <div className="flex items-center gap-4">
                      <div
                        className="grid shrink-0 place-items-center rounded-full"
                        style={{
                          width: 60,
                          height: 60,
                          backgroundColor: "rgba(36, 91, 235, 0.10)",
                        }}
                      >
                        {categoryIcon(listId)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-[16px] text-foreground"
                          style={{ fontWeight: 400 }}
                        >
                          {title}
                        </div>
                        {subtitle ? (
                          <div className="mt-1 truncate text-[13px] text-foreground/60">
                            {subtitle}
                          </div>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-[15px] font-bold text-foreground/70">
                        {count}
                      </div>
                    </div>
                  </Link>

                  {idx !== rows.length - 1 ? (
                    <div
                      style={{ height: 1, backgroundColor: "var(--border)" }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
