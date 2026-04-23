import { NextResponse } from "next/server";

import crypto from "crypto";

import { createClient } from "@/lib/supabase/server";

type PendingPaymentRow = {
  id: string;
  transaction_code?: number | null;
};

function random8DigitCode() {
  return 10000000 + Math.floor(Math.random() * 90000000);
}

async function generateUniqueTransactionCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  for (let i = 0; i < 20; i += 1) {
    const code = random8DigitCode();
    const { data, error } = await supabase
      .from("payments")
      .select("id")
      .eq("transaction_code", code)
      .limit(1);
    if (!error && Array.isArray(data) && data.length === 0) return code;
  }
  return random8DigitCode();
}

async function findPendingPaymentByRequestKey(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestKey: string,
) {
  const { data, error } = await supabase
    .from("payments")
    .select("id, transaction_code")
    .eq("request_key", requestKey)
    .limit(1)
    .maybeSingle();

  if (error) return null;

  const row = data as PendingPaymentRow | null;
  const transactionCode = Number(row?.transaction_code ?? 0);
  if (!row?.id || !Number.isFinite(transactionCode) || transactionCode <= 0) {
    return null;
  }

  return {
    id: row.id,
    transactionCode,
  };
}

function encodeData(payload: Record<string, unknown>) {
  const jsonStr = JSON.stringify(payload);
  return Buffer.from(jsonStr, "utf8").toString("base64");
}

function sign(data: string) {
  const privateKey = process.env.EPOINT_PRIVATE_KEY;
  if (!privateKey) throw new Error("EPOINT_PRIVATE_KEY is not set");
  const raw = `${privateKey}${data}${privateKey}`;
  const digest = crypto.createHash("sha1").update(raw, "utf8").digest();
  return Buffer.from(digest).toString("base64");
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as any;
    const amount = Number(body?.amount);
    const requestKey = String(body?.requestKey ?? "").trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    if (!requestKey) {
      return NextResponse.json(
        { message: "Missing requestKey" },
        { status: 400 },
      );
    }

    const publicKey = process.env.EPOINT_PUBLIC_KEY;
    if (!publicKey) throw new Error("EPOINT_PUBLIC_KEY is not set");

    const existingPayment = await findPendingPaymentByRequestKey(
      supabase,
      requestKey,
    );
    const transactionCode =
      existingPayment?.transactionCode ??
      (await generateUniqueTransactionCode(supabase));
    const orderId = String(transactionCode);

    const configuredBaseUrl = String(
      process.env.PAYMENT_BASE_URL ?? "https://jobly.az",
    ).trim();
    const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
    const baseUrl = /jobly\.az$/i.test(new URL(normalizedBaseUrl).hostname)
      ? normalizedBaseUrl
      : "https://jobly.az";

    const callbackQuery = `?tid=${encodeURIComponent(orderId)}`;

    const payload = {
      public_key: publicKey,
      amount,
      currency: "AZN",
      language: "az",
      order_id: orderId,
      description: `Top-up for ${user.id}`,
      success_url: `${baseUrl}/payment/success${callbackQuery}`,
      error_url: `${baseUrl}/payment/error${callbackQuery}`,
      result_url: `${baseUrl}/payment/result${callbackQuery}`,
    };

    const data = encodeData(payload);
    const signature = sign(data);

    const res = await fetch("https://epoint.az/api/1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, signature }),
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      return NextResponse.json(
        { message: json?.message ?? "ePoint request failed" },
        { status: 502 },
      );
    }

    const redirectUrl =
      (typeof json?.redirect_url === "string" && json.redirect_url) ||
      (typeof json?.redirectUrl === "string" && json.redirectUrl) ||
      (typeof json?.url === "string" && json.url) ||
      (typeof json?.payment_url === "string" && json.payment_url) ||
      (typeof json?.link === "string" && json.link) ||
      null;

    if (!redirectUrl) {
      return NextResponse.json(
        { message: json?.message ?? "redirect_url not found" },
        { status: 502 },
      );
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", user.id)
      .maybeSingle();

    const userEmail = (userRow as any)?.email ?? user.email ?? null;

    if (!existingPayment) {
      await supabase.from("payments").insert({
        user_id: user.id,
        user_email: userEmail,
        amount: Math.round(amount),
        transaction_code: transactionCode,
        request_key: requestKey,
        is_applied: false,
      });
    }

    return NextResponse.json({ redirectUrl, orderId });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
