import OpenAI from 'openai';
import type { Config } from './config.js';
import type { ModelProvider, ModelRequest, ModelResult } from './provider.js';

export class OpenAIProvider implements ModelProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor(private cfg: Config['model']) {
    const apiKey = process.env[cfg.apiKeyEnv];
    if (!apiKey) {
      throw new Error(
        `${cfg.apiKeyEnv} is not set; export it in the environment that launches docs-mcp`
      );
    }
    this.client = new OpenAI({ apiKey });
  }

  async generate(req: ModelRequest): Promise<ModelResult> {
    const res = await this.client.responses.create({
      model: this.cfg.model,
      instructions: req.system,
      input: req.user,
      prompt_cache_key: req.cacheKey,
      ...(this.cfg.maxOutputTokens
        ? { max_output_tokens: this.cfg.maxOutputTokens }
        : {}),
      ...(this.cfg.reasoningEffort
        ? { reasoning: { effort: this.cfg.reasoningEffort } }
        : {}),
    });

    if (!res.output_text) {
      const why = res.incomplete_details?.reason ?? res.status;
      throw new Error(`model ${this.cfg.model} returned no text (${why})`);
    }
    return {
      text: res.output_text,
      usage: res.usage && {
        inputTokens: res.usage.input_tokens,
        cachedInputTokens: res.usage.input_tokens_details?.cached_tokens ?? 0,
        outputTokens: res.usage.output_tokens,
      },
    };
  }
}
