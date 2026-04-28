"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function PaginationControls({
  total,
  limit = 20,
}: {
  total: number;
  limit?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page") ?? "1");
  const totalPages = Math.max(1, Math.ceil(total / limit));

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className={cn(
          "h-9 w-9 rounded-lg border border-border flex items-center justify-center text-sm",
          currentPage <= 1 && "opacity-40 cursor-not-allowed"
        )}
        style={{ color: "var(--foreground)" }}
      >
        <i className="ri-arrow-left-s-line" />
      </button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span
            key={`dots-${idx}`}
            className="h-9 w-9 flex items-center justify-center text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p as number)}
            className={cn(
              "h-9 w-9 rounded-lg border text-sm font-medium flex items-center justify-center transition-colors",
              currentPage === p
                ? "border-[var(--jobly-main)] text-white"
                : "border-border hover:bg-muted"
            )}
            style={currentPage === p ? { backgroundColor: "var(--jobly-main)" } : { color: "var(--foreground)" }}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className={cn(
          "h-9 w-9 rounded-lg border border-border flex items-center justify-center text-sm",
          currentPage >= totalPages && "opacity-40 cursor-not-allowed"
        )}
        style={{ color: "var(--foreground)" }}
      >
        <i className="ri-arrow-right-s-line" />
      </button>
    </div>
  );
}
