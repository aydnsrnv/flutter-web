import Link from "next/link";

import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function finalizeWalletTopUpByTransactionCode(
  rawCode: string | null | undefined,
) {
  const code = String(rawCode ?? "").trim();
  if (!code) {
    return { ok: false, message: "Missing transaction code" as string };
  }

  const txCode = Number(code);
  if (!Number.isFinite(txCode)) {
    return { ok: false, message: "Invalid transaction code" as string };
  }

  const supabase = createAdminClient();

  const { data: paymentRow, error: payErr } = await supabase
    .from("payments")
    .select("id, user_id, amount, transaction_code, is_applied")
    .eq("transaction_code", txCode)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (payErr) {
    return { ok: false, message: payErr.message };
  }

  const paymentId = (paymentRow as any)?.id as string | undefined;
  const userId = (paymentRow as any)?.user_id as string | undefined;

  if (!paymentId || !userId) {
    return { ok: false, message: "Payment not found" as string };
  }

  if ((paymentRow as any)?.is_applied === true) {
    return { ok: true, alreadyApplied: true as const };
  }

  const { data: claimedRow, error: claimErr } = await supabase
    .from("payments")
    .update({ is_applied: true } as any)
    .eq("id", paymentId)
    .eq("is_applied", false)
    .select("id")
    .maybeSingle();

  if (claimErr) {
    return { ok: false, message: claimErr.message };
  }

  if (!claimedRow) {
    return { ok: true, alreadyApplied: true as const };
  }

  const { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("wallet")
    .eq("user_id", userId)
    .maybeSingle();

  if (userErr) {
    await supabase
      .from("payments")
      .update({ is_applied: false } as any)
      .eq("id", paymentId);
    return { ok: false, message: userErr.message };
  }

  const amount = Number((paymentRow as any)?.amount ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    await supabase
      .from("payments")
      .update({ is_applied: false } as any)
      .eq("id", paymentId);
    return { ok: false, message: "Invalid payment amount" as string };
  }

  const currentWallet = Number((userRow as any)?.wallet ?? 0) || 0;
  const nextWallet = currentWallet + Math.round(amount);

  const { error: updateErr } = await supabase
    .from("users")
    .update({ wallet: nextWallet })
    .eq("user_id", userId);

  if (updateErr) {
    await supabase
      .from("payments")
      .update({ is_applied: false } as any)
      .eq("id", paymentId);
    return { ok: false, message: updateErr.message };
  }

  return { ok: true };
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const locale = await getLocaleFromCookies();
  const dict = getDictionary(locale);
  const t = (key: string) => dict[key] ?? key;

  const sp = await Promise.resolve(searchParams ?? {});
  const tidRaw = sp.tid ?? sp.order_id ?? sp.orderId ?? sp.order;
  const tid = Array.isArray(tidRaw) ? tidRaw[0] : tidRaw;

  const finalizeResult = tid
    ? await finalizeWalletTopUpByTransactionCode(tid)
    : { ok: true };

  const showError = !finalizeResult.ok;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-[520px] flex-col items-center justify-center px-6">
      <div className="w-full rounded-2xl border border-border bg-card p-6 text-center">
        <div className="text-lg font-semibold text-foreground">
          {showError ? t("payment_failed_title") : t("payment_success_title")}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {showError
            ? finalizeResult.message || t("payment_failed_subtitle")
            : t("payment_success_subtitle")}
        </div>
        <Link
          href={showError ? "/wallet" : "/profile"}
          className="mt-5 inline-block h-12 w-full rounded-2xl text-center text-sm font-semibold leading-[48px] bg-primary text-primary-foreground"
        >
          {showError ? t("payment_try_again") : t("payment_back_to_profile")}
        </Link>
      </div>
    </div>
  );
}
