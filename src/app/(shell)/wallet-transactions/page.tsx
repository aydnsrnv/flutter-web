import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";

import { WalletTransactionsClient } from "@/app/(shell)/wallet-transactions/wallet-transactions-client";
import { EmptyState } from "@/components/empty-state";

function toSnakeCase(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

type WalletTxRow = {
  id: string;
  amount: number;
  source?: string | null;
  type?: string | null;
  number?: number | null;
  title?: string | null;
  created_at: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function WalletTransactionsPage() {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? dict[toSnakeCase(key)] ?? key;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, amount, source, type, number, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const items = (Array.isArray(data) ? (data as WalletTxRow[]) : []).filter(
    Boolean,
  );
  const limit = 20;

  const footerText = "3 aydan öncəki tarixə aid məlumatlar göstərilmir.";

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div className="rounded-2xl border border-border p-4 text-sm text-muted-foreground">
          {String(error.message ?? "")}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border">
        {items.length === 0 ? (
          <EmptyState label={t("spendings_empty")} />
        ) : (
          <WalletTransactionsClient
            initialItems={items}
            initialHasMore={items.length >= limit}
            limit={limit}
          />
        )}
      </div>

      <div className="pb-2 text-center text-xs text-muted-foreground">
        {footerText}
      </div>
    </div>
  );
}
