import { describe, expect, it } from 'vitest';
import { loadCorpus } from '../src/corpus.js';
import { tempRoot } from './helpers.js';

const voice = { include: ['docs/**/*.md'], exclude: [], maxKb: 256 };

describe('loadCorpus', () => {
  it('orders examples, then avoid, then includes, each sorted by path', () => {
    const root = tempRoot({
      '.techwriter-mcp/voice/examples/b.md': 'example b',
      '.techwriter-mcp/voice/examples/a.md': 'example a',
      '.techwriter-mcp/voice/avoid/slop.md': 'slop',
      'docs/two.md': 'two',
      'docs/one.md': 'one',
    });
    const { files, dropped } = loadCorpus(root, voice);
    expect(files.map((f) => [f.path, f.role])).toEqual([
      ['.techwriter-mcp/voice/examples/a.md', 'example'],
      ['.techwriter-mcp/voice/examples/b.md', 'example'],
      ['.techwriter-mcp/voice/avoid/slop.md', 'avoid'],
      ['docs/one.md', 'voice'],
      ['docs/two.md', 'voice'],
    ]);
    expect(dropped).toEqual([]);
  });

  it('applies excludes and never includes .techwriter-mcp itself', () => {
    const root = tempRoot({
      'docs/keep.md': 'keep',
      'docs/generated/out.md': 'generated',
      '.techwriter-mcp/config.toml': '',
    });
    const { files } = loadCorpus(root, {
      ...voice,
      exclude: ['docs/generated/**'],
    });
    expect(files.map((f) => f.path)).toEqual(['docs/keep.md']);
  });

  it('drops whole files past the byte budget and reports them', () => {
    const root = tempRoot({
      'docs/a.md': 'x'.repeat(700),
      'docs/b.md': 'y'.repeat(700),
    });
    const { files, dropped } = loadCorpus(root, { ...voice, maxKb: 1 });
    expect(files.map((f) => f.path)).toEqual(['docs/a.md']);
    expect(dropped).toEqual(['docs/b.md']);
  });
});
