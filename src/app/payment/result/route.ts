import { NextResponse } from 'next/server';

import crypto from 'crypto';

import { createAdminClient } from '@/lib/supabase/admin';

function verifySignature(data: string, signature: string) {
  const privateKey = process.env.EPOINT_PRIVATE_KEY;
  if (!privateKey) throw new Error('EPOINT_PRIVATE_KEY is not set');
  const raw = `${privateKey}${data}${privateKey}`;
  const digest = crypto.createHash('sha1').update(raw, 'utf8').digest();
  const expected = Buffer.from(digest).toString('base64');
  return expected === signature;
}

function decodeData(data: string) {
  const jsonStr = Buffer.from(String(data), 'base64').toString('utf8');
  return JSON.parse(jsonStr) as any;
}

async function handleResult(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';

  let data: string | null = null;
  let signature: string | null = null;

  if (contentType.includes('application/json')) {
    const body = (await req.json().catch(() => null)) as any;
    data = body?.data != null ? String(body.data) : null;
    signature = body?.signature != null ? String(body.signature) : null;
  } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    data = form.get('data') != null ? String(form.get('data')) : null;
    signature = form.get('signature') != null ? String(form.get('signature')) : null;
  }

  if (!data || !signature) {
    return NextResponse.json({ ok: false, message: 'Missing data/signature' }, { status: 400 });
  }

  if (!verifySignature(data, signature)) {
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 401 });
  }

  const payload = decodeData(data);

  const orderId = String(payload?.order_id ?? payload?.orderId ?? payload?.order ?? '').trim();
  const status = String(payload?.status ?? payload?.payment_status ?? '').toLowerCase();
  const amountRaw = payload?.amount;
  const amount = Number(amountRaw);

  if (!orderId) {
    return NextResponse.json({ ok: false, message: 'Missing order_id' }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, message: 'Invalid amount' }, { status: 400 });
  }

  if (status && status !== 'success' && status !== 'successful' && status !== 'paid') {
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();

  const txCode = Number(orderId);
  if (!Number.isFinite(txCode)) {
    return NextResponse.json({ ok: false, message: 'Invalid order_id' }, { status: 400 });
  }

  const { data: paymentRow, error: payErr } = await supabase
    .from('payments')
    .select('id, user_id, amount, transaction_code, is_applied')
    .eq('transaction_code', txCode)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (payErr) {
    return NextResponse.json({ ok: false, message: payErr.message }, { status: 500 });
  }

  const userId = (paymentRow as any)?.user_id;
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Payment user not found' }, { status: 404 });
  }

  if ((paymentRow as any)?.is_applied === true) {
    return NextResponse.json({ ok: true });
  }

  const paymentId = (paymentRow as any)?.id as string | undefined;
  if (!paymentId) {
    return NextResponse.json({ ok: false, message: 'Payment not found' }, { status: 404 });
  }

  const { data: claimedRow, error: claimErr } = await supabase
    .from('payments')
    .update({ is_applied: true } as any)
    .eq('id', paymentId)
    .eq('is_applied', false)
    .select('id')
    .maybeSingle();

  if (claimErr) {
    return NextResponse.json({ ok: false, message: claimErr.message }, { status: 500 });
  }

  if (!claimedRow) {
    return NextResponse.json({ ok: true });
  }

  const { data: userRow, error: uErr } = await supabase.from('users').select('wallet').eq('user_id', userId).maybeSingle();
  if (uErr) {
    return NextResponse.json({ ok: false, message: uErr.message }, { status: 500 });
  }

  const current = Number((userRow as any)?.wallet ?? 0) || 0;
  const next = current + Math.round(amount);

  const { error: upErr } = await supabase.from('users').update({ wallet: next }).eq('user_id', userId);
  if (upErr) {
    await supabase.from('payments').update({ is_applied: false } as any).eq('id', paymentId);
    return NextResponse.json({ ok: false, message: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    return await handleResult(req);
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? String(e) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    return await handleResult(req);
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message ?? String(e) }, { status: 500 });
  }
}
