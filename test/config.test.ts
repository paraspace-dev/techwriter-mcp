import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { tempRoot } from './helpers.js';

describe('loadConfig', () => {
  it('returns defaults when no .docs-mcp exists', () => {
    const root = tempRoot({});
    const config = loadConfig(root);
    expect(config.model.provider).toBe('openai');
    expect(config.model.apiKeyEnv).toBe('OPENAI_API_KEY');
    expect(config.voice.include).toEqual([]);
    expect(config.voice.maxKb).toBeGreaterThan(0);
  });

  it('maps config.toml onto defaults', () => {
    const root = tempRoot({
      '.docs-mcp/config.toml': [
        '[model]',
        'model = "gpt-5.1"',
        'api_key_env = "MY_KEY"',
        'reasoning_effort = "low"',
        '',
        '[voice]',
        'include = ["docs/**/*.md"]',
        'exclude = ["docs/generated/**"]',
        'max_kb = 64',
      ].join('\n'),
    });
    const config = loadConfig(root);
    expect(config.model.model).toBe('gpt-5.1');
    expect(config.model.apiKeyEnv).toBe('MY_KEY');
    expect(config.model.reasoningEffort).toBe('low');
    expect(config.voice.include).toEqual(['docs/**/*.md']);
    expect(config.voice.exclude).toEqual(['docs/generated/**']);
    expect(config.voice.maxKb).toBe(64);
  });

  it('names the file on malformed toml', () => {
    const root = tempRoot({ '.docs-mcp/config.toml': '[model\nbroken' });
    expect(() => loadConfig(root)).toThrow(/config\.toml/);
  });

  it('names the file on invalid values', () => {
    const root = tempRoot({ '.docs-mcp/config.toml': '[voice]\nmax_kb = -4' });
    expect(() => loadConfig(root)).toThrow(/config\.toml/);
  });
});
