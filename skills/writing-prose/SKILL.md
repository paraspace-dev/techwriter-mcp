---
name: writing-prose
description: Use whenever writing or revising human-facing prose in this project: docs pages, READMEs, guides, plans, RFCs, design docs, PR descriptions, issue reports, or any markdown a person will read. The techwriter MCP server writes the prose; you supply verified facts.
---

# Writing prose through the techwriter server

You own technical truth. The techwriter model owns communication. Do not write
or rewrite human-facing prose yourself. Never send the server a draft to
"clean up" because a draft smuggles your phrasing into the output.

If the project has no `.techwriter-mcp/` directory, run
`/techwriter-mcp:techwriter-init` before anything else.

## The loop

1. **Investigate first.** Read the code, run the commands, resolve the links
   and anchors you are about to cite. Everything you send must be a fact you
   verified in this session.
2. **Send facts, not prose.** Call `create` for a new page or `edit` for an
   existing one, filling the applicable typed fields: purpose, audience,
   current and proposed behavior, decisions, constraints, tradeoffs, open
   questions, code evidence. Plain statements of fact, not sentences you want
   to see in the page.
3. **Fact-check what returns.** Verify every claim, command, path, default,
   and link in the output against the repo.
4. **Corrections are facts too.** When the output is wrong, call `edit` again
   stating what is true ("the flag is --runtime incus, not --incus"), not
   replacement sentences. Repeat until the page survives your check, then
   apply it verbatim.
5. **Review without rewriting.** Call `review` to diagnose an existing page.
   "No significant editorial problems" is a valid outcome; do not invent work.
   Investigate each real finding in the repo, then send the verified context
   needed to resolve it through `edit`.

## PRs and issues

PR descriptions and issue reports go through the server like any other
document, as types `pr` and `issue`. For a PR, the facts are the diff you just
produced: why the change exists, what changed conceptually, how you verified
it. For an issue, they are the observed and expected behavior and the
reproduction you confirmed.

The first line of the returned document is the title, as a single `#` heading.
Strip it and pass it separately, with the remainder as the body:

```sh
gh pr create --title "..." --body-file body.md
gh issue create --title "..." --body-file body.md
```

## Boundaries

- Voice and style live in the project's `.techwriter-mcp/` directory: config,
  instructions, and voice corpus. If the style is wrong, fix the applicable
  `.techwriter-mcp/` style source, not the prompt.
- Tone direction is legitimate input when the user asks for it ("warmer",
  "more direct"). It is distinct from technical facts and belongs in the
  changes field.
- Prose you still write directly: commit messages, code comments, and CLI
  output. Keep those in the project's documented style. PR and issue bodies
  are not on that list; they go through the server.
