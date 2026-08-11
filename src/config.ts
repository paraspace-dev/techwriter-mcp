import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'smol-toml';
import * as z from 'zod';

export interface Config {
  model: {
    provider: 'openai';
    model: string;
    apiKeyEnv: string;
    maxOutputTokens?: number;
    reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high';
  };
  voice: {
    include: string[];
    exclude: string[];
    maxKb: number;
  };
}

const fileSchema = z.object({
  model: z
    .object({
      provider: z.enum(['openai']).optional(),
      model: z.string().optional(),
      api_key_env: z.string().optional(),
      max_output_tokens: z.number().int().positive().optional(),
      reasoning_effort: z.enum(['minimal', 'low', 'medium', 'high']).optional(),
    })
    .optional(),
  voice: z
    .object({
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
      max_kb: z.number().int().positive().optional(),
    })
    .optional(),
});

const defaults: Config = {
  model: { provider: 'openai', model: 'gpt-5.1', apiKeyEnv: 'OPENAI_API_KEY' },
  voice: { include: [], exclude: [], maxKb: 256 },
};

// Root is where .docs-mcp/ lives: DOCS_MCP_ROOT if set, else the cwd the
// MCP host launched us with (project scope in Claude Code and Codex).
export function findRoot(): string {
  return process.env.DOCS_MCP_ROOT || process.cwd();
}

export function loadConfig(root: string): Config {
  const path = join(root, '.docs-mcp', 'config.toml');
  if (!existsSync(path)) return defaults;

  let raw: unknown;
  try {
    raw = parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(`${path}: ${e instanceof Error ? e.message : e}`);
  }
  const parsed = fileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`${path}: ${z.prettifyError(parsed.error)}`);
  }

  const { model = {}, voice = {} } = parsed.data;
  return {
    model: {
      provider: model.provider ?? defaults.model.provider,
      model: model.model ?? defaults.model.model,
      apiKeyEnv: model.api_key_env ?? defaults.model.apiKeyEnv,
      maxOutputTokens: model.max_output_tokens,
      reasoningEffort: model.reasoning_effort,
    },
    voice: {
      include: voice.include ?? [],
      exclude: voice.exclude ?? [],
      maxKb: voice.max_kb ?? defaults.voice.maxKb,
    },
  };
}

export function loadInstructions(root: string): string {
  const path = join(root, '.docs-mcp', 'instructions.md');
  if (!existsSync(path)) return '';
  return readFileSync(path, 'utf8').trim();
}
