"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n/client";
import { Input } from "@/components/ui/input";

const mainColor = "#245BEB";
const REQUEST_KEY_STORAGE = "jobly_wallet_topup_request_key";

export default function WalletTopUpPage() {
  const { t } = useI18n();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const redirectingRef = useRef(false);

  const numericAmount = useMemo(() => {
    const n = Number(amount);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(REQUEST_KEY_STORAGE);
    }
    redirectingRef.current = false;
    inFlightRef.current = false;
    setRedirecting(false);
    setLoading(false);
  }, []);

  const submit = useCallback(async () => {
    if (inFlightRef.current || redirectingRef.current) return;
    inFlightRef.current = true;
    setError(null);

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError(t("wallet_enter_valid_amount_alt"));
      inFlightRef.current = false;
      return;
    }

    setLoading(true);
    try {
      const existingRequestKey =
        typeof window !== "undefined"
          ? window.sessionStorage.getItem(REQUEST_KEY_STORAGE)
          : null;
      const requestKey =
        existingRequestKey ||
        (typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(REQUEST_KEY_STORAGE, requestKey);
      }

      const res = await fetch("/api/epoint/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, requestKey }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        const msg = json?.message ?? json?.error ?? res.statusText;
        throw new Error(msg);
      }

      const url = String(json?.redirectUrl ?? "").trim();
      if (!url)
        throw new Error(
          t("initiate_payment_failed").replace(
            "{message}",
            "redirectUrl missing",
          ),
        );

      redirectingRef.current = true;
      setRedirecting(true);
      window.location.href = url;
    } catch (e: any) {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(REQUEST_KEY_STORAGE);
      }
      setError(
        t("initiate_payment_error").replace("{error}", e?.message ?? String(e)),
      );
      redirectingRef.current = false;
      setRedirecting(false);
    } finally {
      setLoading(false);
      if (!redirectingRef.current) {
        inFlightRef.current = false;
      }
    }
  }, [amount, numericAmount, t]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("payment_view_title")}</h1>
      </header>

      {error ? (
        <div
          className="rounded-2xl border border-border px-4 py-3 text-[14px]"
          style={{ color: "#EF4444", backgroundColor: "rgba(239,68,68,0.06)" }}
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-[14px] text-muted-foreground">
          {t("add_balance_message")}
        </div>

        <div className="mt-4">
          <div className="text-[13px] font-semibold text-muted-foreground">
            {t("wallet_amount")}
          </div>
          <div className="mt-2">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder={t("payment_amount_hint")}
              disabled={loading || redirecting}
            />
          </div>

          <div
            className="mt-2 text-[13px] font-semibold"
            style={{ color: "rgb(21, 128, 61)" }}
          >
            {t("payment_no_commission")}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={loading || redirecting}
          className="mt-5 h-12 w-full rounded-2xl text-[15px] font-semibold"
          style={{
            backgroundColor: mainColor,
            color: "#fff",
            opacity: loading || redirecting ? 0.75 : 1,
          }}
        >
          {redirecting ? t("loading") : t("payment_top_up_button")}
        </button>
      </div>
    </div>
  );
}
