# docs-mcp

Let coding agents understand your code. Don't let them write your docs.

Coding agents are good at finding out what is true about a repository and bad
at turning it into prose. The same context that traced the code writes the
document, and the trace leaks in: file-by-file inventories, headings for
everything, plans that read like diffs predicted in English. Style rules in
CLAUDE.md don't fix it, because the agent doing the investigating is still the
one doing the writing.

docs-mcp splits the two jobs. It is an MCP server with three tools, `create`,
`edit`, and `review`. Your coding agent investigates the repository and passes
facts, purpose, constraints, decisions, and open questions to `create`; a
general-purpose model in a separate context, primed with an editorial brief
and your project's own writing, decides how to say it. The agent then
fact-checks the result against the code and sends corrections back through
`edit` as facts, never as replacement prose. The agent owns technical truth.
The writing model owns communication.

## Install as a Claude Code plugin

```
/plugin marketplace add jchook/docs-mcp
/plugin install docs-mcp@docs-mcp
```

Claude Code prompts for your OpenAI API key when the plugin is enabled and
stores it in the OS keychain. The plugin registers the `docs` MCP server, a
`writing-docs` skill that holds the agent to the facts-in, prose-out loop, and
a `/docs-mcp:docs-init` command that scaffolds `.docs-mcp/` in a project.

## Manual setup (any MCP host)

The server is the npm package `docs-mcp`, and it needs `OPENAI_API_KEY` in its
environment. For Claude Code without the plugin, add it to your project's
`.mcp.json`:

```json
{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": ["-y", "docs-mcp@latest"]
    }
  }
}
```

For Codex, the same server goes in `~/.codex/config.toml`:

```toml
[mcp_servers.docs]
command = "npx"
args = ["-y", "docs-mcp@latest"]
```

The server reads project configuration from `.docs-mcp/` in the directory it
is launched from (set `DOCS_MCP_ROOT` to override). No configuration is
required; without it you get the editorial brief and a default model.

## Teaching it your project's voice

Everything project-specific lives in `.docs-mcp/`:

```
.docs-mcp/
  config.toml       model choice, voice corpus globs
  instructions.md   your house style, in your words
  voice/
    examples/       documents that sound the way you want
    avoid/          counterexamples of the style you keep deleting
```

```toml
[model]
model = "gpt-5.1"

[voice]
include = ["docs/**/*.md", "README.md"]
exclude = ["docs/generated/**"]
```

Files in `voice/` and files matched by `include` are sent with every request
as the voice to imitate. Examples teach editorial judgment better than rules,
so a couple of documents you are proud of do more than a long instructions
file. Make sure the examples are prose a person actually wrote. If your
current docs are AI-written, globbing them into `include` teaches the model
the exact voice you are trying to escape; pull examples from pre-AI READMEs
or posts instead, and put the AI originals in `avoid/`. The corpus rides in the cached prefix of every prompt (the stable
material goes first by construction), so after the first request it is cheap;
run with `DOCS_MCP_DEBUG=1` to see cached token counts per call on stderr.
The corpus is capped at `max_kb` (default 256) and files dropped for budget
are reported, never silently skipped.

## What the agent is supposed to do

The tool descriptions tell the agent its role, but the loop is worth knowing
when you supervise one: investigate first, call `create` with facts rather
than a draft, fact-check the returned document against the repository, and
push corrections through `edit` stated as facts. `review` returns findings
with locations and never a rewrite; "no significant editorial problems" is an
acceptable answer, and the agent should not rewrite returned prose by hand
unless you ask it to.

The writing model treats the supplied material as its only source of
technical truth. If the agent sends wrong facts, you get a well-written wrong
document; nothing replaces the fact-check step.

## Scope

docs-mcp writes software documents: plans, RFCs, design and architecture
docs, READMEs, guides, explanations, ADRs. It is not a general writing
assistant, and requests for one belong elsewhere.
