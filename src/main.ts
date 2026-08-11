#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { findRoot, loadConfig, loadInstructions } from './config.js';
import { loadCorpus } from './corpus.js';
import { debug, warn } from './log.js';
import { OpenAIProvider } from './openai.js';
import { buildSystem } from './prompt.js';
import { DocumentService } from './service.js';
import { createServer } from './server.js';

function main() {
  const root = findRoot();
  const config = loadConfig(root);
  const corpus = loadCorpus(root, config.voice);
  for (const path of corpus.dropped) {
    warn(`voice corpus over ${config.voice.maxKb}KB budget, dropped ${path}`);
  }
  const system = buildSystem(loadInstructions(root), corpus.files);
  debug(
    `root ${root}, model ${config.model.model}, corpus ${corpus.files.length} files, system ${system.length} chars`
  );

  // The provider is created on first use so a missing API key surfaces as a
  // readable tool error in the agent instead of a server that fails to start.
  let service: DocumentService | undefined;
  serveStdio(() =>
    createServer(() => {
      service ??= new DocumentService(
        new OpenAIProvider(config.model),
        system,
        `docs-mcp:${root}`
      );
      return service;
    })
  );
}

main();
