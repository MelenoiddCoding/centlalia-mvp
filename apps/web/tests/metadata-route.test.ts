import { describe, expect, it } from 'vitest';
import { GET } from '../app/api/metadata/event/route';

describe('MPL Core metadata route', () => {
  it('expone metadata publica y explicita de devnet', async () => {
    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      name: 'Acceso Centlalia',
      symbol: 'CENT',
    });
    expect(body.description).toContain('Solana devnet');
    expect(body.image).toMatch(/^https:\/\//);
  });
});
