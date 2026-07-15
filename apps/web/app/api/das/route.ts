import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ALLOWED_METHODS = new Set(['getAsset', 'getAssetProof', 'searchAssets']);
const ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,64}$/;
const SEARCH_KEYS = new Set([
  'ownerAddress',
  'creatorAddress',
  'authorityAddress',
  'grouping',
  'page',
  'limit',
  'sortBy',
  'compressed',
  'burnt',
]);
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;
const requests = new Map<string, { count: number; resetsAt: number }>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validAddress(value: unknown): value is string {
  return typeof value === 'string' && ADDRESS.test(value);
}

function validSearchParams(params: unknown): params is Record<string, unknown> {
  if (!isRecord(params)) return false;
  if (Object.keys(params).some((key) => !SEARCH_KEYS.has(key))) return false;
  const selectors = [params.ownerAddress, params.creatorAddress, params.authorityAddress].filter(
    (value) => value !== undefined,
  );
  if (selectors.some((value) => !validAddress(value))) return false;
  if (params.grouping !== undefined) {
    if (
      !Array.isArray(params.grouping) ||
      params.grouping.length !== 2 ||
      params.grouping[0] !== 'collection' ||
      !validAddress(params.grouping[1])
    )
      return false;
  }
  if (selectors.length === 0 && params.grouping === undefined) return false;
  if (
    params.page !== undefined &&
    (!Number.isInteger(params.page) || Number(params.page) < 1 || Number(params.page) > 1_000)
  )
    return false;
  if (
    params.limit !== undefined &&
    (!Number.isInteger(params.limit) || Number(params.limit) < 1 || Number(params.limit) > 100)
  )
    return false;
  if (params.compressed !== undefined && typeof params.compressed !== 'boolean') return false;
  if (params.burnt !== undefined && typeof params.burnt !== 'boolean') return false;
  if (params.sortBy !== undefined && !isRecord(params.sortBy)) return false;
  return true;
}

function validParams(method: string, params: unknown): params is Record<string, unknown> {
  if (method === 'searchAssets') return validSearchParams(params);
  return isRecord(params) && Object.keys(params).length === 1 && validAddress(params.id);
}

function allowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL;
  return origin === requestOrigin || origin === configuredOrigin;
}

function withinRateLimit(request: Request): { allowed: boolean; retryAfter: number } {
  const forwarded = (
    request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for')
  )
    ?.split(',')[0]
    ?.trim();
  const key = forwarded || request.headers.get('x-real-ip') || 'local';
  const now = Date.now();
  const current = requests.get(key);

  if (!current || current.resetsAt <= now) {
    if (!requests.has(key) && requests.size >= 1_000) {
      const oldestKey = requests.keys().next().value;
      if (oldestKey) requests.delete(oldestKey);
    }
    requests.set(key, { count: 1, resetsAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  return {
    allowed: current.count <= RATE_LIMIT,
    retryAfter: Math.max(1, Math.ceil((current.resetsAt - now) / 1_000)),
  };
}

export async function POST(request: Request) {
  const endpoint = process.env.DAS_RPC_URL;
  if (!endpoint) {
    return NextResponse.json({ error: 'DAS no está configurado.' }, { status: 503 });
  }
  if (!allowedOrigin(request)) {
    return NextResponse.json({ error: 'Origen no permitido.' }, { status: 403 });
  }
  const rate = withinRateLimit(request);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes DAS.' },
      { status: 429, headers: { 'retry-after': String(rate.retryAfter) } },
    );
  }

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 16_384) {
    return NextResponse.json({ error: 'Solicitud demasiado grande.' }, { status: 413 });
  }

  let payload: unknown;
  try {
    const text = await request.text();
    if (text.length > 16_384) throw new Error('payload too large');
    payload = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  if (
    !isRecord(payload) ||
    typeof payload.method !== 'string' ||
    !ALLOWED_METHODS.has(payload.method)
  ) {
    return NextResponse.json({ error: 'Método DAS no permitido.' }, { status: 400 });
  }
  if (!validParams(payload.method, payload.params)) {
    return NextResponse.json({ error: 'Parámetros DAS inválidos.' }, { status: 400 });
  }

  let parsedEndpoint: URL;
  try {
    parsedEndpoint = new URL(endpoint);
    if (parsedEndpoint.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      throw new Error('insecure endpoint');
    }
  } catch {
    return NextResponse.json({ error: 'DAS no está disponible.' }, { status: 503 });
  }

  try {
    const upstream = await fetch(parsedEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: payload.method,
        params: payload.params,
      }),
      signal: AbortSignal.timeout(8_000),
      cache: 'no-store',
    });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);
    const result: unknown = await upstream.json();
    return NextResponse.json(result, {
      headers: { 'cache-control': 'private, no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'El proveedor DAS no respondió.' }, { status: 502 });
  }
}
