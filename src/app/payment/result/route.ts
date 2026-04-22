import { NextResponse } from "next/server";
import crypto from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

function verifySignature(data: string, signature: string) {
  const privateKey = process.env.EPOINT_PRIVATE_KEY;
  if (!privateKey) throw new Error("EPOINT_PRIVATE_KEY is not set");

  const raw = `${privateKey}${data}${privateKey}`;
  const digest = crypto.createHash("sha1").update(raw, "utf8").digest();
  const expected = Buffer.from(digest).toString("base64");

  return expected === signature;
}

function decodeData(data: string) {
  const jsonStr = Buffer.from(String(data), "base64").toString("utf8");
  return JSON.parse(jsonStr) as Record<string, unknown>;
}

function firstNonEmpty(...values: Array<unknown>) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

async function finalizeTopUpByOrderId(orderIdRaw: string) {
  const orderId = String(orderIdRaw ?? "").trim();
  if (!orderId) {
    return { ok: false, status: 400, message: "Missing order_id" } as const;
  }

  const txCode = Number(orderId);
  if (!Number.isFinite(txCode)) {
    return { ok: false, status: 400, message: "Invalid order_id" } as const;
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
    return { ok: false, status: 500, message: payErr.message } as const;
  }

  const paymentId = (paymentRow as any)?.id as string | undefined;
  const userId = (paymentRow as any)?.user_id as string | undefined;
  const amount = Number((paymentRow as any)?.amount ?? 0);

  if (!paymentId || !userId) {
    return { ok: false, status: 404, message: "Payment not found" } as const;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      ok: false,
      status: 400,
      message: "Invalid payment amount",
    } as const;
  }

  if ((paymentRow as any)?.is_applied === true) {
    return { ok: true, status: 200, alreadyApplied: true } as const;
  }

  const { data: claimedRow, error: claimErr } = await supabase
    .from("payments")
    .update({ is_applied: true } as any)
    .eq("id", paymentId)
    .eq("is_applied", false)
    .select("id")
    .maybeSingle();

  if (claimErr) {
    return { ok: false, status: 500, message: claimErr.message } as const;
  }

  if (!claimedRow) {
    return { ok: true, status: 200, alreadyApplied: true } as const;
  }

  const { data: userRow, error: uErr } = await supabase
    .from("users")
    .select("wallet")
    .eq("user_id", userId)
    .maybeSingle();

  if (uErr) {
    await supabase
      .from("payments")
      .update({ is_applied: false } as any)
      .eq("id", paymentId);
    return { ok: false, status: 500, message: uErr.message } as const;
  }

  const currentWallet = Number((userRow as any)?.wallet ?? 0) || 0;
  const nextWallet = currentWallet + Math.round(amount);

  const { error: upErr } = await supabase
    .from("users")
    .update({ wallet: nextWallet })
    .eq("user_id", userId);

  if (upErr) {
    await supabase
      .from("payments")
      .update({ is_applied: false } as any)
      .eq("id", paymentId);
    return { ok: false, status: 500, message: upErr.message } as const;
  }

  return { ok: true, status: 200 } as const;
}

async function readCallbackInput(req: Request) {
  const url = new URL(req.url);
  const contentType = req.headers.get("content-type") ?? "";

  let data: string | null = null;
  let signature: string | null = null;

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as any;
    data = body?.data != null ? String(body.data) : null;
    signature = body?.signature != null ? String(body.signature) : null;
  } else if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    data = form.get("data") != null ? String(form.get("data")) : null;
    signature =
      form.get("signature") != null ? String(form.get("signature")) : null;
  }

  const tid = firstNonEmpty(
    url.searchParams.get("tid"),
    url.searchParams.get("order_id"),
    url.searchParams.get("orderId"),
    url.searchParams.get("order"),
  );

  return {
    data: data ? String(data) : null,
    signature: signature ? String(signature) : null,
    tid,
  };
}

async function handleResult(req: Request) {
  const { data, signature, tid } = await readCallbackInput(req);

  if (data && signature) {
    if (!verifySignature(data, signature)) {
      return NextResponse.json(
        { ok: false, message: "Invalid signature" },
        { status: 401 },
      );
    }

    const payload = decodeData(data);

    const orderId = firstNonEmpty(
      payload?.order_id,
      payload?.orderId,
      payload?.order,
      tid,
    );

    const status = firstNonEmpty(
      payload?.status,
      payload?.payment_status,
    ).toLowerCase();
    const amount = Number(payload?.amount);

    if (!orderId) {
      return NextResponse.json(
        { ok: false, message: "Missing order_id" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, message: "Invalid amount" },
        { status: 400 },
      );
    }

    if (
      status &&
      status !== "success" &&
      status !== "successful" &&
      status !== "paid"
    ) {
      return NextResponse.json({ ok: true });
    }

    const finalized = await finalizeTopUpByOrderId(orderId);
    if (!finalized.ok) {
      return NextResponse.json(
        { ok: false, message: finalized.message },
        { status: finalized.status },
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (tid) {
    const finalized = await finalizeTopUpByOrderId(tid);
    if (!finalized.ok) {
      return NextResponse.json(
        { ok: false, message: finalized.message },
        { status: finalized.status },
      );
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, message: "Missing callback payload or tid query" },
    { status: 400 },
  );
}

export async function POST(req: Request) {
  try {
    return await handleResult(req);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    return await handleResult(req);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
