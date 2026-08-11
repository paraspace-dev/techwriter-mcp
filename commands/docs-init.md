---
description: Scaffold .docs-mcp/ so the docs server can learn this project's voice
---

Set up the `.docs-mcp/` directory for this project. It configures the docs MCP
server (the `docs` tools), which writes human-facing prose from facts.

1. If `.docs-mcp/` already exists, report what is in it and stop.

2. Create `.docs-mcp/config.toml`:

   ```toml
   [model]
   model = "gpt-5.1"

   [voice]
   include = []
   ```

   Ask the user which OpenAI model to use if they have a preference.

3. Create `.docs-mcp/instructions.md` with the project's writing rules for the
   docs model: who reads these docs, what register they expect, and any hard
   style rules. Distill from the repo's existing style guidance (CLAUDE.md,
   CONTRIBUTING, style guides) if present; otherwise ask the user two or three
   concrete questions (audience, register, banned habits) rather than
   inventing rules.

4. Create `.docs-mcp/voice/examples/` and `.docs-mcp/voice/avoid/`, then help
   the user fill them. This corpus teaches the model the project's voice, and
   its quality decides the output's quality:

   - **Examples must be genuinely hand-written.** Ask the user for prose they
     wrote themselves: READMEs from their pre-AI projects, blog posts,
     landing pages. Check `git log` authorship before trusting anything in
     the current repo — docs that look polished are often AI-written, and
     feeding those in as examples teaches the model the exact voice the user
     is trying to escape.
   - **Avoid-examples work best from the project's own history.** If the repo
     has AI-written docs that were later fixed, extract the bad originals
     (`git show <commit>^:<file>`) into `voice/avoid/` with a one-line
     provenance comment. The same facts written both ways is the strongest
     signal.
   - Only glob current docs into `[voice] include` when the user confirms
     they are hand-written.

5. Tell the user the per-request cost model: the corpus is sent with every
   request but is served from the provider's prompt cache after the first call
   of a session, so a focused corpus of a few files costs little. Keep it
   under a few hundred KB.
