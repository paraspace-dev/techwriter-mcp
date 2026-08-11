# docs-mcp

Write repository documents from verified codebase facts. Your coding agent
investigates the repository, this server sends those facts to a separate model
that writes the document, and the agent fact-checks the result before sending
corrections back.

## Install with Claude Code

```text
/plugin marketplace add paraspace-dev/docs-mcp
/plugin install docs-mcp@docs-mcp
```

Claude Code prompts once for an OpenAI API key and stores it in the OS keychain.
The plugin registers the `docs` MCP server, a skill that keeps the agent in the
facts-in role, and a command to set up project writing configuration:

```text
/docs-mcp:docs-init
```

## How it works

The agent calls `create` for a new document, then checks the result against the
repository. If it finds an error, it calls `edit` with the corrected facts
rather than rewriting the prose itself.

Use `review` when you want editorial findings instead of a rewrite. It returns
findings with locations, or reports that the document has no significant
editorial problems.

The fact-check matters. Wrong facts produce a well-written wrong document.

docs-mcp writes plans, RFCs, design and architecture docs, READMEs, guides,
explanations, and ADRs.

## Other MCP hosts

The server is the npm package `docs-mcp`. Run it as `npx -y docs-mcp@latest`
with `OPENAI_API_KEY` in its environment.

### Claude Code project configuration

For Claude Code without the plugin, add the server to `.mcp.json`:

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

### Codex

For Codex, add the server to `~/.codex/config.toml`:

```toml
[mcp_servers.docs]
command = "npx"
args = ["-y", "docs-mcp@latest"]
```

## Give it your project's voice

Configuration is optional. Without `.docs-mcp/`, the server uses its editorial
brief and a default model.

Add examples and writing rules when you want the document to sound like your
project:

```text
.docs-mcp/
  config.toml       model choice, voice corpus globs
  instructions.md   your house style, in your words
  voice/
    examples/       documents that sound the way you want
    avoid/          counterexamples of the style you keep deleting
```

```toml
[model]
model = "gpt-5.6-terra"

[voice]
include = ["docs/**/*.md", "README.md"]
exclude = ["docs/generated/**"]
```

Files in `voice/` and files matched by `include` become the voice corpus. A few
strong examples usually teach the model more than a long instructions file.

If your existing documentation is AI-written, adding it to `include` teaches the
model that same voice. Pre-AI READMEs and posts make better examples. AI
originals recovered from git history can go in `voice/avoid/`.

The corpus is capped at `max_kb`, which defaults to 256 KB. The server reports
files it drops for the budget. The corpus is sent with every request and uses
the provider's prompt cache, so it is nearly free after the first call of a
session. Set `DOCS_MCP_DEBUG=1` to print input, cached, and output token counts
to stderr.
