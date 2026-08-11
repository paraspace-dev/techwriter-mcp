export interface ModelRequest {
  system: string;
  user: string;
  cacheKey: string;
}

export interface ModelUsage {
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
}

export interface ModelResult {
  text: string;
  usage?: ModelUsage;
}

export interface ModelProvider {
  readonly name: string;
  generate(req: ModelRequest): Promise<ModelResult>;
}
