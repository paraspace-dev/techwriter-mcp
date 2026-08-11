---
description: Scaffold .techwriter-mcp/ so the techwriter server can learn this project's voice
---

Set up the `.techwriter-mcp/` directory for this project. It configures the
techwriter MCP server (the `techwriter` tools), which writes human-facing
prose from facts.

1. If `.techwriter-mcp/` already exists, report what is in it and stop.

2. Ask the user which OpenAI model to use if they have a preference. If they
   have none, use `gpt-5.6-terra`. Then create `.techwriter-mcp/config.toml`:

   ```toml
   [model]
   model = "gpt-5.6-terra"

   [voice]
   include = []
   ```

   Files in `.techwriter-mcp/voice/examples/` and `.techwriter-mcp/voice/avoid/`
   load automatically. Leave `include = []` when all voice material lives there.
   The `[voice] include` globs add repository files to the corpus. If the user
   confirms that current documentation is hand-written, add the appropriate
   glob, such as `docs/**/*.md`, to `include`.

3. Create `.techwriter-mcp/instructions.md` with the project's writing rules
   for the techwriter model: who reads these docs, what register they expect,
   and any hard style rules. Distill from the repo's existing style guidance
   (AGENTS.md, CLAUDE.md, CONTRIBUTING, style guides) if present; otherwise ask
   the user two or three concrete questions (audience, register, banned habits)
   rather than inventing rules.

4. Create `.techwriter-mcp/voice/examples/` and `.techwriter-mcp/voice/avoid/`,
   then help the user fill them. This corpus teaches the model the project's
   voice, and its quality decides the output's quality:

   - **Examples must be genuinely hand-written.** Ask the user for prose they
     wrote themselves: READMEs from their pre-AI projects, blog posts,
     landing pages. Git history is evidence, not proof. Commits by coding
     agents may carry `Co-authored-by` trailers, while hand commits usually
     lack them. The user confirms whether prose is hand-written.
   - **Avoid-examples work best from the project's own history.** If the repo
     has AI-written docs that were later fixed, extract the bad originals
     (`git show <commit>^:<file>`) into `voice/avoid/` as Markdown copies.
     Add a one-line HTML provenance comment at the top of each copied file.
     The same facts written both ways is the strongest signal.
   - Only add current-doc globs to `[voice] include` after the user confirms
     those docs are hand-written.

5. Tell the user the per-request cost model: the corpus is sent with every
   request but is served from the provider's prompt cache after the first call
   of a session. Keep the corpus within the `max_kb` cap, which defaults to
   256 KB. The server reports any file it drops for the budget.
