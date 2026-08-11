# docs-mcp MVP plan

## The bet

Coding agents write bad docs because the same context that traced the code
writes the prose, and the trace leaks into the writing. docs-mcp separates the
two jobs with a process boundary. The coding agent investigates and supplies
facts through an MCP tool call; a general-purpose model in a fresh context,
primed with an editorial brief and the project's own good writing, turns those
facts into a document. The agent then fact-checks the result against the repo
and sends corrections back as facts, never as prose.

The MVP is done when that loop works end to end on one real project
(paraspace): agent gathers facts, `create` returns a document a human wants to
read, `review` diagnoses without rewriting, `edit` fixes one fact without
churning the rest.

## Shape

TypeScript, ESM, Node 20+. Four runtime dependencies: the MCP server SDK v2
(`@modelcontextprotocol/server`), `openai`, `smol-toml`, `tinyglobby`, plus
`zod` for schemas. Build with `tsc`, test with `vitest`.

One process, stdio transport, launched by the coding agent's MCP host with the
project as its working directory. Project root comes from `DOCS_MCP_ROOT` or
the cwd; everything project-specific loads from `<root>/.docs-mcp/` at startup.
No config is required to run; with no `.docs-mcp/` the server works on the
editorial brief alone.

Internally: `service.ts` (the three operations) calls a `ModelProvider`
interface with exactly one implementation, `openai.ts`. The provider takes a
system string and a user string and returns text plus token usage. Nothing
outside `openai.ts` imports the OpenAI SDK, so a second provider is a new file
and a config value, not a refactor.

## Tool contracts

Three tools on a server named `docs`, so hosts surface them as
`docs / create`, `docs / edit`, `docs / review`.

`create` takes a document type (plan, rfc, design, architecture, readme,
guide, explanation, adr), a required purpose, and optional typed fields for
the material: context, current and proposed behavior, decisions, constraints,
tradeoffs, open questions, code evidence, audience, and free notes. It returns
the finished document.

`edit` takes the current document verbatim plus the requested changes stated
as facts, and returns the revised document. The brief holds it to the smallest
editorially coherent change.

`review` takes a document and optional specific concerns, and returns findings
with locations, or the sentence that nothing significant is wrong. It never
returns a rewrite.

The schemas carry meaning so the agent is pushed to supply facts, not drafts.
There is deliberately no field for style instructions; the editorial brief is
not overridable by the caller, and the brief itself tells the model to ignore
style directives smuggled into the material.

## The prompt, and why its order matters

Every request is one system string and one user string. The system string is
the stable prefix, identical across all calls in a project: the built-in
editorial brief, then the project's `instructions.md`, then the voice corpus.
The user string is everything that varies: document-type guidance, the
labeled material, the existing document, the operation. OpenAI's implicit
caching keys on the prefix, and a `prompt_cache_key` derived from the project
root keeps requests from one project landing on one cache. This ordering is
the one architectural invariant worth a test: two different requests must
produce byte-identical system strings.

The corpus is deterministic. Files from `.docs-mcp/voice/examples/` and
`voice/avoid/` first (sorted), then whatever the `[voice]` include globs in
`config.toml` match (sorted, exclusions applied), concatenated with per-file
labels until a byte budget runs out. What gets dropped is logged, never
silent.

The editorial brief is the product. It encodes the philosophy: write from the
reader's problem outward, omit freely, structure only when it helps, never
serialize implementation into English, treat supplied facts as the only
technical truth and surface gaps as open questions instead of inventing.
Plans get their own charge, because agents' plans are the worst offenders:
explain the approach, the moved responsibilities, the risk, and what stays
unchanged, with a checklist only in support.

## Risks and open questions

The real risk is not the plumbing, it is whether the brief plus corpus
actually beats the coding agent's prose. That gets settled empirically on
paraspace, and the brief will need iteration; keeping it in one file makes
that cheap.

The MCP SDK v2 is newly released (2.0.0), so its API surface is the least
settled dependency. The server touches it in exactly one file to keep a
future SDK change contained.

No OpenAI key is present in the dev environment yet, so the MVP lands with
the full loop tested against a fake provider and the live round-trip
outstanding.

Model choice stays in config with a current default; wrong values fail with
the API's own error rather than a maintained allowlist.

## Test plan

Unit tests with a fake provider, no network: config defaults and parsing
errors, corpus determinism and budget behavior, the stable-prefix invariant,
and per-operation prompt assembly (material lands in the user string, the
document survives edit verbatim, review is asked to diagnose). A stdio smoke
test drives the built server with raw JSON-RPC to prove the tools register.
The live OpenAI path is exercised manually once a key exists.
