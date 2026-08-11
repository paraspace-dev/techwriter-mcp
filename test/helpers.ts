import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { ModelProvider, ModelRequest } from '../src/provider.js';

export function tempRoot(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'docs-mcp-test-'));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(root, dirname(path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

export class FakeProvider implements ModelProvider {
  readonly name = 'fake';
  requests: ModelRequest[] = [];

  async generate(req: ModelRequest) {
    this.requests.push(req);
    return { text: 'fake output' };
  }
}
