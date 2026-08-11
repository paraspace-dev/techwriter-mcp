import { debug } from './log.js';
import { buildCreateUser, buildEditUser, buildReviewUser } from './prompt.js';
import type { ModelProvider } from './provider.js';
import type { CreateInput, EditInput, ReviewInput } from './types.js';

export class DocumentService {
  constructor(
    private provider: ModelProvider,
    private system: string,
    private cacheKey: string
  ) {}

  create(input: CreateInput): Promise<string> {
    return this.run('create', buildCreateUser(input));
  }

  edit(input: EditInput): Promise<string> {
    return this.run('edit', buildEditUser(input));
  }

  review(input: ReviewInput): Promise<string> {
    return this.run('review', buildReviewUser(input));
  }

  private async run(op: string, user: string): Promise<string> {
    const { text, usage } = await this.provider.generate({
      system: this.system,
      user,
      cacheKey: this.cacheKey,
    });
    if (usage) {
      debug(
        `${op}: ${usage.inputTokens} in (${usage.cachedInputTokens} cached), ${usage.outputTokens} out`
      );
    }
    return text;
  }
}
