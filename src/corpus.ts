import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { globSync } from 'tinyglobby';
import type { Config } from './config.js';

export interface CorpusFile {
  path: string;
  role: 'example' | 'avoid' | 'voice';
  text: string;
}

export interface Corpus {
  files: CorpusFile[];
  dropped: string[];
}

function md(dir: string, cwd: string): string[] {
  return globSync('**/*.md', { cwd: join(cwd, dir) })
    .sort()
    .map((p) => join(dir, p));
}

// Selection is deterministic so the assembled prompt (and thus the provider's
// cache prefix) is stable across calls: fixed role order, sorted paths, and a
// byte budget that drops whole files from the tail.
export function loadCorpus(root: string, voice: Config['voice']): Corpus {
  const candidates: Array<{ path: string; role: CorpusFile['role'] }> = [];

  for (const path of md('.techwriter-mcp/voice/examples', root)) {
    candidates.push({ path, role: 'example' });
  }
  for (const path of md('.techwriter-mcp/voice/avoid', root)) {
    candidates.push({ path, role: 'avoid' });
  }
  if (voice.include.length > 0) {
    const included = globSync(voice.include, {
      cwd: root,
      ignore: [...voice.exclude, '.techwriter-mcp/**', 'node_modules/**'],
    }).sort();
    for (const path of included) candidates.push({ path, role: 'voice' });
  }

  const files: CorpusFile[] = [];
  const dropped: string[] = [];
  let budget = voice.maxKb * 1024;
  for (const { path, role } of candidates) {
    const text = readFileSync(join(root, path), 'utf8');
    if (Buffer.byteLength(text) > budget) {
      dropped.push(path);
      continue;
    }
    budget -= Buffer.byteLength(text);
    files.push({ path, role, text });
  }
  return { files, dropped };
}
