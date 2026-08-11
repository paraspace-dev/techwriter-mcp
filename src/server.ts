import { McpServer } from '@modelcontextprotocol/server';
import type { DocumentService } from './service.js';
import { createSchema, editSchema, reviewSchema } from './types.js';

type Handler = () => Promise<string>;

async function respond(fn: Handler) {
  try {
    return { content: [{ type: 'text' as const, text: await fn() }] };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { content: [{ type: 'text' as const, text: msg }], isError: true };
  }
}

export function createServer(service: () => DocumentService): McpServer {
  const server = new McpServer({ name: 'docs', version: '0.1.0' });

  server.registerTool(
    'create',
    {
      description:
        'Write a software document (plan, RFC, design doc, README, guide, ADR) from facts you supply. ' +
        'Investigate the repository first, then pass what you learned as structured material. ' +
        'Do not draft prose yourself and do not paste a draft as material; a separate writing model decides structure and wording. ' +
        'When it returns, fact-check the document against the repository and send corrections through the edit tool as facts.',
      inputSchema: createSchema,
    },
    (input) => respond(() => service().create(input))
  );

  server.registerTool(
    'edit',
    {
      description:
        'Revise an existing document with the smallest coherent change. ' +
        'State what is factually wrong or what must change, as facts rather than replacement prose. ' +
        'The document\'s voice and untouched text are preserved.',
      inputSchema: editSchema,
    },
    (input) => respond(() => service().edit(input))
  );

  server.registerTool(
    'review',
    {
      description:
        'Get editorial findings on a document: where it inventories instead of explains, structure that is not helping, ' +
        'missing motivation or tradeoffs, prose that reads like serialized code. ' +
        'Returns findings with locations, never a rewrite; "no significant editorial problems" is a possible outcome.',
      inputSchema: reviewSchema,
    },
    (input) => respond(() => service().review(input))
  );

  return server;
}
