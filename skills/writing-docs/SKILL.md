---
name: writing-docs
description: Use whenever writing or revising human-facing prose in this project — docs pages, READMEs, guides, plans, design docs, or any markdown a person will read. The docs MCP server writes the prose; you supply verified facts.
---

# Writing docs through the docs server

You own technical truth. The docs model owns communication. Do not write or
rewrite human-facing prose yourself, and never send the server a draft to
"clean up" — a draft smuggles your phrasing into the output.

If the project has no `.docs-mcp/` directory, run `/docs-mcp:docs-init` before
anything else.

## The loop

1. **Investigate first.** Read the code, run the commands, resolve the links
   and anchors you are about to cite. Everything you send must be a fact you
   verified in this session.
2. **Send facts, not prose.** Call `create` for a new page or `edit` for an
   existing one, filling the typed fields: purpose, audience, current and
   proposed behavior, decisions, constraints, tradeoffs, open questions, code
   evidence. Plain statements of fact, not sentences you want to see in the
   page.
3. **Fact-check what returns.** Verify every claim, command, path, default,
   and link in the output against the repo. The model writes well but only
   knows what you sent.
4. **Corrections are facts too.** When the output is wrong, call `edit` again
   stating what is true ("the flag is --runtime incus, not --incus"), not
   replacement sentences. Repeat until the page survives your check, then
   apply it verbatim.
5. **Review without rewriting.** Call `review` to diagnose an existing page.
   "No significant editorial problems" is a valid outcome; do not invent work.
   Real findings go back through step 2 as facts.

## Boundaries

- Voice and style live in the project's `.docs-mcp/` directory (config,
  instructions, voice corpus), never in your tool calls. If the style is
  wrong, fix the corpus, not the prompt.
- Tone direction is legitimate input when the user asks for it ("warmer",
  "more direct"), passed as a fact about what the page should do.
- Prose you still write directly: commit messages, code comments, and CLI
  output. Keep those in the project's documented style.
