import { describe, expect, it } from 'vitest';
import { DocumentService } from '../src/service.js';
import { FakeProvider } from './helpers.js';

describe('DocumentService', () => {
  it('sends the identical system string and cache key for every operation', async () => {
    const provider = new FakeProvider();
    const service = new DocumentService(provider, 'STABLE PREFIX', 'docs-mcp:/repo');

    await service.create({ type: 'plan', purpose: 'p' });
    await service.edit({ document: 'd', changes: 'c' });
    await service.review({ document: 'd' });

    expect(provider.requests).toHaveLength(3);
    for (const req of provider.requests) {
      expect(req.system).toBe('STABLE PREFIX');
      expect(req.cacheKey).toBe('docs-mcp:/repo');
    }
    const users = new Set(provider.requests.map((r) => r.user));
    expect(users.size).toBe(3);
  });

  it('returns the provider text untouched', async () => {
    const service = new DocumentService(new FakeProvider(), 's', 'k');
    expect(await service.create({ type: 'adr', purpose: 'p' })).toBe(
      'fake output'
    );
  });
});
