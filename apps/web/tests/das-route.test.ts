import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/das/route';

const assetId = '11111111111111111111111111111111';

function request(payload: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost:3000/api/das', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': crypto.randomUUID(),
      ...headers,
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.DAS_RPC_URL;
});

describe('POST /api/das', () => {
  it('falla cerrado cuando falta el endpoint privado', async () => {
    const response = await POST(request({ method: 'getAsset', params: { id: assetId } }));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: 'DAS no está configurado.' });
  });

  it('rechaza métodos fuera de la allowlist', async () => {
    process.env.DAS_RPC_URL = 'https://das.example.test';
    const response = await POST(request({ method: 'getProgramAccounts', params: {} }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Método DAS no permitido.' });
  });

  it('rechaza el cuerpo antes de procesarlo cuando excede 16 KiB', async () => {
    process.env.DAS_RPC_URL = 'https://das.example.test';
    const response = await POST(
      request({ method: 'getAsset', params: { id: assetId } }, { 'content-length': '16385' }),
    );
    expect(response.status).toBe(413);
  });

  it('reenvía solamente una llamada DAS validada sin revelar el endpoint', async () => {
    process.env.DAS_RPC_URL = 'https://das.example.test/private-key';
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ jsonrpc: '2.0', result: { id: assetId } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(request({ method: 'getAsset', params: { id: assetId } }));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(await response.text()).not.toContain('das.example.test');
  });

  it('rechaza orígenes ajenos', async () => {
    process.env.DAS_RPC_URL = 'https://das.example.test';
    const response = await POST(
      request(
        { method: 'getAsset', params: { id: assetId } },
        { origin: 'https://attacker.example' },
      ),
    );
    expect(response.status).toBe(403);
  });

  it('limita cada instancia a 30 solicitudes por minuto e IP', async () => {
    process.env.DAS_RPC_URL = 'https://das.example.test';
    const headers = { 'x-forwarded-for': 'rate-limit-test' };
    for (let index = 0; index < 30; index += 1) {
      const response = await POST(request({ method: 'notAllowed', params: {} }, headers));
      expect(response.status).toBe(400);
    }
    const limited = await POST(request({ method: 'notAllowed', params: {} }, headers));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBeTruthy();
  });
});
