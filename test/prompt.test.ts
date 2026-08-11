import { describe, expect, it } from 'vitest';
import { EDITORIAL_BRIEF } from '../src/editorial.js';
import {
  buildCreateUser,
  buildEditUser,
  buildReviewUser,
  buildSystem,
} from '../src/prompt.js';
import type { CorpusFile } from '../src/corpus.js';

const corpus: CorpusFile[] = [
  { path: 'docs/why.md', role: 'voice', text: 'the why doc' },
  { path: '.docs-mcp/voice/avoid/slop.md', role: 'avoid', text: 'slop sample' },
];

describe('buildSystem', () => {
  it('is deterministic for the same inputs', () => {
    expect(buildSystem('house rules', corpus)).toBe(
      buildSystem('house rules', corpus)
    );
  });

  it('orders brief, instructions, corpus', () => {
    const system = buildSystem('house rules', corpus);
    const brief = system.indexOf(EDITORIAL_BRIEF);
    const rules = system.indexOf('house rules');
    const voice = system.indexOf('the why doc');
    expect(brief).toBe(0);
    expect(rules).toBeGreaterThan(brief);
    expect(voice).toBeGreaterThan(rules);
    expect(system).toContain('counterexample');
  });

  it('omits empty sections', () => {
    const system = buildSystem('', []);
    expect(system).toBe(EDITORIAL_BRIEF);
  });
});

describe('buildCreateUser', () => {
  it('renders only the fields that were supplied', () => {
    const user = buildCreateUser({
      type: 'rfc',
      purpose: 'let plugins register resolvers',
      constraints: ['no breaking change'],
    });
    expect(user).toContain('Write a rfc');
    expect(user).toContain('let plugins register resolvers');
    expect(user).toContain('- no breaking change');
    expect(user).not.toContain('Current behavior');
    expect(user).not.toContain('Open questions');
  });
});

describe('buildEditUser', () => {
  it('carries the document verbatim and the changes', () => {
    const user = buildEditUser({
      document: 'The cache holds 512 entries.',
      changes: 'The cache now holds 1024 entries.',
    });
    expect(user).toContain('The cache holds 512 entries.');
    expect(user).toContain('The cache now holds 1024 entries.');
    expect(user).toContain('smallest editorially coherent change');
  });
});

describe('buildReviewUser', () => {
  it('includes the document and optional concerns', () => {
    const user = buildReviewUser({
      document: 'Some doc.',
      type: 'plan',
      concerns: 'is the risk section honest',
    });
    expect(user).toContain('Some doc.');
    expect(user).toContain('It is a plan.');
    expect(user).toContain('is the risk section honest');
  });
});
